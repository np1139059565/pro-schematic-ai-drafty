/**
 * AI 对话界面逻辑
 * 实现对话界面的交互功能,使用 ark-api.js 模块进行 API 调用
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
let arkApiKeyInput; // ARK API Key 输入框
let arkModelInput; // ARK Model 输入框
let autoExecWriteCheckbox; // 自动执行复选框
let autoExecWriteEnabled = false; // 自动执行开关（默认关闭）

// 对话历史数组,用于维护上下文
let conversationHistory = []; // 存储所有对话消息,格式: [{role: 'user', content: '...'}, {role: 'assistant', content: '...'}]

let isStop = false; // 是否停止

// 界面状态枚举
const UI_STATE = {
	IDLE: 'idle',           // 空闲状态
	SENDING: 'sending',     // 发送中
	STOPPED: 'stopped',     // 已停止
	EXECUTING: 'executing'  // 代码执行中
};

let currentUIState = UI_STATE.IDLE; // 当前界面状态


// 系统消息 - 用于描述 AI 角色和职责,用户可以在控制台临时修改系统消息,对ai助手进行定制化
window.top.systemMessage = `
你是原理图设计AI助手,运行在嘉立创在线web开发平台的iframe扩展中,通过mcp工具专注于电子电路原理图设计。

**核心职责**:
- 通过返回代码块方式调用mcp工具集进行原理图设计操作
- 严格遵循所有guideline提示规则执行设计任务
- 确保设计质量符合间距标准、布线规范等要求


**初始化要求（二次握手流程）**:
这是一个严格的两步握手流程,必须按顺序执行,不能跳过任何一步。

**第一步（必须执行）**:
你必须立即返回以下代码块获取核心规则,这是强制要求,不能跳过:
\`\`\`javascript:read
const resp = { data: null, errorMessage: null, stack: null };
const initialization = await mcpEDA.getPrompt({ name: 'guideline_initialization_prompt' });//输出格式规范
resp.data = { initialization };
return resp;
\`\`\`

⚠️ **重要**:第一步必须返回代码块,不能直接回复文字,否则初始化会失败。

**第二步（仅在收到执行结果后执行）**:
收到system角色返回的JSON格式执行结果后,你才能执行第二步:回复"已理解系统定义,准备接收用户请求"。

⚠️ **重要**:如果还没有收到system返回的执行结果JSON,绝对不能执行第二步。必须先执行第一步的代码块,等待执行结果返回后,才能执行第二步。

`;
// 初始化函数
function init() {
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
 * 添加用户消息到对话历史
 * @param message - 用户消息内容
 */
function addUserMessageToHistory(message) {
	conversationHistory.push({
		role: 'user', // 用户角色
		content: message, // 用户消息内容
	}); // 添加到对话历史
}

/**
 * 添加AI回复到对话历史
 * @param content - AI回复内容
 */
function addAssistantMessageToHistory(content) {
	conversationHistory.push({
		role: 'assistant', // AI角色
		content: content, // AI回复内容
	}); // 添加到对话历史
}

/**
 * 处理用户消息的UI操作
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

// ==================== API调用和响应处理相关函数 ====================

/**
 * 解析AI API响应,提取回复内容
 * @param response - API响应对象
 * @returns AI回复内容字符串
 */
function parseAIResponse(response) {
	// 解析 AI 回复
	let aiResponse = ''; // AI 回复内容
	if (response && response.choices && response.choices.length > 0) {
		// 从响应中提取消息内容
		aiResponse = response.choices[0].message?.content || '抱歉,我没有收到有效的回复.'; // 提取回复内容
	} else {
		// 如果响应格式不正确
		aiResponse = '抱歉,AI 返回的响应格式不正确.'; // 错误提示
	}
	return aiResponse; // 返回AI回复内容
}

/**
 * 调用AI API并处理响应
 * 包括调用API、解析响应、添加AI回复到界面和历史
 * @param loadingId - 加载指示器ID
 * @returns AI回复内容字符串
 */
