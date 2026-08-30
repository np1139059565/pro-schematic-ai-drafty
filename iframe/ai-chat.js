/**
 * 主控制器 ai-chat.js —— AI 对话界面逻辑
 *
 * 职责:
 * 1. UI 状态机(UI_STATE:IDLE / SENDING / STOPPED / EXECUTING)统一管控输入框、
 *    发送/停止/清空按钮与自动执行复选框的可用性;
 * 2. 对话主流程:handleSendMessage → runSendFlow → callAIAndHandleResponse,
 *    经 ark-api.js 调用 ARK 直连或私服后端(每轮绑定 60s 超时 + 手动取消的合并信号);
 * 3. 工具调用流程:parseAIResponse 解析 function_call → generateCodeFromToolCalls 生成
 *    mcpProtocol.callTool 代码块 → 用户「确认执行」(或开启自动执行后延迟 2 秒自动点击)
 *    → executeToolCallsAndContinue → 结果以 function_call_output 回传模型继续下一轮;
 * 4. 配置管理:ARK API Key / Model / 私服开关的读写与即时生效(localStorage 持久化),
 *    配置变更时清空对话历史,避免 previous_response_id 跨服务端污染上下文;
 * 5. 调用日志:数据库激活时,每轮调用前经 dataStore.appendLog 写请求快照,
 *    响应返回后经 updateLogResponse 回填(fire-and-forget,失败不阻断对话);
 * 6. 系统消息:暴露 window.applySystemMessage 供 data-store.js 在 prompt_index
 *    被编辑后同步替换当前会话历史中的 system 消息,无需清空对话即可生效。
 *
 * 运行时超级对象(全局 window 挂载点)的统一定义见 mcp/meta-tools.js(协议壳 window.mcpProtocol)与 mcp/curated-tools/index.js(精选工具 window.curatedTools)顶部「超级对象挂载区」,
 * 本文件实际消费的运行时对象为 window.mcpProtocol(协议壳,见 L573/L833 等调用)与 window.promptList(见 L75 取 prompt_index);
 * 均由对应源码文件集中挂载。
 *
 * 依赖模块(均由 ai-chat.html 在本文件之前加载):
 *   ark-api.js(后端) / mcp/mcp-core.js + mcp/custom-tools.js(工具执行与超级对象定义) / data-store.js(数据与日志) /
 *   abort-signal.js(取消信号 AbortManager) / error-handler.js(错误分类 ErrorHandler)
 */

// DOM 元素引用
let messagesContainer; // 消息容器
let messageInput; // 输入框
let sendBtn; // 发送按钮
let stopBtn; // 停止按钮
let clearBtn; // 清空按钮
let statusText; // 状态文本
let configBtn; // 配置按钮
let configDialog; // 配置对话框
let configCloseBtn; // 配置关闭按钮
let configSaveBtn; // 配置保存按钮
let configCancelBtn; // 配置取消按钮
let arkApiKeyInput; // API Key 输入框
let arkModelInput; // API Model 输入框
let arkModelInputContainer; // API Model 输入框容器（用于显示/隐藏）
let usePrivateServerCheckbox; // 使用私服复选框（旧版遗留，仅保留引用，逻辑已由连接模式选择器取代）
let customApiKeyInput; // 自定义模式 API Key 输入框
let customBaseUrlInput; // 自定义模式 Base URL 输入框
let customModelInput; // 自定义模式 Model 输入框
let arkApiKeyContainer; // API Key 配置项容器（按模式显隐）
let customApiKeyContainer; // 自定义 API Key 配置项容器
let customBaseUrlContainer; // 自定义 Base URL 配置项容器
let customModelContainer; // 自定义 Model 配置项容器
let modelInfoEl; // 状态栏「当前模型」展示位
let packageInfoEl; // 状态栏「已领取套餐」展示位
let autoExecWriteCheckbox; // 自动执行复选框
let autoExecWriteEnabled = false; // 自动执行开关（默认关闭）
let usePrivateServer = false; // 是否为私服模式（由 connectionMode 派生，保持旧逻辑兼容）
// 连接模式：'private'(私服) | 'ark'(ARK 官网) | 'custom'(用户自配主流模型兼容端点，第三种模式)
let connectionMode = 'private';

// 对话历史数组，用于维护上下文
let conversationHistory = []; // 存储所有对话消息，格式：[{role: 'user', content: '...'}, {role: 'assistant', content: '...'}]
let previousResponseId = null; // 上一轮响应的 ID（用于多轮对话）
// 注意:取消语义已统一交由 abort-signal.js 的 AbortManager 管理,此处不再使用全局 isStop 标志
let totalTokensAccumulated = 0; // 累加多轮对话的 total_tokens
let lastStatusText = ''; // 最近一次 updateStatus 的状态文案(供 refreshStatusToken 复用)
let lastStatusType = ''; // 最近一次 updateStatus 的状态类型(供 refreshStatusToken 复用)
let currentLoadingId = null; // 当前加载指示器 ID

// 异步操作追踪
let activeTimeouts = new Set(); // 追踪正在执行的 setTimeout ID
let activeApiPromises = new Set(); // 追踪正在执行的 API Promise

// 界面状态枚举
const UI_STATE = {
	IDLE: 'idle',           // 空闲状态
	SENDING: 'sending',     // 发送中
	STOPPED: 'stopped',     // 已停止
	EXECUTING: 'executing'  // 代码执行中
};

let currentUIState = UI_STATE.IDLE; // 当前界面状态
let pendingConfirmation = false; // 是否存在等待用户确认执行的代码块(待确认态)


// 系统消息 - 用于描述 AI 角色和职责，用户可以在控制台临时修改系统消息，对 AI 巧绘进行定制化
// 取出时还原 @name 引用标记为裸 name，保证送入模型的文本与标记化前逐字节一致（详见《系统设计说明》§4.5「@引用 标记与还原」）
// 系统消息承载于 prompt_index 提示词（全局索引），而非旧版的 system_message
// 系统消息的唯一写入口为 applySystemMessage(见下方定义):既更新 window.top.systemMessage,
// 又同步替换会话历史中的 system 消息,保证单一所有权、避免与 data-store.js 重复直写失步。
applySystemMessage(window.dataStore.stripRefMarks(
	window.promptList.find(prompt => prompt.name === 'prompt_index').messages[0].content.text || ''
));

/**
 * 应用新的系统消息并即时生效
 * 由 data-store.js 在数据库激活/prompt_index 提示词被编辑后调用:
 * 除更新全局 systemMessage 外,还同步替换当前对话历史中的 system 消息,
 * 使修改无需清空对话即可在下一轮请求生效
 * @param {string} newText - 新的系统消息文本
 */
function applySystemMessage(newText) {
	window.top.systemMessage = newText; // 更新全局系统消息
	const systemMsg = conversationHistory.find((msg) => msg.role === 'system'); // 查找会话中的系统消息
	if (systemMsg) {
		systemMsg.content = newText; // 已存在则原地替换内容
	}
}
window.applySystemMessage = applySystemMessage; // 暴露给 data-store.js 调用

/**
 * AI 请求异常统一收尾（消除 callAIAndHandleResponse / continueConversationAfterTools 两处重复的 catch 模板）
 * 负责：① 从追踪集合移除 API Promise；② 移除加载指示器；③ 用户主动取消(abort)时静默返回 true；
 * ④ 失败日志采集——若本次尚未落库请求快照(await 前 reject)，用 ark-api 挂在错误上的真实请求体补写，
 * 再回填错误快照使日志面板可见失败原因。
 * @param {Promise} apiPromise 本次 AI 请求的 Promise(可能为 undefined)
 * @param {Error} error 捕获到的异常
 * @param {number|undefined} chatLogId 成功路径已写入的日志行 ID(未写入则为 undefined)
 * @returns {boolean} 返回 true 表示用户取消、调用方应静默 return；false 表示需继续 throw
 */
function cleanupAfterAIError(apiPromise, error, chatLogId) {
	// 从追踪集合中移除（即使出错也要移除）
	if (apiPromise) {
		activeApiPromises.delete(apiPromise);
	}
	// 移除加载指示器
	removeLoadingIndicator();
	// 用户主动取消(abort)引发的错误不再作为失败处理
	if (AbortManager.isCancelled()) {
		return true;
	}
	// 失败请求日志采集:无论是否已在成功路径写入,只要本次请求拿到了真实请求体,
	// 就确保有一行「请求快照 + 错误快照」落库。成功路径已写入则仅回填错误;
	// 失败路径(await 之前 reject)则在此用错误上挂载的 requestBody 补写完整日志。
	if (!chatLogId) {
		// 失败分支:用 ark-api 挂在错误上的真实请求体补写请求快照
		chatLogId = writeChatLog(error.requestBody || {});
	}
	updateChatLogResponse(chatLogId, { error: error.message });
	return false;
}

// ==================== 日志写入（数据库激活时记录每轮 AI 调用） ====================

/** 当前日志会话 ID 与轮次(仅数据库已激活时记录) */
let currentSessionId = null;
let currentTurn = 0;

/** 是否启用日志写入(仅数据库激活且 dataStore 提供日志 API 时) */
function isLoggingEnabled() {
	return !!(window.dataStore && window.dataStore.isActivated && window.dataStore.isActivated()
		&& window.dataStore.createSession && window.dataStore.appendLog);
}

/** 新建日志会话(每次用户发送消息时调用;标题取首句前 20 字) */
function startLogSession(firstUserText) {
	currentSessionId = null;
	currentTurn = 0;
	if (!isLoggingEnabled()) return;
	const title = (firstUserText || '').trim().slice(0, 20) || '未命名会话';
	currentSessionId = window.dataStore.createSession(title);
}

/** 写入本轮请求日志(同步返回 logId,失败不影响主流程) */
function writeChatLog(requestPayload) {
	if (!isLoggingEnabled() || !currentSessionId) return null;
	currentTurn += 1;
	// 序列化嵌套对象后再存入 STRING 列,遵循业务表既定范式(JSON.stringify 后再存),
	// 避免 INDEXEDDB 后端将对象退化为 "[object Object]" 导致界面乱码
	return window.dataStore.appendLog({
		sessionId: currentSessionId,
		turn: currentTurn,
		requestPayload: JSON.stringify(requestPayload),
		promptSnapshot: window.top.systemMessage, // 系统消息快照(字符串)
		// 工具描述快照优先取接口真实 tools(真实接口数据),缺失时降级到前端镜像(元工具清单)
		toolSnapshot: JSON.stringify((requestPayload && requestPayload.tools) || collectToolDescriptions() || [])
	});
}

/** 回填本轮响应日志(异步,吞异常) */
function updateChatLogResponse(logId, responsePayload) {
	if (!logId || !window.dataStore.updateLogResponse) return;
	try {
		// 序列化嵌套对象后再存入 STRING 列,避免 INDEXEDDB 后端退化为 "[object Object]"
		window.dataStore.updateLogResponse(logId, JSON.stringify(responsePayload));
	} catch (error) {
		console.error('[ai-chat] 日志响应回填失败:', error);
	}
}

