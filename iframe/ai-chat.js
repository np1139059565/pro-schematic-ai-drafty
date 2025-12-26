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
let arkApiKeyInput; // API Key 输入框
let arkModelInput; // API Model 输入框
let arkModelInputContainer; // API Model 输入框容器（用于显示/隐藏）
let usePrivateServerCheckbox; // 使用私服复选框
let autoExecWriteCheckbox; // 自动执行复选框
let autoExecWriteEnabled = false; // 自动执行开关（默认关闭）
let usePrivateServer = false; // 是否使用私服（默认使用ARK API）

// 对话历史数组,用于维护上下文
let conversationHistory = []; // 存储所有对话消息,格式: [{role: 'user', content: '...'}, {role: 'assistant', content: '...'}]
let previousResponseId = null; // 上一轮响应的ID（用于多轮对话）
let isStop = false; // 是否停止
let totalTokensAccumulated = 0; // 累加多轮对话的 total_tokens
let currentLoadingId = null; // 当前加载指示器ID

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


// 系统消息 - 用于描述 AI 角色和职责,用户可以在控制台临时修改系统消息,对ai助手进行定制化
window.top.systemMessage = window.promptList.find(prompt => prompt.name === 'system_message').messages[0].content.text;
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
	arkModelInputContainer = document.getElementById('arkModelInputContainer'); // 获取API Model输入框容器
	usePrivateServerCheckbox = document.getElementById('usePrivateServerCheckbox'); // 获取使用私服复选框
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
	// 使用私服复选框切换事件
	usePrivateServerCheckbox.addEventListener('change', handlePrivateServerToggle); // 绑定切换事件
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
			// 空闲状态:可发送消息、可清空、可配置、停止按钮隐藏
			setInputDisabled(false); // 启用输入框和发送按钮
			stopBtn.style.display = 'none'; // 隐藏停止按钮
			clearBtn.disabled = false; // 启用清空按钮
			autoExecWriteCheckbox.disabled = false; // 启用自动执行复选框
			configBtn.disabled = false; // 启用配置按钮
			break;

		case UI_STATE.SENDING:
			// 发送中:禁用输入/发送/清空、允许配置、显示停止
			setInputDisabled(true); // 禁用输入框和发送按钮
			stopBtn.style.display = 'block'; // 显示停止按钮
			clearBtn.disabled = true; // 禁用清空按钮
			autoExecWriteCheckbox.disabled = false; // 允许自动执行复选框（但停止后会被禁用）
			configBtn.disabled = false; // 允许配置
			break;

		case UI_STATE.STOPPED:
			// 停止中:禁用输入/发送/清空/自动执行复选框、隐藏停止按钮、取消自动执行选中状态
			setInputDisabled(true); // 禁用输入框和发送按钮
			stopBtn.style.display = 'none'; // 隐藏停止按钮
			clearBtn.disabled = true; // 禁用清空按钮
			autoExecWriteCheckbox.disabled = true; // 禁用自动执行复选框
			autoExecWriteEnabled = false; // 取消自动执行
			autoExecWriteCheckbox.checked = false; // 取消自动执行选中状态
			configBtn.disabled = false; // 允许配置
			break;

		case UI_STATE.EXECUTING:
			// 代码执行中:禁用输入/发送/清空、允许配置、显示停止
			setInputDisabled(true); // 禁用输入框和发送按钮
			stopBtn.style.display = 'block'; // 显示停止按钮
			clearBtn.disabled = true; // 禁用清空按钮
			autoExecWriteCheckbox.disabled = false; // 允许自动执行复选框
			configBtn.disabled = false; // 允许配置
			break;
	}
}



/**
 * 添加AI回复到对话历史
 * @param {Object} message - 消息对象
 * @param {Array} toolCalls - 工具调用数组
 */
