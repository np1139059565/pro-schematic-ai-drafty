/**
 * MCP (Model Context Protocol) 客户端封装
 * 符合 MCP 规范,支持工具、资源、提示的管理和调用
 * 通过 window.mcpEDA.xxx 方式访问
 */


// 参数验证（基于 JSON Schema）
/**
 * 参数验证（基于 JSON Schema）
 * @param {*} args 参数
 * @param {*} schema 参数模式
 * @returns 
 * 返回 null 表示验证通过,否则返回错误信息
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
		const toolSchema = window.mcpEDA.listTools().tools.find(tool => tool.name === name) || 
		window.jdbToolDescriptions.find(tool => tool.name === name);
		if (toolSchema === null) {
			// 返回符合 MCP 规范的错误格式
			return buildTextResponse(`工具不存在: ${name}`, true);
		}
		// 验证工具参数
		const validateResult = validateArguments(args, toolSchema?.inputSchema);
		if (validateResult !== null) {
			return buildTextResponse(`工具参数验证失败: ${validateResult}`, false);
		}
		// 按照优先级调用工具(自定义工具名称格式为:className$methodName,原生API名称格式为:className.methodName)
		const mname = name.replace('.', '$');
		const tool = window.mcpEDA[name] || window.customeTools[mname] || eda[className]?.[methodName];

		// 执行工具处理函数(检查是否为原生API,如果是则使用位置参数调用)
		const result = (window.mcpEDA[name] || window.customeTools[mname]) === null
			? await tool(...Object.values(args) || {})
			: await tool(args || {});

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

/**
 * 列出所有工具 (符合 MCP 规范)
 * @returns {Object} 返回格式: { tools: [{ name: string, description: string, inputSchema: Object }] }
 */
function listTools() {
	return { tools: window.mcpEDA.toolDescriptions.concat(window.customeTools.toolDescriptions) };
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
 * @param {Object} params 参数对象,包含 uri
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
	return {
		prompts: window.promptList.map(p => ({
			name: p.name,
			description: p.description,
			arguments: p.messages.map(m => ({
				role: m.role,
				description: m.description,
				required: false
			}))
		}))
	};
}

/**
 * 获取提示 (符合 MCP 规范)
 * @param {Object} params 参数对象 {name: string, arguments: {name: string}}
 * @param {string} params.name 提示名称
 * @param {Object} params.arguments 提示参数对象 {name: string}
 * @param {string} params.arguments.name 提示参数名称(不传则返回所有提示)
 * @returns {Object} 返回格式: { description: string, messages: [{ role: string, content: { type: string, text: string } }] }
 */
async function getPrompt(params) {
	// 从参数对象中提取 name 和 arguments
	const { name, arguments: _args } = params;

	// 从提示列表中查找提示(如果arguments不为空,则查找arguments.name对应的提示)
	const prompt = window.promptList.find(prompt => prompt.name === name);
	if (!prompt) {
		throw new Error(`提示不存在: ${name}`);
	}
	const messages = prompt?.messages.filter(message => 
		[null, undefined].includes(_args) ? true : message.role === _args.name
	) || [];
	messages.map(m=>m.content.text=m.content.text.replace(/\n\s+/g, '\n'));//去除每行前面的空格

	// 返回符合 MCP 规范的格式
	return {
		description: prompt?.description || '',
		messages: messages
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
	toolDescriptions: [
		{
			name: 'callTool',
			description: '调用工具,参数为工具名称',
			inputSchema: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					arguments: { type: 'object' },
				},
				required: ['name', 'arguments'],
			},
		},
		{
			name: 'listTools',
			description: `
列出所有自定义工具列表
			`,
			inputSchema: {
				type: 'object',
				properties: {},
				required: []
			}
		},
		{
			name: 'listResources',
			description: '列出所有资源',
			inputSchema: {
				type: 'object',
				properties: {},
				required: []
			}
		},
		{
			name: 'readResource',
			description: '读取资源',
			inputSchema: {
				type: 'object',
				properties: {
					uri: { type: 'string' },
				},
				required: ['uri']
			}
		},
		{
			name: 'listPrompts',
			description: '列出所有提示',
			inputSchema: {
				type: 'object',
				properties: {},
				required: []
			}
		},
		{
			name: 'getPrompt',
			description: '获取提示',
			inputSchema: {
				type: 'object',
				properties: {
					name: { type: 'string' },
					arguments: { type: 'object' },
				},
				required: ['name'],
			}
		}
	]
};
// 输出使用说明
console.log('[MCP] EDA MCP 已初始化,通过 window.mcpEDA 访问');





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
	const results = window.jdbToolDescriptions
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
 * 在原理图放置元件（必须使用设备 uuid,subPartName 必填即便为空字符串）
 */