// 初始化函数
/**
 * 安装全局未捕获异常兜底处理器（方案A核心）
 *
 * 职责：
 * 1. 拦截 window 上的 "unhandledrejection" 事件——即 EDA 宿主原生 API 在内部 UI 逻辑
 *    （ui.js/api.js）深处自行 reject、却未返回到插件 await 链上的逃逸 promise。
 *    典型表现：控制台出现 "Uncaught (in promise) #<Mt>"，Mt 为 EDA 内部错误对象（minified）。
 * 2. 拦截 window 上的 "error" 事件——兜底捕获逃逸到全局的同步异常（同源于 EDA 宿主）。
 * 3. 统一转换为带上下文的 console.error 日志（不影响对话主流程，不抛出、不阻断页面），
 *    从而防止逐轮累积的未捕获 rejection 触发宿主"不可处理的错误"导致页面卡死。
 *
 * 注意：
 * - 此处理器仅作"最后一道防线"。工具执行链路上的可预期错误（参数非法、工具抛错等）
 *   仍由 executeSingleToolCall / callTool 的 try/catch 捕获并回喂模型自愈，不在此重复处理。
 * - 若逃逸 rejection 携带 reason 且 reason 含可识别文本，一并打印，便于定位根因
 *   （如 "uuid/libraryUuid 不存在"、"画布未激活"、"编辑器未聚焦" 等 EDA 语义）。
 * - 使用模块级标志 guardInstalled 确保只注册一次（init 可能因热重载多次调用）。
 */
let guardInstalled = false; // 全局兜底处理器是否已安装（防止重复注册）
function installGlobalRejectionGuard() {
	if (guardInstalled) {
		// 已安装则直接返回，避免重复绑定同一监听器
		return;
	}
	guardInstalled = true; // 标记已安装

	// 拦截未捕获的 Promise rejection（核心场景：EDA 原生 API 逃逸的内部 promise）
	window.addEventListener('unhandledrejection', (event) => {
		const reason = event.reason; // 逃逸的拒绝原因（可能是 Error 对象或任意值，如 #<Mt>）
		let reasonText = '未知原因'; // 默认描述
		if (reason instanceof Error) {
			// 标准 Error：提取 message（Mt 等 minified 对象通常 message 含 EDA 语义）
			reasonText = reason.message || reason.toString();
		} else if (typeof reason === 'string') {
			// 字符串原因直接采用
			reasonText = reason;
		} else if (reason && typeof reason === 'object') {
			// 对象原因：尽量序列化（#<Mt> 之类无 message 的对象也能留下类型线索）
			try {
				reasonText = JSON.stringify(reason);
			} catch (_) {
				reasonText = reason.toString();
			}
		}
		// 记录到控制台：标注来源，便于区分"可预期的工具错误"与"宿主逃逸异常"
		console.error('[ai-chat] 已拦截未捕获的 Promise rejection（来源：EDA 宿主原生 API，不影响对话）：', reasonText);
		// 调用 preventDefault 阻止浏览器将其作为致命错误上报，避免宿主判定页面不可恢复
		if (typeof event.preventDefault === 'function') {
			event.preventDefault();
		}
	});

	// 拦截逃逸到全局的同步错误（双保险：EDA 宿主在个别路径会同步 throw 而非 reject）
	window.addEventListener('error', (event) => {
		// 仅处理确实逃逸到 window 的运行时错误（event.error 存在说明来自 window.onerror）
		if (event && event.error) {
			const msg = event.error.message || event.message || '未知错误';
			console.error('[ai-chat] 已拦截全局逃逸错误（来源：EDA 宿主，不影响对话）：', msg);
		}
	});
}

/**
 * 初始化对话宿主。
 * 注册全局异常兜底处理器(拦截 EDA 原生 API 逃逸的未捕获 rejection/同步错误),
 * 绑定 UI 事件与输入框交互,拉取历史会话与提示词列表,最后触发首轮问候。
 * 整个生命周期只应被调用一次。
 */
function init() {
	// 注册全局异常兜底处理器（方案A：拦截 EDA 原生 API 逃逸的未捕获 rejection/同步错误）
	// 背景：嘉立创 EDA 宿主原生 API（如 eda.sch_PrimitiveComponent.create）在内部 UI 校验失败、
	// 画布未激活、元件 uuid 不存在等场景下，会在 ui.js/api.js 深处自行 reject 一个内部 promise，
	// 该 promise 未返回到我们的 await 链上（fire-and-forget），在 microtask 阶段被浏览器抛出为
	// "Uncaught (in promise)"。此类逃逸 rejection 不会中断当前 await（外层已拿到包装结果），
	// 但会逐轮累积，最终触发宿主"不可处理的错误"导致页面卡死。
	// 此处统一拦截，转为带上下文的日志记录，避免页面崩溃；真实的工具执行错误仍由
	// executeSingleToolCall 的 try/catch → callTool 的 try/catch 正常回喂模型自愈。
	installGlobalRejectionGuard();

	// 获取 DOM 元素
	messagesContainer = document.getElementById('messagesContainer');
	messageInput = document.getElementById('messageInput');
	sendBtn = document.getElementById('sendBtn');
	stopBtn = document.getElementById('stopBtn');
	clearBtn = document.getElementById('clearBtn');
	statusText = document.getElementById('statusText');
	configBtn = document.getElementById('configBtn');
	configDialog = document.getElementById('configDialog');
	configCloseBtn = document.getElementById('configCloseBtn');
	configSaveBtn = document.getElementById('configSaveBtn');
	configCancelBtn = document.getElementById('configCancelBtn');
	arkApiKeyInput = document.getElementById('arkApiKeyInput');
	arkModelInput = document.getElementById('arkModelInput');
	arkModelInputContainer = document.getElementById('arkModelInputContainer'); // 获取 API Model 输入框容器
	arkApiKeyContainer = document.getElementById('arkApiKeyContainer'); // 获取 API Key 配置项容器
	customApiKeyInput = document.getElementById('customApiKeyInput'); // 获取自定义 API Key 输入框
	customBaseUrlInput = document.getElementById('customBaseUrlInput'); // 获取自定义 Base URL 输入框
	customModelInput = document.getElementById('customModelInput'); // 获取自定义 Model 输入框
	customApiKeyContainer = document.getElementById('customApiKeyContainer'); // 获取自定义 API Key 配置项容器
	customBaseUrlContainer = document.getElementById('customBaseUrlContainer'); // 获取自定义 Base URL 配置项容器
	customModelContainer = document.getElementById('customModelContainer'); // 获取自定义 Model 配置项容器
	modelInfoEl = document.getElementById('modelInfo'); // 获取状态栏模型信息展示位
	packageInfoEl = document.getElementById('packageInfo'); // 获取状态栏套餐信息展示位
	usePrivateServerCheckbox = document.getElementById('usePrivateServerCheckbox'); // 保留引用（已不再作为主开关）
	autoExecWriteCheckbox = document.getElementById('autoExecWriteCheckbox'); // 获取自动执行复选框

	// 绑定事件监听器
	sendBtn.addEventListener('click', handleSendMessage); // 发送按钮点击事件
	clearBtn.addEventListener('click', handleClearChat); // 清空按钮点击事件
	stopBtn.addEventListener('click', handleStop); // 停止按钮点击事件
	configBtn.addEventListener('click', handleConfigClick); // 配置按钮点击事件
	configCloseBtn.addEventListener('click', handleCloseConfig); // 配置关闭按钮点击事件
	configSaveBtn.addEventListener('click', handleSaveConfig); // 配置保存按钮点击事件
	configCancelBtn.addEventListener('click', handleCloseConfig); // 配置取消按钮点击事件
	// 点击遮罩层关闭对话框
	configDialog.querySelector('.config-overlay').addEventListener('click', handleCloseConfig); // 遮罩层点击事件
	// 写入自动执行开关事件
	autoExecWriteCheckbox.addEventListener('change', () => {
		autoExecWriteEnabled = autoExecWriteCheckbox.checked; // 更新写入自动执行开关状态
	}); // 复选框切换事件
	autoExecWriteCheckbox.checked = autoExecWriteEnabled; // 初始化复选框状态为默认关闭
	// 连接模式三选一：监听 radio 组变化，动态显隐对应配置项
	document.querySelectorAll('input[name="connMode"]').forEach((radio) => {
		radio.addEventListener('change', handleConnectionModeChange); // 绑定模式切换事件
	});
	// 输入框事件
	messageInput.addEventListener('keydown', (e) => {
		// 按 Enter 发送（Shift+Enter 换行）
		if (e.key === 'Enter' && !e.shiftKey) {
			e.preventDefault(); // 阻止默认换行行为
			handleSendMessage(); // 发送消息
		}
	});

	// 输入框自动调整高度
	messageInput.addEventListener('input', () => {
		messageInput.style.height = 'auto'; // 重置高度
		messageInput.style.height = messageInput.scrollHeight + 'px'; // 根据内容调整高度
	});

	// 加载配置
	loadConfig(); // 从 localStorage 加载配置
	setupPrivateServerLink(); // 设置私服链接

	// 初始化本地数据层(异步):数据库已激活时会用数据库数据覆盖运行时缓存,
	// 未激活时保持原始 JS 数据不变,失败不阻断聊天主流程
	if (window.dataStore) {
		window.dataStore.init().catch((error) => console.error('数据层初始化失败:', error));
	}

	// 设置初始状态
	updateUIState(UI_STATE.IDLE); // 初始化界面状态
	updateStatus('', ''); // 清空状态文本
}


/**
 * 统一更新界面状态
 * @param {string} state - 目标状态 (UI_STATE.IDLE | UI_STATE.SENDING | UI_STATE.STOPPED | UI_STATE.EXECUTING)
 */
