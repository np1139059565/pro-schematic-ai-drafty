/**
 * 后端适配层 ark-api.js —— 双后端对话通道
 *
 * 职责:
 * 1. callArkChat:直连火山引擎方舟 Responses API,需配置 api_key + api_model,
 *    请求头携带 Authorization: Bearer;
 * 2. callPrivateChat:走私服代理 /api/ark-chat,仅需 user_api_key(模型由私服侧决定),
 *    由私服转发到 ARK 并记账;
 * 3. updateConfig:基于 localStorage 的配置写入(api_key / api_model);读取用的 getConfig 为模块内私有函数,不对外暴露。
 *
 * 两个后端共用的约定:
 * - 多轮上下文靠 previous_response_id 串联;首轮(历史长度为 2)直接把整段历史作为 input,
 *   其余轮次仅传最后一条消息,以节省 Token;
 * - 工具以 MCP 描述(name/description/inputSchema)传入,内部转换为 ARK 的
 *   { type:'function', name, description, parameters } 格式;
 * - 第四个参数 signal 为 AbortManager 合并的「超时 + 手动取消」信号,用于真正中断请求;
 * - HTTP 非 2xx 时抛出的 Error 会挂载 status 字段,供 error-handler.js 按状态码
 *   分级为 AUTH(401/403) / RATE_LIMIT(429) / NETWORK(5xx) / PARAM(400)。
 */

let PRIVATE_SERVER_URL = 'https://113.46.209.138'; // 私服地址
let ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3'; // API 基础地址
let CUSTOM_API_URL = 'https://api.deepseek.com/v1'; // 自定义主流模型兼容端点默认地址（用户可在配置中覆盖）

/**
 * 获取私服地址
 * @returns {string} 私服地址
 */
function getPrivateServerUrl() {
	try {
		// 从 localStorage 读取私服地址配置
		const savedServerUrl = localStorage.getItem('private_server_url');
		if (savedServerUrl) {
			return savedServerUrl; // 返回保存的私服地址
		}
	} catch (error) {
		console.error('读取私服地址配置失败:', error); // 输出错误日志
	}
	return PRIVATE_SERVER_URL; // 返回默认私服地址
}

/**
 * 判断错误是否为 previous_response_id 失效类错误(服务端存储的上一轮响应过期/不可达)。
 * 典型表现:第 1 轮对话正常,第 2 轮起携带 prev_id 的请求被服务端拒绝,
 * 用户侧观感即「配置丢失导致的失效」,实际是上下文链路断裂而非配置问题。
 * @param {Error} error - 带 status 字段的请求错误
 * @returns {boolean}
 */
function shouldRetryWithoutPrevId(error) {
	const status = error && error.status;
	if (status === 404) return true; // 存储的上一轮响应已不存在
	if (status === 400 || status === 409) {
		const msg = (error && error.message) || '';
		return /previous_response|response_id|not found|不存在|失效|过期|expire|上下文/i.test(msg);
	}
	return false;
}

/**
 * previous_response_id 失效后的自愈重试:按当前模式重建通道,以全量历史一次性发送。
 * 仅在 catch 中且 prev_id 已失效判定成立时调用,重试内部 prev_id 为 null,不会无限递归。
 * @param {Array} mhistory - 完整消息历史
 * @param {Array} tools - 工具描述数组
 * @param {AbortSignal|null} signal - 取消信号
 * @returns {Promise<Object>} API 响应
 */
function retryWithFullHistory(mhistory, tools, signal) {
	const mode = getConfig().mode;
	if (mode === 'private') return callPrivateChat(mhistory, null, tools, signal, { fullHistory: true });
	if (mode === 'custom') return callCustomChat(mhistory, null, tools, signal, { fullHistory: true });
	return callArkChat(mhistory, null, tools, signal, { fullHistory: true }); // ark 官网直连
}

/**
 * 调用私服 API 进行对话(私服转发至 ARK 并记录 token 用量)
 * @param {Array} mhistory - 消息历史数组
 * @param {string|null} previousResponseId - 上一轮响应 ID(用于多轮上下文串联)
 * @param {Array} tools - MCP 工具描述数组,内部转换为 ARK function 格式
 * @param {AbortSignal|null} signal - 超时与手动取消的合并信号
 * @returns {Promise<Object>} API 响应数据
 */
