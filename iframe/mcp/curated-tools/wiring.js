// 精选工具 · 布线域(wiring_design)
// 本文件仅声明本域的 const *_SCHEMA 与 async function,不挂载 window;统一由 curated-tools/index.js 聚合挂载。

/**
 * 创建单条原理图导线。
 * 校验 line 为偶数长度且不少于4、坐标不越界画布,color 须明确(禁止 null/undefined);
 * 校验通过后调用原生 API 创建。
 * @param {Object} params 含 line(连续坐标数组)/net/color/lineWidth/lineType
 * @returns {Promise<{content: Object}>} 新建导线对象
 */
const SCH_PRIMITIVE_WIRE_CREATE_SCHEMA = {
	name: 'sch_PrimitiveWire$create',
	description: '创建单条原理图导线;line 为连续坐标数组(偶数长度、不少于4),坐标不得超出画布边界',
	inputSchema: {
		type: 'object',
		properties: {
			line: { type: 'array', items: { type: 'number' }, description: '连续坐标数组 [x1,y1,x2,y2,...]' },
			net: { type: 'string', description: '网络名(可选)' },
			color: { type: 'string', description: '导线颜色,默认 #000000' },
			lineWidth: { type: 'number', description: '线宽,默认 1' },
			lineType: { type: 'number', description: '线型,默认 0(实线)' },
		},
		required: ['line'],
	},
	semantic_tags: ['导线', '布线', '45°', 'lineType'],
	source: 'curated',
	domain: 'wiring_design',
};

async function sch_PrimitiveWire$create({ line, net = null, color = '#000000', lineWidth = 1, lineType = 0 }) {
	if (!Array.isArray(line) || line.length < 4 || line.length % 2 !== 0) {
		throw new Error('line 必须是长度不少于4且为偶数的坐标数组');
	}
	if (color === null || color === undefined) {
		throw new Error('color 可以不传,但必须不能为null或undefined');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	for(let i = 0; i < line.length; i += 2) {
		assertInCanvas(line[i], line[i + 1], canvasWidth, canvasHeight);
	}
	const wire = await eda.sch_PrimitiveWire.create(line, net, color, lineWidth, lineType);
	return { content: wire };
}

/**
 * 批量创建多条原理图导线。
 * 遍历 wires 数组逐个复用单条创建;任一条失败抛出带索引错误并中断。
 * @param {{wires: Array}} params 导线参数数组
 * @returns {Promise<{content: Array}>} 各导线创建结果集合
 */
const SCH_PRIMITIVE_WIRE_CREATE_BATCH_SCHEMA = {
	name: 'sch_PrimitiveWire$createBatch',
	description: '批量创建多条原理图导线;每条 line 为连续坐标数组(偶数长度、不少于4),坐标不得超出画布边界',
	inputSchema: {
		type: 'object',
		properties: {
			wires: {
				type: 'array',
				description: '导线数组,每项为一个待创建导线',
				items: {
					type: 'object',
					properties: {
						line: { type: 'array', items: { type: 'number' }, description: '连续坐标数组' },
						net: { type: 'string', description: '网络名(可选)' },
						color: { type: 'string', description: '导线颜色' },
						lineWidth: { type: 'number', description: '线宽' },
						lineType: { type: 'number', description: '线型' },
					},
					required: ['line']
				}
			},
		},
		required: ['wires'],
	},
	semantic_tags: ['导线', '批量', '布线'],
	source: 'curated',
	domain: 'wiring_design',
};

async function sch_PrimitiveWire$createBatch({ wires }) {
	const results = await batchWrap(wires, 'wires', async (wire) => {
		const result = await window.curatedTools.sch_PrimitiveWire$create({
			line: wire.line,
			net: wire.net,
			color: wire.color,
			lineWidth: wire.lineWidth,
			lineType: wire.lineType,
		});
		return result.content;
	});
	return { content: results };
}

/**
 * 删除原理图导线。
 * primitiveIds 支持单个 ID 或 ID 数组,统一透传原生 API 删除。
 * @param {Object} params 含 primitiveIds(单个/数组)
 * @returns {Promise<{content: Object}>} 删除结果
 */
const SCH_PRIMITIVE_WIRE_DELETE_SCHEMA = {
	name: 'sch_PrimitiveWire$delete',
	description: '删除原理图导线;primitiveIds 支持单个图元 ID 或 ID 数组',
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
	semantic_tags: ['导线', '删除'],
	source: 'curated',
	domain: 'wiring_design',
};

async function sch_PrimitiveWire$delete({ primitiveIds }) {
	if (!primitiveIds) {
		throw new Error('primitiveIds 必填');
	}
	const result = await eda.sch_PrimitiveWire.delete(primitiveIds);
	return { content: result };
}

/**
 * 获取所有原理图导线(可选按网络名筛选,无参数返回全部)。
 * @param {{net?: string|Array}} [params] 可选网络名筛选
 * @returns {Promise<{content: Array}>} 导线对象列表
 */
const SCH_PRIMITIVE_WIRE_GET_ALL_SCHEMA = {
	name: 'sch_PrimitiveWire$getAll',
	description: '获取所有原理图导线;可选 net 按网络名筛选',
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
	semantic_tags: ['导线', '列表', '查询', '网络'],
	source: 'curated',
	domain: 'wiring_design',
};

async function sch_PrimitiveWire$getAll({ net = null }) {
	const result = await eda.sch_PrimitiveWire.getAll(net);
	return { content: result };
}

/**
 * 修改原理图导线坐标/属性。
 * primitiveId 与 property 均必填;若修改 line,校验新坐标不越界画布后透传原生 API。
 * @param {Object} params 含 primitiveId 与 property(待修改属性)
 * @returns {Promise<{content: Object}>} 修改后的导线对象
 */
const SCH_PRIMITIVE_WIRE_MODIFY_SCHEMA = {
	name: 'sch_PrimitiveWire$modify',
	description: '修改原理图导线坐标/属性;新 line 坐标不得超出画布边界',
	inputSchema: {
		type: 'object',
		properties: {
			primitiveId: {
				type: 'string',
				description: '导线图元 ID(必填)'
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
	semantic_tags: ['导线', '修改', '属性'],
	source: 'curated',
	domain: 'wiring_design',
};

async function sch_PrimitiveWire$modify({ primitiveId, property }) {
	if (!primitiveId) {
		throw new Error('primitiveId 必填');
	}
	if (!property || typeof property !== 'object') {
		throw new Error('property 必填且必须为对象');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	for(let i = 0; i < property.line.length; i += 2) {
		assertInCanvas(property.line[i], property.line[i + 1], canvasWidth, canvasHeight);
	}
	const wire = await eda.sch_PrimitiveWire.modify(primitiveId, property);
	return { content: wire };
}