function updateUIState(state) {
	currentUIState = state; // 更新当前状态

	switch (state) {
		case UI_STATE.IDLE:
			// 空闲状态：可发送消息、可清空、可配置、停止按钮隐藏
			setInputDisabled(false); // 启用输入框和发送按钮
			stopBtn.style.display = 'none'; // 隐藏停止按钮
			clearBtn.disabled = false; // 启用清空按钮
			autoExecWriteCheckbox.disabled = false; // 启用自动执行复选框
			configBtn.disabled = false; // 启用配置按钮
			break;

		case UI_STATE.SENDING:
			// 发送中：禁用输入/发送/清空、允许配置、显示停止
			setInputDisabled(true); // 禁用输入框和发送按钮
			stopBtn.style.display = 'block'; // 显示停止按钮
			clearBtn.disabled = true; // 禁用清空按钮
			autoExecWriteCheckbox.disabled = false; // 允许自动执行复选框（但停止后会被禁用）
			configBtn.disabled = false; // 允许配置
			break;

		case UI_STATE.STOPPED:
			// 停止中：禁用输入/发送/清空/自动执行复选框、隐藏停止按钮、取消自动执行选中状态
			setInputDisabled(true); // 禁用输入框和发送按钮
			stopBtn.style.display = 'none'; // 隐藏停止按钮
			clearBtn.disabled = true; // 禁用清空按钮
			autoExecWriteCheckbox.disabled = true; // 禁用自动执行复选框
			autoExecWriteEnabled = false; // 取消自动执行
			autoExecWriteCheckbox.checked = false; // 取消自动执行选中状态
			configBtn.disabled = false; // 允许配置
			break;

		case UI_STATE.EXECUTING:
			// 代码执行中：禁用输入/发送/清空、允许配置、显示停止
			setInputDisabled(true); // 禁用输入框和发送按钮
			stopBtn.style.display = 'block'; // 显示停止按钮
			clearBtn.disabled = true; // 禁用清空按钮
			autoExecWriteCheckbox.disabled = false; // 允许自动执行复选框
			configBtn.disabled = false; // 允许配置
			break;
	}
}



/**
 * 添加 AI 回复到对话历史
 * @param {Object} message - 消息对象
 * @param {Array} toolCalls - 工具调用数组
 */
function addAssistantMessageToHistory(message, toolCalls) {
	conversationHistory.push({
		role: 'assistant', // AI 角色
		content: message, // AI 回复内容
		toolCalls: toolCalls, // 工具调用信息
	}); // 添加到对话历史
}

/**
 * 处理用户消息的 UI 操作
 * 包括移除欢迎消息、清空输入框等
 * @param message - 用户消息内容
 */
function prepareUserMessageUI(message) {
	// 移除欢迎消息（如果存在）
	const welcomeMsg = messagesContainer.querySelector('.welcome-message'); // 获取欢迎消息
	if (welcomeMsg) {
		welcomeMsg.remove(); // 移除欢迎消息
	}

	// 添加用户消息到界面
	addMessageToChat('user', message); // 添加用户消息

	// 清空输入框
	messageInput.value = ''; // 清空输入框
	messageInput.style.height = 'auto'; // 重置输入框高度
}

// ==================== API 调用和响应处理相关函数 ====================

/**
 * 解析工具参数
 * @param {string|Object} argumentsStr - 工具参数字符串或对象
 * @returns {Object} 解析后的参数对象
 */
function parseToolArguments(argumentsStr) {
	if (!argumentsStr) {
		return {}; // 如果没有参数，返回空对象
	}
	try {
		return typeof argumentsStr === 'string'
			? JSON.parse(argumentsStr) // 如果是字符串，解析 JSON
			: argumentsStr; // 如果已经是对象，直接返回
	} catch (e) {
		// 如果解析失败，返回原始值（用于 generateCodeFromToolCalls）
		return argumentsStr; // 返回原始字符串
	}
}

/**
 * 更新上一轮响应 ID
 * @param {string|null} responseId - 响应 ID
 */
function updatePreviousResponseId(responseId) {
	if (responseId) {
		previousResponseId = responseId; // 更新响应 ID
	}
}

/**
 * 提取消息内容
 * @param {Object} item - 消息项
 * @returns {string} 消息内容
 */
function extractMessageContent(item) {
	if (item.content && Array.isArray(item.content)) {
		// content 是数组格式
		return item.content
			.filter(c => c.type === 'output_text') // 过滤文本类型
			.map(c => c.text) // 提取文本
			.join(''); // 拼接文本
	} else if (typeof item.content === 'string') {
		// content 是字符串格式
		return item.content; // 直接返回字符串
	}
	return ''; // 默认返回空字符串
}

/**
 * 提取工具调用
 * @param {Object} item - 工具调用项
 * @returns {Object} 工具调用对象
 */
function extractToolCall(item) {
	return {
		id: item.call_id || item.id, // 工具调用 ID
		function: {
			name: item.name, // 函数名称
			arguments: typeof item.arguments === 'string'
				? item.arguments
				: JSON.stringify(item.arguments || {}), // 参数（JSON 字符串）
		},
	}; // 返回工具调用对象
}

/**
 * 解析 AI API 响应，提取回复内容和工具调用信息
 * @param response - API 响应对象（Responses API 格式）
 * @returns {Object} 包含 content 和 toolCalls 的对象
 */
function parseAIResponse(response) {
	// 解析 AI 回复
	let aiResponse = ''; // AI 回复内容
	let toolCalls = null; // 工具调用信息

	if (response && response.output && Array.isArray(response.output)) {
		// Responses API 格式：解析 output 数组
		const output = response.output; // 获取 output 数组

		// 查找消息类型的输出
		for (const item of output) {
			if (item.type === 'message' && item.role === 'assistant') {
				// 找到助手消息
				aiResponse = extractMessageContent(item); // 提取消息内容
			} else if (item.type === 'function_call') {
				// 找到工具调用
				if (!toolCalls) {
					toolCalls = []; // 初始化工具调用数组
				}
				toolCalls.push(extractToolCall(item)); // 提取并添加工具调用
			}
		}

		// 如果既没有内容也没有工具调用
		if (!aiResponse && !toolCalls) {
			aiResponse = '抱歉，我没有收到有效的回复.'; // 错误提示
		}
	} else {
		// 如果响应格式不正确
		aiResponse = '抱歉，AI 返回的响应格式不正确.'; // 错误提示
	}

	return {
		content: aiResponse, // 回复内容
		toolCalls: toolCalls, // 工具调用信息
		responseId: response?.id, // 响应 ID
	}; // 返回解析结果
}

/**
 * 从工具调用生成代码块内容
 * @param {Array} toolCalls - 工具调用数组
 * @returns {string} 代码块内容
 */
function generateCodeFromToolCalls(toolCalls) {
	if (!toolCalls || toolCalls.length === 0) {
		return ''; // 如果没有工具调用，返回空字符串
	}

	// 生成代码块，包含所有工具调用
	let codeLines = ['const resp = { data: null, errorMessage: null, stack: null };']; // 初始化响应对象

	// 遍历所有工具调用
	for (let i = 0; i < toolCalls.length; i++) {
		const toolCall = toolCalls[i]; // 获取工具调用
		const toolName = toolCall.function.name; // 获取工具名称
		const argumentsObj = parseToolArguments(toolCall.function.arguments); // 使用公共函数解析参数

		// 生成工具调用代码
		if (toolCalls.length === 1) {
			// 单个工具调用
			codeLines.push(`const result = await mcpProtocol.callTool({ name: '${toolName}', arguments: ${JSON.stringify(argumentsObj, null, 2)} });`); // 调用工具
			codeLines.push('resp.data = result;'); // 设置结果
		} else {
			// 多个工具调用
			codeLines.push(`const result${i} = await mcpProtocol.callTool({ name: '${toolName}', arguments: ${JSON.stringify(argumentsObj, null, 2)} });`); // 调用工具
			if (i === toolCalls.length - 1) {
				// 最后一个工具调用，设置结果
				codeLines.push(`resp.data = [${Array.from({ length: toolCalls.length }, (_, idx) => `result${idx}`).join(', ')}];`); // 设置结果数组
			}
		}
	}

	codeLines.push('return resp;'); // 返回响应

	return codeLines.join('\n'); // 返回代码字符串
}

/**
 * 执行单个工具调用（从 executeToolCalls 拆分）
 * @param {Object} toolCall - 工具调用对象
 * @returns {Promise<Object>} 执行结果
 */
async function executeSingleToolCall(toolCall) {
	try {
		const toolName = toolCall.function.name; // 获取工具名称
		const argumentsObj = parseToolArguments(toolCall.function.arguments); // 使用公共函数解析参数

		// 如果解析失败（返回的是字符串）,说明参数格式错误
		if (typeof argumentsObj === 'string') {
			return {
				tool_call_id: toolCall.id, // 工具调用 ID
				content: `参数解析失败：参数格式不正确`, // 错误信息
				isError: true, // 标记为错误
			};
		}

		// 调用 MCP 工具
		const result = await window.mcpProtocol.callTool({
			name: toolName, // 工具名称
			arguments: argumentsObj, // 工具参数
		});

		// 格式化返回结果
		if (result.isError) {
			// 如果工具执行出错
			return {
				tool_call_id: toolCall.id, // 工具调用 ID
				content: result.content?.[0]?.text || '工具执行失败', // 错误信息
				isError: true, // 标记为错误
			};
		} else {
			// 工具执行成功
			const content = result.content?.[0]?.text || JSON.stringify(result); // 提取文本内容
			return {
				tool_call_id: toolCall.id, // 工具调用 ID
				content: content, // 返回内容
				isError: false, // 标记为成功
			};
		}
	} catch (error) {
		// 捕获执行错误：复用 ErrorHandler.toToolError 归类为工具错误结果，
		// 结果将作为 function_call_output 回喂模型（对应文档"工具错误回喂模型自愈"）
		const toolError = window.ErrorHandler.toToolError(error); // 归类为工具错误
		return {
			tool_call_id: toolCall.id, // 工具调用 ID
			content: `❌ ${toolError.message}`, // 错误描述
			isError: true, // 标记为错误
		};
	}
}

/**
 * 执行工具调用并返回结果
 * @param {Array} toolCalls - 工具调用数组
 * @returns {Promise<Object>} 执行结果
 */
async function executeToolCalls(toolCalls) {
	const results = []; // 初始化结果数组

	// 遍历所有工具调用
	for (const toolCall of toolCalls) {
		const result = await executeSingleToolCall(toolCall); // 执行单个工具调用
		results.push(result); // 添加到结果数组
	}

	return results; // 返回所有工具执行结果
}

/**
 * 汇总首轮请求应携带的「元工具」描述清单
 * 渐进式注入策略:首轮仅暴露 window.mcpProtocol 的协议壳元工具(callTool/listTools/searchTools 等),
 * 精选工具(window.curatedTools)与 EDA 原生 API 不进首屏,由模型经 listTools({scenario}) /
 * searchTools({keywords}) 按需下钻获取,避免全量注入淹没上下文。
 * 过滤显式禁用项(enabled === false);清单为空时返回 null 以便调用方省略 tools 字段。
 * @returns {Array|null} 元工具描述数组;无可用工具时返回 null
 */
function collectToolDescriptions() {
	const metaTools = (window.mcpProtocol && Array.isArray(window.mcpProtocol.metaToolSchemas))
		? window.mcpProtocol.metaToolSchemas : [];
	const tools = metaTools.filter(tool => tool && tool.enabled !== false);
	return tools.length > 0 ? tools : null;
}

/**
 * 调用 AI API 并处理响应
 * 包括调用 API、解析响应、添加 AI 回复到界面和历史
 */
/**
 * 依据当前连接模式返回对应的对话通道函数
 * 三态映射：private→callPrivateChat（私服代理） / custom→callCustomChat（用户自配端点） / ark→callArkChat（ARK 官网直连）
 * 统一收口对话分发，避免在各调用点重复三元判断。
 * @returns {Function} 对话通道函数
 */
