// ========================================================================
// 错误分类与恢复引导模块
// ------------------------------------------------------------------------
// 设计目标(对标 Cursor / Claude Code 的错误处理):
//   1. 把散落在各处的"一刀切红字提示"升级为"分类型、可操作"的引导;
//   2. 为上层提供统一的错误识别能力(鉴权失败 / 限流 / 网络 / 超时 / 工具执行 / 解析);
//   3. 工具执行错误可作为 function_call_output 回喂模型让其自愈(而非直接终止对话);
//   4. 渲染层只负责展示 classifyError 返回的 {type, title, message, action} 结构,
//      不感知具体错误规则,符合职责分离原则。
// ========================================================================

/**
 * 错误类型枚举
 * 所有上层模块统一引用本枚举,避免魔法字符串散落各处
 */
const ErrorType = {
	AUTH: 'AUTH', // 鉴权失败(401 / Key 缺失 / 额度不足 等)
	RATE_LIMIT: 'RATE_LIMIT', // 限流(429)
	NETWORK: 'NETWORK', // 网络中断 / DNS / CORS / 超时
	TIMEOUT: 'TIMEOUT', // 请求超时(由 AbortSignal.timeout 触发)
	PARAM: 'PARAM', // 参数 / 配置缺失
	TOOL_EXEC: 'TOOL_EXEC', // 工具执行失败
	PARSE: 'PARSE', // 响应解析失败
	UNKNOWN: 'UNKNOWN', // 未归类
};

/**
 * 判断真实错误文本是否属于"额度/配额/套餐"类问题(而非 API Key 配置问题)。
 * 这类问题提示用户去领取/购买套餐,不应误导其去修改 API Key。
 * @param {string} text 真实错误文本(小写比较)
 * @returns {boolean}
 */
function isQuotaIssue(text) {
	const t = (text || '').toLowerCase();
	return (
		t.includes('额度') || t.includes('配额') || t.includes('余额') ||
		t.includes('套餐') || t.includes('quota') || t.includes('token') ||
		t.includes('余额不足') || t.includes('没有可用') || t.includes('insufficient')
	);
}

/**
 * 判断真实错误文本是否确指向"API Key / 模型名称 配置缺失或无效"。
 * @param {string} text 真实错误文本(小写比较)
 * @returns {boolean}
 */
function isKeyConfigIssue(text) {
	const t = (text || '').toLowerCase();
	return (
		t.includes('api key') || t.includes('apikey') || t.includes('key 不能为空') ||
		t.includes('key不能为空') || t.includes('key 无效') || t.includes('key无效') ||
		t.includes('model') || t.includes('模型') || t.includes('缺少 key') ||
		t.includes('缺少密钥') || t.includes('missing key')
	);
}

/**
 * 根据原始错误对象识别错误类型
 * @param {Error} error 原始错误(可能携带 status / isTimeout 等附加字段)
 * @returns {string} ErrorType 枚举值
 */
function identifyErrorType(error) {
	if (!error) return ErrorType.UNKNOWN;

	// 1. 显式携带的类型标记(由本模块或其它模块主动标注)
	if (error.errorType && ErrorType[error.errorType]) return error.errorType;

	// 2. HTTP 状态码(由 fetch 层在 error 上挂载 status 字段)
	if (typeof error.status === 'number') {
		if (error.status === 401 || error.status === 403) return ErrorType.AUTH;
		if (error.status === 429) return ErrorType.RATE_LIMIT;
		if (error.status >= 500) return ErrorType.NETWORK; // 服务端异常归为网络类可重试
		if (error.status === 400) return ErrorType.PARAM;
	}

	// 3. 超时标记(由 AbortSignal.timeout 触发,AbortError.name === 'TimeoutError')
	if (error.name === 'TimeoutError' || error.isTimeout) return ErrorType.TIMEOUT;
	if (error.name === 'AbortError') return ErrorType.TIMEOUT; // 手动取消也按超时提示用户

	// 4. 网络层错误(浏览器 fetch 在断网/CORS 时抛出 TypeError,无 status)
	const msg = (error.message || '').toLowerCase();
	if (error instanceof TypeError) return ErrorType.NETWORK;
	if (msg.includes('failed to fetch') || msg.includes('networkerror') || msg.includes('network error')) {
		return ErrorType.NETWORK;
	}
	if (msg.includes('timeout') || msg.includes('aborted')) return ErrorType.TIMEOUT;

	return ErrorType.UNKNOWN;
}

/**
 * 把原始错误归类为"展示模型"
 * 渲染层只消费本结构的字段,无需理解错误规则。
 * @param {Error} error 原始错误
 * @param {string} [defaultTitle] 缺省标题(用于工具执行等场景)
 * @returns {{type:string,title:string,message:string,action:string,raw:Error}}
 */