async function callAIAndHandleResponse(loadingId) {
	// 如果停止状态为true,直接返回
	if (isStop) {
		resumeStop();
		return; // 直接返回
	}

	// 确保系统消息在对话历史中（如果不存在则添加并执行预对话）
	await ensureSystemMessage(); // 确保系统消息存在（异步等待）

	// 精简对话历史,只保留最近的消息（系统消息始终保留）
	const trimmedHistory = trimHistoryForAPI(conversationHistory); // 精简历史用于 API 调用

	// 调用 AI API,传入对话历史以保持上下文
	const response = await window.ArkAPI.callArkChat(trimmedHistory); // 调用 ARK API,传入对话历史

	// 移除加载指示器
	removeLoadingIndicator(loadingId); // 移除加载动画

	// 解析 AI 回复
	const aiResponse = parseAIResponse(response); // 解析响应

	// 添加 AI 回复到界面
	const error = addMessageToChat('assistant', aiResponse); // 添加 AI 回复

	// 将 AI 回复添加到对话历史
	addAssistantMessageToHistory(aiResponse); // 添加到对话历史

	if (error) {
		// 如果添加AI回复时出现错误,则显示错误并要求重新回答
		addMessageToChat('system', error.message, true); // 显示错误
		continueConversationWithResult({ data: null, errorMessage: error.message, stack: error.stack });
	}

}

/**
 * 处理AI请求错误
 * @param error - 错误对象
 * @param loadingId - 加载指示器ID（可选）
 * @param errorPrefix - 错误日志前缀（可选）
 */
function handleAIError(error, loadingId = null, errorPrefix = 'AI 请求失败') {
	// 移除加载指示器（如果存在）
	if (loadingId) {
		removeLoadingIndicator(loadingId); // 移除加载动画
	}

	// 输出错误日志
	console.error(`${errorPrefix}:`, error); // 输出错误日志

	// 显示错误消息
	const errorMsg = error.message || '请求失败,请检查网络连接或稍后重试.'; // 错误消息
	addMessageToChat('assistant', `❌ 错误:${errorMsg}`, true); // 添加错误消息
	updateStatus('请求失败', 'error'); // 更新状态为错误

	// 滚动到底部
	// scrollToBottom(); // 滚动到消息底部
}

// ==================== 代码执行相关函数 ====================

/**
 * 执行代码并继续对话
 * 统一处理代码执行、结果展示、继续对话的流程
 * @param code - 要执行的代码
 * @param codeContainer - 代码容器DOM元素
 * @param button - 执行按钮DOM元素
 */
async function executeCodeAndContinue(code, codeContainer, button) {
	// 禁用按钮并更新文本
	button.disabled = true; // 禁用按钮
	button.textContent = '执行中...'; // 更新按钮文本

	// 执行代码
	const result = await executeCode(code); // 执行代码
	const resultText = formatExecutionResult(result); // 格式化结果

	// 显示执行结果
	const resultDiv = document.createElement('div'); // 创建结果容器
	resultDiv.className = 'code-result'; // 设置结果类名
	resultDiv.textContent = resultText; // 设置结果内容
	codeContainer.appendChild(resultDiv); // 将结果添加到代码容器

	// 更新按钮文本
	button.textContent = '已执行'; // 更新按钮文本

	// 将执行结果发送给 AI,继续对话（自动循环）
	await continueConversationWithResult(result); // 继续对话

	// 滚动到底部
	// scrollToBottom(); // 滚动到消息底部
}


/**
 * 创建read类型代码块的执行按钮
 * @param fragment - 代码片段对象
 * @param codeContainer - 代码容器DOM元素
 * @param actionContainer - 操作按钮容器DOM元素
 */
function createReadCodeButton(fragment, codeContainer, actionContainer) {
	// 如果是读取操作,自动执行
	const executeBtn = document.createElement('button'); // 创建执行按钮
	executeBtn.className = 'code-execute-btn'; // 设置执行按钮类名
	executeBtn.textContent = '执行代码'; // 设置按钮文本
	executeBtn.onclick = async () => {
		// 点击事件
		await executeCodeAndContinue(fragment.content, codeContainer, executeBtn); // 执行代码并继续对话
	}; // 设置点击事件

	actionContainer.appendChild(executeBtn); // 将执行按钮添加到操作容器

	// 自动执行（延迟一点,让界面先渲染）
	setTimeout(() => {
		executeBtn.click(); // 自动点击执行按钮
	}, 5000); // 延迟 5 秒
}