function getChatCaller() {
	if (connectionMode === 'private') return window.ArkAPI.callPrivateChat;
	if (connectionMode === 'custom') return window.ArkAPI.callCustomChat;
	return window.ArkAPI.callArkChat;
}

/**
 * 取当前用量上报应携带的模型名
 * 私服模式由服务端决定模型，客户端未知，传空（服务端按用户记录）；
 * ARK / 自定义模式直接取本地配置的模型名。
 * @returns {string} 模型名
 */
function usageModelName() {
	if (connectionMode === 'private') return '';
	if (connectionMode === 'custom') return localStorage.getItem('custom_model') || '';
	return localStorage.getItem('api_model') || '';
}

/**
 * 上报单次对话的 Token 消耗（仅私服模式生效，best-effort 不阻塞）
 * 非私服模式无对应账户，直接跳过；上报失败（网络/服务端异常）一律静默忽略，不影响对话主流程。
 * 优先使用 navigator.sendBeacon（即使页面卸载也能送达），降级到 fire-and-forget fetch。
 * @param {string} model - 模型名（私服模式由服务端决定，此处可传空）
 * @param {number} totalTokens - 总 token 消耗
 * @param {number} inputTokens - 输入 token 数
 * @param {number} outputTokens - 输出 token 数
 * @param {string} conversationId - 会话标识（用于聚合）
 */
function reportTokenUsage(model, totalTokens, inputTokens, outputTokens, conversationId) {
	if (connectionMode !== 'private') return; // 仅私服模式需上报用量
	const apiKey = localStorage.getItem('api_key') || '';
	if (!apiKey) return;
	const payload = {
		user_api_key: apiKey,
		model: model || '',
		input_tokens: inputTokens || 0,
		output_tokens: outputTokens || 0,
		total_tokens: totalTokens || 0,
		conversation_id: conversationId || '',
	};
	try {
		const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
		if (navigator.sendBeacon) {
			// sendBeacon 不受页面卸载影响，最适合旁路统计上报
			navigator.sendBeacon(`${getPrivateServerUrl()}/api/usage`, blob);
		} else {
			fetch(`${getPrivateServerUrl()}/api/usage`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(payload),
			}).catch(() => {}); // 失败静默忽略
		}
	} catch (e) {
		// 任何异常都不应影响对话
		console.error('[ai-chat] Token 用量上报失败(已忽略):', e);
	}
}

/**
 * 刷新状态栏「当前模型」展示
 * 私服模式：向服务端拉取实际模型（服务端按多模型策略动态选择），拉取失败/无模型时显示中性占位；
 * 非私服模式：直接展示本地配置的模型名，绝不发起请求，确保不会出现 API 不兼容报错。
 */
function refreshModelInfo() {
	if (!modelInfoEl) return;
	if (connectionMode === 'private') {
		const apiKey = localStorage.getItem('api_key') || '';
		if (!apiKey) { modelInfoEl.textContent = '模型: 未登录'; return; }
		fetch(`${getPrivateServerUrl()}/api/model-info?user_api_key=${encodeURIComponent(apiKey)}`)
			.then(r => r.json().catch(() => ({})))
			.then(d => { modelInfoEl.textContent = (d && d.model) ? `模型: ${d.model}` : '模型: 未知'; })
			.catch(() => { modelInfoEl.textContent = '模型: 未知'; });
	} else {
		// 非私服模式本地即可得知模型，无需请求
		const localModel = connectionMode === 'custom'
			? (localStorage.getItem('custom_model') || '')
			: (localStorage.getItem('api_model') || '');
		modelInfoEl.textContent = localModel ? `模型: ${localModel}` : '模型: 未配置';
	}
}

/**
 * 刷新状态栏「已领取套餐」展示（仅私服模式）
 * 展示领取的模型类型与剩余数量，并标注该额度来自「管理员免费 token 拆分」。
 * 非私服模式无对应账户，清空展示。
 */
function refreshPackageInfo() {
	if (!packageInfoEl) return;
	if (connectionMode !== 'private') { packageInfoEl.textContent = ''; return; }
	const apiKey = localStorage.getItem('api_key') || '';
	if (!apiKey) { packageInfoEl.textContent = ''; return; }
	fetch(`${getPrivateServerUrl()}/api/user/package?user_api_key=${encodeURIComponent(apiKey)}`)
		.then(r => r.json().catch(() => ({})))
		.then(d => {
			if (!d || !d.claimed) { packageInfoEl.textContent = ''; return; }
			const splitNote = d.is_admin_free_split ? '（管理员免费额度拆分）' : '';
			packageInfoEl.textContent = `套餐: ${d.model || '未知'} · 剩余 ${d.remaining}${splitNote}`;
		})
		.catch(() => { packageInfoEl.textContent = ''; });
}

/**
 * 故障上报（对话不可预知报错时，由错误气泡内的「上报此问题」链接触发）
 * 收集错误堆栈/上下文，经客服通道提交给管理员；非私服用户（无账户/会话）引导先注册登录。
 * @param {Error} error - 原始错误对象（含 message / stack / requestBody）
 */
function handleFaultReport(error) {
	// 故障上报依赖私服账户：非私服模式无法提交，明确引导用户先注册登录私服
	if (connectionMode !== 'private') {
		alert('故障上报需要先注册并登录私服用户。\n请前往私服领取 token 后，使用「私服」模式使用本插件。');
		return;
	}
	const apiKey = localStorage.getItem('api_key') || '';
	if (!apiKey) {
		alert('故障上报需要先登录私服用户。\n请在配置中选择「私服」模式并填写你的 API Key。');
		return;
	}

	// 组装错误上下文：时间、模式、错误文本、堆栈、最近请求体
	let content = '【插件故障上报】\n';
	content += `时间: ${new Date().toLocaleString()}\n`;
	content += `连接模式: ${connectionMode}\n`;
	const localModel = localStorage.getItem('api_model') || localStorage.getItem('custom_model') || '';
	content += `模型(本地配置): ${localModel || '(由私服决定)'}\n`;
	if (error) {
		if (error.message) content += `错误信息: ${error.message}\n`;
		if (error.stack) content += `堆栈: ${error.stack}\n`;
		if (error.requestBody) content += `请求体: ${JSON.stringify(error.requestBody).slice(0, 2000)}\n`;
	}

	// 可选的用户补充说明
	const note = prompt('可补充问题描述（选填，将随错误一并上报给管理员）：', '');
	if (note !== null && note.trim()) content += `用户补充: ${note.trim()}\n`;

	fetch(`${getPrivateServerUrl()}/api/support/report`, {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ user_api_key: apiKey, content, msg_type: 'text' }),
	})
		.then(r => { if (!r.ok) throw new Error('status ' + r.status); return r.json(); })
		.then(() => {
			alert('已上报给管理员。\n您可在普通用户页面的「客服」入口查看管理员回复。');
		})
		.catch(() => {
			alert('上报失败，请稍后重试，或直接在「客服」入口描述问题。');
		});
}

async function callAIAndHandleResponse() {

	// 确保系统消息在对话历史中
	const isAddTool = ensureSystemMessage(); // 确保系统消息存在

	// 创建 API Promise 并追踪
	let apiPromise;
	let chatLogId;
	try {
		// 根据配置选择调用 ARK API 或私服 API
		apiPromise =
			getChatCaller()(
				conversationHistory, previousResponseId, isAddTool ? collectToolDescriptions() : null,
				window.AbortManager.createTimeoutSignal(60000)); // 调用 API(绑定 60s 超时+手动取消信号)

		// 追踪 API Promise
		activeApiPromises.add(apiPromise); // 添加到追踪集合

		// 等待 API 响应
		const response = await apiPromise;
		// 采集接口真实请求参数(来自 fetch 真实发出的 requestBody),而非前端累积 history
		chatLogId = writeChatLog(response.request);
		updateChatLogResponse(chatLogId, response.data); // 回填真实响应快照

		// 从追踪集合中移除
		activeApiPromises.delete(apiPromise); // 移除追踪
		// 累加 total_tokens(加空值保护,响应缺 usage 时不抛异常)
		totalTokensAccumulated += (response.data.usage && response.data.usage.total_tokens) || 0; // 累加 tokens
		console.info(`total_tokens 累计：${totalTokensAccumulated}`, 'history', conversationHistory);//打印对话历史和累计 tokens
		refreshStatusToken(); // 刷新状态栏 token 消耗统计(并入 statusText)
		// 私服模式下异步上报本次 Token 消耗（best-effort，不影响对话）
		reportTokenUsage(usageModelName(), (response.data.usage && response.data.usage.total_tokens) || 0,
			(response.data.usage && response.data.usage.input_tokens) || 0,
			(response.data.usage && response.data.usage.output_tokens) || 0,
			currentSessionId || '');

		// 解析 AI 回复
		const parsedResponse = parseAIResponse(response.data); // 解析响应
		addAssistantMessageToHistory(parsedResponse.content, parsedResponse.toolCalls); // 添加到对话历史

		// 更新上一轮响应 ID（使用公共函数）
		updatePreviousResponseId(parsedResponse.responseId); // 更新响应 ID

		// 如果有内容，添加到界面和历史
		if (parsedResponse.content) {
			// 移除加载指示器
			removeLoadingIndicator(); // 移除加载动画

			// 添加 AI 回复到界面
			addMessageToChat('assistant', parsedResponse.content); // 添加 AI 回复
		}

		// 检查是否有工具调用
		if (parsedResponse.toolCalls && parsedResponse.toolCalls.length > 0) {
			// 如果有工具调用，生成代码块并等待用户确认
			// 生成代码块内容
			const codeContent = generateCodeFromToolCalls(parsedResponse.toolCalls); // 生成代码

			// 创建代码块展示（等待用户确认）
			createToolCallCodeBlock(codeContent, parsedResponse.toolCalls); // 创建代码块
		} else {
			// 如果没有工具调用，说明模型已经完成回复
			// 移除加载指示器（如果还在显示）
			removeLoadingIndicator(); // 移除加载动画
		}
	} catch (error) {
		// 统一异常收尾：移除追踪/加载指示器、abort 静默返回、失败日志补写回填
		if (cleanupAfterAIError(apiPromise, error, chatLogId)) {
			return; // 用户主动取消,不记录为错误
		}
		throw error; // 重新抛出错误
	}

}


/**
 * 创建工具调用代码块（等待用户确认执行）
 * 代码块支持在确认前实时编辑：用户可直接修改代码文本，确认执行时若内容与原始代码不同，
 * 将按编辑后的代码动态执行；同时保留原始代码副本，可通过「回退」按钮一键还原。
 * @param {string} codeContent - 代码内容
 * @param {Array} toolCalls - 工具调用数组（原始副本，用于回退与结果回传 call_id）
 */
