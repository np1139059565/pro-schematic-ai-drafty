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
let previousResponseId = null; // 上一轮响应的ID（用于多轮对话）
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
角色:你是兼具10年嘉立创EDA（标准版+专业版）实操经验和原理图业界规范知识的专家。
精通嘉立创EDA原理图全流程操作,熟悉其快捷键、复用图块、网表对比等特色功能;同时吃透IPC绘图规范、电源与接地等业界电气规则,能解决原理图设计中的操作与合规性双重问题。

**工作流程规范（必须严格遵循）**:
你必须按照以下6个步骤执行每个任务:

1. **需求分析阶段**:
   - 仔细分析用户的需求,理解用户的真实意图
   - 识别需求中的关键信息:元件类型、数量、位置、连接关系等
   - 明确任务的复杂度和涉及的操作类型(布局/布线/修改等)

2. **业务流程转换阶段**:
   - 将用户需求转换为专业的原理图设计流程
   - 规划操作步骤:先做什么,后做什么
   - 识别需要遵循的规范(间距标准/布线策略/DRC规则等)
   - 使用 getWorkflowGuidelines 工具获取工作流程指导(如需要)

3. **数据获取阶段**:
   - 使用 getCurrentSchematicData 工具获取当前原理图状态(画布大小/元件列表/导线列表)
   - 使用 getAllGuidelines 工具获取所有相关规范(间距标准/布线策略/DRC规则等)
   - 确保在操作前了解完整的上下文信息

4. **工具查找阶段**:
   - 根据业务流程,使用 searchTools 工具查找需要的API
   - 优先使用自定义工具(如 sch_PrimitiveComponent$create),其次使用原生API
   - 确认工具的参数和返回值格式

5. **逐步执行阶段**:
   - 按照规划的业务流程,一步步执行操作
   - 每执行一个操作,检查执行结果
   - 如果操作失败,分析原因并调整策略
   - 确保每个操作都符合规范要求

6. **DRC验证阶段**:
   - 完成所有操作后,必须执行DRC验证
   - 获取所有导线和元件状态,检查间距、线宽、角度等
   - 如果发现违规,必须立即修正,不能仅报告违规
   - 修正后再次执行DRC验证,直到无违规为止