async function sch_PrimitiveComponent$create({ uuid, libraryUuid, x, y, subPartName = '', rotation = 0, mirror = false, addIntoBom = true, addIntoPcb = true }) {
	if (!uuid || !libraryUuid) {
		throw new Error('uuid 与 libraryUuid 必填且不可为空');
	}
	if (typeof subPartName !== 'string') {
		throw new Error('subPartName 必须为字符串（可为空字符串）');
	}
	const canvasSize = await getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	if(x < 0 || x > canvasWidth || y < 0 || y > canvasHeight) {
		throw new Error('x,y不能超过画布边界');
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
	return { content: comp };
}

/**
 * 批量在原理图放置元件（必须使用设备 uuid,subPartName 必填即便为空字符串）
 */
async function sch_PrimitiveComponent$createBatch({ components }) {
	if (!Array.isArray(components) || components.length === 0) {
		throw new Error('components 必填且必须为非空数组');
	}
	
	// 批量调用单个函数
	const results = [];
	for (let i = 0; i < components.length; i++) {
		const comp = components[i];
		try {
			const result = await sch_PrimitiveComponent$create({
				uuid: comp.uuid,
				libraryUuid: comp.libraryUuid,
				x: comp.x,
				y: comp.y,
				subPartName: comp.subPartName,
				rotation: comp.rotation,
				mirror: comp.mirror,
				addIntoBom: comp.addIntoBom,
				addIntoPcb: comp.addIntoPcb,
			});
			results.push(result.content);
		} catch (error) {
			throw new Error(`components[${i}]: ${error.message}`);
		}
	}
	return { content: results };
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
 * 获取元件引脚列表,可选 y 轴取反
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
 * 批量获取多个元件的引脚列表,可选 y 轴取反
 * 返回格式：{ [primitiveId]: pins[] }
 */
async function sch_PrimitiveComponent$getAllPinsByPrimitiveIdBatch({ primitiveIds, invertY = true }) {
	if (!Array.isArray(primitiveIds) || primitiveIds.length === 0) {
		throw new Error('primitiveIds 必填且必须为非空数组');
	}
	
	// 批量调用单个函数
	const results = {};
	for (const primitiveId of primitiveIds) {
		if (!primitiveId) {
			throw new Error('primitiveIds 中的每个元素不能为空');
		}
		const result = await sch_PrimitiveComponent$getAllPinsByPrimitiveId({ primitiveId, invertY });
		results[primitiveId] = result.content;
	}
	return { content: results };
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
	const canvasSize = await getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	if(property.x < 0 || property.x > canvasWidth || property.y < 0 || property.y > canvasHeight) {
		throw new Error('x,y不能超过画布边界');
	}
	const comp = await eda.sch_PrimitiveComponent.modify(primitiveId, property);
	return { content: comp };
}

/**
 * 创建原理图导线;line参数必须为连续坐标数组（长度为偶数且不少于4）,例如:[x1,y1,x2,y2,x3,y3,x4,y4];x,y不能超过画布边界
 * @param {*} param0 
 * @returns 
 */
async function sch_PrimitiveWire$create({ line, net = null, color = '#000000', lineWidth = 1, lineType = 0 }) {
	if (!Array.isArray(line) || line.length < 4 || line.length % 2 !== 0) {
		throw new Error('line 必须是长度不少于4且为偶数的坐标数组');
	}
	if (color === null || color === undefined) {
		throw new Error('color 可以不传,但必须不能为null或undefined');
	}
	const canvasSize = await getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	for(let i = 0; i < line.length; i += 2) {
		if(line[i] < 0 || line[i] > canvasWidth || line[i + 1] < 0 || line[i + 1] > canvasHeight) {
			throw new Error('line中的x,y不能超过画布边界');
		}
	}
	const wire = await eda.sch_PrimitiveWire.create(line, net, color, lineWidth, lineType);
	return { content: wire };
}

/**
 * 批量创建原理图导线
 * @param {Object} params 参数对象
 * @param {Array} params.wires 导线数组,每个元素格式：{line: Array<number>, net?: string, color?: string, lineWidth?: number, lineType?: number}
 * @returns {Object} 返回格式: { content: Array } 创建的导线对象数组
 */
async function sch_PrimitiveWire$createBatch({ wires }) {
	if (!Array.isArray(wires) || wires.length === 0) {
		throw new Error('wires 必填且必须为非空数组');
	}
	
	// 批量调用单个函数
	const results = [];
	for (let i = 0; i < wires.length; i++) {
		const wire = wires[i];
		try {
			const result = await sch_PrimitiveWire$create({
				line: wire.line,
				net: wire.net,
				color: wire.color,
				lineWidth: wire.lineWidth,
				lineType: wire.lineType,
			});
			results.push(result.content);
		} catch (error) {
			throw new Error(`wires[${i}]: ${error.message}`);
		}
	}
	return { content: results };
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
 * 修改原理图导线;x,y不能超过画布边界
 * @param {*} param0 
 * @returns 
 */
async function sch_PrimitiveWire$modify({ primitiveId, property }) {
	if (!primitiveId) {
		throw new Error('primitiveId 必填');
	}
	if (!property || typeof property !== 'object') {
		throw new Error('property 必填且必须为对象');
	}
	const canvasSize = await getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	for(let i = 0; i < property.line.length; i += 2) {
		if(property.line[i] < 0 || property.line[i] > canvasWidth || property.line[i + 1] < 0 || property.line[i + 1] > canvasHeight) {
			throw new Error('line中的x,y不能超过画布边界');
		}
	}
	const wire = await eda.sch_PrimitiveWire.modify(primitiveId, property);
	return { content: wire };
}

/**
 * 创建原理图多边形;line参数必须为连续坐标数组（长度为偶数且不少于6,至少4个点,必须闭合）,x,y不能超过画布边界,例如:[x1,y1,x2,y2,x3,y3,x1,y1]
 * @param {*} param0 
 * @returns 
 */
async function sch_PrimitivePolygon$create({ line, color = null, fillColor = null, lineWidth = null, lineType = null }) {
	// line 必须为长度不少于8且为偶数的坐标数组（至少4点且必须闭合,首尾点必须相同）
	if (!Array.isArray(line) || line.length < 8 || line.length % 2 !== 0 || `${line[0]}${line[1]}` !== `${line[line.length - 2]}${line[line.length - 1]}`) {
		throw new Error('line 必须是长度不少于8且为偶数的坐标数组,至少包含4点且必须闭合');
	}
	const canvasSize = await getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	for(let i = 0; i < line.length; i += 2) {
		if(line[i] < 0 || line[i] > canvasWidth || line[i + 1] < 0 || line[i + 1] > canvasHeight) {
			throw new Error('line中的x,y不能超过画布边界');
		}
	}
	// color 可为字符串或 null,不允许 undefined
	if (color === undefined) {
		throw new Error('color 若不传请设为 null,不能为 undefined');
	}
	// 调用原生 API 创建多边形
	const polygon = await eda.sch_PrimitivePolygon.create(line, color, fillColor, lineWidth, lineType);
	// 返回统一的 content 包装
	return { content: polygon };
}

/**
 * 批量创建原理图多边形
 * @param {Object} params 参数对象
 * @param {Array} params.boundsList 边界数组,每个元素格式：{line: Array<number>, color?: string|null, fillColor?: string|null, lineWidth?: number|null, lineType?: number|null}
 * @returns {Object} 返回格式: { content: Array } 创建的多边形对象数组
 */
async function sch_PrimitivePolygon$createBatch({ boundsList }) {
	if (!Array.isArray(boundsList) || boundsList.length === 0) {
		throw new Error('boundsList 必填且必须为非空数组');
	}
	
	// 批量调用单个函数
	const results = [];
	for (let i = 0; i < boundsList.length; i++) {
		const bounds = boundsList[i];
		try {
			const result = await sch_PrimitivePolygon$create({
				line: bounds.line,
				color: bounds.color,
				fillColor: bounds.fillColor,
				lineWidth: bounds.lineWidth,
				lineType: bounds.lineType,
			});
			results.push(result.content);
		} catch (error) {
			throw new Error(`boundsList[${i}]: ${error.message}`);
		}
	}
	return { content: results };
}

// 删除原理图多边形
async function sch_PrimitivePolygon$delete({ primitiveIds }) {
	// primitiveIds 必填,可为单个 ID 或 ID 数组
	if (!primitiveIds) {
		throw new Error('primitiveIds 必填');
	}
	// 调用原生 API 删除多边形
	const result = await eda.sch_PrimitivePolygon.delete(primitiveIds);
	// 返回统一的 content 包装
	return { content: result };
}

// 获取全部原理图多边形
async function sch_PrimitivePolygon$getAll() {
	// 调用原生 API 获取全部多边形
	const result = await eda.sch_PrimitivePolygon.getAll();
	// 返回统一的 content 包装
	return { content: result };
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
 * @param {Array} params.pins 引脚坐标列表,格式：[{x: number, y: number}, ...]
 * @param {number} params.expandMil 引脚膨胀距离（默认10mil）
 * @returns {Object} 返回格式: { content: Array } 矩形边界顶点坐标,格式：[x1,y1,x2,y2,x3,y3,x4,y4]（顺时针顺序：左下、右下、右上、左上）
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
			console.warn(`无效引脚坐标：${JSON.stringify(pin)},已忽略`);
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

/**
 * 批量计算多个原理图元件的矩形边界
 * @param {Object} params 参数对象
 * @param {Array<Array>} params.pinsList 多个元件的引脚坐标列表数组,每个元素格式：[{x: number, y: number}, ...]
 * @param {number} params.expandMil 引脚膨胀距离（默认10mil）
 * @returns {Object} 返回格式: { content: Array } 边界数组,每个元素格式：[x1,y1,x2,y2,x3,y3,x4,y4]（顺时针顺序：左下、右下、右上、左上）
 */
async function calculateComponentBoundsBatch({ pinsList, expandMil = 10 }) {
	if (!Array.isArray(pinsList) || pinsList.length === 0) {
		throw new Error('pinsList 必填且必须为非空数组');
	}
	
	// 批量调用单个函数
	const results = [];
	for (const pins of pinsList) {
		const result = await calculateComponentBounds({ pins, expandMil });
		results.push(result.content);
	}
	return { content: results };
}

/**查询所有已选中图元的图元对象
 * @returns {Object} 返回格式: { content: Array } 图元对象列表,格式：[{primitiveId: string, x: number, y: number, rotation: number, mirror: boolean, addIntoBom: boolean, addIntoPcb: boolean, designator: string|null, name: string|null, uniqueId: string|null, manufacturer: string|null, manufacturerId: string|null, supplier: string|null, supplierId: string|null, otherProperty: {[key:string]:string|number|boolean}}]
 */
async function sch_SelectControl$getAllSelectedPrimitives() {
	const result = await eda.sch_SelectControl.getAllSelectedPrimitives();
	return { content: result };
}

/**
 * 使用图元 ID 选中图元
 * @param {Object} params 参数对象
 * @param {string|Array<string>} params.primitiveIds 图元 ID，可以是单个ID或ID数组
 * @returns {Object} 返回格式: { content: any } 选择操作结果
 */
async function sch_SelectControl$doSelectPrimitives({ primitiveIds }) {
	if (!primitiveIds) {
		throw new Error('primitiveIds 必填');
	}
	const result = await eda.sch_SelectControl.doSelectPrimitives(primitiveIds);
	return { content: result };
}

/**
 * 清除选中状态
 * @returns {Object} 返回格式: { content: any } 清除操作结果
 */
async function sch_SelectControl$clearSelected() {
	const result = await eda.sch_SelectControl.clearSelected();
	return { content: result };
}

/**
 * 获取当前鼠标在画布上的位置
 * @returns {Object} 返回格式: { content: { x: number, y: number } } 鼠标位置坐标
 */
async function sch_SelectControl$getCurrentMousePosition() {
	const result = await eda.sch_SelectControl.getCurrentMousePosition();
	return { content: result };
}

/**
 * 缩放到已选中图元（适应选中）
 * @param {Object} params 参数对象
 * @param {string} params.tabId 标签页 ID，如若未传入，则为最后输入焦点的画布（可选）
 * @returns {Object} 返回格式: { content: any } 缩放操作结果
 */
async function dmt_EditorControl$zoomToSelectedPrimitives({ tabId = null }) {
	const result = await eda.dmt_EditorControl.zoomToSelectedPrimitives(tabId);
	return { content: result };
}


window.customeTools = {
	searchTools,//搜索原生API列表
	getCanvasSize,//获取图纸边界(画布大小)
	lib_Device$search,//元件搜索
	sch_PrimitiveComponent$create,//在原理图放置单个元件
	sch_PrimitiveComponent$createBatch,//批量在原理图放置元件
	sch_PrimitiveComponent$getAllPinsByPrimitiveId,//获取单个元件的引脚列表
	sch_PrimitiveComponent$getAllPinsByPrimitiveIdBatch,//批量获取引脚坐标
	sch_PrimitiveComponent$getAll,//获取当前原理图中的所有元件列表
	sch_PrimitiveComponent$modify,//修改原理图元件
	sch_PrimitiveComponent$delete,//删除原理图元件
	calculateComponentBounds,//计算原理图元件的矩形边界
	calculateComponentBoundsBatch,//批量计算多个原理图元件的矩形边界
	sch_PrimitiveWire$create,//在原理图放置单条导线
	sch_PrimitiveWire$createBatch,//批量在原理图放置导线
	sch_PrimitiveWire$modify,//修改原理图导线
	sch_PrimitiveWire$delete,//删除原理图导线
	sch_PrimitiveWire$getAll,//获取当前原理图中的所有导线列表
	sch_PrimitivePolygon$create,//在原理图放置多边形
	sch_PrimitivePolygon$createBatch,//批量在原理图放置多边形
	sch_PrimitivePolygon$delete,//删除原理图多边形
	sch_PrimitivePolygon$getAll,//获取全部原理图多边形
	sys_FileManager$getDocumentFootprintSources,//获取文档中所有封装的源码信息
	sch_SelectControl$getAllSelectedPrimitives,//查询所有已选中图元的图元对象
	sch_SelectControl$doSelectPrimitives,//使用图元 ID 选中图元
	sch_SelectControl$clearSelected,//清除选中状态
	sch_SelectControl$getCurrentMousePosition,//获取当前鼠标在画布上的位置
	dmt_EditorControl$zoomToSelectedPrimitives,//缩放到已选中图元（适应选中）
	toolDescriptions: [
		{
			name: 'searchTools',
			description: `
搜索原生API列表,并按权重降序排序,返回权重最高的前十条结果;
由于原生API数量庞大,而且可能有错误导致无法使用,所以只能通过密集的关键词来搜索,不能列出所有的API,谨慎使用
参数:
	keywords: 关键词数组,支持多个中英文混合的关键词组合搜索,关键词越多,最终搜索结果越精准,多个关键词使用OR逻辑;
返回值:
	tools: 工具列表,最多返回10条结果,按权重降序排序;
			`,
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
			description: `
获取图纸边界(画布大小);
所有元件/导线不能超过该范围;
单位:mil;
`,
			inputSchema: {
				type: 'object',
				properties: {},
				required: [],
			},
		},
		{
			name: 'lib_Device$search',
			description: `
元件搜索;
带分页参数(itemsOfPage/page)时必须提供 libraryUuid;
返回 lib_Device.search 结果;
`,
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
			description: `
在原理图放置单个元件;
x,y不能超过画布边界;
如果有多个元件要放置,强烈建议使用 sch_PrimitiveComponent$createBatch 批量操作以提高效率;
`,
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
			name: 'sch_PrimitiveComponent$createBatch',
			description: `
批量在原理图放置元件;
x,y不能超过画布边界;
如果有多个元件要放置,必须使用此批量操作而不是逐个调用 sch_PrimitiveComponent$create;
`,
			inputSchema: {
				type: 'object',
				properties: {
					components: {
						type: 'array',
						items: {
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
							required: ['uuid', 'libraryUuid', 'x', 'y']
						}
					},
				},
				required: ['components'],
			},
		},
		{
			name: 'sch_PrimitiveComponent$getAll',
			description: `
获取当前原理图中的所有元件列表;
可选 cmdKey（筛选条件）和 allSchematicPages（是否获取所有页面）;
`,
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
			description: `
删除原理图元件;
primitiveIds可以是单个图元ID(string)或图元ID数组(Array<string>);
`,
			inputSchema: {
				type: 'object',
				properties: {
					primitiveIds: {
						oneOf: [
							{ type: 'string' },
							{ type: 'array', items: { type: 'string' } }
						],
						description: '器件的图元 ID 或器件图元对象,可以是单个ID或ID数组'
					}
				},
				required: ['primitiveIds']
			},
		},
		{
			name: 'sch_PrimitiveComponent$getAllPinsByPrimitiveId',
			description: `
获取单个元件的引脚列表;
如果有多个元件要获取引脚坐标,强烈建议使用 sch_PrimitiveComponent$getAllPinsByPrimitiveIdBatch 批量操作以提高效率;
`,
			inputSchema: {
				type: 'object',
				properties: {
					primitiveId: { type: 'string' },
					// invertY: { type: 'boolean' },
				},
				required: ['primitiveId'],
			},
		},
		{
			name: 'sch_PrimitiveComponent$getAllPinsByPrimitiveIdBatch',
			description: `
批量获取多个元件的引脚列表;
返回格式：{ [primitiveId]: pins[] };
如果有多个元件要获取引脚坐标,必须使用此批量操作而不是逐个调用 sch_PrimitiveComponent$getAllPinsByPrimitiveId;
`,
			inputSchema: {
				type: 'object',
				properties: {
					primitiveIds: {
						type: 'array',
						items: { type: 'string' }
					},
					invertY: { type: 'boolean' },
				},
				required: ['primitiveIds'],
			},
		},
		{
			name: 'sch_PrimitiveComponent$modify',
			description: `
修改原理图元件;
x,y不能超过画布边界;
`,
			inputSchema: {
				type: 'object',
				properties: {
					primitiveId: {
						type: 'string',
						description: '图元 ID'
					},
					property: {
						type: 'object',
						description: '需要修改的参数对象,支持：x?:number, y?:number, rotation?:number, mirror?:boolean, addIntoBom?:boolean, addIntoPcb?:boolean, designator?:string|null, name?:string|null, uniqueId?:string|null, manufacturer?:string|null, manufacturerId?:string|null, supplier?:string|null, supplierId?:string|null, otherProperty?:{[key:string]:string|number|boolean}',
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
			description: `
计算单个原理图元件的矩形边界;
根据元件的引脚坐标列表计算元件的最小外接矩形,支持引脚膨胀距离设置(expandMil);
返回矩形边界顶点坐标数组（顺时针顺序：左下、右下、右上、左上）,格式：[x1,y1,x2,y2,x3,y3,x4,y4];
如果有多个元件要计算边界,强烈建议使用 calculateComponentBoundsBatch 批量操作以提高效率;
`,
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
			name: 'calculateComponentBoundsBatch',
			description: `
批量计算多个原理图元件的矩形边界;
根据多个元件的引脚坐标列表数组计算每个元件的最小外接矩形,支持引脚膨胀距离设置(expandMil);
返回边界数组,每个元素格式：[x1,y1,x2,y2,x3,y3,x4,y4]（顺时针顺序：左下、右下、右上、左上）;
如果有多个元件要计算边界,必须使用此批量操作而不是逐个调用 calculateComponentBounds;
`,
			inputSchema: {
				type: 'object',
				properties: {
					pinsList: {
						type: 'array',
						items: {
							type: 'array',
							items: {
								type: 'object',
								properties: {
									x: { type: 'number' },
									y: { type: 'number' }
								},
								required: ['x', 'y']
							}
						}
					},
					expandMil: { type: 'number' }
				},
				required: ['pinsList']
			},
		},
		{
			name: 'sch_PrimitiveWire$create',
			description: `
创建单条原理图导线;
line参数必须为连续坐标数组（长度为偶数且不少于4）,例如:[x1,y1,x2,y2,x3,y3,x4,y4];
x,y不能超过画布边界;
如果有多条导线要创建,强烈建议使用 sch_PrimitiveWire$createBatch 批量操作以提高效率;
`,
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
			name: 'sch_PrimitiveWire$createBatch',
			description: `
批量创建多条原理图导线;
line参数必须为连续坐标数组（长度为偶数且不少于4）,例如:[x1,y1,x2,y2,x3,y3,x4,y4];
x,y不能超过画布边界;
如果有多条导线要创建,必须使用此批量操作而不是逐个调用 sch_PrimitiveWire$create;
`,
			inputSchema: {
				type: 'object',
				properties: {
					wires: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								line: { type: 'array', items: { type: 'number' } },
								net: { type: 'string' },
								color: { type: 'string' },
								lineWidth: { type: 'number' },
								lineType: { type: 'number' },
							},
							required: ['line']
						}
					},
				},
				required: ['wires'],
			},
		},
		{
			name: 'sch_PrimitiveWire$delete',
			description: `
删除原理图导线;
primitiveIds可以是单个图元ID(string)或图元ID数组(Array<string>);
`,
			inputSchema: {
				type: 'object',
				properties: {
					primitiveIds: {
						oneOf: [
							{ type: 'string' },
							{ type: 'array', items: { type: 'string' } }
						],
						description: '导线的图元 ID 或导线图元对象,可以是单个ID或ID数组'
					}
				},
				required: ['primitiveIds']
			},
		},
		{
			name: 'sch_PrimitiveWire$modify',
			description: `
修改原理图导线;
x,y不能超过画布边界;
`,
			inputSchema: {
				type: 'object',
				properties: {
					primitiveId: {
						type: 'string',
						description: '导线的图元 ID 或导线图元对象'
					},
					property: {
						type: 'object',
						description: '修改参数对象,支持：line?:Array<number>|Array<Array<number>>, net?:string, color?:string|null, lineWidth?:number|null, lineType?:ESCH_PrimitiveLineType|null',
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
			description: `
获取所有原理图导线;
可选net参数（网络名称）进行筛选;
net可以是单个网络名称(string)或网络名称数组(Array<string>);
`,
			inputSchema: {
				type: 'object',
				properties: {
					net: {
						oneOf: [
							{ type: 'string' },
							{ type: 'array', items: { type: 'string' } }
						],
						description: '网络名称,可选,用于筛选特定网络的导线'
					}
				},
				required: []
			},
		},
		{
			name: 'sch_PrimitivePolygon$create',
			description: `
创建单个多边形;
line参数必须为连续坐标数组（长度为偶数且不少于8,至少4点）;
x,y不能超过画布边界;
如果有多个边界要绘制,强烈建议使用 sch_PrimitivePolygon$createBatch 批量操作以提高效率;
`,
			inputSchema: {
				type: 'object',
				properties: {
					line: { type: 'array', items: { type: 'number' } },
					color: { type: ['string', 'null'] },
					fillColor: { type: ['string', 'null'] },
					lineWidth: { type: ['number', 'null'] },
					lineType: { 
						type: 'number', 
						enum: [0,1,2,3], 
						description: '线型,0:实线,1:虚线,2:点划线,3:点线'
					}
				},
				required: ['line']
			},
		},
		{
			name: 'sch_PrimitivePolygon$createBatch',
			description: `
批量创建多个多边形;
line参数必须为连续坐标数组（长度为偶数且不少于8,至少4点）;
x,y不能超过画布边界;
如果有多个边界要绘制,必须使用此批量操作而不是逐个调用 sch_PrimitivePolygon$create;
`,
			inputSchema: {
				type: 'object',
				properties: {
					boundsList: {
						type: 'array',
						items: {
							type: 'object',
							properties: {
								line: { type: 'array', items: { type: 'number' } },
								color: { type: ['string', 'null'] },
								fillColor: { type: ['string', 'null'] },
								lineWidth: { type: ['number', 'null'] },
								lineType: { 
									type: 'number', 
									enum: [0,1,2,3], 
									description: '线型,0:实线,1:虚线,2:点划线,3:点线'
								}
							},
							required: ['line']
						}
					},
				},
				required: ['boundsList'],
			},
		},
		{
			name: 'sch_PrimitivePolygon$delete',
			description: `
删除多边形;
primitiveIds 可以是单个 ID 或 ID 数组;
`,
			inputSchema: {
				type: 'object',
				properties: {
					primitiveIds: {
						oneOf: [
							{ type: 'string' },
							{ type: 'array', items: { type: 'string' } }
						],
						description: '多边形的图元 ID 或多边形图元对象,可以是单个ID或ID数组'
					}
				},
				required: ['primitiveIds']
			},
		},
		{
			name: 'sch_PrimitivePolygon$getAll',
			description: `
获取全部多边形;
无参数;
`,
			inputSchema: {
				type: 'object',
				properties: {},
				required: []
			},
		},
		{
			name: 'sys_FileManager$getDocumentFootprintSources',
			description: `
获取文档中所有封装的源码信息;
返回封装UUID和对应的文档源码字符串;
`,
			inputSchema: {
				type: 'object',
				properties: {},
				required: [],
			},
		},
		{
			name: 'sch_SelectControl$getAllSelectedPrimitives',
			description: `
查询所有已选中图元的图元对象;
返回图元对象列表,包含完整属性信息;
`,
			inputSchema: {
				type: 'object',
				properties: {},
				required: [],
			},
		},
		{
			name: 'sch_SelectControl$doSelectPrimitives',
			description: `
使用图元 ID 选中图元;
primitiveIds可以是单个图元ID(string)或图元ID数组(Array<string>);
用于主动选择指定的图元;
`,
			inputSchema: {
				type: 'object',
				properties: {
					primitiveIds: {
						oneOf: [
							{ type: 'string' },
							{ type: 'array', items: { type: 'string' } }
						],
						description: '图元 ID，可以是单个ID或ID数组'
					}
				},
				required: ['primitiveIds']
			},
		},
		{
			name: 'sch_SelectControl$clearSelected',
			description: `
清除所有选中状态;
无参数;
用于取消当前所有图元的选择;
`,
			inputSchema: {
				type: 'object',
				properties: {},
				required: [],
			},
		},
		{
			name: 'sch_SelectControl$getCurrentMousePosition',
			description: `
获取当前鼠标在画布上的位置;
返回鼠标的x,y坐标;
用于感知用户鼠标位置,实现交互功能;
`,
			inputSchema: {
				type: 'object',
				properties: {},
				required: [],
			},
		},
		{
			name: 'dmt_EditorControl$zoomToSelectedPrimitives',
			description: `
缩放到已选中图元（适应选中）;
用于将视图缩放到选中图元的位置,提供交互反馈;
tabId:标签页ID,如若未传入,则为最后输入焦点的画布(可选);
`,
			inputSchema: {
				type: 'object',
				properties: {
					tabId: { type: 'string', description: '标签页 ID，如若未传入，则为最后输入焦点的画布' }
				},
				required: [],
			},
		},
	],
};