function addAssistantMessageToHistory(message, toolCalls) {
	conversationHistory.push({
		role: 'assistant', // AI角色
		content: message, // AI回复内容
		toolCalls: toolCalls, // 工具调用信息
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
 * 解析工具参数
 * @param {string|Object} argumentsStr - 工具参数字符串或对象
 * @returns {Object} 解析后的参数对象
 */
function parseToolArguments(argumentsStr) {
	if (!argumentsStr) {
		return {}; // 如果没有参数,返回空对象
	}
	try {
		return typeof argumentsStr === 'string'
			? JSON.parse(argumentsStr) // 如果是字符串,解析JSON
			: argumentsStr; // 如果已经是对象,直接返回
	} catch (e) {
		// 如果解析失败,返回原始值（用于generateCodeFromToolCalls）
		return argumentsStr; // 返回原始字符串
	}
}

/**
 * 更新上一轮响应ID
 * @param {string|null} responseId - 响应ID
 */
function updatePreviousResponseId(responseId) {
	if (responseId) {
		previousResponseId = responseId; // 更新响应ID
	}
}

/**
 * 提取消息内容
 * @param {Object} item - 消息项
 * @returns {string} 消息内容
 */
function extractMessageContent(item) {
	if (item.content && Array.isArray(item.content)) {
		// content是数组格式
		return item.content
			.filter(c => c.type === 'output_text') // 过滤文本类型
			.map(c => c.text) // 提取文本
			.join(''); // 拼接文本
	} else if (typeof item.content === 'string') {
		// content是字符串格式
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
		id: item.call_id || item.id, // 工具调用ID
		function: {
			name: item.name, // 函数名称
			arguments: typeof item.arguments === 'string'
				? item.arguments
				: JSON.stringify(item.arguments || {}), // 参数（JSON字符串）
		},
	}; // 返回工具调用对象
}

/**
 * 解析AI API响应,提取回复内容和工具调用信息
 * @param response - API响应对象（Responses API格式）
 * @returns {Object} 包含content和toolCalls的对象
 */
function parseAIResponse(response) {
	// 解析 AI 回复
	let aiResponse = ''; // AI 回复内容
	let toolCalls = null; // 工具调用信息

	if (response && response.output && Array.isArray(response.output)) {
		// Responses API格式:解析output数组
		const output = response.output; // 获取output数组

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
			aiResponse = '抱歉,我没有收到有效的回复.'; // 错误提示
		}
	} else {
		// 如果响应格式不正确
		aiResponse = '抱歉,AI 返回的响应格式不正确.'; // 错误提示
	}

	return {
		content: aiResponse, // 回复内容
		toolCalls: toolCalls, // 工具调用信息
		responseId: response?.id, // 响应ID
	}; // 返回解析结果
}

/**
 * 从工具调用生成代码块内容
 * @param {Array} toolCalls - 工具调用数组
 * @returns {string} 代码块内容
 */
function generateCodeFromToolCalls(toolCalls) {
	if (!toolCalls || toolCalls.length === 0) {
		return ''; // 如果没有工具调用,返回空字符串
	}

	// 生成代码块,包含所有工具调用
	let codeLines = ['const resp = { data: null, errorMessage: null, stack: null };']; // 初始化响应对象

	// 遍历所有工具调用
	for (let i = 0; i < toolCalls.length; i++) {
		const toolCall = toolCalls[i]; // 获取工具调用
		const toolName = toolCall.function.name; // 获取工具名称
		const argumentsObj = parseToolArguments(toolCall.function.arguments); // 使用公共函数解析参数

		// 生成工具调用代码
		if (toolCalls.length === 1) {
			// 单个工具调用
			codeLines.push(`const result = await mcpEDA.callTool({ name: '${toolName}', arguments: ${JSON.stringify(argumentsObj, null, 2)} });`); // 调用工具
			codeLines.push('resp.data = result;'); // 设置结果
		} else {
			// 多个工具调用
			codeLines.push(`const result${i} = await mcpEDA.callTool({ name: '${toolName}', arguments: ${JSON.stringify(argumentsObj, null, 2)} });`); // 调用工具
			if (i === toolCalls.length - 1) {
				// 最后一个工具调用,设置结果
				codeLines.push(`resp.data = [${Array.from({ length: toolCalls.length }, (_, idx) => `result${idx}`).join(', ')}];`); // 设置结果数组
			}
		}
	}

	codeLines.push('return resp;'); // 返回响应

	return codeLines.join('\n'); // 返回代码字符串
}

/**
 * 执行单个工具调用（从executeToolCalls拆分）
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
				tool_call_id: toolCall.id, // 工具调用ID
				content: `参数解析失败: 参数格式不正确`, // 错误信息
				isError: true, // 标记为错误
			};
		}

		// 调用MCP工具
		const result = await window.mcpEDA.callTool({
			name: toolName, // 工具名称
			arguments: argumentsObj, // 工具参数
		});

		// 格式化返回结果
		if (result.isError) {
			// 如果工具执行出错
			return {
				tool_call_id: toolCall.id, // 工具调用ID
				content: result.content?.[0]?.text || '工具执行失败', // 错误信息
				isError: true, // 标记为错误
			};
		} else {
			// 工具执行成功
			const content = result.content?.[0]?.text || JSON.stringify(result); // 提取文本内容
			return {
				tool_call_id: toolCall.id, // 工具调用ID
				content: content, // 返回内容
				isError: false, // 标记为成功
			};
		}
	} catch (error) {
		// 捕获执行错误
		return {
			tool_call_id: toolCall.id, // 工具调用ID
			content: `工具执行异常: ${error.message}`, // 错误信息
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
 * 调用AI API并处理响应
 * 包括调用API、解析响应、添加AI回复到界面和历史
 */
async function callAIAndHandleResponse() {

	// 确保系统消息在对话历史中
	const isAddTool = ensureSystemMessage(); // 确保系统消息存在
	
	// 创建 API Promise 并追踪
	let apiPromise;
	try {
		// 根据配置选择调用 ARK API 或私服 API
		apiPromise = 
			window.ArkAPI[usePrivateServer?'callPrivateChat':'callArkChat'](
				conversationHistory, previousResponseId,isAddTool ? window.mcpEDA.toolDescriptions : null); // 调用 API
		
		// 追踪 API Promise
		activeApiPromises.add(apiPromise); // 添加到追踪集合
		
		// 等待 API 响应
		const response = await apiPromise;
		
		// 从追踪集合中移除
		activeApiPromises.delete(apiPromise); // 移除追踪
		// 如果停止状态为true,直接返回
		if (isStop) {
			resumeStop();
			return; // 直接返回
		}
		// 累加 total_tokens
		totalTokensAccumulated += response.usage.total_tokens; // 累加 tokens
		console.info(`total_tokens累计: ${totalTokensAccumulated}`, 'history', conversationHistory);//打印对话历史和累计tokens

		// 解析 AI 回复
		const parsedResponse = parseAIResponse(response); // 解析响应
		addAssistantMessageToHistory(parsedResponse.content, parsedResponse.toolCalls); // 添加到对话历史

		// 更新上一轮响应ID（使用公共函数）
		updatePreviousResponseId(parsedResponse.responseId); // 更新响应ID

		// 如果有内容,添加到界面和历史
		if (parsedResponse.content) {
			// 移除加载指示器
			removeLoadingIndicator(); // 移除加载动画

			// 添加 AI 回复到界面
			addMessageToChat('assistant', parsedResponse.content); // 添加 AI 回复
		}

		// 检查是否有工具调用
		if (parsedResponse.toolCalls && parsedResponse.toolCalls.length > 0) {
			// 如果有工具调用,生成代码块并等待用户确认
			// 生成代码块内容
			const codeContent = generateCodeFromToolCalls(parsedResponse.toolCalls); // 生成代码

			// 创建代码块展示（等待用户确认）
			createToolCallCodeBlock(codeContent, parsedResponse.toolCalls); // 创建代码块
		} else {
			// 如果没有工具调用,说明模型已经完成回复
			// 移除加载指示器（如果还在显示）
			removeLoadingIndicator(); // 移除加载动画
		}
	} catch (error) {
		// 从追踪集合中移除（即使出错也要移除）
		if (apiPromise) {
			activeApiPromises.delete(apiPromise); // 移除追踪
		}
		// 移除加载指示器
		removeLoadingIndicator(); // 移除加载动画
		// 如果停止状态为true,直接返回
		if (isStop) {
			resumeStop();
			return; // 直接返回
		}
		throw error; // 重新抛出错误
	}

}


/**
 * 创建工具调用代码块（等待用户确认执行）
 * @param {string} codeContent - 代码内容
 * @param {Array} toolCalls - 工具调用数组
 */
function createToolCallCodeBlock(codeContent, toolCalls) {
	// 创建代码容器
	const codeContainer = document.createElement('div'); // 创建代码容器
	codeContainer.className = 'code-block-container'; // 设置代码容器类名

	// 创建代码块
	const codeBlock = document.createElement('pre'); // 创建代码块元素
	codeBlock.className = 'code-block'; // 设置代码块类名
	const codeElement = document.createElement('code'); // 创建代码元素
	codeElement.textContent = codeContent; // 设置代码内容
	codeBlock.appendChild(codeElement); // 将代码元素添加到代码块

	// 创建操作按钮容器
	const actionContainer = document.createElement('div'); // 创建操作容器
	actionContainer.className = 'code-action-container'; // 设置操作容器类名

	// 创建确认执行按钮（统一按钮,不再区分read/write）
	const confirmBtn = document.createElement('button'); // 创建确认按钮
	confirmBtn.className = 'code-confirm-btn'; // 设置确认按钮类名
	confirmBtn.textContent = '确认执行'; // 设置按钮文本
	confirmBtn.onclick = async () => {
		// 点击事件
		await executeToolCallsAndContinue(toolCalls, codeContainer, confirmBtn); // 执行工具调用并继续对话
	}; // 设置点击事件

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

	// 如果开启自动执行,5 秒后自动触发执行
	if (autoExecWriteEnabled) {
		const timeoutId = setTimeout(() => {
			// 延迟执行
			activeTimeouts.delete(timeoutId); // 从追踪集合中移除
			if (!confirmBtn.disabled) {
				// 未被禁用才执行
				confirmBtn.click(); // 自动点击执行
			}
		}, 2000); // 5 秒延迟
		activeTimeouts.add(timeoutId); // 追踪 setTimeout
	}
}

/**
 * 处理工具执行结果
 * @param {Array} toolResults - 工具执行结果数组
 * @param {Object} codeContainer - 代码容器DOM元素
 * @param {Object} button - 执行按钮DOM元素
 * @returns {Array} 工具输入消息数组（用于Responses API）
 */
function handleToolExecutionResults(toolResults, codeContainer, button) {
	// 格式化并显示执行结果
	let allResults = []; // 初始化结果数组
	for (const result of toolResults) {
		const resultText = result.isError ? `❌ 错误: ${result.content}` : `执行完成: ${result.content}`; // 格式化结果
		allResults.push(resultText); // 添加到结果数组
	}

	// 显示执行结果
	const resultDiv = document.createElement('div'); // 创建结果容器
	resultDiv.className = 'code-result'; // 设置结果类名
	resultDiv.textContent = allResults.join('\n'); // 设置结果内容
	codeContainer.appendChild(resultDiv); // 将结果添加到代码容器

	// 更新按钮文本
	button.textContent = '已执行'; // 更新按钮文本

	// 准备工具执行结果消息（用于Responses API）
	// 根据Responses API文档,工具执行结果应该作为input的一部分传入
	const toolInputMessages = []; // 初始化工具输入消息数组
	for (const result of toolResults) {
		// 添加工具调用输出（符合Responses API格式）
		toolInputMessages.push({
			type: 'function_call_output', // 工具调用输出类型
			call_id: result.tool_call_id, // 工具调用ID
			output: result.content, // 工具执行结果内容
		}); // 添加到工具输入消息数组
		// 同时添加到本地对话历史（用于记录）
		conversationHistory.push({
			role: 'tool', // 角色为tool
			tool_call_id: result.tool_call_id, // 工具调用ID
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
	// 继续调用模型获取最终回复（使用Responses API）
	addLoadingIndicator(); // 添加加载指示器
	updateUIState(UI_STATE.EXECUTING); // 切换到代码执行中状态
	updateStatus('AI 正在处理结果...', 'info'); // 更新状态提示
	
	// 创建 API Promise 并追踪
	let apiPromise;
	try {
		// 根据配置选择调用 ARK API 或私服 API
		apiPromise = window.ArkAPI[usePrivateServer ? 'callPrivateChat' : 'callArkChat'](
				toolInputMessages, // 工具执行结果（作为input传入）
			previousResponseId // 上一轮响应ID
		); // 调用 API
		
		// 追踪 API Promise
		activeApiPromises.add(apiPromise); // 添加到追踪集合
		
		// 等待 API 响应
		const response = await apiPromise;
		
		// 从追踪集合中移除
		activeApiPromises.delete(apiPromise); // 移除追踪
		
		// 如果停止状态为true,直接返回
		if (isStop) {
			resumeStop();
			return; // 直接返回
		}
		
		// 累加 total_tokens
		totalTokensAccumulated += response.usage.total_tokens; // 累加 tokens
		console.info('history', conversationHistory, `total_tokens累计: ${totalTokensAccumulated}`);//打印对话历史和累计tokens

		// 解析响应
		const parsedResponse = parseAIResponse(response); // 解析响应
		addAssistantMessageToHistory(parsedResponse.content, parsedResponse.toolCalls); // 添加到对话历史

		// 更新上一轮响应ID（使用公共函数）
		updatePreviousResponseId(parsedResponse.responseId); // 更新响应ID

		// 如果有内容,添加到界面
		if (parsedResponse.content) {
			addMessageToChat('assistant', parsedResponse.content); // 添加 AI 回复
		}

		// 检查是否还有工具调用
		if (parsedResponse.toolCalls && parsedResponse.toolCalls.length > 0) {
			// 如果有工具调用,生成代码块并等待用户确认
			const codeContent = generateCodeFromToolCalls(parsedResponse.toolCalls); // 生成代码
			createToolCallCodeBlock(codeContent, parsedResponse.toolCalls); // 创建代码块
		} else {
			// 如果没有工具调用,完成
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
		// 从追踪集合中移除（即使出错也要移除）
		if (apiPromise) {
			activeApiPromises.delete(apiPromise); // 移除追踪
		}
		// 移除加载指示器
		removeLoadingIndicator(); // 移除加载动画
		// 如果停止状态为true,直接返回
		if (isStop) {
			resumeStop();
			return; // 直接返回
		}
		throw error; // 重新抛出错误
	}


}

/**
 * 执行工具调用并继续对话
 * @param {Array} toolCalls - 工具调用数组
 * @param {Object} codeContainer - 代码容器DOM元素
 * @param {Object} button - 执行按钮DOM元素
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
		// 恢复UI状态
		updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
		updateStatus('', ''); // 清空状态提示
		messageInput.focus(); // 聚焦输入框
	}
}

/**
 * 处理AI请求错误
 * @param error - 错误对象
 * @param errorPrefix - 错误日志前缀（可选）
 */
function handleAIError(error, errorPrefix = 'AI 请求失败') {
	// 移除加载指示器（如果存在）
	removeLoadingIndicator(); // 移除加载动画

	// 输出错误日志
	console.error(`${errorPrefix}:`, error); // 输出错误日志

	// 显示错误消息
	const errorMsg = error.message || '请求失败,请检查网络连接或稍后重试.'; // 错误消息
	addMessageToChat('assistant', `❌ 错误:${errorMsg}`, true); // 添加错误消息
	updateStatus('请求失败', 'error'); // 更新状态为错误

	// 滚动到底部
	// scrollToBottom(); // 滚动到消息底部
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
			conversationHistory.push({
				role: 'user', // 用户角色
				content: message, // 用户消息内容
			}); // 添加到对话历史
		}, // 写入历史
		errorPrefix: 'AI 请求失败', // 错误前缀
		needScroll: true, // 发送用户消息需要滚动
	}); // 运行统一流程
}


/**
 * 处理停止按钮点击事件
 * 立即检测并取消所有正在执行的异步操作，如果没有正在执行的操作，则立即恢复到空闲状态
 */
function handleStop() {
	isStop = true; // 设置为停止状态
	
	// 取消所有正在执行的 setTimeout
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
		// 有正在执行的操作，更新为停止状态（等待操作完成后自动恢复）
		updateUIState(UI_STATE.STOPPED); // 更新为停止状态
	}
}

/**
 * 恢复停止状态
 */
function resumeStop() {
	isStop = false; // 重置停止状态
	removeLoadingIndicator(); // 移除加载指示器
	// 清理所有追踪（确保状态一致）
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

	// 直接显示文本内容（不再解析代码块,因为现在使用Function Calling）
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
		return false; // 如果已有系统消息,直接返回
	}

	conversationHistory.unshift({
		role: 'system',
		content: window.top.systemMessage
	});


	console.log('已添加系统消息到对话历史'); // 输出日志
	return true;
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
	try {
		updateUIState(uiState); // 切换 UI 状态
		updateStatus(statusText, 'info'); // 更新状态提示
		beforeSend(); // 执行发送前 UI 操作
		appendHistory(); // 写入对话历史
		addLoadingIndicator(); // 添加加载指示器
		if (needScroll) {
			scrollToBottom(); // 按需滚动到底部
		}
		await callAIAndHandleResponse(); // 调用 AI 并处理响应
		updateStatus('', ''); // 清空状态提示
	} catch (error) {
		handleAIError(error, errorPrefix); // 统一错误处理
	} finally {
		updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
		messageInput.focus(); // 聚焦输入框
	}
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

	// 重置上一轮响应ID
	previousResponseId = null; // 重置响应ID
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
		const savedApiKey = localStorage.getItem('api_key'); // 读取 API Key
		const savedModel = localStorage.getItem('api_model'); // 读取 API Model
		const savedUsePrivateServer = localStorage.getItem('use_private_server') === 'true'; // 读取是否使用私服

		// 根据 model 是否为空决定是否使用私服（如果 model 为空，默认使用私服）
		usePrivateServer = savedUsePrivateServer !== null ? savedUsePrivateServer : !savedModel; // 如果未保存过配置，根据 model 是否为空决定

		// 调用 ark-api.js 的更新配置函数
		window.ArkAPI.updateConfig(savedApiKey || '', savedModel || ''); // 更新配置
	} catch (error) {
		// 捕获配置加载错误
		console.error('加载配置失败:', error); // 输出错误日志
	}
}

