/**
 * MCP 协议核心运行时对象(要素③ functions:MCP 函数池的「协议壳」)
 * 本文件承载 MCP 通用协议层与元工具(协议壳),与精选工具(mcp/curated-tools/index.js)、提示词(mcp/prompts.js)、资源(mcp/resources.js)职责分离:
 *   - MCP 通用方法(callTool / listTools / validateArguments / buildTextResponse / searchTools):协议统一入口;
 *   - MCP 资源/提示方法(listResources / readResource / listPrompts / getPrompt / searchResources):协议层对 resources/prompt 要素的访问入口;
 *   - 末尾「超级对象挂载区」统一把 window.mcpProtocol 挂到全局,供 data-store.js / ai-chat.js 消费。
 * 与 mcp/curated-tools/index.js 并列于 mcp/ 目录,精选工具实现(纯 functions 函数体)见 curated-tools/index.js。
 *
 * 依赖(均为 window 全局对象,运行时读取,无加载期硬依赖):
 *   window.eda          原生 EDA 宿主 API,callTool 内兜底调用;
 *   window.edaApi       原生 EDA API 清单(eda-api.js 挂载),callTool 内查找工具签名;
 *   window.curatedTools 精选工具(mcp/curated-tools/index.js 挂载),callTool/listTools 运行时引用;
 *   window.promptList   出厂提示词(mcp/prompts.js 挂载),listPrompts/getPrompt 运行时引用;
 *   window.resourceList 出厂资源(mcp/resources.js 挂载),listResources/readResource 运行时引用。
 */

// [区块1] 通用方法:参数验证校验、统一文本响应、工具调用入口(callTool)

/**
 * 校验工具调用参数是否符合 inputSchema 规范。
 * 校验规则:必填字段是否齐全、各字段类型是否匹配(数组/字符串/数字/对象)。
 * @param {Object} args  模型传入的工具参数对象
 * @param {Object} schema 工具定义的 inputSchema(含 type/required/properties)
 * @returns {string|null} 校验失败返回中文错误描述,校验通过返回 null
 */
function validateArguments(args, schema) {
	if (!schema || schema.type !== 'object') {
		return null;
	}
	if (schema.required && Array.isArray(schema.required)) {
		for (const requiredField of schema.required) {
			if (!(requiredField in args)) {
				return `缺少必需参数: ${requiredField}`;
			}
		}
	}
	if (schema.properties) {
		for (const [key, value] of Object.entries(args)) {
			const propSchema = schema.properties[key];
			if (propSchema) {
				if (propSchema.type === 'array' && !Array.isArray(value)) {
					return `参数 ${key} 必须是数组类型`;
				}
				if (propSchema.type === 'string' && typeof value !== 'string') {
					return `参数 ${key} 必须是字符串类型`;
				}
				if (propSchema.type === 'number' && typeof value !== 'number') {
					return `参数 ${key} 必须是数字类型`;
				}
				if (propSchema.type === 'object' && (typeof value !== 'object' || Array.isArray(value))) {
					return `参数 ${key} 必须是对象类型`;
				}
			}
		}
	}
	return null;
}

/**
 * 构造统一的文本响应结构。
 * 所有元工具/精选工具均通过此函数返回结果,content 内 text 为字符串,
 * isError 标记是否为错误响应(影响上层对工具结果的判读)。
 * @param {string} text     响应文本内容
 * @param {boolean} isError 是否为错误响应,默认 false
 * @returns {{content: Array, isError: boolean}} 统一响应结构
 */
function buildTextResponse(text, isError) {
	return {
		content: [{ type: "text", text }],
		isError,
	};
}

/**
 * 统一工具调用入口。
 * 调度顺序:① 从 listTools 工具池与 edaApi 原生清单中按 name 查找签名;
 *           ② 校验存在性/禁用状态/参数合法性;③ 优先调用自定义工具(类名$方法名整体传参),
 *              否则回退原生 EDA API(类名.方法名展位传参);④ 结果经 buildTextResponse 标准化。
 * @param {Object} params 含 name(工具名,格式 className.methodName) 与 arguments(参数对象)
 * @returns {Promise<{content: Array, isError: boolean}>} 统一文本响应
 */
