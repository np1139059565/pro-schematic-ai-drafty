/**
 * MCP (Model Context Protocol) 客户端封装
 * 符合 MCP 规范，支持工具、资源、提示的管理和调用
 * 通过 window.cmcp.xxx 方式访问
 */



/**
 * 调用工具 (符合 MCP 规范)
 * @params {name: string, arguments: Object}
 * @params.name 工具名称,格式为:className.methodName
 * @params.arguments 工具参数对象:{key: value}
 * @returns {Object} 返回格式: { content: [{ type: "text", text: string }], isError: boolean }
 */
async function callTool(params) {
	try {
		const { name, arguments: args } = params;
		const [className, methodName] = name.split('.');
		// 检查工具是否存在
		if (window.customeTools[name] === null && (className === undefined || methodName === undefined || eda[className]?.[methodName] === null)) {
			// 返回符合 MCP 规范的错误格式
			return buildTextResponse(`工具不存在: ${name}`, true);
		}
		// 验证工具参数
		const toolSchema = window.customeTools.toolList.find(tool => tool.name === name) || window.jdbToolList.find(tool => tool.name === name);
		const validateResult = validateArguments(args, toolSchema?.inputSchema);
		if (validateResult !== null) {
			return buildTextResponse(`工具参数验证失败: ${validateResult}`, false);
		}
		// 优先调用自定义工具(自定义工具名称格式为:className$methodName)
		const tool = window.customeTools[name.replace('.', '$')] || eda[className]?.[methodName];

		// 执行工具处理函数
		// 自定义工具使用对象参数，原生API使用位置参数
		const result = window.customeTools[name.replace('.', '$')] 
			? await tool(args || {})
			: await tool(...Object.values(args) || {});

		// 包装为符合 MCP 规范的返回格式
		if (result !== null && ['string', 'number', 'boolean', 'object'].includes(typeof result)) {
			return buildTextResponse(typeof result === 'string' ? result : JSON.stringify(result, null, 2), false);
		} else {
			return buildTextResponse(`工具执行失败 [${name}]: ${result}`, true);
		}
	} catch (error) {
		// 包装错误信息为符合 MCP 规范的格式
		return buildTextResponse(`工具执行失败 [${name}]: ${error.message}`, true);
	}
}

// 参数验证（基于 JSON Schema）
/**
 * 参数验证（基于 JSON Schema）
 * @param {*} args 参数
 * @param {*} schema 参数模式
 * @returns 
 * 返回 null 表示验证通过，否则返回错误信息
 */