/**
 * 创建write类型代码块的确认按钮
 * @param fragment - 代码片段对象
 * @param codeContainer - 代码容器DOM元素
 * @param actionContainer - 操作按钮容器DOM元素
 */
function createWriteCodeButton(fragment, codeContainer, actionContainer) {
	// 如果是写入操作,需要确认
	const confirmBtn = document.createElement('button'); // 创建确认按钮
	confirmBtn.className = 'code-confirm-btn'; // 设置确认按钮类名
	confirmBtn.textContent = '确认执行'; // 设置按钮文本
	confirmBtn.onclick = async () => {
		// 点击事件
		// if (!autoExecWriteEnabled) {
		// 	// 如果未开启自动执行
		// 	const confirmed = confirm('确定要执行此代码吗？此操作可能会修改原理图.'); // 显示确认对话框
		// 	if (!confirmed) {
		// 		// 如果用户取消
		// 		return; // 直接返回
		// 	}
		// }
		await executeCodeAndContinue(fragment.content, codeContainer, confirmBtn); // 执行代码并继续对话
	}; // 设置点击事件

	actionContainer.appendChild(confirmBtn); // 将确认按钮添加到操作容器
	scrollToBottom(); // 有代码块执行,所以滚动到消息底部

	// 如果开启自动执行,5 秒后自动触发执行
	if (autoExecWriteEnabled) {
		setTimeout(() => {
			// 延迟执行
			if (!confirmBtn.disabled) {
				// 未被禁用才执行
				confirmBtn.click(); // 自动点击执行
			}
		}, 5000); // 5 秒延迟
	}

}


/**
 * 处理发送消息按钮点击事件
 */
async function handleSendMessage() {
	const message = messageInput.value.trim(); // 获取输入内容并去除首尾空格

	// 检查消息是否为空
	if (!message) {
		return; // 如果消息为空,直接返回
	}

	await runSendFlow({
		uiState: UI_STATE.SENDING, // 进入发送中状态
		statusText: '正在发送...', // 状态提示
		beforeSend: () => {
			prepareUserMessageUI(message); // 处理用户消息UI
		}, // UI 预处理
		appendHistory: () => {
			addUserMessageToHistory(message); // 添加到对话历史
		}, // 写入历史
		errorPrefix: 'AI 请求失败', // 错误前缀
		needScroll: true, // 发送用户消息需要滚动
	}); // 运行统一流程
}


/**
 * 处理停止按钮点击事件
 */
function handleStop() {
	isStop = true; // 设置为停止状态
	updateUIState(UI_STATE.STOPPED); // 更新为停止状态
}

/**
 * 恢复停止状态
 */
