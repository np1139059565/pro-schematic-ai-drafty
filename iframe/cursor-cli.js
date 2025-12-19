let API_URL='https://113.46.209.138/cserver/call-cursor-cli';
const TOOLS_PENDING_URL = 'https://113.46.209.138/cserver/mcp/tools/pending';
const TOOLS_RESULT_URL = 'https://113.46.209.138/cserver/mcp/tools/result';

// 工具调用轮询管理
let toolPollingInterval = null;

/**
 * 启动工具调用轮询
 * @param {string} sessionId - 会话ID
 */
function startToolPolling(sessionId) {
	// 如果已有轮询，先停止
	if (toolPollingInterval) {
		clearInterval(toolPollingInterval);
		toolPollingInterval = null;
	}
	
	// 每2000ms轮询一次
	toolPollingInterval = setInterval(async () => {
		try {
			const response = await fetch(`${TOOLS_PENDING_URL}?session_id=${encodeURIComponent(sessionId)}`);
			if (!response.ok) {
				return; // 忽略错误，继续轮询
			}
			
			const data = await response.json();
			
			if (data.has_pending && data.tool_request) {
				// 有待执行的工具调用
				const toolRequest = data.tool_request;
				console.log('检测到工具调用请求:', toolRequest);
				
				// 检查是否已经创建过这个工具调用的代码块（避免重复创建）
				const existingBlock = document.querySelector(`[data-request-id="${toolRequest.request_id}"]`);
				if (existingBlock) {
					console.log('工具调用代码块已存在，跳过创建');
					return;
				}
				
				// 从 tool_request 中提取工具信息
				const toolName = toolRequest.params.name;
				const toolArguments = toolRequest.params.arguments||{};
				
				// 将 MCP 工具调用转换为 ai-chat.js 需要的 toolCalls 格式
				const toolCall = {
					id: toolRequest.request_id, // 使用 request_id 作为工具调用ID
					function: {
						name: toolName,
						arguments: JSON.stringify(toolArguments)
					}
				};
				
				// 生成代码块内容(用于展示给用户)
				const codeContent = `const resp = await mcpEDA.callTool({ name: '${toolName}', arguments: ${JSON.stringify(toolArguments, null, 2)} });`;
				
				// 创建代码块展示（等待用户确认）
				// 使用 ai-chat.js 中的 createToolCallCodeBlock，传入自定义执行函数
				// 自定义执行函数会执行工具并发送结果到后端，但不继续对话
				const executeMCPToolCalls = async (toolInputMessages) => {
					const firstResult = toolInputMessages[0];
					await fetch(TOOLS_RESULT_URL, {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							session_id: sessionId,
							request_id: toolRequest.request_id,
							result: firstResult.isError ? null : firstResult.content,
							error: firstResult.isError ? firstResult.content : null
						})
					});
				};
				
                window.createToolCallCodeBlock(
                    codeContent,
                    [toolCall],
                    {}, // message 对象（MCP 场景不需要）
                    null, // loadingId
                    false, // addToHistory: MCP 场景不加入历史
                    executeMCPToolCalls // 自定义执行函数
                );
			}
		} catch (error) {
			// 忽略轮询错误，继续轮询
			console.warn('工具调用轮询错误:', error);
		}
	}, 2000);
}

/**
 * 停止工具调用轮询
 */
function stopToolPolling() {
	if (toolPollingInterval) {
		clearInterval(toolPollingInterval);
		toolPollingInterval = null;
	}
}

/**
 * 自定义AI接口（兼容 ark-api.js 的 callArkChat 接口格式）
 * @param {Array} mhistory - 消息历史数组
 * @param {string} previousResponseId - 上一轮响应的ID（用于多轮对话，cursor CLI 使用 session_id）
 * @param {Array} tools - 工具数组（cursor CLI 不支持此参数，但保留以兼容接口）
 * @returns {Promise<Object>} 返回兼容 ARK API 格式的响应
 */
async function callCursorCLI(mhistory, sessionId = null, tools = []) {
    //如果sessionId为空，则生成一个唯一的sessionId
    if(sessionId==null){
        sessionId=crypto.randomUUID().replace(/-/g, '');
    }

	// 在发送请求前启动轮询（工具调用只可能在请求过程中触发）
    startToolPolling(sessionId);
	
    const p=mhistory[mhistory.length - 1];//最后一条消息
	try {
		// 发送 POST 请求到 Cursor CLI API（工具调用可能在请求过程中触发）
		const response = await fetch(API_URL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				sessionid: sessionId,
				prompt:  `${p.role}: ${p.content}`.trim()
			}),
		});

		// 检查响应状态
		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`HTTP 错误! 状态码: ${response.status}\n${errorText}`);
		}

		// 解析响应数据
		const result = await response.json();
		
		// 转换为兼容 ARK API 格式的响应
		// 只返回 parseAIResponse 函数实际使用的字段：output 和 id
		const arkFormatResponse = {
			output: result.output || [],
			id: result.session_id || '--'
		};
		
		console.log('AI 请求成功:', arkFormatResponse);
		return arkFormatResponse;
	} catch (error) {
		console.error('AI 请求失败:', error);
		throw error;
	} finally {
		// 请求完成后立即停止轮询（无论成功还是失败）
		stopToolPolling();
	}
}


window.CursorCLI = {
	callCursorCLI,
	API_URL,
	startToolPolling,
	stopToolPolling
};