function validateArguments(args, schema) {
	// 简单的参数验证实现
	if (!schema || schema.type !== 'object') {
		return null; // 不验证非对象类型
	}

	// 检查必需参数
	if (schema.required && Array.isArray(schema.required)) {
		for (const requiredField of schema.required) {
			if (!(requiredField in args)) {
				return `缺少必需参数: ${requiredField}`;
			}
		}
	}

	// 检查参数类型
	if (schema.properties) {
		for (const [key, value] of Object.entries(args)) {
			const propSchema = schema.properties[key];
			if (propSchema) {
				// 类型检查
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

	return null; // 验证通过
}

/**
 * 统一构造文本返回结果,保证结构一致性
 * @param {*} text 文本内容
 * @param {*} isError 是否错误
 * @returns 
 */
function buildTextResponse(text, isError) {
	return {
		content: [ 
			{ // 单条内容
				type: "text", // 内容类型标记
				text, // 具体文本内容
			}
		],
		isError, // 是否错误标记
	};
}

/**
 * 列出所有工具 (符合 MCP 规范)
 * @returns {Object} 返回格式: { tools: [{ name: string, description: string, inputSchema: Object }] }
 */
function listTools() {
	return { tools: window.customeTools.toolList/*.concat(window.jdbToolList)*/ };
}

/**
 * 列出所有资源 (符合 MCP 规范)
 * @returns {Object} 返回格式: { resources: [{ uri: string, name: string, description: string, mimeType: string }] }
 */
function listResources() {
	return { resources: window.jdbResourceList };
}

/**
 * 读取资源 (符合 MCP 规范)
 * @param {Object} params 参数对象，包含 uri
 * @param {string} params.uri 资源 URI
 * @returns {Object} 返回格式: { contents: [{ uri: string, mimeType: string, text: string }] }
 */
async function readResource(params) {
	// 从参数对象中提取 uri
	const { uri } = params;

	// 查找资源
	const resource = window.jdbResourceList.find(resource => resource.uri === uri);
	// if (!resource) {
	// 	const error = new Error(`资源不存在: ${uri}`);
	// 	error.code = 'RESOURCE_NOT_FOUND';
	// 	throw error;
	// }

	// 返回符合 MCP 规范的格式
	return {
		contents: [
			{
				uri: resource.uri,
				mimeType: resource.mimeType,
				text: resource.content
			}
		]
	};
}

/**
 * 列出所有提示 (符合 MCP 规范)
 * @returns {Object} 返回格式: { prompts: [{ name: string, description: string, arguments: Array }] }
 */
function listPrompts() {
	// 包装为符合 MCP 规范的返回格式
	return { prompts: [] };
}

/**
 * 获取提示 (符合 MCP 规范)
 * @param {Object} params 参数对象，包含 name 和 arguments
 * @param {string} params.name 提示名称
 * @param {Object} params.arguments 提示参数对象
 * @returns {Object} 返回格式: { description: string, messages: [{ role: string, content: { type: string, text: string } }] }
 */
async function getPrompt(params) {
	// 从参数对象中提取 name 和 arguments
	const { name, arguments: _args } = params;

	// TODO: 实现提示获取逻辑，使用 _args 参数（当前未使用，标记为 _args 表示预留）
	// if (!prompts.has(name)) {
	// 	const error = new Error(`提示不存在: ${name}`);
	// 	error.code = 'PROMPT_NOT_FOUND';
	// 	throw error;
	// }
	// const prompt = prompts.get(name);
	// return prompt;

	// 暂时忽略未使用的 _args 参数（预留用于后续实现）
	void _args;

	// 返回符合 MCP 规范的格式
	return {
		description: `提示: ${name}`,
		messages: []
	};
}

// 导出函数供其他模块使用
window.mcpEDA = {
	callTool,
	listTools,
	listResources,
	readResource,
	listPrompts,
	getPrompt,
};
// 输出使用说明
console.log('[MCP] EDA MCP 已初始化，通过 window.mcpEDA 访问');





// ----------------------------------------------------自定义API----------------------------------------------------
/**
 * 搜索eda原生API,支持多关键词搜索和权重排序
 * @param {*} keywords 关键词数组
 * @returns 返回格式: { tools: [{ name: string, description: string, inputSchema: Object }] }
 */

function searchTools(keywords) {

	// 如果关键词数组为空,返回空数组
	if (keywords.length === 0) {
		return [];
	}

	// 过滤并计算权重
	const results = window.jdbToolList
		.map(m => {
			// 解析API信息
			const msg = `name:${m.name},description:${m.description},inputSchema:${JSON.stringify(m.inputSchema)}`;

			// 计算在msg中匹配的关键词数量
			let matchedKeywordsCount = 0; // 匹配的关键词数量

			// 检查每个关键词是否在msg中匹配
			for (const keyword of keywords) {
				// 在msg中搜索关键词(不区分大小写)
				if (msg.toLowerCase().includes(keyword.toLowerCase())) {
					matchedKeywordsCount++; // 匹配的关键词数量+1
				}
			}

			// 只要匹配任意一个关键词就返回结果(OR逻辑)
			if (matchedKeywordsCount > 0) {
				// 权重 = 匹配的关键词数量,命中关键词越多得分越高
				const score = matchedKeywordsCount;

				return {
					name: m.name,
					description: m.description,
					inputSchema: m.inputSchema,
					score: score, // 权重分数(匹配的关键词数量)
				};
			}

			return null; // 不匹配,返回null
		})
		.filter(result => result !== null) // 过滤掉不匹配的结果
		.sort((a, b) => b.score - a.score); // 按权重降序排序(命中关键词越多排在前面)

	return results.filter(result => result.score > 0).slice(0, 10); // 返回排序后的结果,最多返回10条结果
}

/**
 * 获取图纸边界
 * @returns 
 * {content: { width: { type: "number", value: canvasWidth }, height: { type: "number", value: canvasHeight } }}
 */
async function getCanvasSize() {
	let canvasWidth = 1170; // 默认宽度（单位：mil）
	let canvasHeight = 825; // 默认高度（单位：mil）
	try {
		const footprintSourceStr = await eda.sys_FileManager.getDocumentSource();
		if (footprintSourceStr && footprintSourceStr.includes('Width') && footprintSourceStr.includes('Height')) {
			// 按行解析文档源码(合并二维数组)
			const parts = footprintSourceStr.split('\n').map(line =>
				line.trim().split('|').filter(p => p.trim().length > 0)
			).flat();

			for (const part of parts) {
				// 解析每个JSON对象（包含type、ticket、id等信息）
				const attrObj = JSON.parse(part);

				// 查找 Width 属性
				if (attrObj.key === 'Width' && attrObj.value) {
					canvasWidth = parseInt(attrObj.value, 10) || canvasWidth;
					console.log(`画布宽度: ${canvasWidth} mil`);
				}

				// 查找 Height 属性
				if (attrObj.key === 'Height' && attrObj.value) {
					canvasHeight = parseInt(attrObj.value, 10) || canvasHeight;
					console.log(`画布高度: ${canvasHeight} mil`);
				}
			}
		} else {
			console.warn('API没有找到图纸边界信息,使用默认值: 1170 x 825 mil');
		}

		console.log(`图纸边界(画布大小): ${canvasWidth} x ${canvasHeight} mil`);
	} catch (e) {
		console.error('获取图纸边界失败,错误信息:', e);
	}
	return {
		content: {
			width: { type: "number", value: canvasWidth },
			height: { type: "number", value: canvasHeight }
		}
	};
}

/**
 * 元件搜索（遵循分页规则：带 itemsOfPage/page 必须提供 libraryUuid）
 */
async function lib_Device$search({ keyword, libraryUuid = null, itemsOfPage = null, page = null }) {
	if (!keyword || typeof keyword !== 'string') {
		throw new Error('keyword 必填且为字符串');
	}
	// 若传分页参数则必须传 libraryUuid
	if ((itemsOfPage !== null || page !== null) && !libraryUuid) {
		throw new Error('使用分页参数时必须提供 libraryUuid');
	}
	// 如果没有分页参数,则不传递 itemsOfPage 和 page（连 null 都不能有）
	let result;
	if (itemsOfPage === null && page === null) {
		// 无分页参数,只传递前1个参数
		result = await eda.lib_Device.search(keyword);
	} else {
		// 有分页参数,传递所有6个参数
		result = await eda.lib_Device.search(keyword, libraryUuid, null, null, itemsOfPage, page);
	}
	return { content: result };
}

/**
 * 在原理图放置元件（必须使用设备 uuid，subPartName 必填即便为空字符串）
 */
async function sch_PrimitiveComponent$create({ uuid, libraryUuid, x, y, subPartName = '', rotation = 0, mirror = false, addIntoBom = true, addIntoPcb = true }) {
	if (!uuid || !libraryUuid) {
		throw new Error('uuid 与 libraryUuid 必填且不可为空');
	}
	if (typeof subPartName !== 'string') {
		throw new Error('subPartName 必须为字符串（可为空字符串）');
	}
	const comp = await eda.sch_PrimitiveComponent.create(
		{ uuid, libraryUuid },
		x,
		y,
		subPartName,
		rotation,
		mirror,
		addIntoBom,
		addIntoPcb,
	);
	await comp.done();
	return { content: comp };
}

/**
 * 获取元件引脚列表，可选 y 轴取反
 */
async function sch_PrimitiveComponent$getAllPinsByPrimitiveId({ primitiveId, invertY = true }) {
	if (!primitiveId) {
		throw new Error('primitiveId 必填');
	}
	const pins = await eda.sch_PrimitiveComponent.getAllPinsByPrimitiveId(primitiveId);
	if (invertY) {
		return { content: pins.map(p => ({ ...p, y: -p.y })) };
	}
	return { content: pins };
}

/**
 * 创建原理图连线（line 坐标数组必须连续）
 */
async function sch_PrimitiveWire$create({ line, net = null, color = '#000000', lineWidth = 1, lineType = 0 }) {
	if (!Array.isArray(line) || line.length < 4 || line.length % 2 !== 0) {
		throw new Error('line 必须是长度不少于4且为偶数的坐标数组');
	}
	const wire = await eda.sch_PrimitiveWire.create(line, net, color, lineWidth, lineType);
	return { content: wire };
}

/**
 * 获取所有原理图元件
 */
async function sch_PrimitiveComponent$getAll({ cmdKey = null, allSchematicPages = false }) {
	const result = await eda.sch_PrimitiveComponent.getAll(cmdKey, allSchematicPages);
	return { content: result };
}

/**
 * 获取文档封装源码
 */
async function sys_FileManager$getDocumentFootprintSources() {
	const result = await eda.sys_FileManager.getDocumentFootprintSources();
	return { content: result };
}



window.customeTools = {
	searchTools,
	getCanvasSize,
	'lib_Device$search': lib_Device$search,
	'sch_PrimitiveComponent$create': sch_PrimitiveComponent$create,
	'sch_PrimitiveComponent$getAllPinsByPrimitiveId': sch_PrimitiveComponent$getAllPinsByPrimitiveId,
	'sch_PrimitiveComponent$getAll': sch_PrimitiveComponent$getAll,
	'sch_PrimitiveWire$create': sch_PrimitiveWire$create,
	'sys_FileManager$getDocumentFootprintSources': sys_FileManager$getDocumentFootprintSources,
	toolList: [
		{
			name: 'searchTools',
			description: '搜索并按权重降序排序工具列表,最多返回10条结果;支持多个关键词组合搜索,多个关键词使用OR逻辑;为了提高搜索精准度,应该尽量使用中文搜索,并且组合多个关键词扩大搜索范围',
			inputSchema: {
				type: 'object',
				properties: {
					keywords: { type: 'array', items: { type: 'string' } },
				},
				required: ['keywords'],

			},
		},
		{
			name: 'getCanvasSize',
			description: '获取图纸边界(画布大小,所有元件/导线不能超过该范围,单位:mil)',
			inputSchema: {
				type: 'object',
				properties: {},
				required: [],
			},
		},
		{
			name: 'lib_Device$search',
			description: '元件搜索；带分页参数(itemsOfPage/page)时必须提供 libraryUuid；返回 lib_Device.search 结果',
			inputSchema: {
				type: 'object',
				properties: {
					keyword: { type: 'string' },
					libraryUuid: { type: 'string' },
					itemsOfPage: { type: 'number' },
					page: { type: 'number' },
				},
				required: ['keyword'],
			},
		},
		{
			name: 'sch_PrimitiveComponent$create',
			description: '在原理图放置元件；必须使用设备 uuid 与 libraryUuid，subPartName 必填（可为空字符串），内部自动调用 done() 保存',
			inputSchema: {
				type: 'object',
				properties: {
					uuid: { type: 'string' },
					libraryUuid: { type: 'string' },
					x: { type: 'number' },
					y: { type: 'number' },
					subPartName: { type: 'string' },
					rotation: { type: 'number' },
					mirror: { type: 'boolean' },
					addIntoBom: { type: 'boolean' },
					addIntoPcb: { type: 'boolean' },
				},
				required: ['uuid', 'libraryUuid', 'x', 'y'],
			},
		},
		{
			name: 'sch_PrimitiveComponent$getAllPinsByPrimitiveId',
			description: '获取元件引脚列表；默认对 y 轴取反以符合画布坐标习惯，可通过 invertY 控制',
			inputSchema: {
				type: 'object',
				properties: {
					primitiveId: { type: 'string' },
					invertY: { type: 'boolean' },
				},
				required: ['primitiveId'],
			},
		},
		{
			name: 'sch_PrimitiveComponent$getAll',
			description: '获取当前原理图页面（或所有页面）中的所有元件列表；可选 cmdKey（筛选条件）和 allSchematicPages（是否获取所有页面）',
			inputSchema: {
				type: 'object',
				properties: {
					cmdKey: { type: 'string' },
					allSchematicPages: { type: 'boolean' },
				},
				required: [],
			},
		},
		{
			name: 'sch_PrimitiveWire$create',
			description: '创建原理图导线；line 必须为连续坐标数组（长度为偶数且不少于4）,例如:[100, 200, 300, 400, 500, 600]',
			inputSchema: {
				type: 'object',
				properties: {
					line: { type: 'array', items: { type: 'number' } },
					net: { type: 'string' },
					color: { type: 'string' },
					lineWidth: { type: 'number' },
					lineType: { type: 'number' },
				},
				required: ['line'],
			},
		},
		{
			name: 'sys_FileManager$getDocumentFootprintSources',
			description: '获取文档中所有封装的源码信息，返回封装UUID和对应的文档源码字符串；可用于解析画布信息、封装数据等',
			inputSchema: {
				type: 'object',
				properties: {},
				required: [],
			},
		},
	],
};

