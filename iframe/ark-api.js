/**
 * 火山引擎 ARK API 模块
 * 封装与火山引擎 ARK API 交互的所有功能
 */

// ARK API 配置
let ARK_API_KEY = ''; // API Key
let ARK_MODEL = ''; // 模型名称
let ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3'; // API 基础地址


/**
 * 调用Responses API进行对话
 * @param {Array} mhistory - 消息历史数组
 * @param {string} previousResponseId - 上一轮响应的ID（用于多轮对话）
 * @param {Array} tools - 工具数组
 * 
 * @returns {Promise<Object>} API响应数据
 */
async function callArkChat(mhistory, previousResponseId = null, tools = []) {
	try {
		// 检查ARK_API_KEY和ARK_MODEL是否为空
		if (!ARK_API_KEY || !ARK_MODEL) {
			throw new Error('ARK_API_KEY和ARK_MODEL不能为空');
		}

		// 在火山方舟的 Responses API 中，caching 和 store 是上下文管理的核心参数，两者协同工作但职责不同，具体区别如下：
		// 1. 核心定义与作用
		// 参数	定义	作用
		// store	控制是否将本轮请求的输入/输出存储到历史上下文中，供后续请求复用。	简化上下文管理：无需手动拼接历史对话，只需通过 previous_response_id 引用即可自动带入历史信息。
		// caching	控制是否将已存储的历史信息（含 store 保存的内容）缓存为预处理的 Token，供模型快速复用。	降低成本：缓存的 Token 会以折扣价计费（如 doubao-seed-1-6 模型缓存输入费用下降约 80%），且减少重复计算耗时。
		// 2. 依赖关系
		// caching 依赖 store 开启：
		// 只有当 store: true（默认）时，本轮请求的信息才会被存储，caching 才能将这些信息缓存为 Token。
		// 若 store: false，caching 无法生效（无内容可缓存）。
		// 3. 典型场景与配置
		// 场景1：仅需复用历史上下文（不追求成本优化）
		// 配置 store: true + caching: {"type": "disabled"}
		// 历史对话会被存储，但不会缓存为 Token，每次请求需重新计算所有输入，成本较高。
		// 场景2：追求成本优化（多轮对话/重复 Prompt）
		// 配置 store: true + caching: {"type": "enabled"}
		// 历史对话会被存储并缓存为 Token，后续请求仅需支付新输入的费用，缓存部分享受折扣。
		// 场景3：静态 Prompt 复用（如固定角色设定）
		// 配置 store: true + caching: {"type": "enabled", "prefix": true}
		// 首次请求存储并缓存固定 Prompt（如“你是专业翻译助手”），后续请求仅需传入新问题，无需重复发送固定内容，成本极低。
		// 4. 关键注意事项
		// store 默认开启：若未显式设置 store: false，历史信息会自动存储。
		// caching 需显式开启：需通过 caching: {"type": "enabled"} 主动启用缓存功能。
		// 缓存有效期：可通过 expire_at 自定义（最长 72 小时），过期后需重新创建缓存。
		// 计费差异：
		// store 本身不直接计费，但存储的内容会占用 Token 额度。
		// caching 会产生缓存存储费（按小时最大 Token 量计费）和缓存输入折扣费。

		// temperature和top_p是控制模型输出随机性的核心参数，二者的作用机制和适用场景有所不同：
		// temperature（温度系数）
		// 作用：通过调整概率分布的平滑程度来控制随机性。值越大，概率分布越平缓，模型更倾向于选择低概率的token，输出更具多样性；值越小，概率分布越陡峭，模型更倾向于选择高概率的token，输出更稳定、更集中。
		// 范围：通常为0到2（火山方舟平台大部分模型支持此范围，部分模型如DeepSeek R1建议设置在0.5-0.7）。
		// 示例：
		// temperature=0.7：适合需要一定创造性的场景（如文案生成）。
		// temperature=0.3：适合需要精准回答的场景（如事实性问答）。
		// top_p（核采样）
		// 作用：通过累积概率截断来控制候选token的范围。模型会从概率最高的token开始累积，直到概率和达到top_p值，仅从这些token中采样。值越大，候选范围越广，输出越多样；值越小，候选范围越窄，输出越集中。
		// 范围：通常为0到1。
		// 示例：
		// top_p=0.9：允许模型从概率和为90%的候选token中选择，兼顾多样性和稳定性。
		// top_p=0.5：仅从概率最高的50%token中选择，输出更保守。
		// 区别与选择建议
		// 维度	temperature	top_p
		// 控制方式	调整概率分布的平滑度	截断概率累积范围
		// 随机性影响	全局调整所有token的概率权重	局部截断高概率token的候选范围
		// 适用场景	需要精细控制随机性（如创意生成、诗歌创作）	需要稳定输出同时保留一定多样性（如对话、摘要）
		// 实践建议：
		// 通常不建议同时调整两个参数，优先使用temperature或top_p中的一个。
		// 若追求更稳定的输出，可降低temperature或top_p；若追求更多样性，可提高其中一个参数。
		// 如需进一步优化模型输出，可结合火山方舟的Prompt Pilot工具（https://promptpilot.volcengine.com/home）进行调试。
		
		// 构建请求体
		const requestBody = {
			model: ARK_MODEL, // 模型名称
			input: [mhistory[mhistory.length - 1]], // 最后一条消息
			store: true, // 存储响应以便后续检索
			caching: { "type": "enabled" },// 启用缓存(设置了缓存不需要一直传入tools)
			temperature: 0.2, // 采样温度，降低随机性，使输出更确定
			top_p: 0.9, // 核采样概率，降低随机性，使输出更确定(通常建议仅调整 temperature 或 top_p 其中之一，不建议两者都修改)

		};

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
				Authorization: `Bearer ${ARK_API_KEY}`, // 设置授权头
			},
			body: JSON.stringify(requestBody), // 请求体
		});

		// 检查响应状态
		if (!response.ok) {
			// 如果响应不成功
			const errorText = await response.text(); // 获取错误文本
			throw new Error(`HTTP 错误! 状态码: ${response.status}\n${errorText}`); // 抛出错误
		}

		// 解析响应数据
		const result = await response.json(); // 解析 JSON 响应
		console.log('AI 请求成功:', result); // 输出成功日志
		return result; // 返回结果
	} catch (error) {
		// 捕获网络错误或其他错误
		console.error('AI 请求失败:', error); // 输出错误日志
		throw error; // 向上抛出错误
	}
}

