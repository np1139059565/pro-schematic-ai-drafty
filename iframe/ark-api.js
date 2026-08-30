
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
 * 调用私服 API 进行对话(私服转发至 ARK 并记录 token 用量)
 * @param {Array} mhistory - 消息历史数组
 * @param {string|null} previousResponseId - 上一轮响应 ID(用于多轮上下文串联)
 * @param {Array} tools - MCP 工具描述数组,内部转换为 ARK function 格式
 * @param {AbortSignal|null} signal - 超时与手动取消的合并信号
 * @returns {Promise<Object>} API 响应数据
 */
async function callPrivateChat(mhistory, previousResponseId = null, tools = [], signal = null) {
	let requestBody = null;
	try {
		// 工具结果轮传入的是 function_call_output 增量数组(每项含 type 字段),需整段发送,
		// 否则同批多个工具调用仅回灌最后一条结果;普通对话轮取最后一条即可。
		const isToolResultBatch = mhistory.length > 0 && mhistory[0].type !== undefined; // 判断是否为工具结果增量批次
		requestBody = {
			input: isToolResultBatch ? mhistory : [mhistory[mhistory.length - 1]], // 工具结果批次整段发送,普通对话仅取最后一条
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
			requestBody.tools = tools.map(tool => ({
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
					(errorJson.error && typeof errorJson.error === 'object' ? errorJson.error.message : undefined)
					|| (typeof errorJson.error === 'string' ? errorJson.error : undefined)
					|| (typeof errorJson.message === 'string' ? errorJson.message : undefined)
					|| (typeof errorJson.error_message === 'string' ? errorJson.error_message : undefined)
					|| errorJson.error; // 兜底:可能是对象字面量(转字符串时会变 [object Object],下方再补原始文本)
				errorMessage = (extracted && extracted !== '[object Object]')
					? String(extracted)
					: errorMessage; // 提取失败则保留状态码提示
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
async function callArkChat(mhistory, previousResponseId = null, tools = [], signal = null) {
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
			input: isToolResultBatch ? mhistory : [mhistory[mhistory.length - 1]], // 工具结果批次整段发送,普通对话仅取最后一条
			store: true, // 存储响应以便后续检索
			caching: { "type": "enabled" },// 启用缓存(设置了缓存不需要一直传入tools)
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
			requestBody.tools = tools.map(tool => ({
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
		console.error('AI 请求失败:', error); // 输出错误日志
		throw error; // 向上抛出错误
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
 * 与 callArkChat 共用同一套 Responses API 请求体结构,仅把 baseUrl / key / model 改为用户提供的值,
 * 从而在不改动对话主流程的前提下,支持 deepseek / glm 等 OpenAI 兼容端点的接入。
 * @param {Array} mhistory - 消息历史数组
 * @param {string|null} previousResponseId - 上一轮响应的 ID（用于多轮对话）
 * @param {Array} tools - MCP 工具描述数组
 * @param {AbortSignal|null} signal - 超时与手动取消的合并信号
 * @returns {Promise<Object>} API响应数据
 */
async function callCustomChat(mhistory, previousResponseId = null, tools = [], signal = null) {
	let requestBody = null;
	try {
		const isToolResultBatch = mhistory.length > 0 && mhistory[0].type !== undefined; // 判断是否为工具结果增量批次
		// 复用与 callArkChat 完全一致的请求体结构（Responses API）,保证多轮/工具结果批次行为一致
		requestBody = {
			input: isToolResultBatch ? mhistory : [mhistory[mhistory.length - 1]],
			store: true,
			caching: { "type": "enabled" },
			temperature: 0.2,
			top_p: 0.9,
		};
		const config = getConfig();
		// 自定义模式必须提供：自定义 API Key + 自定义 Model；Base URL 缺省回退到默认值
		if (!config.customKey || !config.customModel) {
			throw new Error('自定义模式需要配置 API Key 与 Model,请点击上方按钮进行配置后使用');
		}
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
			requestBody.tools = tools.map(tool => ({
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
			const err = new Error(`HTTP 错误! 状态码: ${response.status}\n${errorText}`);
			err.status = response.status;
			throw err;
		}

		const result = await response.json();
		console.log('AI 请求成功(自定义端点):', result);
		return { data: result, request: requestBody };
	} catch (error) {
		error.requestBody = requestBody;
		console.error('AI 请求失败(自定义端点):', error);
		throw error;
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
		}; // 返回配置对象
	} catch (error) {
		console.error('读取API配置失败:', error); // 输出错误日志
		return { key: null, model: null, mode: 'private', customKey: '', customBaseUrl: CUSTOM_API_URL, customModel: '' };
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
 */
function updateConnectionConfig(mode, customKey, customBaseUrl, customModel) {
	localStorage.setItem('connection_mode', mode); // 保存连接模式
	localStorage.setItem('custom_api_key', customKey || ''); // 保存自定义 API Key
	localStorage.setItem('custom_base_url', customBaseUrl || CUSTOM_API_URL); // 保存自定义 Base URL
	localStorage.setItem('custom_model', customModel || ''); // 保存自定义 Model
}

window.ArkAPI = {
	callArkChat,
	callPrivateChat,
	callCustomChat,
	updateConfig,
	updateConnectionConfig,
};