function classifyError(error, defaultTitle = '操作失败') {
	const type = identifyErrorType(error);
	const rawMessage = error && error.message ? error.message : '发生未知错误';

	// 各类型的用户可见标题、引导文案与可操作建议
	const guide = {
		[ErrorType.AUTH]: {
			title: '鉴权失败',
			// 直接采用后台/底层真实错误文本作为唯一原因,不再叠加假设性的
			// "API Key 无效或缺失"文案(否则会与真实原因如"额度不足"互相矛盾,
			// 导致用户误解)。真实原因由 rawMessage 透传,是唯一且明确的。
			message: rawMessage,
			// action 不写死:根据真实错误内容动态决定(见下方 finalizeAuthAction)
			action: '',
		},
		[ErrorType.RATE_LIMIT]: {
			title: '请求过于频繁',
			message: '服务返回 429 限流,短时间内请求次数过多。',
			action: '请稍候 10~30 秒再发送消息;若持续触发请降低请求频率或切换模型。',
		},
		[ErrorType.NETWORK]: {
			title: '网络异常',
			message: '无法连接到模型服务,可能是断网、跨域或服务器故障。',
			action: '请检查网络连接与私服地址配置后,重新输入消息发送。',
		},
		[ErrorType.TIMEOUT]: {
			title: '请求超时',
			message: '模型未在预期时间内响应,请求已被中断。',
			action: '可重新输入消息发送;长任务建议拆分需求或减少单次工具调用量。',
		},
		[ErrorType.PARAM]: {
			title: '参数错误',
			message: '请求参数不合法,服务拒绝执行。',
			action: '请检查输入内容或配置,必要时清空对话后重试。',
		},
		[ErrorType.TOOL_EXEC]: {
			title: '工具执行失败',
			message: rawMessage,
			action: '模型已收到该错误,通常会自动调整策略重试;若反复失败请检查工程状态。',
		},
		[ErrorType.PARSE]: {
			title: '响应解析失败',
			message: '模型返回内容不符合预期结构,无法解析。',
			action: '可重新输入消息发送;若持续失败请清空对话或更换模型。',
		},
		[ErrorType.UNKNOWN]: {
			title: defaultTitle,
			message: rawMessage,
			action: '请检查网络与配置后,重新输入消息发送。',
		},
	};

	const g = guide[type] || guide[ErrorType.UNKNOWN];
	// 透传真实错误原文,供上层在固定引导之外展示后台返回的具体原因(如额度不足)

	// AUTH 类的 action 必须依据真实错误内容动态决定,避免"额度不足"却提示去配 Key:
	// - 额度/套餐类 → 引导领取/购买套餐;
	// - 确为 Key/模型 配置问题 → 引导填写配置;
	// - 无法判定 → 给出中性且涵盖两种可能的提示,不臆测。
	let action = g.action;
	let isConfigIssue = false; // 是否为"配置(API Key/模型)"问题,供上层决定是否高亮配置按钮
	if (type === ErrorType.AUTH) {
		if (isQuotaIssue(rawMessage)) {
			action = '请先领取或购买可用额度的套餐后再试;额度恢复后即可正常调用模型。';
		} else if (isKeyConfigIssue(rawMessage)) {
			action = '请点击上方「配置」按钮填写正确的 API Key 与模型名称后重试。';
			isConfigIssue = true;
		} else {
			// 既不像额度也不像 Key 配置:中性提示,让用户看到真实原因后自行判断
			action = '请查看上方真实原因,按需领取额度或检查「配置」中的 API Key 与模型名称。';
		}
	}

	return {
		type,
		title: g.title,
		message: type === ErrorType.TOOL_EXEC ? rawMessage : g.message,
		action,
		isConfigIssue, // 仅 AUTH 且确为 Key/模型配置问题时为 true
		raw: error,
		rawMessage, // 后台/底层真实错误文本(如 "您当前没有可用额度的Token…")
	};
}

/**
 * 把错误归类为"工具执行结果"
 * 供 executeSingleToolCall 使用:工具执行失败时返回 {isError:true, ...},
 * 上层将其作为 function_call_output 回喂模型,让模型自愈(而非终止对话)。
 * @param {Error} error 工具抛出的错误
 * @returns {{isError:boolean,errorType:string,message:string}}
 */
function toToolError(error) {
	return {
		isError: true,
		errorType: identifyErrorType(error),
		message: error && error.message ? error.message : '工具执行失败',
	};
}

// 导出到全局,供 ai-chat.js 等模块调用
window.ErrorHandler = {
	ErrorType,
	identifyErrorType,
	classifyError,
	toToolError,
};