async function callPrivateChat(mhistory, previousResponseId = null, tools = [], signal = null, opts = null) {
	let requestBody = null;
	try {
		// 工具结果轮传入的是 function_call_output 增量数组(每项含 type 字段),需整段发送,
		// 否则同批多个工具调用仅回灌最后一条结果;普通对话轮取最后一条即可。
		const isToolResultBatch = mhistory.length > 0 && mhistory[0].type !== undefined; // 判断是否为工具结果增量批次
		requestBody = {
			// fullHistory 为 prev_id 失效自愈重试标记:必须整段发送完整历史恢复上下文
			input: opts && opts.fullHistory ? mhistory : isToolResultBatch ? mhistory : [mhistory[mhistory.length - 1]], // 工具结果批次整段发送,普通对话仅取最后一条
		};
		// 获取用户API Key（用于在私服中认证身份和记录token使用）
		const config = getConfig();
		// 前端体验层校验：非空、长度上限（与后端 200 上限保持一致）、仅允许非空字符
		if (!config.key || !config.key.trim()) {
			throw new Error('用户API Key不能为空,请点击上方按钮进行配置后使用');
		}
		if (config.key.length > 200) {
			throw new Error('用户API Key长度超限,请检查配置');
		}
		requestBody.user_api_key = config.key.trim();

		// 如果有上一轮响应ID，添加到请求体中
		if (previousResponseId) {
			requestBody.previous_response_id = previousResponseId; // 添加上一轮响应ID
		} else if (mhistory.length === 2) {
			// 如果无上一轮响应ID,则将消息历史作为输入
			requestBody.input = mhistory;
		}

		// 如果有工具，则添加到请求体中(转换MCP工具为ARK格式)
		if (tools && tools.length > 0) {
			requestBody.tools = tools.map((tool) => ({
				type: 'function',
				name: tool.name,
				description: tool.description,
				parameters: tool.inputSchema,
			})); // 添加工具数组
		}

		// 发送 POST 请求到私服端点（私服会转发到ARK API并记录token使用）
		const response = await fetch(`${getPrivateServerUrl()}/api/ark-chat`, {
			method: 'POST', // 使用 POST 方法
			headers: {
				'Content-Type': 'application/json', // 设置内容类型为 JSON
			},
			body: JSON.stringify(requestBody), // 请求体
			signal, // 绑定取消/超时信号(可能为空)
		});

		// 检查响应状态
		if (!response.ok) {
			// 如果响应不成功
			const errorText = await response.text(); // 获取错误文本
			let errorMessage = `HTTP 错误! 状态码: ${response.status}`;
			try {
				const errorJson = JSON.parse(errorText);
				// 兼容多种后台错误结构,优先提取最具体的真实原因文本:
				// error.message / error / message / error_message
				const extracted =
					(errorJson.error && typeof errorJson.error === 'object' ? errorJson.error.message : undefined) ||
					(typeof errorJson.error === 'string' ? errorJson.error : undefined) ||
					(typeof errorJson.message === 'string' ? errorJson.message : undefined) ||
					(typeof errorJson.error_message === 'string' ? errorJson.error_message : undefined) ||
					errorJson.error; // 兜底:可能是对象字面量(转字符串时会变 [object Object],下方再补原始文本)
				errorMessage = extracted && extracted !== '[object Object]' ? String(extracted) : errorMessage; // 提取失败则保留状态码提示
				// 若提取出的仅为状态码提示(未拿到具体原因),把原始响应文本附在后面供排查
				if (errorMessage === `HTTP 错误! 状态码: ${response.status}`) {
					errorMessage += `\n${errorText}`;
				}
			} catch (e) {
				errorMessage += `\n${errorText}`;
			}
			// 挂载 status 以便上层按 HTTP 状态码分级(401/429/5xx)
			const err = new Error(errorMessage);
			err.status = response.status;
			throw err; // 抛出带状态码的错误
		}

		// 解析响应数据
		const result = await response.json(); // 解析 JSON 响应
		console.log('AI 请求成功:', result); // 输出成功日志
		// 返回真实接口数据：data 为真实响应、request 为真实请求体(供日志采集真实接口参数)
		return { data: result, request: requestBody };
	} catch (error) {
		// 捕获网络错误或其他错误:把真实请求体一并挂到错误上,
		// 供上层(ai-chat.js)在失败分支也能采集「请求快照 + 错误快照」写入日志。
		error.requestBody = requestBody; // 失败日志采集用真实请求体
		// previous_response_id 失效自愈:服务端存储过期/不可达时(404 或特定 400 文案),
		// 降级为「不带 prev_id + 全量历史」重试一次;工具结果批次离开 prev_id 无法
		// 与服务端 function_call 关联,不做重试,避免自愈反而产生残缺上下文
		const isToolResultBatch = mhistory.length > 0 && mhistory[0].type !== undefined;
		if (previousResponseId && !isToolResultBatch && shouldRetryWithoutPrevId(error)) {
			console.warn('previous_response_id 疑似失效,降级为全量历史重试:', error.message);
			return retryWithFullHistory(mhistory, tools, signal);
		}
		console.error('AI 请求失败:', error); // 输出错误日志
		throw error; // 向上抛出错误
	}
}