/**
 * 更新 ARK API 配置
 * @param apiKey - ARK API Key
 * @param model - ARK Model 名称
 */
function updateConfig(apiKey, model) {
	// 更新配置变量
	ARK_API_KEY = apiKey || ''; // 更新 API Key
	ARK_MODEL = model || ''; // 更新 Model

	// 更新全局对象中的配置
	if (window.ArkAPI) {
		// 如果全局对象存在
		window.ArkAPI.ARK_API_KEY = ARK_API_KEY; // 更新全局对象中的 API Key
		window.ArkAPI.ARK_MODEL = ARK_MODEL; // 更新全局对象中的 Model
	}
}

/**
 * 从 localStorage 加载配置
 * 页面加载时自动调用,如果存在保存的配置则自动应用
 */
function loadConfigFromStorage() {
	try {
		// 从 localStorage 读取配置
		const savedApiKey = localStorage.getItem('ark_api_key'); // 读取 ARK API Key
		const savedModel = localStorage.getItem('ark_model'); // 读取 ARK Model

		// 如果存在配置,则更新
		if (savedApiKey || savedModel) {
			// 如果存在保存的配置
			updateConfig(savedApiKey || '', savedModel || ''); // 更新配置
		}
	} catch (error) {
		// 捕获配置加载错误
		console.error('从 localStorage 加载配置失败:', error); // 输出错误日志
	}
}

// 导出函数供其他模块使用
// 浏览器环境，挂载到全局对象
window.ArkAPI = {
	callArkChat,
	updateConfig,
	ARK_API_KEY,
	ARK_MODEL,
	ARK_API_URL,
};

// 页面加载时自动从 localStorage 加载配置
loadConfigFromStorage(); // 加载配置