function createToolCallCodeBlock(codeContent, toolCalls) {
	// 进入待确认执行态：标记存在待确认代码块，并显示停止按钮以便随时结束当前操作
	pendingConfirmation = true; // 标记待确认态
	stopBtn.style.display = 'block'; // 显示停止按钮(待确认态允许用户先停止再清空)

	// 创建代码容器
	const codeContainer = document.createElement('div'); // 创建代码容器
	codeContainer.className = 'code-block-container'; // 设置代码容器类名

	// 保留原始代码副本（闭包常量），用于回退
	const originalCode = codeContent; // 原始代码快照

	// 创建代码块
	const codeBlock = document.createElement('pre'); // 创建代码块元素
	codeBlock.className = 'code-block'; // 设置代码块类名
	const codeElement = document.createElement('code'); // 创建代码元素
	codeElement.textContent = codeContent; // 设置代码内容
	// 允许在确认前实时编辑代码（contentEditable + 编辑态样式）
	codeElement.contentEditable = 'true'; // 开启可编辑
	codeElement.classList.add('code-editable'); // 添加可编辑样式类
	codeBlock.appendChild(codeElement); // 将代码元素添加到代码块

	// 创建操作按钮容器
	const actionContainer = document.createElement('div'); // 创建操作容器
	actionContainer.className = 'code-action-container'; // 设置操作容器类名

	// 创建回退按钮（还原为原始代码），默认禁用（未改动时无需回退）
	const revertBtn = document.createElement('button'); // 创建回退按钮
	revertBtn.className = 'code-revert-btn'; // 设置回退按钮类名
	revertBtn.textContent = '回退原始'; // 设置按钮文本
	revertBtn.disabled = true; // 初始禁用：尚未编辑
	// 监听编辑内容变化，控制回退按钮可用状态与编辑态高亮
	codeElement.addEventListener('input', () => {
		const changed = codeElement.textContent !== originalCode; // 是否与原始代码不同
		revertBtn.disabled = !changed; // 有改动才可回退
		codeElement.classList.toggle('code-edited', changed); // 改动时高亮提示
	});
	revertBtn.onclick = () => {
		// 点击回退：还原原始代码并复位状态
		codeElement.textContent = originalCode; // 还原文本
		revertBtn.disabled = true; // 复位禁用
		codeElement.classList.remove('code-edited'); // 取消编辑高亮
	};

	// 创建确认执行按钮（统一按钮，不再区分 read/write）
	const confirmBtn = document.createElement('button'); // 创建确认按钮
	confirmBtn.className = 'code-confirm-btn'; // 设置确认按钮类名
	confirmBtn.textContent = '确认执行'; // 设置按钮文本
	confirmBtn.onclick = async () => {
		// 点击事件：点击即离开待确认态
		pendingConfirmation = false; // 清除待确认态标记
		const currentCode = codeElement.textContent; // 读取当前（可能已编辑的）代码
		if (currentCode !== originalCode) {
			// 内容与原始代码不同 → 按编辑后的代码动态执行
			await executeEditedCode(currentCode, codeContainer, confirmBtn, toolCalls); // 执行编辑后代码
		} else {
			// 未改动 → 沿用原始 toolCalls 对象执行（原生路径）
			await executeToolCallsAndContinue(toolCalls, codeContainer, confirmBtn); // 执行工具调用并继续对话
		}
	}; // 设置点击事件

	actionContainer.appendChild(revertBtn); // 将回退按钮添加到操作容器
	actionContainer.appendChild(confirmBtn); // 将确认按钮添加到操作容器
	codeContainer.appendChild(codeBlock); // 将代码块添加到代码容器
	codeContainer.appendChild(actionContainer); // 将操作容器添加到代码容器

	// 添加到消息容器
	const messageDiv = document.createElement('div'); // 创建消息容器
	messageDiv.className = 'message assistant'; // 设置消息类名
	const contentDiv = document.createElement('div'); // 创建内容容器
	contentDiv.className = 'message-content'; // 设置内容类名
	contentDiv.appendChild(codeContainer); // 将代码容器添加到内容容器
	messageDiv.appendChild(contentDiv); // 将内容添加到消息容器
	messagesContainer.appendChild(messageDiv); // 将消息添加到消息容器

	// 移除加载指示器
	removeLoadingIndicator(); // 移除加载动画

	scrollToBottom(); // 滚动到消息底部

	// 如果开启自动执行，2 秒后自动触发执行
	if (autoExecWriteEnabled) {
		const timeoutId = setTimeout(() => {
			// 延迟执行
			activeTimeouts.delete(timeoutId); // 从追踪集合中移除
			if (!confirmBtn.disabled) {
				// 未被禁用才执行
				confirmBtn.click(); // 自动点击执行
			}
		}, 2000); // 2 秒后自动执行
		activeTimeouts.add(timeoutId); // 追踪 setTimeout
	}
}

/**
 * 执行用户编辑后的代码（确认前已实时修改）
 * 将编辑后的代码文本动态编译为异步函数执行，并把返回的 resp 包装成与原生路径兼容的
 * toolResults 结构，复用 handleToolExecutionResults / continueConversationAfterTools。
 * @param {string} codeText - 编辑后的代码文本
 * @param {Object} codeContainer - 代码容器 DOM 元素
 * @param {Object} button - 确认执行按钮 DOM 元素
 * @param {Array} toolCalls - 原始工具调用数组（用于回退 call_id 与结果关联）
 */
async function executeEditedCode(codeText, codeContainer, button, toolCalls) {
	try {
		// 禁用按钮并更新文本
		button.disabled = true; // 禁用确认按钮
		button.textContent = '执行中...'; // 更新按钮文本

		// 将编辑后的代码动态执行：mcpProtocol 为生成代码所依赖的全局调用入口
		// 生成代码形如 `const resp = ...; await mcpProtocol.callTool(...); return resp;`
		// 包裹在 async IIFE 中以支持 await，并通过 new Function 注入 mcpProtocol 入参
		const runCode = new Function('mcpProtocol', 'return (async () => {\n' + codeText + '\n})();'); // 编译
		const resp = await runCode(window.mcpProtocol); // 执行并取回 resp

		// 把 resp 包装成与原生 executeToolCalls 兼容的结果结构
		// 兼容字段：tool_call_id（用于回传 Responses API 的 call_id）、content、isError
		// 若工具本身返回 errorMessage（执行层面的业务错误），同样标记为 isError 以回喂模型自愈
		const hasToolError = !!(resp && resp.errorMessage); // 工具是否返回业务错误
		const wrappedResults = [{
			tool_call_id: (toolCalls[0] && toolCalls[0].id) || 'edited', // 回退使用原始首个调用 ID
			content: hasToolError
				? `❌ ${resp.errorMessage}`
				: (resp ? JSON.stringify(resp.data, null, 2) : '(无返回)'), // 结果文本
			isError: hasToolError, // 是否出错
		}]; // 包装结果

		// 复用原生结果处理与后续对话流程
		const toolInputMessages = handleToolExecutionResults(wrappedResults, codeContainer, button); // 处理结果
		await continueConversationAfterTools(toolInputMessages); // 继续对话
	} catch (error) {
		// 编辑后代码执行出错（如语法错误、变量未定义 resp1 is not defined 等）：
		// 不走通用的"网络/AI 错误"提示（那只会显示无入口的"重新发送"文案并终止对话），
		// 而是复用 ErrorHandler.toToolError 把错误包装为工具执行结果，回喂模型让其自愈。
		const toolError = window.ErrorHandler.toToolError(error); // 归类为工具错误结果
		const wrappedResults = [{
			tool_call_id: (toolCalls[0] && toolCalls[0].id) || 'edited', // 回退使用原始首个调用 ID
			content: `❌ ${toolError.message}`, // 错误描述
			isError: true, // 标记为错误
		}]; // 包装错误结果
		const toolInputMessages = handleToolExecutionResults(wrappedResults, codeContainer, button); // 展示错误结果
		updateStatus('代码执行出错，已回喂模型尝试自愈', 'error'); // 状态栏提示自愈中
		// 把错误作为 function_call_output 回喂模型，模型据此修正后通常会再次返回可执行的代码块
		// （即代码块界面上的"回退原始 / 确认执行"按钮即为重新发送入口，无需额外按钮）
		await continueConversationAfterTools(toolInputMessages); // 继续对话（自愈）
	}
}

/**
 * 处理工具执行结果
 * @param {Array} toolResults - 工具执行结果数组
 * @param {Object} codeContainer - 代码容器 DOM 元素
 * @param {Object} button - 执行按钮 DOM 元素
 * @returns {Array} 工具输入消息数组（用于 Responses API）
 */
function handleToolExecutionResults(toolResults, codeContainer, button) {
	// 格式化并显示执行结果
	let allResults = []; // 初始化结果数组
	for (const result of toolResults) {
		const resultText = result.isError ? `❌ 错误：${result.content}` : `执行完成：${result.content}`; // 格式化结果
		allResults.push(resultText); // 添加到结果数组
	}

	// 显示执行结果
	const resultDiv = document.createElement('div'); // 创建结果容器
	resultDiv.className = 'code-result'; // 设置结果类名
	resultDiv.textContent = allResults.join('\n'); // 设置结果内容
	codeContainer.appendChild(resultDiv); // 将结果添加到代码容器

	// 更新按钮文本
	button.textContent = '已执行'; // 更新按钮文本

	// 准备工具执行结果消息（用于 Responses API）
	// 根据 Responses API 文档，工具执行结果应该作为 input 的一部分传入
	const toolInputMessages = []; // 初始化工具输入消息数组
	for (const result of toolResults) {
		// 添加工具调用输出（符合 Responses API 格式）
		toolInputMessages.push({
			type: 'function_call_output', // 工具调用输出类型
			call_id: result.tool_call_id, // 工具调用 ID
			output: result.content, // 工具执行结果内容
		}); // 添加到工具输入消息数组
		// 同时添加到本地对话历史（用于记录）
		conversationHistory.push({
			role: 'tool', // 角色为 tool
			tool_call_id: result.tool_call_id, // 工具调用 ID
			content: result.content, // 工具执行结果内容
		}); // 添加到历史
	}

	return toolInputMessages; // 返回工具输入消息数组
}

/**
 * 工具执行后继续对话
 * @param {Array} toolInputMessages - 工具输入消息数组
 */