// ========================================================================

/**
 * 直连火山引擎方舟 Responses API 进行对话
 * @param {Array} mhistory - 消息历史数组
 * @param {string|null} previousResponseId - 上一轮响应的 ID（用于多轮对话）
 * @param {Array} tools - MCP 工具描述数组,内部转换为 ARK function 格式
 * @param {AbortSignal|null} signal - 超时与手动取消的合并信号
 * @returns {Promise<Object>} API响应数据
 */
async function callArkChat(mhistory, previousResponseId = null, tools = [], signal = null, opts = null) {
	let requestBody = null;
	try {
		// 普通多轮对话时 mhistory 是完整会话历史(每条含 role 字段),
		// 借助 previous_response_id 串联上下文,只需发送最后一条消息即可;
		// 但工具结果轮传入的 mhistory 实为 handleToolExecutionResults 返回的
		// function_call_output 增量数组(每条含 type 字段而非 role),多条结果必须整段发送,
		// 若只取最后一条会导致同批多个工具调用仅回灌 1 个结果,模型据此回应必然残缺。
		const isToolResultBatch = mhistory.length > 0 && mhistory[0].type !== undefined; // 判断是否为工具结果增量批次
		// 构建请求体
		requestBody = {
			// model: config.model, // 模型名称
			// fullHistory 为 prev_id 失效自愈重试标记:必须整段发送完整历史恢复上下文
			input: opts && opts.fullHistory ? mhistory : isToolResultBatch ? mhistory : [mhistory[mhistory.length - 1]], // 工具结果批次整段发送,普通对话仅取最后一条
			store: true, // 存储响应以便后续检索
			caching: { 'type': 'enabled' }, // 启用缓存(设置了缓存不需要一直传入tools)
			temperature: 0.2, // 采样温度，降低随机性，使输出更确定
			top_p: 0.9, // 核采样概率，降低随机性，使输出更确定(通常建议仅调整 temperature 或 top_p 其中之一，不建议两者都修改)
		};
		const config = getConfig();
		// 检查ARK_API_KEY和ARK_MODEL是否为空
		if (!config.key || !config.model) {
			throw new Error('API Key和API model不能为空,请点击上方按钮进行配置后使用');
		}
		requestBody.model = config.model;

		// 如果有上一轮响应ID，添加到请求体中
		if (previousResponseId) {
			requestBody.previous_response_id = previousResponseId; // 添加上一轮响应ID
		} else if (mhistory.length === 2) {
			// 如果无上一轮响应ID,则将消息历史作为输入
			requestBody.input = mhistory;
		}

		// 如果有工具，则添加到请求体中(转换MCP工具为ARK格式)
		if (tools && tools.length > 0) {
			requestBody.tools = tools.map((tool) => ({
				type: 'function',
				name: tool.name,
				description: tool.description,
				parameters: tool.inputSchema,
			})); // 添加工具数组
		}

		// 发送 POST 请求到 Responses API
		const response = await fetch(`${ARK_API_URL}/responses`, {
			method: 'POST', // 使用 POST 方法
			headers: {
				'Content-Type': 'application/json', // 设置内容类型为 JSON
				Authorization: `Bearer ${config.key}`, // 设置授权头
			},
			body: JSON.stringify(requestBody), // 请求体
			signal, // 绑定取消/超时信号(可能为空)
		});

		// 检查响应状态
		if (!response.ok) {
			// 如果响应不成功
			const errorText = await response.text(); // 获取错误文本
			// 挂载 status 以便上层按 HTTP 状态码分级(401/429/5xx)
			const err = new Error(`HTTP 错误! 状态码: ${response.status}\n${errorText}`);
			err.status = response.status;
			throw err; // 抛出带状态码的错误
		}

		// 解析响应数据
		const result = await response.json(); // 解析 JSON 响应
		console.log('AI 请求成功:', result); // 输出成功日志
		// 返回真实接口数据：data 为真实响应、request 为真实请求体(供日志采集真实接口参数)
		return { data: result, request: requestBody };
	} catch (error) {
		// 捕获网络错误或其他错误:把真实请求体一并挂到错误上,
		// 供上层(ai-chat.js)在失败分支也能采集「请求快照 + 错误快照」写入日志。
		error.requestBody = requestBody; // 失败日志采集用真实请求体
		// previous_response_id 失效自愈:服务端存储过期/不可达时(404 或特定 400 文案),
		// 降级为「不带 prev_id + 全量历史」重试一次;工具结果批次离开 prev_id 无法
		// 与服务端 function_call 关联,不做重试,避免自愈反而产生残缺上下文
		const isToolResultBatch = mhistory.length > 0 && mhistory[0].type !== undefined;
		if (previousResponseId && !isToolResultBatch && shouldRetryWithoutPrevId(error)) {
			console.warn('previous_response_id 疑似失效,降级为全量历史重试:', error.message);
			return retryWithFullHistory(mhistory, tools, signal);
		}
		console.error('AI 请求失败:', error); // 输出错误日志
		throw error; // 向上抛出错误
	}
}