const CALL_TOOL_SCHEMA = {
	name: 'callTool',
	description: '统一工具入口:调用任意下层工具(精选工具/EDA 原生 API)时,将下层工具名填入 name 参数(如 name:"lib_Device$search"),其参数填入 arguments;切勿将 name 填为 "callTool" 自身',
	inputSchema: {
		type: 'object',
		properties: {
			name: { type: 'string', description: '下层目标工具名(如 lib_Device$search / getCanvasSize),非 callTool 本身' },
			arguments: { type: 'object', description: '工具参数对象' },
		},
		required: ['name', 'arguments'],
	},
	semantic_tags: ['调用', '执行', '工具'],
	source: 'meta',
	domain: null,
};
async function callTool(params) {
	try {
		// dispatcher 设计说明(避免误判为"自调用 bug"):
		// callTool 是协议壳调度器,所有工具调用均经它中转。前端 executeSingleToolCall /
		// generateCodeFromToolCalls 必然以 params.name="callTool" 传入(因为模型只能
		// function_call(name:"callTool"),真实目标工具名被放在 arguments.name 里,见日志
		// docs/08232315.log)。因此当 name==='callTool' 且 arguments.name 存在时,
		// 必须从 arguments.name 提取真实目标工具名再调度,而非用 'callTool' 去找实现。
		const { name, arguments: args } = params;
		// 解析真实目标工具名:处理前端 dispatcher 中转场景(前端恒传 name="callTool")。
		const targetName = (name === 'callTool' && args && typeof args.name === 'string') ? args.name : name;
		const [className, methodName] = targetName.split('.');
		const toolSchema = window.mcpProtocol.listTools().tools.find(tool => tool.name === targetName) ||
		window.edaApi.find(tool => tool.name === targetName);
		if (!toolSchema) {
			return buildTextResponse(`工具不存在: ${targetName}`, true);
		}
		if (toolSchema.enabled === false) {
			return buildTextResponse(`工具已禁用: ${targetName}`, true);
		}
		const validateResult = validateArguments(args || {}, toolSchema?.inputSchema);
		if (validateResult !== null) {
			return buildTextResponse(`工具参数验证失败: ${validateResult}`, false);
		}
		const curatedKey = targetName.replace('.', '$');
		// 仅排除 callTool 壳自身:防止 window.mcpProtocol[name] 把协议壳自身当实现引发自递归;
		// 其余元工具(listTools/listPrompts/getPrompt 等)与精选工具、EDA 原生 API 同路径调度,
		// 若一并排除则它们经 callTool 调用时必报「工具不存在」。注意此处仍用 targetName 判断,
		// 分发后真实目标不应再被当作壳自身排除(见 docs/08232315.log 修复)。
		const PROTOCOL_SHELL_NAMES = new Set(['callTool']);
		const curatedImpl = (PROTOCOL_SHELL_NAMES.has(targetName) ? undefined : window.mcpProtocol[targetName])
			|| window.curatedTools[curatedKey];
		let result;
		if (typeof curatedImpl === 'function') {
			result = await curatedImpl(args || {});
		} else {
			const nativeTool = eda[className]?.[methodName];
			if (typeof nativeTool !== 'function') {
				return buildTextResponse(`工具不存在: ${targetName}`, true);
			}
			result = await nativeTool(...Object.values(args || {}));
		}
		if (result !== null && ['string', 'number', 'boolean', 'object'].includes(typeof result)) {
			return buildTextResponse(typeof result === 'string' ? result : JSON.stringify(result, null, 2), false);
		} else {
			return buildTextResponse(`工具执行失败 [${targetName}]: ${result}`, true);
		}
	} catch (error) {
		return buildTextResponse(`工具执行失败 [${params?.name}]: ${error.message}`, true);
	}
}