async function continueConversationAfterTools(toolInputMessages) {
	// 继续调用模型获取最终回复（使用 Responses API）
	addLoadingIndicator(); // 添加加载指示器
	updateUIState(UI_STATE.EXECUTING); // 切换到代码执行中状态
	updateStatus('AI 正在处理结果...', 'info'); // 更新状态提示

	// 创建 API Promise 并追踪
	let apiPromise;
	let chatLogId;
	try {
		// 根据配置选择调用 ARK API 或私服 API
		apiPromise = window.ArkAPI[usePrivateServer ? 'callPrivateChat' : 'callArkChat'](
			toolInputMessages, // 工具执行结果（作为 input 传入）
			previousResponseId, // 上一轮响应 ID
			null, // 无新增工具
			window.AbortManager.createTimeoutSignal(60000) // 绑定 60s 超时+手动取消信号
		); // 调用 API

		// 追踪 API Promise
		activeApiPromises.add(apiPromise); // 添加到追踪集合

		// 等待 API 响应
		const response = await apiPromise;
		// 采集接口真实请求参数(来自 fetch 真实发出的 requestBody),而非前端累积 messages
		chatLogId = writeChatLog(response.request);
		updateChatLogResponse(chatLogId, response.data); // 回填真实响应快照

		// 从追踪集合中移除
		activeApiPromises.delete(apiPromise); // 移除追踪

		// 累加 total_tokens(加空值保护,响应缺 usage 时不抛异常)
		totalTokensAccumulated += (response.data.usage && response.data.usage.total_tokens) || 0; // 累加 tokens
		console.info('history', conversationHistory, `total_tokens 累计：${totalTokensAccumulated}`);//打印对话历史和累计 tokens
		refreshStatusToken(); // 刷新状态栏 token 消耗统计(并入 statusText)
		// 私服模式下异步上报本次 Token 消耗（best-effort，不影响对话）
		reportTokenUsage(usageModelName(), (response.data.usage && response.data.usage.total_tokens) || 0,
			(response.data.usage && response.data.usage.input_tokens) || 0,
			(response.data.usage && response.data.usage.output_tokens) || 0,
			currentSessionId || '');

		// 解析响应
		const parsedResponse = parseAIResponse(response.data); // 解析响应
		addAssistantMessageToHistory(parsedResponse.content, parsedResponse.toolCalls); // 添加到对话历史

		// 更新上一轮响应 ID（使用公共函数）
		updatePreviousResponseId(parsedResponse.responseId); // 更新响应 ID

		// 如果有内容，添加到界面
		if (parsedResponse.content) {
			addMessageToChat('assistant', parsedResponse.content); // 添加 AI 回复
		}

		// 检查是否还有工具调用
		if (parsedResponse.toolCalls && parsedResponse.toolCalls.length > 0) {
			// 如果有工具调用，生成代码块并等待用户确认
			const codeContent = generateCodeFromToolCalls(parsedResponse.toolCalls); // 生成代码
			createToolCallCodeBlock(codeContent, parsedResponse.toolCalls); // 创建代码块
		} else {
			// 如果没有工具调用，完成
			removeLoadingIndicator(); // 移除加载动画
			if (!parsedResponse.content) {
				addMessageToChat('assistant', '操作已完成'); // 添加完成提示
			}
			// 恢复状态
			updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
			updateStatus('', ''); // 清空状态提示
			messageInput.focus(); // 聚焦输入框
		}
	} catch (error) {
		// 统一异常收尾：移除追踪/加载指示器、abort 静默返回、失败日志补写回填
		if (cleanupAfterAIError(apiPromise, error, chatLogId)) {
			return; // 用户主动取消,不记录为错误
		}
		throw error; // 重新抛出错误
	}


}

/**
 * 执行工具调用并继续对话
 * @param {Array} toolCalls - 工具调用数组
 * @param {Object} codeContainer - 代码容器 DOM 元素
 * @param {Object} button - 执行按钮 DOM 元素
 */
async function executeToolCallsAndContinue(toolCalls, codeContainer, button) {
	try {
		// 禁用按钮并更新文本
		button.disabled = true; // 禁用按钮
		button.textContent = '执行中...'; // 更新按钮文本

		// 执行工具调用
		const toolResults = await executeToolCalls(toolCalls); // 执行工具调用

		// 处理工具执行结果
		const toolInputMessages = handleToolExecutionResults(toolResults, codeContainer, button); // 处理结果并获取工具输入消息

		// 继续对话
		await continueConversationAfterTools(toolInputMessages); // 继续对话
	} catch (error) {
		// 捕获错误并显示
		handleAIError(error, '工具执行后继续对话失败'); // 统一错误处理
		// 恢复 UI 状态
		updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
		updateStatus('', ''); // 清空状态提示
		messageInput.focus(); // 聚焦输入框
	}
}

/**
 * 处理 AI 请求错误
 * @param error - 错误对象
 * @param errorPrefix - 错误日志前缀（可选）
 */
function handleAIError(error, errorPrefix = 'AI 请求失败', onResend = null) {
	// 移除加载指示器（如果存在）
	removeLoadingIndicator(); // 移除加载动画

	// 用户主动取消(abort)不视为失败,静默结束
	if (AbortManager.isCancelled()) {
		updateStatus('已停止', 'idle'); // 更新状态为空闲
		return; // 直接返回,不展示错误
	}

	// 错误分类与恢复引导(对标 Cursor / Claude Code 的分类型提示)
	const info = window.ErrorHandler.classifyError(error, errorPrefix); // 归类错误
	console.error(`[${info.type}] ${info.title}:`, error); // 输出带类型的错误日志

	// 组装"标题 + 原因 + 可操作建议"的结构化提示。
	// 注意:info.message 已经是透传后的唯一、明确真实原因(后台/底层具体错误文本),
	// 因此此处不再追加独立的"真实原因"行,避免把通用引导与真实原因并排展示,
	// 造成用户困惑、原因不唯一。整段提示保持"唯一原因 + 一条可操作建议"。
	const guideText =
		`❌ ${info.title}\n` +
		`${info.message}\n` +
		`💡 ${info.action}`; // 恢复引导

	// 错误提示必须无条件渲染到界面(最优先,任何后续逻辑异常都不影响它显示)
	const messageDiv = addMessageToChat('assistant', guideText, true); // 添加结构化错误提示
	updateStatus(info.title, 'error'); // 状态栏展示错误类型

	// 仅当确为 API Key / 模型配置问题时,才高亮配置按钮引导修正;
	// "额度不足"等配额类问题不属于配置问题,不应误导用户去改配置按钮
	if (info.isConfigIssue && configBtn) {
		configBtn.classList.add('config-btn-alert'); // 添加告警样式
	}

	// 在错误气泡末尾追加「重新发送」按钮:失败消息已从对话历史剔除(见 runSendFlow 回滚),
	// 仅保留界面这条错误提示并允许一键重发,避免失败消息污染后续成功对话的上下文。
	// 用独立 try/catch 包裹,确保按钮逻辑出错也绝不影响上方错误提示的显示。
	if (onResend && messageDiv) {
		try {
			const resendBtn = document.createElement('button'); // 创建重新发送按钮
			resendBtn.className = 'error-resend-btn'; // 设置按钮类名
			resendBtn.textContent = '重新发送'; // 按钮文案
			resendBtn.onclick = () => {
				// 点击重发:移除当前错误气泡(含本按钮),避免界面堆积重复错误提示
				if (messageDiv.parentNode) messageDiv.parentNode.removeChild(messageDiv);
				onResend(); // 复用原始入参重新执行发送流程(闭包内已绑定原始消息)
			}; // 绑定点击
			const contentDiv = messageDiv.querySelector('.message-content') || messageDiv;
			contentDiv.appendChild(resendBtn); // 添加重新发送按钮
		} catch (btnErr) {
			console.error('[ai-chat] 重新发送按钮渲染失败(不影响错误提示):', btnErr);
		}
	}

	// 仅「不可预知」类错误（UNKNOWN / NETWORK / TIMEOUT / PARSE）才展示故障上报链接；
	// 鉴权/限流/参数等可预期问题与工具执行错误不引导上报。
	// 上报链接点击后收集错误堆栈经客服通道提交管理员（见 handleFaultReport）。
	const reportableTypes = [
		window.ErrorHandler.ErrorType.UNKNOWN,
		window.ErrorHandler.ErrorType.NETWORK,
		window.ErrorHandler.ErrorType.TIMEOUT,
		window.ErrorHandler.ErrorType.PARSE,
	];
	if (reportableTypes.includes(info.type) && messageDiv) {
		try {
			const reportLink = document.createElement('a'); // 创建上报链接
			reportLink.className = 'error-report-link'; // 设置类名
			reportLink.textContent = '📣 上报此问题'; // 链接文案
			reportLink.href = 'javascript:void(0)'; // 阻止页面跳转
			reportLink.style.cssText = 'display:inline-block;margin-top:6px;color:#667eea;cursor:pointer;text-decoration:underline;';
			reportLink.onclick = () => handleFaultReport(error); // 点击触发上报
			const contentDiv = messageDiv.querySelector('.message-content') || messageDiv;
			contentDiv.appendChild(reportLink); // 追加到错误气泡末尾
		} catch (linkErr) {
			console.error('[ai-chat] 上报链接渲染失败:', linkErr);
		}
	}
}



/**
 * 处理发送消息按钮点击事件
 */
async function handleSendMessage() {
	const message = messageInput.value.trim(); // 获取输入内容并去除首尾空格

	// 检查消息是否为空
	if (!message) {
		return; // 如果消息为空，直接返回
	}

	// 日志会话边界划分:以 previous_response_id 为准。
	// previous_response_id 为 null 表示这是一次全新的对话起点(上下文未串联上一轮),
	// 此时新建日志会话;previous_response_id 存在表示延续上一轮上下文(真实连续对话),
	// 则复用当前会话 currentSessionId,把本轮请求继续追加进去,从而更真实地反映对话流程。
	if (!previousResponseId) {
		// 仅在对话真正重新开始(新会话边界)时新建会话
		startLogSession(message);
	}

	await runSendFlow({
		uiState: UI_STATE.SENDING, // 进入发送中状态
		statusText: '正在发送...', // 状态提示
		beforeSend: () => {
			prepareUserMessageUI(message); // 处理用户消息 UI
		}, // UI 预处理
		appendHistory: () => {
			// 追加 user 消息并返回该消息对象,供发送失败时从历史中回滚剔除
			const msg = {
				role: 'user', // 用户角色
				content: message, // 用户消息内容
			}; // 构造用户消息
			conversationHistory.push(msg); // 添加到对话历史
			return msg; // 返回引用,便于失败回滚
		}, // 写入历史
		errorPrefix: 'AI 请求失败', // 错误前缀
		needScroll: true, // 发送用户消息需要滚动
	}); // 运行统一流程
}


/**
 * 处理停止按钮点击事件
 * 经 AbortManager.abortCurrent() 真正中断底层 fetch(而非仅置标志位),
 * 并清除自动执行等待中的 setTimeout;
 * 无在途请求时立即恢复空闲,否则切到 STOPPED 态等待请求因 abort 结束后由 resumeStop 恢复。
 */