// ========================================================================
// ==================== Chat Completions 协议适配层 ========================
// 自定义端点可选两种协议:responses(Responses API,默认)/ chat(OpenAI Chat Completions)。
// 对话主流程(ai-chat.js)完全基于 Responses API 语义(previous_response_id 串联、
// function_call_output 回喂、output 数组解析),因此 chat 协议在适配层内完成双向转换:
// 请求侧:把完整会话历史(含 assistant.toolCalls 与 role:'tool' 结果)转为 CC messages;
// 响应侧:把 CC choices 转回 Responses output 形状,上层解析代码零改动。

/**
 * 判断自定义模式当前是否使用 Chat Completions 协议
 * @returns {boolean}
 */
function isCustomChatProtocol() {
	const config = getConfig();
	return config.mode === 'custom' && config.customProtocol === 'chat';
}

/**
 * 把内部会话历史转换为 CC messages 数组(无状态全量发送)
 * 历史条目形状见 ai-chat.js:
 * - {role:'system'|'user', content}
 * - {role:'assistant', content, toolCalls?} toolCalls 为 extractToolCall 产物 {id, function:{name,arguments}}
 * - {role:'tool', tool_call_id, content}
 * @param {Array} mhistory - 完整会话历史
 * @returns {Array} CC messages
 */