/**
 * 处理使用私服复选框切换事件
 * 根据复选框状态显示/隐藏 API Model 输入框
 */
function handlePrivateServerToggle() {
	usePrivateServer = usePrivateServerCheckbox.checked; // 更新使用私服状态
	if (usePrivateServer) {
		// 如果使用私服，隐藏 Model 输入框
		arkModelInputContainer.style.display = 'none'; // 隐藏容器
	} else {
		// 如果使用 ARK API，显示 Model 输入框
		arkModelInputContainer.style.display = 'block'; // 显示容器
	}
}

/**
 * 处理配置按钮点击事件
 * 显示配置对话框并填充当前配置值
 */
function handleConfigClick() {
	// 从 localStorage 读取当前配置值
	const currentApiKey = localStorage.getItem('api_key') || ''; // 读取当前 API Key
	const currentModel = localStorage.getItem('api_model') || ''; // 读取当前 Model
	const usePrivateServerValue = (currentModel == '') ? true : false; // 读取是否使用私服

	// 填充输入框
	arkApiKeyInput.value = currentApiKey; // 设置 API Key 输入框值
	arkModelInput.value = currentModel; // 设置 Model 输入框值
	usePrivateServerCheckbox.checked = usePrivateServerValue; // 设置使用私服复选框状态
	handlePrivateServerToggle(); // 根据复选框状态显示/隐藏 Model 输入框
	usePrivateServer = usePrivateServerValue; // 更新使用私服状态

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
		const model = usePrivateServer ? '' : arkModelInput.value.trim(); // 如果使用私服，model 为空；否则获取 Model 并去除首尾空格


		// 更新 ARK API 模块配置
		window.ArkAPI.updateConfig(apiKey, model); // 更新配置

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

/**
 * 设置私服链接，传递用户信息
 */
async function setupPrivateServerLink() {
	const privateServerLink = document.getElementById('privateServerLink'); // 获取私服链接元素
	if (!privateServerLink) return; // 如果元素不存在，直接返回

	let uinfo = ''; // 用户信息参数
	try {
		// 从 localStorage 读取用户登录信息
		const isLogin = localStorage.getItem('isLogin'); // 读取登录信息
		const loginData = JSON.parse(isLogin); // 解析 JSON 字符串
		// 尝试从 LCEDA API 获取完整用户信息
		const response = await fetch('https://u.lceda.cn/api/user', {
			credentials: 'include' // 携带 cookie
		}); // 调用 LCEDA API
		const data = await response.json(); // 解析响应

		if (isLogin /*&& data.success && data.code === 0*/) {
			// 构建用户信息对象（包含完整 LCEDA 信息）
			const userInfo = {
				uuid: loginData.uuid || '',
				username: loginData.username || '',
				avatar: loginData.avatar || '',
				lceda_user_info: data.result || {} // 添加完整用户信息
			};
			uinfo = encodeURIComponent(JSON.stringify(userInfo)); // 编码 JSON 字符串
			// 设置私服链接 URL
			const serverUrl = 'https://113.46.209.138/login?uinfo=' + uinfo; // 构建完整 URL
			privateServerLink.href = serverUrl; // 设置链接地址
		}else{
			// alert('登录信息解析失败,请重新登录(如果确认已经登录,请点击右上角个人中心获取登录信息)');
		}
	} catch (error) {
		console.error('解析登录信息失败:', error); // 输出错误日志
	}
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', init); // 监听 DOM 加载完成事件