function handleStop() {
	// 待确认执行态:仅存在未确认的代码块(无在途请求),停止即移除这些代码块并恢复空闲,
	// 让用户能在清空前正常结束当前操作
	if (pendingConfirmation) {
		pendingConfirmation = false; // 清除待确认态标记
		// 移除所有仍处于待确认(未禁用)的代码块容器
		document.querySelectorAll('.code-confirm-btn:not(:disabled)').forEach(btn => {
			const container = btn.closest('.code-block-container'); // 定位外层容器
			if (container && container.parentNode) container.parentNode.removeChild(container); // 移除
		});
		resumeStop(); // 恢复到空闲状态(隐藏停止按钮、启用清空等)
		return; // 提前返回,无需触发 abort/超时清理
	}

	// 通过 AbortManager 真正中断底层 fetch/工具执行(而非仅置标志位)
	window.AbortManager.abortCurrent();

	// 取消所有正在执行的 setTimeout(如自动执行延时)
	activeTimeouts.forEach(timeoutId => {
		clearTimeout(timeoutId); // 清除定时器
	});

	// 检测是否有正在执行的 API 请求
	const hasActiveApiRequest = activeApiPromises.size > 0; // 检查是否有正在执行的 API 请求

	// 如果没有正在执行的操作，立即恢复到空闲状态
	if (!hasActiveApiRequest) {
		// 没有正在执行的操作，立即恢复
		resumeStop(); // 恢复到空闲状态
	} else {
		// 有正在执行的操作，更新为停止状态(等待请求因 abort 完成后自动恢复)
		updateUIState(UI_STATE.STOPPED); // 更新为停止状态
	}
}

/**
 * 恢复停止状态(由请求自然结束或主动停止后调用)
 */
function resumeStop() {
	window.AbortManager.endAbortSession(); // 释放当前会话的 AbortController
	removeLoadingIndicator(); // 移除加载指示器
	// 清理所有追踪(确保状态一致)
	activeTimeouts.clear(); // 清空 setTimeout 追踪
	activeApiPromises.clear(); // 清空 API Promise 追踪

	updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
	messageInput.focus(); // 聚焦到输入框
}

/**
 * 设置输入框状态
 * @param disabled - 是否禁用
 */
function setInputDisabled(disabled) {
	messageInput.disabled = disabled; // 设置输入框状态
	sendBtn.disabled = disabled; // 设置发送按钮状态

}


/**
 * 添加消息到对话界面
 * @param role - 消息角色 ('user' 或 'assistant')
 * @param content - 消息内容
 * @param isError - 是否为错误消息
 */
function addMessageToChat(role, content, isError = false) {
	// 纯 UI 函数:仅负责把一条消息渲染到对话界面,不再承担任何"取消/重置状态机"副作用
	// 取消语义已统一交由 abort-signal.js 的 AbortManager 管理
	// 创建消息元素
	const messageDiv = document.createElement('div'); // 创建消息容器
	messageDiv.className = `message ${role}`; // 设置消息类名

	// 创建消息内容元素
	const contentDiv = document.createElement('div'); // 创建内容容器
	contentDiv.className = 'message-content'; // 设置内容类名
	if (isError) {
		// 如果是错误消息
		contentDiv.style.background = '#fee'; // 设置错误背景色
		contentDiv.style.color = '#c33'; // 设置错误文字颜色
		contentDiv.style.border = '1px solid #fcc'; // 设置错误边框
	}

	// 直接显示文本内容（不再解析代码块，因为现在使用 Function Calling）
	const textDiv = document.createElement('div'); // 创建文本容器
	textDiv.className = 'message-text'; // 设置文本类名
	textDiv.textContent = content; // 设置文本内容
	contentDiv.appendChild(textDiv); // 添加到内容容器

	// 组装消息元素
	messageDiv.appendChild(contentDiv); // 将内容添加到消息容器
	messagesContainer.appendChild(messageDiv); // 将消息添加到消息容器

	// 滚动到底部
	// scrollToBottom(); // 滚动到消息底部
}

/**
 * 添加加载指示器
 * @returns 加载指示器的 ID
 */
function addLoadingIndicator() {
	// 创建加载消息元素
	const messageDiv = document.createElement('div'); // 创建消息容器
	messageDiv.className = 'message assistant'; // 设置消息类名
	const loadingId = 'loading-' + Date.now(); // 生成唯一 ID
	currentLoadingId = loadingId; // 保存到全局变量
	messageDiv.id = loadingId; // 设置 ID

	// 创建加载内容元素
	const contentDiv = document.createElement('div'); // 创建内容容器
	contentDiv.className = 'message-content loading-indicator'; // 设置内容类名

	// 创建加载动画点
	for (let i = 0; i < 3; i++) {
		// 创建 3 个加载点
		const dot = document.createElement('div'); // 创建点元素
		dot.className = 'loading-dot'; // 设置点类名
		contentDiv.appendChild(dot); // 将点添加到内容容器
	}

	// 组装加载消息元素
	messageDiv.appendChild(contentDiv); // 将内容添加到消息容器
	messagesContainer.appendChild(messageDiv); // 将消息添加到消息容器

	// 滚动到底部
	// scrollToBottom(); // 滚动到消息底部

	return loadingId; // 返回加载指示器 ID
}

/**
 * 移除加载指示器
 */
function removeLoadingIndicator() {
	// 查找并移除加载指示器
	if (currentLoadingId) {
		const loadingElement = document.getElementById(currentLoadingId); // 获取加载元素
		if (loadingElement) {
			// 如果元素存在
			loadingElement.remove(); // 移除元素
		}
		currentLoadingId = null; // 清空全局变量
	}
}


/**
 * 确保系统消息在对话历史中
 * 如果没有系统消息则添加到对话历史开头
 */
function ensureSystemMessage() {
	// 检查对话历史中是否已有系统消息
	const hasSystemMessage = conversationHistory.some((msg) => msg.role === 'system'); // 检查是否有系统消息
	if (hasSystemMessage) {
		return false; // 如果已有系统消息，直接返回
	}

	conversationHistory.unshift({
		role: 'system',
		content: window.top.systemMessage
	});


	console.log('已添加系统消息到对话历史'); // 输出日志
	return true;
}


/**
 * 统一的发送流程封装，减少重复代码
 * @param {Object} options - 配置项
 * @param {string} options.uiState - 需要切换到的 UI 状态
 * @param {string} options.statusText - 状态提示文本
 * @param {Function} options.beforeSend - 发送前的 UI 处理
 * @param {Function} options.appendHistory - 写入对话历史的处理
 * @param {string} options.errorPrefix - 错误前缀文案
 * @param {boolean} [options.needScroll=true] - 是否需要滚动到底部
 */
async function runSendFlow({
	uiState, // 需要切换到的 UI 状态
	statusText, // 状态提示文本
	beforeSend, // 发送前的 UI 处理
	appendHistory, // 写入历史的处理
	errorPrefix, // 错误前缀文案
	needScroll = true, // 是否需要滚动
}) {
	// 缓存完整入参,供「重新发送」回调复用(闭包内 beforeSend/appendHistory 已绑定原始消息)
	const opts = { uiState, statusText, beforeSend, appendHistory, errorPrefix, needScroll };
	let pushedMsg = null; // 本次发送追加进历史的 user 消息对象(用于失败回滚)
	try {
		updateUIState(uiState); // 切换 UI 状态
		updateStatus(statusText, 'info'); // 更新状态提示
		beforeSend(); // 执行发送前 UI 操作
		pushedMsg = appendHistory(); // 写入对话历史,返回本次追加的 user 消息对象
		addLoadingIndicator(); // 添加加载指示器
		if (needScroll) {
			scrollToBottom(); // 按需滚动到底部
		}
		window.AbortManager.createAbortController(); // 为本轮会话创建取消信号
		await callAIAndHandleResponse(); // 调用 AI 并处理响应
		updateStatus('', ''); // 清空状态提示
	} catch (error) {
		// 失败回滚:本次请求根本未成功发送(鉴权失败/网络异常等),必须把刚追加进对话历史的
		// user 消息剔除,否则它会永久污染后续成功对话的上下文(失败消息被反复带过去)。
		if (pushedMsg) {
			const idx = conversationHistory.indexOf(pushedMsg); // 定位刚追加的消息
			if (idx !== -1) conversationHistory.splice(idx, 1); // 从历史中移除失败消息
		}
		// 传递「重新发送」回调,供错误气泡末尾的按钮复用(错误提示本身由 handleAIError 无条件渲染)
		handleAIError(error, errorPrefix, () => runSendFlow(opts));
	} finally {
		updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
		messageInput.focus(); // 聚焦输入框
	}
}



/**
 * 重置对话记录（清空页面消息与本地历史）
 * 用于修改私服 API 后调用：上一轮响应 ID（previousResponseId）与具体 API 服务端绑定，
 * 切换/修改 API 后旧历史上下文会被不同服务端返回的内容污染，导致 AI 无法正确识别，因此需立即清空。
 * 同时清空 conversationHistory 与 previousResponseId，系统消息会在下次发送时自动重新添加。
 */
function resetConversationRecords() {
	// 清空消息容器，重新生成欢迎消息
	messagesContainer.innerHTML = ''; // 清空所有消息
	const welcomeDiv = document.createElement('div'); // 创建欢迎消息容器
	welcomeDiv.className = 'welcome-message'; // 设置欢迎消息类名
	welcomeDiv.innerHTML = `
		<p>你好！我是原理图设计 AI 巧绘，专门帮助你进行原理图设计.</p>
		<p>我可以帮你:</p>
		<ul style="text-align: left; display: inline-block; margin-top: 8px;">
			<li>解答原理图设计相关问题</li>
			<li>根据用户自然语言，自动设计和优化原理图</li>
		</ul>
		<p style="margin-top: 12px;">请输入你的原理图设计问题，我会尽力帮助你！</p>
	`; // 设置欢迎消息内容
	messagesContainer.appendChild(welcomeDiv); // 添加欢迎消息

	// 清空对话历史（系统消息会在下次发送消息时自动添加）
	conversationHistory = []; // 重置对话历史数组

	// 重置上一轮响应 ID（该 ID 与服务端绑定，更换 API 后立即失效）
	previousResponseId = null; // 重置响应 ID
}

/**
 * 处理清空对话
 */
function handleClearChat() {
	// 待确认执行态保护：存在等待确认的代码块时,不允许直接清空,
	// 先提示用户结束当前操作(点击停止),避免误以为按钮无响应或误清空未执行代码
	if (pendingConfirmation) {
		alert('当前有等待确认执行的代码块。\n请先点击「停止」按钮结束当前操作，再清空会话。'); // 友好提示
		return; // 中止清空
	}

	// 确认是否清空
	const confirmed = confirm('确定要清空所有对话记录吗？'); // 显示确认对话框
	if (!confirmed) {
		// 如果用户取消
		return; // 直接返回
	}

	// 复用统一的清空逻辑
	resetConversationRecords(); // 清空页面与历史记录
	// 更新状态
	updateStatus('对话已清空', 'success'); // 更新状态为成功
	setTimeout(() => {
		// 延迟清空状态
		updateStatus('', ''); // 清空状态文本
	}, 2000); // 2 秒后清空
}