**重要提醒**:
- 每个任务都必须完整执行这6个步骤,不能跳过任何步骤
- 在执行操作前,必须先获取当前原理图数据和相关规范
- 完成操作后,必须执行DRC验证并修正所有违规
- 如果任务复杂,可以分阶段执行,但每个阶段都要遵循这6个步骤
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
 * 提取消息内容（从parseAIResponse拆分）
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
 * 提取工具调用（从parseAIResponse拆分）
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
	let messageObj = null; // 消息对象

	if (response && response.output && Array.isArray(response.output)) {
		// Responses API格式:解析output数组
		const output = response.output; // 获取output数组

		// 查找消息类型的输出
		for (const item of output) {
			if (item.type === 'message' && item.role === 'assistant') {
				// 找到助手消息
				messageObj = item; // 保存消息对象
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
		message: messageObj, // 完整消息对象
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
 * @param loadingId - 加载指示器ID
 */
async function callAIAndHandleResponse(loadingId) {
	// 如果停止状态为true,直接返回
	if (isStop) {
		resumeStop();
		return; // 直接返回
	}

	// 确保系统消息在对话历史中
	const isAddTool = ensureSystemMessage(); // 确保系统消息存在

	// 调用 AI API（使用Responses API,传入previous_response_id进行多轮对话）
	const response = await window.ArkAPI.callArkChat(conversationHistory, previousResponseId,
		isAddTool ? window.mcpEDA.toolDescriptions : null); // 调用 ARK API

	// 解析 AI 回复
	const parsedResponse = parseAIResponse(response); // 解析响应

	// 更新上一轮响应ID（使用公共函数）
	updatePreviousResponseId(parsedResponse.responseId); // 更新响应ID

	// 获取消息对象
	const message = parsedResponse.message; // 获取消息对象

	// 如果有内容,添加到界面和历史
	if (parsedResponse.content) {
		// 移除加载指示器
		removeLoadingIndicator(loadingId); // 移除加载动画

		// 添加 AI 回复到界面
		addMessageToChat('assistant', parsedResponse.content); // 添加 AI 回复

		// 将 AI 回复添加到对话历史（用于本地记录）
		addAssistantMessageToHistory(parsedResponse.content); // 添加到对话历史
	}

	// 检查是否有工具调用
	if (parsedResponse.toolCalls && parsedResponse.toolCalls.length > 0) {
		// 如果有工具调用,生成代码块并等待用户确认
		// 生成代码块内容
		const codeContent = generateCodeFromToolCalls(parsedResponse.toolCalls); // 生成代码

		// 创建代码块展示（等待用户确认）
		createToolCallCodeBlock(codeContent, parsedResponse.toolCalls, message || {}, loadingId); // 创建代码块
	} else {
		// 如果没有工具调用,说明模型已经完成回复
		// 将助手消息添加到对话历史（用于本地记录,统一使用函数）
		if (parsedResponse.content) {
			addAssistantMessageToHistory(parsedResponse.content); // 使用统一函数添加到历史
		}

		// 移除加载指示器（如果还在显示）
		removeLoadingIndicator(loadingId); // 移除加载动画
	}

}


/**
 * 创建工具调用代码块（等待用户确认执行）
 * @param {string} codeContent - 代码内容
 * @param {Array} toolCalls - 工具调用数组
 * @param {Object} message - 消息对象
 * @param {string|null} loadingId - 加载指示器ID（可选,如果提供则在创建代码块后移除）
 */
function createToolCallCodeBlock(codeContent, toolCalls, message, loadingId = null) {
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
		await executeToolCallsAndContinue(toolCalls, codeContainer, confirmBtn, message); // 执行工具调用并继续对话
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

	// 如果提供了加载指示器ID,立即移除加载指示器
	if (loadingId) {
		removeLoadingIndicator(loadingId); // 移除加载动画
	}

	scrollToBottom(); // 滚动到消息底部

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
 * 处理工具执行结果
 * @param {Array} toolResults - 工具执行结果数组
 * @param {Object} codeContainer - 代码容器DOM元素
 * @param {Object} button - 执行按钮DOM元素
 * @param {Object} message - 消息对象
 * @returns {Array} 工具输入消息数组（用于Responses API）
 */
function handleToolExecutionResults(toolResults, codeContainer, button, message) {
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

	// 将助手消息添加到对话历史（用于本地记录）
	if (message) {
		conversationHistory.push(message); // 添加到历史
	}

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
	const loadingId = addLoadingIndicator(); // 添加加载指示器
	updateUIState(UI_STATE.EXECUTING); // 切换到代码执行中状态
	updateStatus('AI 正在处理结果...', 'info'); // 更新状态提示

	// 调用Responses API,传入工具执行结果和previous_response_id
	const response = await window.ArkAPI.callArkChat(
		toolInputMessages, // 工具执行结果（作为input传入）
		previousResponseId // 上一轮响应ID
	); // 调用 ARK API

	// 解析响应
	const parsedResponse = parseAIResponse(response); // 解析响应
	const responseMessage = parsedResponse.message; // 获取消息对象

	// 更新上一轮响应ID（使用公共函数）
	updatePreviousResponseId(parsedResponse.responseId); // 更新响应ID

	// 如果有内容,添加到界面
	if (parsedResponse.content) {
		addMessageToChat('assistant', parsedResponse.content); // 添加 AI 回复
		// 添加到本地历史（统一使用函数）
		addAssistantMessageToHistory(parsedResponse.content); // 使用统一函数添加到历史
	}

	// 检查是否还有工具调用
	if (parsedResponse.toolCalls && parsedResponse.toolCalls.length > 0) {
		// 如果有工具调用,生成代码块并等待用户确认
		const codeContent = generateCodeFromToolCalls(parsedResponse.toolCalls); // 生成代码
		createToolCallCodeBlock(codeContent, parsedResponse.toolCalls, responseMessage, loadingId); // 创建代码块
	} else {
		// 如果没有工具调用,完成
		removeLoadingIndicator(loadingId); // 移除加载动画
		if (!parsedResponse.content) {
			addMessageToChat('assistant', '操作已完成'); // 添加完成提示
		}
		// 恢复状态
		updateUIState(UI_STATE.IDLE); // 恢复为空闲状态
		updateStatus('', ''); // 清空状态提示
		messageInput.focus(); // 聚焦输入框
	}


}

/**
 * 执行工具调用并继续对话
 * @param {Array} toolCalls - 工具调用数组
 * @param {Object} codeContainer - 代码容器DOM元素
 * @param {Object} button - 执行按钮DOM元素
 * @param {Object} message - 消息对象
 */
async function executeToolCallsAndContinue(toolCalls, codeContainer, button, message) {
	// 禁用按钮并更新文本
	button.disabled = true; // 禁用按钮
	button.textContent = '执行中...'; // 更新按钮文本

	// 执行工具调用
	const toolResults = await executeToolCalls(toolCalls); // 执行工具调用

	// 处理工具执行结果
	const toolInputMessages = handleToolExecutionResults(toolResults, codeContainer, button, message); // 处理结果并获取工具输入消息

	// 继续对话
	await continueConversationAfterTools(toolInputMessages); // 继续对话
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
 * 确保系统消息在对话历史中
 * 如果没有系统消息则添加到对话历史开头
 */
function ensureSystemMessage() {
	// 检查对话历史中是否已有系统消息
	const hasSystemMessage = conversationHistory.some((msg) => msg.role === 'system'); // 检查是否有系统消息
	if (hasSystemMessage) {
		return false; // 如果已有系统消息,直接返回
	}

	conversationHistory[0].role = 'system';
	conversationHistory[0].content = window.top.systemMessage + conversationHistory[0].content;

	// 如果没有系统消息,说明是首次提问,需要定义ai能力,并设置tools
	// window.ArkAPI.callArkChat([{ 
	// 	role: 'system', // 系统角色
	// 	content: window.top.systemMessage, // 系统消息内容
	// 	type: 'message', // 消息类型
	// }], previousResponseId, window.mcpEDA.toolDescriptions);
	// // 添加到对话历史开头
	// conversationHistory.unshift({ 
	// 	role: 'system', // 系统角色
	// 	content: window.top.systemMessage, // 系统消息内容
	// 	type: 'message', // 消息类型
	// }); // 添加到历史开头
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

