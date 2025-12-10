/**
 * MCP (Model Context Protocol) 客户端封装
 * 符合 MCP 规范，支持工具、资源、提示的管理和调用
 * 通过 window.mcpEDA.xxx 方式访问
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
	return { tools: window.customeTools.toolList /* .concat(window.jdbToolList) */ };
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
	return { prompts: window.jdbPromptList };
}

/**
 * 获取提示 (符合 MCP 规范)
 * @param {Object} params 参数对象 {name: string, arguments: {name: string}}
 * @param {string} params.name 提示名称
 * @param {string} params.arguments.name 提示参数名称
 * @param {Object} params.arguments 提示参数对象 {name: string}
 * @returns {Object} 返回格式: { description: string, messages: [{ role: string, content: { type: string, text: string } }] }
 */
async function getPrompt(params) {
	// 从参数对象中提取 name 和 arguments
	const { name, arguments: _args } = params;

	// 从提示列表中查找提示
	const prompt = window.jdbPromptList.find(prompt => prompt.name === name);
	const message = prompt.messages.find(message => message.role === _args.name);

	// 返回符合 MCP 规范的格式
	return {
		description: prompt.description,
		messages: [
			{
				role: message.role,
				content: {
					type: message.content.type,
					text: message.content.text,
				},
			}
		]
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

function searchTools({ keywords }) {

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
		.sort((a, b) => b.score - a.score) // 按权重降序排序(命中关键词越多排在前面)
		// 如果自定义api'className$methodName'与原api'className.methodName'相同,则将之替换
		.map(result => {
			const customApiName = result.name.replace('$', '.');
			if (window.customeTools[customApiName] !== null) {
				return window.customeTools[customApiName];
			}
			return result;
		});
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
 * 删除原理图元件
 */
async function sch_PrimitiveComponent$delete({ primitiveIds }) {
	if (!primitiveIds) {
		throw new Error('primitiveIds 必填');
	}
	const result = await eda.sch_PrimitiveComponent.delete(primitiveIds);
	return { content: result };
}

/**
 * 获取所有原理图元件
 */
async function sch_PrimitiveComponent$getAll({ cmdKey = null, allSchematicPages = false }) {
	const result = await eda.sch_PrimitiveComponent.getAll(cmdKey, allSchematicPages);
	return { content: result };
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
 * 修改原理图元件（支持位置、旋转、镜像、属性等完整修改）
 */
async function sch_PrimitiveComponent$modify({ primitiveId, property }) {
	if (!primitiveId) {
		throw new Error('primitiveId 必填');
	}
	if (!property || typeof property !== 'object') {
		throw new Error('property 必填且必须为对象');
	}
	const comp = await eda.sch_PrimitiveComponent.modify(primitiveId, property);
	return { content: comp };
}

/**
 * 创建原理图导线（line 坐标数组必须连续）
 */
async function sch_PrimitiveWire$create({ line, net = null, color = '#000000', lineWidth = 1, lineType = 0 }) {
	if (!Array.isArray(line) || line.length < 4 || line.length % 2 !== 0) {
		throw new Error('line 必须是长度不少于4且为偶数的坐标数组');
	}
	if (color === null || color === undefined) {
		throw new Error('color 可以不传,但必须不能为null或undefined');
	}
	const wire = await eda.sch_PrimitiveWire.create(line, net, color, lineWidth, lineType);
	return { content: wire };
}

/**
 * 删除原理图导线
 */
async function sch_PrimitiveWire$delete({ primitiveIds }) {
	if (!primitiveIds) {
		throw new Error('primitiveIds 必填');
	}
	const result = await eda.sch_PrimitiveWire.delete(primitiveIds);
	return { content: result };
}

/**
 * 获取所有原理图导线
 */
async function sch_PrimitiveWire$getAll({ net = null }) {
	const result = await eda.sch_PrimitiveWire.getAll(net);
	return { content: result };
}

/**
 * 修改原理图导线（支持坐标、网络、颜色、线宽、线型等完整修改）
 */
async function sch_PrimitiveWire$modify({ primitiveId, property }) {
	if (!primitiveId) {
		throw new Error('primitiveId 必填');
	}
	if (!property || typeof property !== 'object') {
		throw new Error('property 必填且必须为对象');
	}
	const wire = await eda.sch_PrimitiveWire.modify(primitiveId, property);
	return { content: wire };
}

/**
 * 获取文档封装源码
 */
async function sys_FileManager$getDocumentFootprintSources() {
	const result = await eda.sys_FileManager.getDocumentFootprintSources();
	return { content: result };
}

/**
 * 计算原理图元件的矩形边界
 * @param {Object} params 参数对象
 * @param {Array} params.pins 引脚坐标列表，格式：[{x: number, y: number}, ...]
 * @param {number} params.expandMil 引脚膨胀距离（默认10mil）
 * @returns {Object} 返回格式: { content: Array } 矩形边界顶点坐标，格式：[x1,y1,x2,y2,x3,y3,x4,y4]（顺时针顺序：左下、右下、右上、左上）
 */
async function calculateComponentBounds({ pins, expandMil = 10 }) {
	// 边界校验：无引脚时返回空数组
	if (!Array.isArray(pins) || pins.length === 0) {
		console.warn('引脚列表不能为空');
		return { content: [] };
	}

	// 1. 计算所有引脚膨胀后的最小/最大坐标（膨胀=点向四周扩展expandMil）
	let minX = Infinity;
	let minY = Infinity;
	let maxX = -Infinity;
	let maxY = -Infinity;

	pins.forEach(pin => {
		const { x, y } = pin;
		// 校验引脚坐标有效性
		if (typeof x !== 'number' || typeof y !== 'number' || isNaN(x) || isNaN(y)) {
			console.warn(`无效引脚坐标：${JSON.stringify(pin)}，已忽略`);
			return;
		}

		// 每个引脚膨胀后的矩形边界（上下左右各扩展expandMil）
		const pinMinX = x - expandMil;
		const pinMinY = y - expandMil;
		const pinMaxX = x + expandMil;
		const pinMaxY = y + expandMil;

		// 更新整体边界
		minX = Math.min(minX, pinMinX);
		minY = Math.min(minY, pinMinY);
		maxX = Math.max(maxX, pinMaxX);
		maxY = Math.max(maxY, pinMaxY);
	});

	// 2. 生成矩形边界的4个顶点（顺时针顺序：左下→右下→右上→左上）
	const bounds = [
		minX, minY,  // 左下
		maxX, minY,  // 右下
		maxX, maxY,  // 右上
		minX, maxY   // 左上
	];

	return { content: bounds };
}

window.customeTools = {
	searchTools,
	getCanvasSize,
	'lib_Device$search': lib_Device$search,

	'sch_PrimitiveComponent$create': sch_PrimitiveComponent$create,
	'sch_PrimitiveComponent$getAllPinsByPrimitiveId': sch_PrimitiveComponent$getAllPinsByPrimitiveId,
	'sch_PrimitiveComponent$getAll': sch_PrimitiveComponent$getAll,
	'sch_PrimitiveComponent$modify': sch_PrimitiveComponent$modify,
	'sch_PrimitiveComponent$delete': sch_PrimitiveComponent$delete,
	'calculateComponentBounds': calculateComponentBounds,

	'sch_PrimitiveWire$create': sch_PrimitiveWire$create,
	'sch_PrimitiveWire$modify': sch_PrimitiveWire$modify,
	'sch_PrimitiveWire$delete': sch_PrimitiveWire$delete,
	'sch_PrimitiveWire$getAll': sch_PrimitiveWire$getAll,

	'sys_FileManager$getDocumentFootprintSources': sys_FileManager$getDocumentFootprintSources,
	toolList: [
		{
			name: 'searchTools',
			description: '搜索mcp工具列表,并按权重降序排序,最多返回10条结果,支持多个关键词组合搜索,多个关键词使用OR逻辑;先查看mcp工具的搜索规范 guideline_tool_usage_prompt',
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
			description: '在原理图放置元件；使用前必须查看 guideline_layout_planning_prompt 了解布局规划规则，放置后必须查看 guideline_component_bounds_prompt 进行碰撞检测',
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
			name: 'sch_PrimitiveComponent$getAll',
			description: '获取当前原理图中的所有元件列表；可选 cmdKey（筛选条件）和 allSchematicPages（是否获取所有页面）',
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
			name: 'sch_PrimitiveComponent$delete',
			description: '删除原理图元件；primitiveIds可以是单个图元ID(string)或图元ID数组(Array<string>)',
			inputSchema: {
				type: 'object',
				properties: {
					primitiveIds: {
						oneOf: [
							{ type: 'string' },
							{ type: 'array', items: { type: 'string' } }
						],
						description: '器件的图元 ID 或器件图元对象，可以是单个ID或ID数组'
					}
				},
				required: ['primitiveIds']
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
			name: 'sch_PrimitiveComponent$modify',
			description: '修改原理图元件；支持修改/移动位置(x,y)、旋转(rotation)、镜像(mirror)、BOM/PCB属性(addIntoBom,addIntoPcb)、标识符(designator)、名称(name)、唯一ID(uniqueId)、制造商信息(manufacturer,manufacturerId)、供应商信息(supplier,supplierId)以及其他自定义属性(otherProperty)',
			inputSchema: {
				type: 'object',
				properties: {
					primitiveId: {
						type: 'string',
						description: '图元 ID'
					},
					property: {
						type: 'object',
						description: '需要修改的参数对象，支持：x?:number, y?:number, rotation?:number, mirror?:boolean, addIntoBom?:boolean, addIntoPcb?:boolean, designator?:string|null, name?:string|null, uniqueId?:string|null, manufacturer?:string|null, manufacturerId?:string|null, supplier?:string|null, supplierId?:string|null, otherProperty?:{[key:string]:string|number|boolean}',
						properties: {
							x: { type: 'number' },
							y: { type: 'number' },
							rotation: { type: 'number' },
							mirror: { type: 'boolean' },
							addIntoBom: { type: 'boolean' },
							addIntoPcb: { type: 'boolean' },
							designator: { type: ['string', 'null'] },
							name: { type: ['string', 'null'] },
							uniqueId: { type: ['string', 'null'] },
							manufacturer: { type: ['string', 'null'] },
							manufacturerId: { type: ['string', 'null'] },
							supplier: { type: ['string', 'null'] },
							supplierId: { type: ['string', 'null'] },
							otherProperty: { type: 'object' }
						}
					}
				},
				required: ['primitiveId', 'property']
			},
		},
		{
			name: 'calculateComponentBounds',
			description: '计算原理图元件的矩形边界；根据引脚坐标列表计算元件的最小外接矩形，支持引脚膨胀距离设置；返回矩形边界顶点坐标数组（顺时针顺序：左下、右下、右上、左上），格式：[x1,y1,x2,y2,x3,y3,x4,y4]；在放置元件后必须调用此函数计算元件边界，用于检查碰撞和避免导线穿过元件；使用前必须查看 guideline_component_bounds_prompt 了解元件边界计算与碰撞检测规则',
			inputSchema: {
				type: 'object',
				properties: {
					pins: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								x: { type: 'number' },
								y: { type: 'number' }
							},
							required: ['x', 'y']
						}
					},
					expandMil: { type: 'number' }
				},
				required: ['pins']
			},
		},
		{
			name: 'sch_PrimitiveWire$create',
			description: '创建原理图导线；line 必须为连续坐标数组（长度为偶数且不少于4）,例如:[x1,y1,x2,y2,x3,y3,x4,y4]；使用前必须查看 guideline_smart_routing_prompt 和 guideline_routing_constraints_prompt 了解智能布线和约束规则，确保最小间距和45°走线优先；布线完成后必须查看 guideline_drc_repair_prompt 进行DRC校验',
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
			name: 'sch_PrimitiveWire$delete',
			description: '删除原理图导线；primitiveIds可以是单个图元ID(string)或图元ID数组(Array<string>)',
			inputSchema: {
				type: 'object',
				properties: {
					primitiveIds: {
						oneOf: [
							{ type: 'string' },
							{ type: 'array', items: { type: 'string' } }
						],
						description: '导线的图元 ID 或导线图元对象，可以是单个ID或ID数组'
					}
				},
				required: ['primitiveIds']
			},
		},
		{
			name: 'sch_PrimitiveWire$modify',
			description: '修改原理图导线；支持修改/移动坐标(line)、网络(net)、颜色(color)、线宽(lineWidth)、线型(lineType)；line可以是扁平数组Array<number>或二维数组Array<Array<number>>',
			inputSchema: {
				type: 'object',
				properties: {
					primitiveId: {
						type: 'string',
						description: '导线的图元 ID 或导线图元对象'
					},
					property: {
						type: 'object',
						description: '修改参数对象，支持：line?:Array<number>|Array<Array<number>>, net?:string, color?:string|null, lineWidth?:number|null, lineType?:ESCH_PrimitiveLineType|null',
						properties: {
							line: {
								oneOf: [
									{ type: 'array', items: { type: 'number' } },
									{ type: 'array', items: { type: 'array', items: { type: 'number' } } }
								]
							},
							net: { type: 'string' },
							color: { type: ['string', 'null'] },
							lineWidth: { type: ['number', 'null'] },
							lineType: { type: ['number', 'null'] }
						}
					}
				},
				required: ['primitiveId', 'property']
			},
		},
		{
			name: 'sch_PrimitiveWire$getAll',
			description: '获取所有原理图导线；可选net参数（网络名称）进行筛选，net可以是单个网络名称(string)或网络名称数组(Array<string>)',
			inputSchema: {
				type: 'object',
				properties: {
					net: {
						oneOf: [
							{ type: 'string' },
							{ type: 'array', items: { type: 'string' } }
						],
						description: '网络名称，可选，用于筛选特定网络的导线'
					}
				},
				required: []
			},
		},
		{
			name: 'sys_FileManager$getDocumentFootprintSources',
			description: '获取文档中所有封装的源码信息，返回封装UUID和对应的文档源码字符串；先查看mcp工具的提示 guideline_source_code_parse_prompt。',
			inputSchema: {
				type: 'object',
				properties: {},
				required: [],
			},
		},
	],
};

