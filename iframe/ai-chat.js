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

// 对话历史数组,用于维护上下文
let conversationHistory = []; // 存储所有对话消息,格式: [{role: 'user', content: '...'}, {role: 'assistant', content: '...'}]

// 对话历史配置
const MAX_HISTORY_MESSAGES = 30; // 最大保留的历史消息数量（用户消息和AI回复各算一条）,超过此数量将自动精简,只保留最近的对话

let isStop = false; // 是否停止

// 系统消息 - 用于描述 AI 角色和职责,用户可以在控制台临时修改系统消息,对ai助手进行定制化
window.top.systemMessage = `
你是原理图设计AI助手,专门帮助用户进行电子电路原理图设计,运行在嘉立创在线web开发平台的iframe扩展应用中.

MCP工具集:
- 通过 mcpEDA.listTools()/listResources()/readResource()/callTool(...) 获取或调用工具,工具列表包含搜索工具/画布尺寸等能力


工作流程:
1. 分析用户需求:
   - 判断用户意图:是询问原理图信息(回答问题)还是需要修改原理图(执行操作)
   - 询问类:用户想了解当前原理图状态、元件信息、设计建议等
   - 操作类:用户要求创建/修改/删除元件、导线、调整布局等

2. 回答问题流程:
   - 编写read代码块,获取鼠标所选的元件列表,然后再根据元件获取信息(如元件名称、引脚、属性等)
   - 系统自动执行read代码块,将结果以system角色消息反馈给你(JSON格式,包含data/errorMessage/stack)
   - 根据反馈结果,结合原理图信息给出专业回答

3. 修改原理图流程(循环执行):
   - 第一步:编写read代码块获取当前原理图状态(画布大小/元件列表/导线等),系统执行read代码并反馈结果
   - 第二步:你根据结果计算修改方案,编写write代码块,执行修改操作(创建/修改/删除元件等)
   - 第三步:系统执行write代码并反馈结果,你检查是否完成所有修改
   - 循环条件:如果还有未完成的修改,继续返回代码块;如果所有修改已完成且无错误,则不再返回代码块,对话结束
   - 重要规则:
     * 元件放置大小计算:放置元件时必须考虑元件大小,避免重叠
       - 优先方案:通过元件的引脚列表获取引脚位置,计算元件的大致边界范围(最小X/Y到最大X/Y)
       - 备用方案:如果无法获取引脚信息,必须至少设置200mil的安全距离,确保元件之间不会重叠
       - 放置新元件时,需要检查与现有元件的位置关系,确保有足够的间距
     * 写入前状态同步:每次执行write代码块之前,必须先执行read代码块获取当前原理图的最新状态,因为原理图随时可能变化,不能使用过时的状态信息

4. 错误处理策略:
   - 执行错误时:系统会在system消息中返回errorMessage和stack信息
   - 分析错误:检查错误原因(API调用错误、参数错误、逻辑错误等)
   - write代码块错误处理(关键):
     * 如果write代码块执行失败,必须先执行read代码块获取当前原理图状态
     * 识别并清除已成功放置的元件(因为可能只是部分失败,另一部分成功后元件就已经放下去了)
     * 清除已成功的数据后,再重新计算修改方案并重试
     * 这是为了避免重复放置元件或产生脏数据
   - 自动修复:尝试查询正确的API、修正参数、调整逻辑等
   - 重试机制:如果修复后仍有错误,最多重试2次(指AI主动修复并重新执行代码,不是系统自动重试)
   - 失败处理:重试2次后仍失败,向用户说明错误原因并暂停,等待用户进一步指示

代码执行格式:
**代码块类型**:
- 只读操作:\`\`\`javascript:read（获取信息,如画布大小、元件列表）
- 写入操作:\`\`\`javascript:write（修改原理图,如创建元件、修改导线）

**返回值格式**（必须）:
\`\`\`javascript
{
  data: any,           // 执行结果（成功时）
  errorMessage: string | null,  // 错误信息（失败时）
  stack: string | null          // 错误堆栈（失败时）
}
\`\`\`

**示例**（只读）:
\`\`\`javascript:read
const resp = { data: null, errorMessage: null, stack: null };
resp.data = await mcpEDA.callTool({ name: 'getCanvasSize', arguments: {} });
return resp;
\`\`\`

**示例**（写入）:
\`\`\`javascript:write
const resp = { data: null, errorMessage: null, stack: null };
const component = await eda.sch_PrimitiveComponent.create(/* 参数 */);
resp.data = { success: true, component };
return resp;
\`\`\`

**注意**:必须返回包含 data/errorMessage/stack 的对象,异步操作使用 await.

对话角色:
本对话系统包含三种角色,你需要清楚理解每种角色的作用:
1. system(扩展自动执行):定义你的角色、职责和工作流程,还会自动执行你返回的代码块,并将执行结果以system角色消息反馈给你(格式为JSON字符串,包含data/errorMessage/stack),直到没有返回代码为止(对话结束)
2. user(用户消息):用户的问题和需求,以自然语言形式发送给你
3. assistant(助手回复):你的回复内容,包括简洁的文本说明和代码块（使用\`\`\`javascript:read或\`\`\`javascript:write格式）

回复要求:
- 使用中文,专业准确,结合实际原理图信息,提供可操作建议
- 回复简洁明了,避免重复相同内容和冗余说明
- 代码执行是自动的,无需在回复中重复说明"系统会执行代码"等
- 直接给出结果和结论,无需重复过程描述

请以原理图设计专家身份,确保回答专业、准确、实用、简洁.
`
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
	updateStatus('', ''); // 清空状态文本
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
		// 移除加载指示器
		removeLoadingIndicator(loadingId); // 移除加载动画
		// 隐藏停止按钮
		stopBtn.style.display = 'none'; // 隐藏停止按钮
		return; // 直接返回
	}

	// 确保系统消息在对话历史中（如果不存在则添加）
	ensureSystemMessage(); // 确保系统消息存在

	// 精简对话历史,只保留最近的消息（系统消息始终保留）
	const trimmedHistory = trimHistoryForAPI(conversationHistory); // 精简历史用于 API 调用

	// 调用 AI API,传入对话历史以保持上下文
	const response = await window.ArkAPI.callArkChat(trimmedHistory); // 调用 ARK API,传入对话历史

	// 移除加载指示器
	removeLoadingIndicator(loadingId); // 移除加载动画

	// 解析 AI 回复
	const aiResponse = parseAIResponse(response); // 解析响应

	// 添加 AI 回复到界面
	addMessageToChat('assistant', aiResponse); // 添加 AI 回复

	// 将 AI 回复添加到对话历史
	addAssistantMessageToHistory(aiResponse); // 添加到对话历史

	return aiResponse; // 返回AI回复内容
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
	scrollToBottom(); // 滚动到消息底部
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
	scrollToBottom(); // 滚动到消息底部
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
	}, 100); // 延迟 100 毫秒
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
		const confirmed = confirm('确定要执行此代码吗？此操作可能会修改原理图.'); // 显示确认对话框
		if (!confirmed) {
			// 如果用户取消
			return; // 直接返回
		}

		await executeCodeAndContinue(fragment.content, codeContainer, confirmBtn); // 执行代码并继续对话
	}; // 设置点击事件

	actionContainer.appendChild(confirmBtn); // 将确认按钮添加到操作容器
}