function convertHistoryToCCMessages(mhistory) {
	const messages = [];
	for (const item of mhistory) {
		if (!item || typeof item !== 'object') continue; // 跳过脏数据
		switch (item.role) {
			case 'system':
			case 'user':
				messages.push({ role: item.role, content: item.content });
				break;
			case 'assistant':
				if (item.toolCalls && item.toolCalls.length > 0) {
					// 带工具调用的助手消息:还原为 CC tool_calls 结构
					messages.push({
						role: 'assistant',
						content: item.content || null, // CC 允许 null;有文本时保留
						tool_calls: item.toolCalls.map((tc) => ({
							id: tc.id, // 沿用原 call_id,保证 tool 消息可对齐
							type: 'function',
							function: { name: tc.function.name, arguments: tc.function.arguments },
						})),
					});
				} else {
					messages.push({ role: 'assistant', content: item.content || '' });
				}
				break;
			case 'tool':
				messages.push({ role: 'tool', tool_call_id: item.tool_call_id, content: item.content });
				break;
			default:
				break; // 未知角色跳过,避免整包被单条脏数据破坏
		}
	}
	return messages;
}

/**
 * 把 CC 响应转换为 Responses API 形状,供 parseAIResponse 无差别解析
 * @param {Object} data - CC 原始响应
 * @returns {Object} Responses 形状 { id, output, usage }
 */
function convertCCResponseToResponses(data) {
	const msg = (data.choices && data.choices[0] && data.choices[0].message) || {}; // 首个 choice 的助手消息
	const output = [];
	// 文本内容 → output_text 消息项(有工具调用时 content 可能为 null,跳过)
	if (typeof msg.content === 'string' && msg.content.length > 0) {
		output.push({
			type: 'message',
			role: 'assistant',
			content: [{ type: 'output_text', text: msg.content }],
		});
	}
	// 工具调用 → function_call 项(call_id 对齐 Responses 语义)
	for (const tc of msg.tool_calls || []) {
		output.push({
			type: 'function_call',
			call_id: tc.id,
			id: tc.id,
			name: tc.function && tc.function.name,
			arguments: tc.function && tc.function.arguments,
		});
	}
	// usage 字段名对齐:prompt/completion → input/output
	const usage = data.usage || {};
	return {
		id: data.id || `cc_${Date.now()}`, // 无响应 ID 时合成占位(updatePreviousResponseId 会存储但 CC 模式不依赖)
		output,
		usage: {
			input_tokens: usage.prompt_tokens || 0,
			output_tokens: usage.completion_tokens || 0,
			total_tokens: usage.total_tokens || (usage.prompt_tokens || 0) + (usage.completion_tokens || 0),
		},
		model: data.model,
	};
}

/**
 * 调用用户自定义端点(Chat Completions 协议)
 * @param {Array} mhistory - 完整会话历史(无状态全量发送)
 * @param {Array} tools - MCP 工具描述数组
 * @param {AbortSignal|null} signal - 超时与手动取消的合并信号
 * @returns {Promise<Object>} { data: Responses形状转换结果, request: 实际请求体 }
 */