/**
 * 按场景列举函数的名称与一句话摘要(剥除 inputSchema)。
 * 合并元工具池(window.mcpProtocol)与精选工具池(window.curatedTools),剔除禁用项,
 * 保留 domain 字段以支持 scenario 过滤;完整参数经 getTool 单条下钻获取。
 * @param {{scenario?: string, limit?: number}} [params] scenario 按域过滤,limit 返回条数上限(1~100)
 * @returns {{tools: Array, total: number, has_more: boolean, hint?: string}} 工具摘要列表
 */
const LIST_TOOLS_SCHEMA = {
	name: 'listTools',
	description: '按场景列举函数的名称与一句话摘要(剥除 inputSchema);完整参数经 getTool 单条获取',
	inputSchema: {
		type: 'object',
		properties: {
			scenario: { type: 'string', description: '可选,按域(domain)过滤函数子集' },
			limit: { type: 'number', description: '可选,返回条数上限(默认50,硬上限100)' },
		},
		required: []
	},
	semantic_tags: ['列举', '工具', '过滤'],
	source: 'meta',
	domain: null,
};
function listTools({ scenario, limit = 50 } = {}) {
	const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
	// 合并两池工具并剔除禁用项;注意必须保留 domain 字段,
	// 否则下方按 scenario 过滤时 tool.domain 恒为 undefined,导致永远匹配不到任何领域工具。
	const allTools = window.mcpProtocol.metaToolSchemas
		.concat(window.curatedTools.curatedToolSchemas)
		.filter(tool => tool.enabled !== false)
		.map(({ name, description, domain }) => ({ name, description, domain }));
	if (scenario) {
		const filtered = allTools.filter(tool => tool.domain === scenario);
		if (filtered.length === 0) {
			return {
				tools: [],
				total: 0,
				has_more: false,
				hint: `无匹配 scenario: ${scenario};可用 scenario 取自查精工具的 domain 字段(如 component_design/wiring/validation 等)`,
			};
		}
		return { tools: filtered.slice(0, safeLimit), total: filtered.length, has_more: filtered.length > safeLimit };
	}
	return { tools: allTools.slice(0, safeLimit), total: allTools.length, has_more: allTools.length > safeLimit };
}

/**
 * 列出资源索引(不含正文)。
 * 无关键词时仅返回根索引资源(无根索引则取首条);有关键词时按 name/description 模糊过滤。
 * 资源正文需经 readResource(uri) 按需下钻获取。
 * @param {{keywords?: string}} [params] 可选,按名称/描述模糊过滤
 * @returns {{resources: Array}} 资源元数据列表
 */
const LIST_RESOURCES_SCHEMA = {
	name: 'listResources',
	description: '列出资源索引:无参仅返回根索引单条,有参按关键词过滤,均不含正文',
	inputSchema: {
		type: 'object',
		properties: {
			keywords: { type: 'string', description: '可选,按名称/描述模糊过滤资源(不返回正文)' },
		},
		required: []
	},
	semantic_tags: ['列举', '资源'],
	source: 'meta',
	domain: null,
};
function listResources({ keywords } = {}) {
	const metas = (window.resourceList || [])
		.filter(r => r && r.enabled !== false)
		.map(({ uri, name, description, mime_type, mimeType }) => ({
			uri,
			name,
			description,
			mimeType: mime_type || mimeType,
		}));
	if (!keywords) {
		const root = metas.filter(r => r.uri === 'resource_jlc_sch_overview');
		return { resources: root.length > 0 ? root : metas.slice(0, 1) };
	}
	const kw = String(keywords).toLowerCase();
	const filtered = metas.filter(r =>
		(r.name && r.name.toLowerCase().includes(kw)) ||
		(r.description && r.description.toLowerCase().includes(kw))
	);
	return { resources: filtered.slice(0, 50) };
}