/**
 * 处理发送消息
 */
async function handleSendMessage() {
	const message = messageInput.value.trim(); // 获取输入内容并去除首尾空格

	// 检查消息是否为空
	if (!message) {
		return; // 如果消息为空,直接返回
	}

	// 重置停止状态
	isStop = false; // 重置停止状态为 false

	// 显示停止按钮
	stopBtn.style.display = 'block'; // 显示停止按钮

	// 禁用输入和发送按钮
	setInputDisabled(true); // 禁用输入框
	updateStatus('正在发送...', 'info'); // 更新状态为"正在发送"

	// 处理用户消息的UI操作
	prepareUserMessageUI(message); // 处理用户消息UI

	// 将用户消息添加到对话历史
	addUserMessageToHistory(message); // 添加到对话历史

	// 添加加载指示器
	const loadingId = addLoadingIndicator(); // 添加加载动画

	try {
		// 调用AI并处理响应
		await callAIAndHandleResponse(loadingId); // 调用AI并处理响应

		updateStatus('', ''); // 清空状态文本

		// 滚动到底部
		scrollToBottom(); // 滚动到消息底部
	} catch (error) {
		// 处理错误
		handleAIError(error, loadingId, 'AI 请求失败'); // 统一错误处理
	} finally {
		// 隐藏停止按钮
		stopBtn.style.display = 'none'; // 隐藏停止按钮

		// 恢复输入和发送按钮
		setInputDisabled(false); // 恢复输入框
		messageInput.focus(); // 聚焦到输入框
	}
}