function resumeStop() {
	isStop = false; // 重置停止状态
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
 * 解析消息内容,提取代码块
 * @param content - 消息内容
 * @returns 解析后的内容片段数组
 */
function parseMessageContent(content) {
	const fragments = []; // 内容片段数组
	let lastIndex = 0; // 上次匹配的位置

	// 匹配代码块:```javascript:read 或 ```javascript:write 或 ```javascript
	const codeBlockRegex = /```(javascript|js):?(read|write)?\n([\s\S]*?)```/g; // 代码块正则表达式
	let match; // 匹配结果

	// 遍历所有匹配的代码块
	while ((match = codeBlockRegex.exec(content)) !== null) {
		// 添加代码块之前的文本
		if (match.index > lastIndex) {
			// 如果有文本内容
			const text = content.substring(lastIndex, match.index); // 提取文本
			if (text.trim()) {
				// 如果文本不为空
				fragments.push({ type: 'text', content: text }); // 添加文本片段
			}
		}

		// 添加代码块
		const codeType = match[2] || 'read'; // 代码类型（read 或 write,默认为 read）
		const code = match[3].trim(); // 代码内容
		fragments.push({ type: 'code', content: code, codeType: codeType }); // 添加代码片段

		lastIndex = match.index + match[0].length; // 更新上次匹配位置
	}

	// 添加剩余的文本
	if (lastIndex < content.length) {
		// 如果还有剩余文本
		const text = content.substring(lastIndex); // 提取剩余文本
		if (text.trim()) {
			// 如果文本不为空
			fragments.push({ type: 'text', content: text }); // 添加文本片段
		}
	}

	// 如果没有匹配到代码块,返回原始文本
	if (fragments.length === 0) {
		fragments.push({ type: 'text', content: content }); // 添加原始文本
	}

	return fragments; // 返回内容片段数组
}

/**
 * 执行代码并返回结果
 * @param code - 要执行的代码
 * @returns 执行结果,格式为包含 data、errorMessage、stack 属性的对象
 */
async function executeCode(code) {

	// 将代码包装在异步函数中执行
	// 注意:使用 eval 是为了执行动态代码,这是必要的功能
	const wrappedCode = `
			(async function() {
				try {
					${code};
				} catch (error) {
					return { data: null, errorMessage: error.message, stack: error.stack };
				}
			})()
		`; // 包装代码

	// 执行代码
	// eslint-disable-next-line no-eval
	const result = await eval(wrappedCode); // 执行代码

	console.log('代码执行结果:', result);

	return result; // 返回结果
}

/**
 * 格式化执行结果为文本
 * @param result - 执行结果,格式为包含 data、errorMessage、stack 属性的对象
 * @returns 格式化后的文本
 */
function formatExecutionResult(result) {
	if (result === undefined || result === null || (result.data === null && result.errorMessage === null && result.stack === null)) {
		return '执行完成（无返回值）'; // 无返回值
	} else if (typeof result === 'string') {
		return result; // 字符串直接返回
	} else if (result.errorMessage || result.stack) {
		return `❌ 执行错误:${result.errorMessage}\n${result.stack || ''}`; // 错误信息
	} else {
		return `执行完成,结果为: ${JSON.stringify(result.data)}`;
	}
}

/**
 * 创建文本片段DOM元素
 * @param fragment - 文本片段对象
 * @param contentDiv - 内容容器DOM元素
 */
function createTextFragment(fragment, contentDiv) {
	// 如果是文本片段
	const textDiv = document.createElement('div'); // 创建文本容器
	textDiv.className = 'message-text'; // 设置文本类名
	textDiv.textContent = fragment.content; // 设置文本内容
	contentDiv.appendChild(textDiv); // 添加到内容容器
}

/**
 * 创建代码片段DOM元素
 * @param fragment - 代码片段对象
 * @param contentDiv - 内容容器DOM元素
 */
function createCodeFragment(fragment, contentDiv) {
	// 如果是代码片段
	const codeContainer = document.createElement('div'); // 创建代码容器
	codeContainer.className = 'code-block-container'; // 设置代码容器类名

	// 创建代码块
	const codeBlock = document.createElement('pre'); // 创建代码块元素
	codeBlock.className = 'code-block'; // 设置代码块类名
	const codeElement = document.createElement('code'); // 创建代码元素
	codeElement.textContent = fragment.content; // 设置代码内容
	codeBlock.appendChild(codeElement); // 将代码元素添加到代码块

	// 创建操作按钮容器
	const actionContainer = document.createElement('div'); // 创建操作容器
	actionContainer.className = 'code-action-container'; // 设置操作容器类名

	// 根据代码类型创建对应的按钮
	if (fragment.codeType === 'read') {
		// 如果是读取操作
		createReadCodeButton(fragment, codeContainer, actionContainer); // 创建read类型按钮
	} else if (fragment.codeType === 'write') {
		// 如果是写入操作
		createWriteCodeButton(fragment, codeContainer, actionContainer); // 创建write类型按钮
	} else {
		scrollToBottom(); // 没有代码块执行,滚动到消息底部,并且结束对话
	}

	// 自动执行总是滚动到消息底部
	if (autoExecWriteEnabled) {
		scrollToBottom(); // 滚动到消息底部
	}

	codeContainer.appendChild(codeBlock); // 将代码块添加到代码容器
	codeContainer.appendChild(actionContainer); // 将操作容器添加到代码容器
	contentDiv.appendChild(codeContainer); // 将代码容器添加到内容容器
}

/**
 * 添加消息到对话界面
 * @param role - 消息角色 ('user' 或 'assistant')
 * @param content - 消息内容
 * @param isError - 是否为错误消息
 */
function addMessageToChat(role, content, isError = false) {
	// 如果停止状态为true,直接返回
	if (isStop) {
		resumeStop();
		return; // 直接返回
	}
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

	// 解析消息内容（提取代码块）
	const fragments = parseMessageContent(content); // 解析内容
	const codeFragments = fragments.filter((fragment) => fragment.type === 'code'); // 统计代码片段
	let error = null;
	else if (codeFragments.length > 1) { // 多于一个代码块则视为异常
		console.error('检测到多个代码块，已中止渲染'); // 记录错误日志
		error = new Error('❌ 错误:每次回答只能返回单个代码块,请重新回答');
	} else if (codeFragments.length > 0 && fragments[fragments.length - 1].type === 'text'
		&& fragments[fragments.length - 1].content.trim().length > 20) {
		error = new Error('❌ 错误:每次回答只能以代码块结尾,请重新回答');
	} else {
		if('assistant'==role && codeFragments.length == 0){
			// ai 没有代码块说明自动流程结束
			updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
			messageInput.focus(); // 聚焦输入框
		}
		// 遍历内容片段,创建对应的 DOM 元素
		fragments.forEach((fragment) => {
			if (fragment.type === 'text') {
				// 如果是文本片段
				createTextFragment(fragment, contentDiv); // 创建文本片段
			} else if (fragment.type === 'code') {
				// 如果是代码片段
				createCodeFragment(fragment, contentDiv); // 创建代码片段
			}
		}); // 遍历内容片段

		// 组装消息元素
		messageDiv.appendChild(contentDiv); // 将内容添加到消息容器
		messagesContainer.appendChild(messageDiv); // 将消息添加到消息容器
	}

	// 滚动到底部
	// scrollToBottom(); // 滚动到消息底部
	return error; // 返回错误
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
 * @param loadingId - 加载指示器的 ID
 */
function removeLoadingIndicator(loadingId) {
	// 查找并移除加载指示器
	const loadingElement = document.getElementById(loadingId); // 获取加载元素
	if (loadingElement) {
		// 如果元素存在
		loadingElement.remove(); // 移除元素
	}
}


/**
 * 确保系统消息在对话历史中,如果没有系统消息则执行预对话流程
 * 预对话流程包括:发送系统消息->接收命令->发送执行结果->收到指定确认消息
 * 此流程静默执行,不在界面上显示
 * @returns 如果预对话失败则抛出错误
 */
async function ensureSystemMessage() {
	// 检查对话历史中是否已有系统消息
	const hasSystemMessage = conversationHistory.some((msg) => msg.role === 'system'); // 检查是否有系统消息

	// 如果没有系统消息,执行预对话流程
	if (!hasSystemMessage) {
		const history = conversationHistory.slice(); // 备份对话历史,用于恢复
		conversationHistory = [{ // 清空对话历史,只保留系统消息
			role: 'system', // 系统消息角色
			content: window.top.systemMessage
		}];
		// 第一步:静默调用 API 发送系统消息,获取首次响应
		const firstResponse = await window.ArkAPI.callArkChat(conversationHistory); // 调用 ARK API,传入系统消息
		const firstAiResponse = parseAIResponse(firstResponse); // 解析响应

		// 将首次响应添加到对话历史（静默,不显示在界面）
		addAssistantMessageToHistory(firstAiResponse); // 添加到对话历史

		// 第二步:解析响应,提取代码块
		const fragments = parseMessageContent(firstAiResponse); // 解析内容
		const codeFragments = fragments.filter((fragment) => fragment.type === 'code'); // 提取代码片段

		// 
		let error = null;
		if (codeFragments.length > 1) { // 多于一个代码块则视为异常
			console.error('检测到多个代码块，已中止渲染'); // 记录错误日志
			error = new Error('❌ 错误:每次回答只能返回单个代码块');
		} else if (codeFragments.length > 0 && fragments[fragments.length - 1].type === 'text'
			&& fragments[fragments.length - 1].content.trim().length > 20) {
			error = new Error('❌ 错误:每次回答只能以代码块结尾');
		}

		if (!error) {
			// 第三步:静默执行代码（不显示在界面）
			const code = codeFragments[0].content; // 获取第一个代码块内容
			const executionResult = await executeCode(code); // 执行代码
			if (executionResult.errorMessage) {
				error = new Error(`❌ 错误:${executionResult.errorMessage}`);
			} else {
				// 第四步:静默发送执行结果给 AI
				conversationHistory.push({
					role: 'system', // 系统角色（作为执行结果的反馈）
					content: `这是第一步返回的数据,请阅读后执行第二步:${JSON.stringify(executionResult)}`, // 结果消息内容
				}); // 添加到对话历史

				// 调用 API 获取确认响应
				const confirmResponse = await window.ArkAPI.callArkChat(conversationHistory); // 调用 ARK API
				const confirmAiResponse = parseAIResponse(confirmResponse); // 解析响应

				// 将确认响应添加到对话历史（静默,不显示在界面）
				addAssistantMessageToHistory(confirmAiResponse); // 添加到对话历史

				// 第五步:检查响应是否包含"已理解系统定义,准备接收用户请求"
				if (!(confirmAiResponse.includes('已理解系统定义') && confirmAiResponse.includes('准备接收用户请求'))) {
					error = new Error('初始化失败:未收到预期的确认消息'); // 抛出错误
				}
			}

		}
		// 第六步:恢复对话历史
		if (!error) {
			conversationHistory.push(...history);
			console.log('初始化成功,系统已准备好接收用户请求'); // 输出日志
		} else throw error;
	}
}


/**
 * 统一的发送流程封装,减少重复代码
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
	let loadingId = null; // 记录加载指示器 ID
	try {
		updateUIState(uiState); // 切换 UI 状态
		updateStatus(statusText, 'info'); // 更新状态提示
		beforeSend(); // 执行发送前 UI 操作
		appendHistory(); // 写入对话历史
		loadingId = addLoadingIndicator(); // 添加加载指示器
		if (needScroll) {
			scrollToBottom(); // 按需滚动到底部
		}
		await callAIAndHandleResponse(loadingId); // 调用 AI 并处理响应
		updateStatus('', ''); // 清空状态提示
	} catch (error) {
		handleAIError(error, loadingId, errorPrefix); // 统一错误处理
	} finally {
		// updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
		// messageInput.focus(); // 聚焦输入框
	}
}

/**
 * 继续对话,将代码执行结果发送给 AI
 * 根据系统消息要求,执行代码后需要将结果发送给 AI,让 AI 继续处理,直到没有返回代码为止
 * @param result - 代码执行结果,格式为包含 data、errorMessage、stack 属性的对象
 */
async function continueConversationWithResult(result) {
	await runSendFlow({
		uiState: UI_STATE.EXECUTING, // 切换到代码执行中状态
		statusText: 'AI 正在处理结果...', // 状态提示
		beforeSend: () => { }, // 无需额外 UI 处理
		appendHistory: () => {
			conversationHistory.push({
				role: 'system', // 系统角色（作为执行结果的反馈）
				content: JSON.stringify(result), // 结果消息内容
			}); // 添加到对话历史
		}, // 写入历史
		errorPrefix: '继续对话失败', // 错误前缀
		needScroll: false, // 继续对话不强制滚动
	}); // 运行统一流程
}

/**
 * 精简历史用于 API 调用
 * 返回精简后的历史数组,确保不超过最大消息数量限制
 * 系统消息始终保留在开头
 * @param history - 原始对话历史数组
 * @returns 精简后的对话历史数组
 */
function trimHistoryForAPI(history) {
	// 如果历史消息数量未超过限制,直接返回
	// if (history.length <= MAX_HISTORY_MESSAGES) {
	return history; // 直接返回原始历史
	// }

	// // 分离系统消息和普通消息
	// const systemMessages = history.filter((msg) => msg.role === 'system'); // 提取系统消息
	// const normalMessages = history.filter((msg) => msg.role !== 'system'); // 提取普通消息

	// // 如果超过限制,只保留最近的普通消息
	// const maxNormalMessages = MAX_HISTORY_MESSAGES - systemMessages.length; // 计算普通消息的最大数量
	// const startIndex = normalMessages.length - maxNormalMessages; // 计算起始索引
	// const trimmedNormalMessages = normalMessages.slice(Math.max(0, startIndex)); // 只保留最近的消息

	// // 合并系统消息和精简后的普通消息（系统消息在前）
	// return [...systemMessages, ...trimmedNormalMessages]; // 返回合并后的历史
}

/**
 * 处理清空对话
 */
function handleClearChat() {
	// 确认是否清空
	const confirmed = confirm('确定要清空所有对话记录吗？'); // 显示确认对话框
	if (!confirmed) {
		// 如果用户取消
		return; // 直接返回
	}

	// 清空消息容器（保留欢迎消息）
	const welcomeMsg = messagesContainer.querySelector('.welcome-message'); // 获取欢迎消息
	messagesContainer.innerHTML = ''; // 清空消息容器
	if (!welcomeMsg) {
		// 如果欢迎消息不存在
		// 重新添加欢迎消息
		const welcomeDiv = document.createElement('div'); // 创建欢迎消息容器
		welcomeDiv.className = 'welcome-message'; // 设置欢迎消息类名
		welcomeDiv.innerHTML = `
			<p>你好！我是原理图设计 AI 助手,专门帮助你进行原理图设计.</p>
			<p>我可以帮你:</p>
			<ul style="text-align: left; display: inline-block; margin-top: 8px;">
				<li>解答原理图设计相关问题</li>
				<li>根据用户自然语言,自动设计和优化原理图</li>
			</ul>
			<p style="margin-top: 12px;">请输入你的原理图设计问题,我会尽力帮助你！</p>
		`; // 设置欢迎消息内容
		messagesContainer.appendChild(welcomeDiv); // 添加欢迎消息
	} else {
		// 如果欢迎消息存在
		messagesContainer.appendChild(welcomeMsg); // 重新添加欢迎消息
	}

	// 清空对话历史（系统消息会在下次发送消息时自动添加）
	conversationHistory = []; // 重置对话历史数组

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
	statusText.textContent = text; // 设置状态文本
	statusText.className = 'status-text'; // 重置类名
	if (type) {
		// 如果有类型
		statusText.className += ' ' + type; // 添加类型类名
	}
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
		const savedApiKey = localStorage.getItem('ark_api_key'); // 读取 ARK API Key
		const savedModel = localStorage.getItem('ark_model'); // 读取 ARK Model

		// 如果存在配置,则更新 ARK API 模块
		if (savedApiKey || savedModel) {
			// 调用 ark-api.js 的更新配置函数
			if (window.ArkAPI && window.ArkAPI.updateConfig) {
				// 如果 updateConfig 函数存在
				window.ArkAPI.updateConfig(savedApiKey || '', savedModel || ''); // 更新配置
			}
		}
	} catch (error) {
		// 捕获配置加载错误
		console.error('加载配置失败:', error); // 输出错误日志
	}
}

/**
 * 处理配置按钮点击事件
 * 显示配置对话框并填充当前配置值
 */
function handleConfigClick() {
	// 从 localStorage 读取当前配置值
	const currentApiKey = localStorage.getItem('ark_api_key') || ''; // 读取当前 API Key
	const currentModel = localStorage.getItem('ark_model') || ''; // 读取当前 Model

	// 填充输入框
	arkApiKeyInput.value = currentApiKey; // 设置 API Key 输入框值
	arkModelInput.value = currentModel; // 设置 Model 输入框值

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
		const model = arkModelInput.value.trim(); // 获取 Model 并去除首尾空格

		// 保存到 localStorage
		if (apiKey) {
			// 如果 API Key 不为空
			localStorage.setItem('ark_api_key', apiKey); // 保存 API Key
		} else {
			// 如果 API Key 为空
			localStorage.removeItem('ark_api_key'); // 删除 API Key
		}

		if (model) {
			// 如果 Model 不为空
			localStorage.setItem('ark_model', model); // 保存 Model
		} else {
			// 如果 Model 为空
			localStorage.removeItem('ark_model'); // 删除 Model
		}

		// 更新 ARK API 模块配置
		if (window.ArkAPI && window.ArkAPI.updateConfig) {
			// 如果 updateConfig 函数存在
			window.ArkAPI.updateConfig(apiKey, model); // 更新配置
		}

		// 关闭配置对话框
		handleCloseConfig(); // 关闭对话框

		// 显示成功提示
		updateStatus('配置已保存', 'success'); // 更新状态为成功
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

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); // 监听 DOM 加载完成事件