/**
 * 按 uri 精确读取资源正文。
 * 先经 listResources 取得索引,再调用本工具获取正文;uri 不存在时抛出带
 * code='RESOURCE_NOT_FOUND' 的错误,交由上层捕获。
 * @param {Object} params 含 uri(资源唯一标识)
 * @returns {Promise<{contents: Array}>} 含 uri/mimeType/text 的资源正文
 * @throws {Error} 资源不存在时抛出(附带 code: RESOURCE_NOT_FOUND)
 */
const READ_RESOURCE_SCHEMA = {
	name: 'readResource',
	description: '按 uri 读取资源正文',
	inputSchema: {
		type: 'object',
		properties: {
			uri: { type: 'string', description: '资源 URI' },
		},
		required: ['uri']
	},
	semantic_tags: ['读取', '资源'],
	source: 'meta',
	domain: null,
};
async function readResource(params) {
	const { uri } = params;
	const resource = window.resourceList.find(resource => resource.uri === uri);
	if (!resource) {
		const error = new Error(`资源不存在: ${uri}`);
		error.code = 'RESOURCE_NOT_FOUND';
		throw error;
	}
	return {
		contents: [{
			uri: resource.uri,
			mimeType: resource.mime_type || resource.mimeType,
			text: resource.content
		}]
	};
}

/**
 * 列举全部提示的名称与描述(剥除 messages/arguments 正文)。
 * 模型据描述自主判断用途后,经 getPrompt({name}) 精确获取正文;
 * limit 控制返回条数(1~100)。
 * @param {{limit?: number}} [params] limit 条数上限(默认50,硬上限100)
 * @returns {{prompts: Array, total: number, has_more: boolean}} 提示摘要列表
 */
const LIST_PROMPTS_SCHEMA = {
	name: 'listPrompts',
	description: '列举全部提示的名称与描述(剥除正文);按描述自主判断后经 getPrompt 精确获取',
	inputSchema: {
		type: 'object',
		properties: {
			limit: { type: 'number', description: '可选,返回条数上限(默认50,硬上限100)' },
		},
		required: []
	},
	semantic_tags: ['列举', '提示'],
	source: 'meta',
	domain: null,
};
function listPrompts({ limit = 50 } = {}) {
	const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 100);
	const prompts = (window.promptList || [])
		.filter(p => p && p.enabled !== false)
		.map(p => ({ name: p.name, description: p.description }));
	return { prompts: prompts.slice(0, safeLimit), total: prompts.length, has_more: prompts.length > safeLimit };
}

/**
 * 按 name 获取提示完整正文。
 * 从 window.promptList 精确匹配提示;arguments.name 指定 role 时仅返回该角色消息,
 * 否则返回全部角色消息。正文文本做换行压缩规整。
 * @param {Object} params 含 name(提示名)与 arguments(可选,含 name 指定 role)
 * @returns {Promise<{description: string, messages: Array}>} 提示正文(描述 + 消息列表)
 * @throws {Error} 提示不存在时抛出
 */
const GET_PROMPT_SCHEMA = {
	name: 'getPrompt',
	description: '按 name 获取提示正文(可选 arguments.name 指定 role)',
	inputSchema: {
		type: 'object',
		properties: {
			name: { type: 'string', description: '提示名称' },
			arguments: { type: 'object', description: '可选,含 name 指定 role' },
		},
		required: ['name'],
	},
	semantic_tags: ['获取', '提示'],
	source: 'meta',
	domain: null,
};
async function getPrompt(params) {
	const { name, arguments: _args } = params;
	const prompt = window.promptList.find(prompt => prompt.name === name);
	if (!prompt) {
		throw new Error(`提示不存在: ${name}`);
	}
	const messages = prompt?.messages.filter(message =>
		[null, undefined].includes(_args) ? true : message.role === _args.name
	) || [];
	messages.map(m => m.content.text = m.content.text.replace(/\n\s+/g, '\n'));
	return {
		description: prompt?.description || '',
		messages: messages
	};
}

