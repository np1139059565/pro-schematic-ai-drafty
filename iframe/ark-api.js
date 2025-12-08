/**
 * 火山引擎 ARK API 模块
 * 封装与火山引擎 ARK API 交互的所有功能
 */

// ARK API 配置
let ARK_API_KEY = ''; // API Key
let ARK_MODEL = ''; // 模型名称
let ARK_API_URL = 'https://ark.cn-beijing.volces.com/api/v3/chat/completions'; // API 地址


/**
 * 调用火山引擎 ARK Chat API
 * @param trimmedHistory - 对话历史数组，格式: 数组元素包含 role 和 content 字段
 * @param apiKey - ARK API Key，如果不提供则使用默认配置
 * @returns API 响应数据
 */
async function callArkChat(trimmedHistory, apiKey = ARK_API_KEY) {
	try {
		// 检查ARK_API_KEY和ARK_MODEL是否为空
		if (!ARK_API_KEY || !ARK_MODEL) {
			throw new Error('ARK_API_KEY和ARK_MODEL不能为空');
		}
		// 发送 POST 请求到 ARK API
		const response = await fetch(ARK_API_URL, {
			method: 'POST', // 使用 POST 方法
			headers: {
				'Content-Type': 'application/json', // 设置内容类型为 JSON
				Authorization: `Bearer ${apiKey}`, // 设置授权头
			},
			body: JSON.stringify({
				// 请求体
				model: ARK_MODEL, // 模型名称
				messages: trimmedHistory, // 包含对话历史的消息数组
			}),
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