/**
 * 处理停止按钮点击事件
 */
function handleStop() {
	isStop = true; // 设置为停止状态
	// 恢复输入和发送按钮
	setInputDisabled(false); // 恢复输入框
	messageInput.focus(); // 聚焦到输入框

	// 更新状态
	updateStatus('已停止生成', 'info'); // 更新状态为已停止
	setTimeout(() => {
		// 延迟清空状态
		updateStatus('', ''); // 清空状态文本
	}, 2000); // 2 秒后清空
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

	// 滚动到底部
	scrollToBottom(); // 滚动到消息底部
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
	scrollToBottom(); // 滚动到消息底部

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
 * 如果对话历史中没有系统消息,则在开头添加
 */
function ensureSystemMessage() {
	// 检查对话历史中是否已有系统消息
	const hasSystemMessage = conversationHistory.some((msg) => msg.role === 'system'); // 检查是否有系统消息

	// 如果没有系统消息,则在开头添加
	if (!hasSystemMessage) {
		conversationHistory.unshift({
			role: 'system', // 系统消息角色
			content: window.top.systemMessage
		}); // 在数组开头添加系统消息
		console.log('已添加系统消息到对话历史'); // 输出日志
	}
}

/**
 * 检查AI回复中是否包含代码块
 * @param aiResponse - AI回复内容
 * @returns 是否包含代码块
 */
function checkHasCodeBlock(aiResponse) {
	// 检查 AI 回复中是否包含代码块
	const hasCodeBlock = /```(javascript|js):?(read|write)?\n/.test(aiResponse); // 检查是否有代码块
	return hasCodeBlock; // 返回检查结果
}

/**
 * 继续对话,将代码执行结果发送给 AI
 * 根据系统消息要求,执行代码后需要将结果发送给 AI,让 AI 继续处理,直到没有返回代码为止
 * @param result - 代码执行结果,格式为包含 data、errorMessage、stack 属性的对象
 */
async function continueConversationWithResult(result) {
	try {
		// 每次都重新获取一次原理图的基础信息
		// ...

		// 将结果消息添加到对话历史
		conversationHistory.push({
			role: 'system', // 系统角色（作为执行结果的反馈）
			content: JSON.stringify(result), // 结果消息内容
		}); // 添加到对话历史

		// 显示停止按钮
		stopBtn.style.display = 'block'; // 显示停止按钮

		// 禁用输入和发送按钮
		setInputDisabled(true); // 禁用输入框
		updateStatus('AI 正在处理结果...', 'info'); // 更新状态

		// 添加加载指示器
		const loadingId = addLoadingIndicator(); // 添加加载动画

		try {
			// 调用AI并处理响应
			const aiResponse = await callAIAndHandleResponse(loadingId); // 调用AI并处理响应

			// 检查 AI 回复中是否包含代码块
			const hasCodeBlock = checkHasCodeBlock(aiResponse); // 检查是否有代码块

			if (hasCodeBlock) {
				// 如果包含代码块,等待代码执行完成后再继续（代码执行会自动触发继续对话）
				// 这里不需要额外操作,因为代码执行按钮的 onclick 事件会自动调用 continueConversationWithResult
				console.log('AI 返回了新的代码,等待执行...'); // 输出日志
			} else {
				// 如果没有代码块,说明对话结束
				console.log('对话完成,没有更多代码需要执行'); // 输出日志
			}

			updateStatus('', ''); // 清空状态文本

			// 滚动到底部
			scrollToBottom(); // 滚动到消息底部
		} catch (error) {
			// 处理错误
			handleAIError(error, loadingId, '继续对话失败'); // 统一错误处理
		} finally {
			// 隐藏停止按钮
			stopBtn.style.display = 'none'; // 隐藏停止按钮

			// 恢复输入和发送按钮
			setInputDisabled(false); // 恢复输入框
			messageInput.focus(); // 聚焦到输入框
		}
	} catch (error) {
		// 如果继续对话失败,记录错误但不影响界面
		console.error('继续对话失败:', error); // 输出错误日志
		updateStatus('', ''); // 清空状态文本
		stopBtn.style.display = 'none'; // 隐藏停止按钮
		setInputDisabled(false); // 恢复输入框
	}
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
 * 设置输入框禁用状态
 * @param disabled - 是否禁用
 */
function setInputDisabled(disabled) {
	messageInput.disabled = disabled; // 设置输入框禁用状态
	sendBtn.disabled = disabled; // 设置发送按钮禁用状态
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