async function callCustomChatCompletions(mhistory, tools, signal) {
	let requestBody = null;
	try {
		const config = getConfig();
		requestBody = {
			model: config.customModel,
			messages: convertHistoryToCCMessages(mhistory), // 完整历史转为 CC messages
			temperature: 0.2, // 与 Responses 通道保持一致的低随机性
			tool_choice: 'auto', // 交由模型决定是否调用工具
		};
		if (tools && tools.length > 0) {
			// CC 工具格式为 {type:'function', function:{name,description,parameters}} 嵌套结构
			requestBody.tools = tools.map((tool) => ({
				type: 'function',
				function: {
					name: tool.name,
					description: tool.description,
					parameters: tool.inputSchema,
				},
			}));
		}

		const baseUrl = (config.customBaseUrl || CUSTOM_API_URL).replace(/\/+$/, '');
		const response = await fetch(`${baseUrl}/chat/completions`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${config.customKey}`,
			},
			body: JSON.stringify(requestBody),
			signal,
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errMessage = `HTTP 错误! 状态码: ${response.status}\n${errorText}`;
			if (response.status === 404) {
				errMessage += '\n提示: 当前 Base URL 未提供 /chat/completions 端点,请检查 Base URL 是否需要补 /v1 等版本前缀。';
			}
			const err = new Error(errMessage);
			err.status = response.status;
			throw err;
		}

		const result = await response.json();
		console.log('AI 请求成功(自定义端点/Chat Completions):', result);
		// 响应转换为 Responses 形状后返回,上层对话主流程零感知协议差异
		return { data: convertCCResponseToResponses(result), request: requestBody };
	} catch (error) {
		error.requestBody = requestBody; // 失败日志采集真实请求体
		console.error('AI 请求失败(自定义端点/Chat Completions):', error);
		throw error;
	}
}

// ========================================================================
/**
 * 获取用户API Key（从localStorage读取）
 * 用户API Key用于在私服中认证身份和记录token使用
 * @returns {Object} {key:API Key,model:API model}
 */
/**
 * 直连用户自定义的主流模型兼容端点（第三种配置模式：用户自配 API Key / Base URL / Model）
 * 支持两种接口协议(页面可配置):
 * - responses(默认):与 callArkChat 共用 Responses API 请求体结构;
 * - chat:走 callCustomChatCompletions 适配层,兼容 DeepSeek 等仅提供
 *   OpenAI Chat Completions 的端点(实测其官方 API 无 /responses 路由)。
 * @param {Array} mhistory - 消息历史数组
 * @param {string|null} previousResponseId - 上一轮响应的 ID（用于多轮对话）
 * @param {Array} tools - MCP 工具描述数组
 * @param {AbortSignal|null} signal - 超时与手动取消的合并信号
 * @returns {Promise<Object>} API响应数据
 */
async function callCustomChat(mhistory, previousResponseId = null, tools = [], signal = null, opts = null) {
	const config = getConfig();
	// 自定义模式必须提供：自定义 API Key + 自定义 Model；Base URL 缺省回退到默认值(两种协议共用该校验)
	if (!config.customKey || !config.customModel) {
		throw new Error('自定义模式需要配置 API Key 与 Model,请点击上方按钮进行配置后使用');
	}
	// Chat Completions 协议:转交适配层(CC 为无状态协议,必须全量历史,
	// 调用方(ai-chat.js)会依据 isCustomChatProtocol() 在工具结果轮传入完整会话历史)
	if (config.customProtocol === 'chat') {
		return callCustomChatCompletions(mhistory, tools, signal);
	}

	let requestBody = null;
	try {
		const isToolResultBatch = mhistory.length > 0 && mhistory[0].type !== undefined; // 判断是否为工具结果增量批次
		// 复用与 callArkChat 完全一致的请求体结构（Responses API）,保证多轮/工具结果批次行为一致
		requestBody = {
			// fullHistory 为 prev_id 失效自愈重试标记:必须整段发送完整历史恢复上下文
			input: opts && opts.fullHistory ? mhistory : isToolResultBatch ? mhistory : [mhistory[mhistory.length - 1]],
			store: true,
			caching: { 'type': 'enabled' },
			temperature: 0.2,
			top_p: 0.9,
		};
		requestBody.model = config.customModel;
		const baseUrl = (config.customBaseUrl || CUSTOM_API_URL).replace(/\/+$/, ''); // 去除末尾多余斜杠

		// 如果有上一轮响应ID，添加到请求体中
		if (previousResponseId) {
			requestBody.previous_response_id = previousResponseId;
		} else if (mhistory.length === 2) {
			requestBody.input = mhistory;
		}

		// 如果有工具，则添加到请求体中(转换MCP工具为ARK格式)
		if (tools && tools.length > 0) {
			requestBody.tools = tools.map((tool) => ({
				type: 'function',
				name: tool.name,
				description: tool.description,
				parameters: tool.inputSchema,
			}));
		}

		// 发送 POST 请求到用户自定义的 Responses 端点
		const response = await fetch(`${baseUrl}/responses`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${config.customKey}`,
			},
			body: JSON.stringify(requestBody),
			signal,
		});

		if (!response.ok) {
			const errorText = await response.text();
			let errMessage = `HTTP 错误! 状态码: ${response.status}\n${errorText}`;
			if (response.status === 404) {
				// 自定义端点必须兼容 OpenAI Responses API(/responses);
				// 仅支持 Chat Completions 的服务商(实测 DeepSeek 官方 API 无 /responses 路由)会返回 404,
				// 此处给出可操作的指引:切换协议或更换端点,避免用户面对裸 404 无法排障
				errMessage +=
					'\n提示: 当前 Base URL 未提供 /responses 端点。可在「配置」中将自定义模式接口协议切换为 Chat Completions,或更换支持 Responses API 的 Base URL。';
			}
			const err = new Error(errMessage);
			err.status = response.status;
			throw err;
		}

		// 解析响应数据
		const result = await response.json(); // 解析 JSON 响应
		console.log('AI 请求成功(自定义端点):', result);
		return { data: result, request: requestBody };
	} catch (error) {
		error.requestBody = requestBody;
		// previous_response_id 失效自愈:同 callArkChat;工具结果批次不重试
		const isToolResultBatch = mhistory.length > 0 && mhistory[0].type !== undefined;
		if (previousResponseId && !isToolResultBatch && shouldRetryWithoutPrevId(error)) {
			console.warn('previous_response_id 疑似失效,降级为全量历史重试:', error.message);
			return retryWithFullHistory(mhistory, tools, signal);
		}
		console.error('AI 请求失败(自定义端点):', error);
		throw error;
	}
}