/**
 * 按 name 获取单个工具的完整定义(含 inputSchema 参数表)。
 * 合并元工具池与精选工具池实时查找,name 需与 listTools 返回的 name 一致;
 * 未找到或已禁用时返回错误文本响应。用于模型在 listTools 摘要后下钻获取完整参数。
 * @param {{name: string}} params 目标工具名称
 * @returns {{name: string, description: string, inputSchema: Object}|{content: Array, isError: boolean}} 完整定义或错误响应
 */
const GET_TOOL_SCHEMA = {
	name: 'getTool',
	description: '按 name 获取单个工具的完整定义(含 inputSchema 参数表)',
	inputSchema: {
		type: 'object',
		properties: {
			name: { type: 'string', description: '工具名称(与 listTools 返回的 name 一致)' },
		},
		required: ['name']
	},
	semantic_tags: ['获取', '工具', 'schema'],
	source: 'meta',
	domain: null,
};
function getTool({ name }) {
	if (!name) {
		return buildTextResponse('缺少必需参数: name', false);
	}
	const tool = window.mcpProtocol.metaToolSchemas
		.concat(window.curatedTools.curatedToolSchemas)
		.find(t => t.name === name && t.enabled !== false);
	if (!tool) {
		return buildTextResponse(`工具不存在或未启用: ${name}`, true);
	}
	return {
		name: tool.name,
		description: tool.description || '',
		inputSchema: tool.inputSchema || {},
	};
}

/**
 * 按关键词检索资源库(强制关键词,不支持全量列举)。
 * keywords 必填(可多词 OR 组合),在 name/description 上命中;返回导航元数据(uri/name/description),
 * 不含正文,正文经 readResource(uri) 按需下钻。limit 控制返回条数(1~30)。
 * @param {{keywords: string[], limit?: number}} [params] keywords 检索词,limit 条数上限
 * @returns {{resources: Array, total: number, has_more: boolean, error?: string}} 资源检索结果
 */
const SEARCH_RESOURCES_SCHEMA = {
	name: 'searchResources',
	description: '检索资源库:按关键词返回资源的导航元数据(uri/name/description),不含正文,正文经 readResource(uri) 按需下钻',
	inputSchema: {
		type: 'object',
		properties: {
			keywords: { type: 'array', items: { type: 'string' }, description: '检索关键词(必填,可多词 OR 组合)' },
			limit: { type: 'number', description: '可选,返回条数上限(默认10,硬上限30)' },
		},
		required: ['keywords']
	},
	semantic_tags: ['检索', '资源', '关键词'],
	source: 'meta',
	domain: null,
};
function searchResources({ keywords, limit = 10 } = {}) {
	if (!keywords || (Array.isArray(keywords) && keywords.length === 0)) {
		return { resources: [], error: 'keywords 必填:资源库体量庞大,请使用关键词检索而非全量列举' };
	}
	const kwList = (Array.isArray(keywords) ? keywords : [keywords]).map(k => String(k).toLowerCase());
	const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 30);
	const metas = (window.resourceList || [])
		.filter(r => r && r.enabled !== false)
		.map(({ uri, name, description, mime_type, mimeType }) => ({
			uri, name, description, mimeType: mime_type || mimeType,
		}));
	const matched = metas.filter(r =>
		kwList.some(kw =>
			(r.name && r.name.toLowerCase().includes(kw)) ||
			(r.description && r.description.toLowerCase().includes(kw))
		)
	);
	return {
		resources: matched.slice(0, safeLimit),
		total: matched.length,
		has_more: matched.length > safeLimit,
	};
}