/**
 * 更新状态文本
 * @param text - 状态文本
 * @param type - 状态类型 ('info', 'error', 'success')
 */
function updateStatus(text, type = '') {
	// 缓存最近一次状态文案与类型,供 refreshStatusToken 在无新状态事件时重渲染(保留 token 串)
	lastStatusText = text;
	lastStatusType = type;
	statusText.textContent = buildStatusText(text); // 设置状态文本(含累计 token 串)
	statusText.className = 'status-text'; // 重置类名
	if (type) {
		// 如果有类型
		statusText.className += ' ' + type; // 添加类型类名
	}
}

/**
 * 拼接状态文案与累计 token 消耗串
 * 仅当存在 token 累计消耗时,在状态文本后追加「 · 已用 N tokens」,无消耗时不显示
 * @param text - 原始状态文案
 * @returns {string} 追加 token 串后的最终状态文案
 */
function buildStatusText(text) {
	const base = text || '';
	return totalTokensAccumulated > 0
		? `${base} · 已用 ${totalTokensAccumulated} tokens`
		: base;
}

/**
 * 仅在 token 累计消耗变化时刷新状态栏
 * 复用上一次 updateStatus 的状态文案与类型,避免 token 累加后状态栏不刷新或被覆盖丢失
 * 由每次响应累加 total_tokens 后调用,替代原独立的 updateTokenInfo(原写入标题栏 span)
 */
function refreshStatusToken() {
	updateStatus(lastStatusText, lastStatusType);
}

/**
 * 滚动到底部
 */
function scrollToBottom() {
	// 使用 setTimeout 确保 DOM 更新后再滚动
	setTimeout(() => {
		// 延迟执行
		messagesContainer.scrollTop = messagesContainer.scrollHeight; // 滚动到底部
	}, 100); // 100 毫秒后执行
}

/**
 * 加载配置
 * 从 localStorage 读取 ARK API 配置并更新到 ark-api.js 模块
 */
function loadConfig() {
	try {
		// 从 localStorage 读取配置
		const savedApiKey = localStorage.getItem('api_key'); // 读取 API Key
		const savedModel = localStorage.getItem('api_model'); // 读取 API Model
		const rawMode = localStorage.getItem('connection_mode'); // 读取连接模式（新字段）

		// 向后兼容旧版二态配置：未显式保存 connection_mode 时,按 model 是否为空推导
		// （私服模式 model 为空 → 'private'；ARK 官网模式有 model → 'ark'）
		connectionMode = rawMode || (savedModel ? 'ark' : 'private');
		usePrivateServer = connectionMode === 'private'; // 派生旧布尔,供兼容逻辑使用

		// 调用 ark-api.js 的更新配置函数
		window.ArkAPI.updateConfig(savedApiKey || '', savedModel || ''); // 更新核心配置

		// 配置加载后刷新模型/套餐展示（私服模式异步拉取，非私服模式读本地配置）
		refreshModelInfo();
		refreshPackageInfo();
	} catch (error) {
		// 捕获配置加载错误
		console.error('加载配置失败:', error); // 输出错误日志
	}
}

/**
 * 依据当前选中的连接模式，显隐对应配置项
 * private：仅 API Key（私服 Key）
 * ark：API Key + API Model
 * custom：自定义 API Key + Base URL + Model
 * @param {string} mode - 连接模式
 */
function applyModeVisibility(mode) {
	const showArkKey = (mode === 'private' || mode === 'ark'); // 私服/ARK 均需 API Key
	const showArkModel = (mode === 'ark'); // 仅 ARK 官网需填 Model
	const showCustom = (mode === 'custom'); // 自定义模式专属三项
	if (arkApiKeyContainer) arkApiKeyContainer.style.display = showArkKey ? 'block' : 'none';
	if (arkModelInputContainer) arkModelInputContainer.style.display = showArkModel ? 'block' : 'none';
	if (customApiKeyContainer) customApiKeyContainer.style.display = showCustom ? 'block' : 'none';
	if (customBaseUrlContainer) customBaseUrlContainer.style.display = showCustom ? 'block' : 'none';
	if (customModelContainer) customModelContainer.style.display = showCustom ? 'block' : 'none';
}

/**
 * 处理连接模式三选一切换事件
 * 切换 API 类型时立即清空对话记录，因为旧历史上下文对切换后的 API 而言可能无法识别，
 * 并按新选中的模式显隐对应配置项。
 */
function handleConnectionModeChange() {
	const checked = document.querySelector('input[name="connMode"]:checked'); // 读取选中的模式
	const newMode = checked ? checked.value : 'private'; // 缺省回退私服
	if (newMode !== connectionMode) {
		// 连接模式真正改变，立即清空页面记录
		connectionMode = newMode; // 更新连接模式
		usePrivateServer = (newMode === 'private'); // 派生旧布尔
		resetConversationRecords(); // 清空对话记录，避免旧历史被 AI 误识别
	}
	applyModeVisibility(newMode); // 按模式显隐配置项
}

/**
 * 处理配置按钮点击事件
 * 显示配置对话框并填充当前配置值
 */
function handleConfigClick() {
	// 从 localStorage 读取当前配置值
	const currentApiKey = localStorage.getItem('api_key') || ''; // 读取当前 API Key
	const currentModel = localStorage.getItem('api_model') || ''; // 读取当前 Model
	const mode = localStorage.getItem('connection_mode') || (currentModel ? 'ark' : 'private'); // 读取连接模式
	const customKey = localStorage.getItem('custom_api_key') || ''; // 读取自定义 API Key
	const customBaseUrl = localStorage.getItem('custom_base_url') || ''; // 读取自定义 Base URL
	const customModel = localStorage.getItem('custom_model') || ''; // 读取自定义 Model

	// 填充输入框
	arkApiKeyInput.value = currentApiKey; // 设置 API Key 输入框值
	arkModelInput.value = currentModel; // 设置 Model 输入框值
	customApiKeyInput.value = customKey; // 设置自定义 API Key
	customBaseUrlInput.value = customBaseUrl; // 设置自定义 Base URL
	customModelInput.value = customModel; // 设置自定义 Model

	// 选中对应模式 radio（仅同步界面，不触发清空）
	const radio = document.querySelector(`input[name="connMode"][value="${mode}"]`);
	if (radio) radio.checked = true; // 选中当前模式
	connectionMode = mode; // 更新全局连接模式
	usePrivateServer = (mode === 'private'); // 派生旧布尔
	applyModeVisibility(mode); // 按模式显隐配置项

	// 显示配置对话框
	configDialog.style.display = 'block'; // 显示对话框
}

/**
 * 关闭配置对话框
 */
function handleCloseConfig() {
	// 隐藏配置对话框
	configDialog.style.display = 'none'; // 隐藏对话框
}

/**
 * 处理保存配置
 * 保存配置到 localStorage 并更新 ARK API 模块
 */
function handleSaveConfig() {
	try {
		// 获取输入框的值
		const apiKey = arkApiKeyInput.value.trim(); // 获取 API Key 并去除首尾空格
		const modeRadio = document.querySelector('input[name="connMode"]:checked'); // 读取选中的连接模式
		const newMode = modeRadio ? modeRadio.value : 'private'; // 缺省回退私服
		// 私服模式 model 为空；ARK 官网模式取 API Model；自定义模式 model 由专属字段承载
		const model = (newMode === 'private') ? '' : arkModelInput.value.trim();
		const customKey = customApiKeyInput.value.trim(); // 自定义 API Key
		const customBaseUrl = customBaseUrlInput.value.trim(); // 自定义 Base URL
		const customModel = customModelInput.value.trim(); // 自定义 Model

		// 与已保存配置对比，检测是否真正发生修改（含模式与自定义字段）
		const savedApiKey = localStorage.getItem('api_key') || ''; // 读取已保存的 API Key
		const savedModel = localStorage.getItem('api_model') || ''; // 读取已保存的 Model
		const savedMode = localStorage.getItem('connection_mode') || (savedModel ? 'ark' : 'private'); // 还原已保存模式
		const savedCustomKey = localStorage.getItem('custom_api_key') || ''; // 已保存自定义 Key
		const savedCustomBaseUrl = localStorage.getItem('custom_base_url') || ''; // 已保存自定义 Base URL
		const savedCustomModel = localStorage.getItem('custom_model') || ''; // 已保存自定义 Model

		const configChanged =
			apiKey !== savedApiKey || // API Key 变化
			model !== savedModel || // Model 变化
			newMode !== savedMode || // 连接模式变化（切换 API 类型）
			customKey !== savedCustomKey || // 自定义 Key 变化
			customBaseUrl !== savedCustomBaseUrl || // 自定义 Base URL 变化
			customModel !== savedCustomModel; // 自定义 Model 变化

		// 修改 API 后清空页面记录，避免旧历史被不同服务端返回的上下文污染
		if (configChanged) {
			resetConversationRecords(); // 清空对话记录
		}

		// 同步全局连接模式（确保后续请求使用最新的 API 类型）
		connectionMode = newMode; // 更新连接模式
		usePrivateServer = (newMode === 'private'); // 派生旧布尔

		// 持久化：私服开关标记（与 model 联动）+ 核心两项 + 模式与自定义字段
		localStorage.setItem('use_private_server', String(newMode === 'private')); // 保存私服标记
		window.ArkAPI.updateConfig(apiKey, model); // 更新核心配置
		window.ArkAPI.updateConnectionConfig(newMode, customKey, customBaseUrl, customModel); // 更新模式与自定义配置

		// 关闭配置对话框
		handleCloseConfig(); // 关闭对话框

		// 配置变更后刷新模型/套餐展示（私服模式异步拉取）
		refreshModelInfo();
		refreshPackageInfo();

		// 显示成功提示
		updateStatus(configChanged ? '配置已保存，对话记录已清空' : '配置已保存', 'success'); // 更新状态
		setTimeout(() => {
			// 延迟清空状态
			updateStatus('', ''); // 清空状态文本
		}, 2000); // 2 秒后清空
	} catch (error) {
		// 捕获保存配置错误
		console.error('保存配置失败:', error); // 输出错误日志
		updateStatus('保存配置失败', 'error'); // 更新状态为错误
		setTimeout(() => {
			// 延迟清空状态
			updateStatus('', ''); // 清空状态文本
		}, 2000); // 2 秒后清空
	}
}

/**
 * 设置私服链接
 * 私服采用独立的用户名+密码登录体系，不依赖嘉立创平台用户信息
 * 链接直接指向私服登录页，用户在私服页面手动输入用户名密码登录
 */
function setupPrivateServerLink() {
	const privateServerLink = document.getElementById('privateServerLink'); // 获取私服链接元素
	if (!privateServerLink) return; // 如果元素不存在，直接返回

	// 私服登录页地址，用户点击后跳转至私服手动输入用户名密码登录
	privateServerLink.href = 'https://113.46.209.138/login';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); // 监听 DOM 加载完成事件