/**
 * 测试连接:按给定配置发起一次轻量真实请求,校验配置有效性(可达性+鉴权+模型可用)。
 * 使用对话框表单当前值(可能尚未保存),不发正式对话、不影响现有会话状态。
 * @param {Object} opts {mode,key,model,baseUrl,protocol,serverUrl}
 * @returns {Promise<{ok:boolean, message?:string, detail?:string}>}
 */
async function testConnection(opts) {
	const mode = opts && opts.mode;
	const key = ((opts && opts.key) || '').trim();
	const model = ((opts && opts.model) || '').trim();
	/** 带超时的 fetch,避免测试连接无限等待 */
	const fetchWithTimeout = (url, timeoutMs, options = {}) => {
		const ctrl = new AbortController();
		const timer = setTimeout(() => ctrl.abort(), timeoutMs);
		return fetch(url, { ...options, signal: ctrl.signal }).finally(() => clearTimeout(timer));
	};
	try {
		// 私服模式:探测 model-info 接口(轻量、无 token 消耗),验证服务器可达与 Key 有效性
		if (mode === 'private') {
			if (!key) return { ok: false, message: '请先填写私服用户 API Key' };
			const serverUrl = (opts.serverUrl || getPrivateServerUrl()).replace(/\/+$/, '');
			const resp = await fetchWithTimeout(`${serverUrl}/api/model-info?user_api_key=${encodeURIComponent(key)}`, 20000);
			if (!resp.ok) {
				return {
					ok: false,
					message: `私服返回 HTTP ${resp.status}${resp.status === 401 || resp.status === 403 ? '(Key 无效或未注册)' : ''}`,
				};
			}
			const data = await resp.json().catch(() => ({}));
			return { ok: true, detail: data && data.model ? `模型 ${data.model}` : '私服可达' };
		}
		// ARK / 自定义模式:必须提供 Key 与 Model
		if (!key || !model) return { ok: false, message: 'API Key 与 Model 不能为空' };
		const ping = { role: 'user', content: '连接测试,请回复ok' }; // 最小探测消息
		let url;
		let body;
		if (mode === 'custom' && opts.protocol === 'chat') {
			// 自定义 + Chat Completions 协议
			const baseUrl = (opts.baseUrl || CUSTOM_API_URL).replace(/\/+$/, '');
			url = `${baseUrl}/chat/completions`;
			body = { model, messages: [ping] };
		} else {
			// ARK 官网 或 自定义 + Responses API 协议
			const baseUrl = (mode === 'custom' ? opts.baseUrl || CUSTOM_API_URL : ARK_API_URL).replace(/\/+$/, '');
			url = `${baseUrl}/responses`;
			body = { model, input: [ping], store: false }; // 测试请求不落存储
		}
		const resp = await fetchWithTimeout(url, 30000, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
			body: JSON.stringify(body),
		});
		if (!resp.ok) {
			// 尽量提取服务端真实错误原因(结构各异,JSON 优先降级纯文本)
			const text = await resp.text().catch(() => '');
			let message = `HTTP ${resp.status}`;
			try {
				const j = JSON.parse(text);
				const reason = (j.error && (j.error.message || (typeof j.error === 'string' ? j.error : undefined))) || j.message || j.error_message;
				if (reason) message += ' ' + String(reason).slice(0, 300);
				else if (text) message += ' ' + text.slice(0, 300);
			} catch (e) {
				if (text) message += ' ' + text.slice(0, 300);
			}
			return { ok: false, message };
		}
		await resp.json().catch(() => ({}));
		return { ok: true, detail: model };
	} catch (error) {
		return {
			ok: false,
			message: error && error.name === 'AbortError' ? '请求超时,请检查网络与 Base URL' : (error && error.message) || String(error),
		};
	}
}