/**
 * 检索原生 EDA API(eda.*)工具。
 * 原生 API 体量大,强制关键词检索(必填);按关键词命中数降序返回前 N 条,
 * 命中精选封装(window.curatedTools)时优先以其描述替换并叠加 semantic_tags 权重;
 * limit 控制返回条数(1~30)。
 * @param {{keywords: string[], limit?: number}} [params] keywords 检索词,limit 条数上限
 * @returns {Array} 降序排列的匹配工具列表(含 name/description/inputSchema/score/domain)
 */
const SEARCH_TOOLS_SCHEMA = {
	name: 'searchTools',
	description: '检索原生 EDA API(eda.*):按关键词命中数降序返回前 N 条,命中精选封装时优先以其描述替换;原生 API 体量大,须用密集关键词检索',
	inputSchema: {
		type: 'object',
		properties: {
			keywords: { type: 'array', items: { type: 'string' }, description: '检索关键词(必填,可多词 OR 组合)' },
			limit: { type: 'number', description: '可选,返回条数上限(默认10,硬上限30)' },
		},
		required: ['keywords']
	},
	semantic_tags: ['搜索', '原生API', '关键词', '检索'],
	source: 'meta',
	domain: null,
};
function searchTools({ keywords, limit = 10 } = {}) {
	if (!Array.isArray(keywords) || keywords.length === 0) {
		return [];
	}
	const safeLimit = Math.min(Math.max(Number(limit) || 10, 1), 30);
	const keywordSet = new Set(keywords.map(k => String(k).toLowerCase()));
	// 按 semantic_tags 命中关键词累加得分(命中一个关键词计 2 分,未提供标签计 0 分)
	const scoreByTag = (tags) => {
		if (!Array.isArray(tags)) return 0;
		return tags.reduce((acc, tag) => acc + (keywordSet.has(String(tag).toLowerCase()) ? 2 : 0), 0);
	};
	const results = (window.edaApi || [])
		.filter(m => m.enabled !== false)
		.map(m => {
			const msg = `name:${m.name},description:${m.description},inputSchema:${JSON.stringify(m.inputSchema)}`;
			let score = 0;
			for (const keyword of keywords) {
				if (msg.toLowerCase().includes(String(keyword).toLowerCase())) score++;
			}
			if (score === 0) return null;
			return { name: m.name, description: m.description, inputSchema: m.inputSchema, score };
		})
		.filter(r => r !== null)
		.sort((a, b) => b.score - a.score)
		.map(result => {
			const customApiName = result.name.replace('.', '$');
			const custom = (window.curatedTools && Array.isArray(window.curatedTools.curatedToolSchemas))
				? window.curatedTools.curatedToolSchemas.find(t => t.name === customApiName && t.enabled !== false)
				: null;
			if (custom) {
				return { ...custom, score: result.score + scoreByTag(custom.semantic_tags), domain: custom.domain };
			}
			return result;
		});
	return results.filter(r => r.score > 0).slice(0, safeLimit);
}

// ==================== 超级对象挂载区(★ 全部 window 赋值集中置于文件末尾) ====================
// 元工具运行时对象:封装 MCP 风格的工具/资源/提示调用,以及对外的 metaToolSchemas 清单
window.mcpProtocol = {
	callTool,
	listTools,
	listResources,
	readResource,
	listPrompts,
	getPrompt,
	getTool,
	searchResources,
	searchTools,
	// 工具描述清单(由上方各元工具 *_SCHEMA 常量聚合)
	metaToolSchemas: [
		CALL_TOOL_SCHEMA,
		LIST_TOOLS_SCHEMA,
		LIST_RESOURCES_SCHEMA,
		READ_RESOURCE_SCHEMA,
		LIST_PROMPTS_SCHEMA,
		GET_PROMPT_SCHEMA,
		GET_TOOL_SCHEMA,
		SEARCH_RESOURCES_SCHEMA,
		SEARCH_TOOLS_SCHEMA,
	],
};

// 输出使用说明
console.log('[MCP] EDA MCP 已初始化,通过 window.mcpProtocol 访问');