function getConfig() {
	try {
		// 从 localStorage 读取API Key
		const apiKey = localStorage.getItem('api_key'); // 读取用户API Key
		// 从 localStorage 读取API model
		const apiModel = localStorage.getItem('api_model'); // 读取用户API Key
		// 三种连接模式：private（私服）/ ark（ARK 官网）/ custom（用户自配主流模型兼容端点）
		// 旧版仅以 use_private_server + api_model 表达二态,此处做向后兼容迁移：
		// 未显式保存 connection_mode 时,按 api_model 是否为空推导(private 时 model 为空)
		const rawMode = localStorage.getItem('connection_mode');
		const mode = rawMode || (apiModel ? 'ark' : 'private');
		return {
			key: apiKey,
			model: apiModel,
			mode, // 当前连接模式
			customKey: localStorage.getItem('custom_api_key') || '', // 自定义模式 API Key
			customBaseUrl: localStorage.getItem('custom_base_url') || CUSTOM_API_URL, // 自定义模式 Base URL
			customModel: localStorage.getItem('custom_model') || '', // 自定义模式 Model
			customProtocol: localStorage.getItem('custom_api_protocol') || 'responses', // 自定义模式接口协议: responses | chat
		}; // 返回配置对象
	} catch (error) {
		console.error('读取API配置失败:', error); // 输出错误日志
		return {
			key: null,
			model: null,
			mode: 'private',
			customKey: '',
			customBaseUrl: CUSTOM_API_URL,
			customModel: '',
			customProtocol: 'responses',
		};
	}
}

/**
 * 更新 ARK API 核心配置
 * @param apiKey - 用户API Key（私服模式下来自私服,用于认证和记录token使用）
 * @param apiModel - API Model（ARK/自定义模式使用,私服模式为空）
 */
function updateConfig(apiKey, apiModel) {
	localStorage.setItem('api_key', apiKey); // 保存用户API Key
	localStorage.setItem('api_model', apiModel); // 保存API Model
}

/**
 * 更新连接模式与自定义端点配置（第三种模式：用户自配主流模型）
 * @param {string} mode - 'private' | 'ark' | 'custom'
 * @param {string} customKey - 自定义模式 API Key
 * @param {string} customBaseUrl - 自定义模式 Base URL
 * @param {string} customModel - 自定义模式 Model
 * @param {string} customProtocol - 自定义模式接口协议: 'responses'(默认) | 'chat'
 */
function updateConnectionConfig(mode, customKey, customBaseUrl, customModel, customProtocol) {
	localStorage.setItem('connection_mode', mode); // 保存连接模式
	localStorage.setItem('custom_api_key', customKey || ''); // 保存自定义 API Key
	localStorage.setItem('custom_base_url', customBaseUrl || CUSTOM_API_URL); // 保存自定义 Base URL
	localStorage.setItem('custom_model', customModel || ''); // 保存自定义 Model
	localStorage.setItem('custom_api_protocol', customProtocol === 'chat' ? 'chat' : 'responses'); // 保存接口协议(仅两种合法值)
}

window.ArkAPI = {
	callArkChat,
	callPrivateChat,
	callCustomChat,
	updateConfig,
	updateConnectionConfig,
	isCustomChatProtocol, // 供 ai-chat.js 判断是否按 CC 无状态语义传参
	testConnection, // 供配置对话框「测试连接」按钮调用
};
