// 精选工具 · 元件域(component_design + 边界计算 + 封装源码)
// 本文件仅声明本域的 const *_SCHEMA 与 async function,不挂载 window;统一由 curated-tools/index.js 聚合挂载。
// 普通 script 共享全局作用域:各 *_SCHEMA 与函数名全局唯一,无重名。

/**
 * 获取当前图纸的画布边界尺寸。
 * 优先从文档源码(sys_FileManager.getDocumentSource)解析 Width/Height 属性;
 * 解析失败或缺失时回退默认 1170×825 mil。返回结构含 width/height(类型+数值)。
 * @returns {Promise<{content: {width: {type: string, value: number}, height: {type: string, value: number}}}>} 画布尺寸
 */
const GET_CANVAS_SIZE_SCHEMA = {
	name: 'getCanvasSize',
	description: '获取图纸边界(画布宽高,单位 mil);元件/导线布局不得超出此范围',
	inputSchema: {
		type: 'object',
		properties: {},
		required: [],
	},
	semantic_tags: ['画布', '边界', '尺寸', 'mil'],
	source: 'curated',
	domain: 'component_design',
};

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
 * 按关键词搜索元件库;使用分页参数时必须提供 libraryUuid。
 * keyword 必填且须为字符串;若携带分页参数(itemsOfPage/page)则必须同时提供 libraryUuid。
 * 无分页参数时仅传 keyword;有分页参数时补齐完整签名(含 uuid 与分页参数)调用原生搜索。
 * @param {{keyword: string, libraryUuid?: string, itemsOfPage?: number, page?: number}} params 搜索关键词与可选分页参数
 * @returns {Promise<{content: Array}>} 元件库存档列表
 */
const LIB_DEVICE_SEARCH_SCHEMA = {
	name: 'lib_Device$search',
	description: '按关键词搜索元件库;使用分页参数时必须提供 libraryUuid',
	inputSchema: {
		type: 'object',
		properties: {
			keyword: { type: 'string', description: '搜索关键词(必填)' },
			libraryUuid: { type: 'string', description: '元件库 UUID,分页时必填' },
			itemsOfPage: { type: 'number', description: '每页条数(分页参数)' },
			page: { type: 'number', description: '页码(分页参数)' },
		},
		required: ['keyword'],
	},
	semantic_tags: ['元件', '搜索', '库', '分页'],
	source: 'curated',
	domain: 'component_design',
};

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
 * 创建单个元件。
 * 按参数在指定位置/旋转/镜像下放置元件;libraryPath+componentName 与 symbolPath+pcbLibPath 两种来源二选一。
 * @param {Object} params 含 libraryPath/componentName/centerX/centerY/rotation/mirror/symbolPath/pcbLibPath
 * @returns {Promise<{content: Object}>} 新元件对象
 */
const SCH_PRIMITIVE_COMPONENT_CREATE_SCHEMA = {
	name: 'sch_PrimitiveComponent$create',
	description: '在原理图放置单个元件;坐标不得超出画布边界,subPartName 必填(可空字符串)',
	inputSchema: {
		type: 'object',
		properties: {
			uuid: { type: 'string', description: '元件 UUID(必填)' },
			libraryUuid: { type: 'string', description: '元件库 UUID(必填)' },
			x: { type: 'number', description: '放置 X 坐标(必填)' },
			y: { type: 'number', description: '放置 Y 坐标(必填)' },
			subPartName: { type: 'string', description: '子部件名,可为空字符串' },
			rotation: { type: 'number', description: '旋转角度,默认 0' },
			mirror: { type: 'boolean', description: '是否镜像,默认 false' },
			addIntoBom: { type: 'boolean', description: '是否加入 BOM,默认 true' },
			addIntoPcb: { type: 'boolean', description: '是否同步到 PCB,默认 true' },
		},
		required: ['uuid', 'libraryUuid', 'x', 'y'],
	},
	semantic_tags: ['元件', '放置', '边界', 'subPartName'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveComponent$create({ uuid, libraryUuid, x, y, subPartName = '', rotation = 0, mirror = false, addIntoBom = true, addIntoPcb = true }) {
	if (!uuid || !libraryUuid) {
		throw new Error('uuid 与 libraryUuid 必填且不可为空');
	}
	if (typeof subPartName !== 'string') {
		throw new Error('subPartName 必须为字符串（可为空字符串）');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	assertInCanvas(x, y, canvasWidth, canvasHeight);
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
 * 批量创建元件。
 * 遍历 components 数组逐个调用单条创建;任一条失败则抛出带索引的错误并中断。
 * @param {{components: Array}} params 元件参数数组
 * @returns {Promise<{content: Array}>} 各元件创建结果集合
 */
const SCH_PRIMITIVE_COMPONENT_CREATE_BATCH_SCHEMA = {
	name: 'sch_PrimitiveComponent$createBatch',
	description: '批量在原理图放置多个元件;坐标不得超出画布边界;多元件优先用本工具',
	inputSchema: {
		type: 'object',
		properties: {
			components: {
				type: 'array',
				description: '元件数组,每项为一个待放置元件',
				items: {
					type: 'object',
					properties: {
						uuid: { type: 'string', description: '元件 UUID' },
						libraryUuid: { type: 'string', description: '元件库 UUID' },
						x: { type: 'number', description: '放置 X 坐标' },
						y: { type: 'number', description: '放置 Y 坐标' },
						subPartName: { type: 'string', description: '子部件名,可为空字符串' },
						rotation: { type: 'number', description: '旋转角度' },
						mirror: { type: 'boolean', description: '是否镜像' },
						addIntoBom: { type: 'boolean', description: '是否加入 BOM' },
						addIntoPcb: { type: 'boolean', description: '是否同步到 PCB' },
					},
					required: ['uuid', 'libraryUuid', 'x', 'y']
				}
			},
		},
		required: ['components'],
	},
	semantic_tags: ['元件', '批量', '放置'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveComponent$createBatch({ components }) {
	const results = await batchWrap(components, 'components', async (comp) => {
		const result = await window.curatedTools.sch_PrimitiveComponent$create({
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
		return result.content;
	});
	return { content: results };
}

/**
 * 删除元件。
 * primitiveIds 支持单个图元 ID 或 ID 数组,统一透传原生 API 删除。
 * @param {Object} params 含 primitiveIds(单个/数组字符串)
 * @returns {Promise<{content: Object}>} 删除结果
 */
const SCH_PRIMITIVE_COMPONENT_DELETE_SCHEMA = {
	name: 'sch_PrimitiveComponent$delete',
	description: '删除原理图元件;primitiveIds 支持单个图元 ID 或 ID 数组',
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
	semantic_tags: ['元件', '删除'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveComponent$delete({ primitiveIds }) {
	if (!primitiveIds) {
		throw new Error('primitiveIds 必填');
	}
	const result = await eda.sch_PrimitiveComponent.delete(primitiveIds);
	return { content: result };
}

/**
 * 获取原理图中全部元件(无参数)。
 * @returns {Promise<{content: Array}>} 全部元件对象列表
 */
const SCH_PRIMITIVE_COMPONENT_GET_ALL_SCHEMA = {
	name: 'sch_PrimitiveComponent$getAll',
	description: '获取当前原理图所有元件列表;支持 cmdKey 筛选与 allSchematicPages 跨页',
	inputSchema: {
		type: 'object',
		properties: {
			cmdKey: { type: 'string', description: '筛选命令键(可选)' },
			allSchematicPages: { type: 'boolean', description: '是否跨所有原理图页获取,默认 false' },
		},
		required: [],
	},
	semantic_tags: ['元件', '列表', '查询'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveComponent$getAll({ cmdKey = null, allSchematicPages = false }) {
	const result = await eda.sch_PrimitiveComponent.getAll(cmdKey, allSchematicPages);
	return { content: result };
}

/**
 * 按元件 ID 获取其全部引脚坐标。
 * 先定位元件,再取其 pins 数组;未找到元件则抛出错误。
 * @param {Object} params 含 primitiveId(元件图元 ID)
 * @returns {Promise<{content: Array}>} 引脚坐标列表
 */
const SCH_PRIMITIVE_COMPONENT_GET_PINS_SCHEMA = {
	name: 'sch_PrimitiveComponent$getAllPinsByPrimitiveId',
	description: '获取单个元件的引脚列表;默认 invertY=true 符合画布坐标系',
	inputSchema: {
		type: 'object',
		properties: {
			primitiveId: { type: 'string', description: '元件图元 ID(必填)' },
		},
		required: ['primitiveId'],
	},
	semantic_tags: ['引脚', '坐标', 'invertY'],
	source: 'curated',
	domain: 'component_design',
};

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
 * 批量按元件 ID 获取各自引脚坐标。
 * 遍历 primitiveIds 逐个查询;任一个未找到则抛出带 ID 的错误。
 * @param {{primitiveIds: Array}} params 元件 ID 数组
 * @returns {Promise<{content: Object}>} 以 ID 为键的引脚坐标映射
 */
const SCH_PRIMITIVE_COMPONENT_GET_PINS_BATCH_SCHEMA = {
	name: 'sch_PrimitiveComponent$getAllPinsByPrimitiveIdBatch',
	description: '批量获取多个元件的引脚列表;返回 { [primitiveId]: pins[] }',
	inputSchema: {
		type: 'object',
		properties: {
			primitiveIds: {
				type: 'array',
				description: '元件图元 ID 数组(必填)',
				items: { type: 'string' }
			},
			invertY: { type: 'boolean', description: '是否 y 轴取反,默认 true' },
		},
		required: ['primitiveIds'],
	},
	semantic_tags: ['引脚', '批量', '坐标'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveComponent$getAllPinsByPrimitiveIdBatch({ primitiveIds, invertY = true }) {
	const results = {};
	await batchWrap(primitiveIds, 'primitiveIds', async (primitiveId) => {
		if (!primitiveId) {
			throw new Error('每个元素不能为空');
		}
		const result = await window.curatedTools.sch_PrimitiveComponent$getAllPinsByPrimitiveId({ primitiveId, invertY });
		results[primitiveId] = result.content;
	});
	return { content: results };
}

/**
 * 修改元件属性。
 * 仅透传调用方提供的属性(坐标/旋转/镜像等),未提供字段保持原值。
 * @param {Object} params 含 primitiveId 与待修改属性
 * @returns {Promise<{content: Object}>} 修改后的元件对象
 */
const SCH_PRIMITIVE_COMPONENT_MODIFY_SCHEMA = {
	name: 'sch_PrimitiveComponent$modify',
	description: '修改原理图元件属性与位置;新坐标不得超出画布边界',
	inputSchema: {
		type: 'object',
		properties: {
			primitiveId: {
				type: 'string',
				description: '元件图元 ID(必填)'
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
	semantic_tags: ['元件', '修改', '属性'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveComponent$modify({ primitiveId, property }) {
	if (!primitiveId) {
		throw new Error('primitiveId 必填');
	}
	if (!property || typeof property !== 'object') {
		throw new Error('property 必填且必须为对象');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	if(property.x < 0 || property.x > canvasWidth || property.y < 0 || property.y > canvasHeight) {
		throw new Error('x,y不能超过画布边界');
	}
	const comp = await eda.sch_PrimitiveComponent.modify(primitiveId, property);
	return { content: comp };
}

/**
 * 创建单个多边形(边界)。
 * 校验 line 为偶数长度且坐标不越界画布,color 须明确为字符串或 null(禁止 undefined);
 * 校验通过后调用原生 API 创建。
 * @param {Object} params 含 line(连续坐标数组)/color/fillColor/lineWidth/lineType
 * @returns {Promise<{content: Object}>} 新建多边形对象
 */
const SCH_PRIMITIVE_POLYGON_CREATE_SCHEMA = {
	name: 'sch_PrimitivePolygon$create',
	description: '创建单个多边形(绘制元件/板框边界);line 须为闭合连续坐标数组(偶数长度、不少于8、首尾相同)',
	inputSchema: {
		type: 'object',
		properties: {
			line: { type: 'array', items: { type: 'number' }, description: '连续坐标数组 [x1,y1,x2,y2,...],须闭合' },
			color: { type: ['string', 'null'], description: '描边颜色,可传 null' },
			fillColor: { type: ['string', 'null'], description: '填充颜色,可传 null' },
			lineWidth: { type: ['number', 'null'], description: '线宽,可传 null' },
			lineType: {
				type: 'number',
				enum: [0, 1, 2, 3],
				description: '线型,0:实线,1:虚线,2:点划线,3:点线'
			}
		},
		required: ['line']
	},
	semantic_tags: ['多边形', '边界', '绘制', 'lineType'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitivePolygon$create({ line, color = null, fillColor = null, lineWidth = null, lineType = null }) {
	// line 必须为长度不少于8且为偶数的坐标数组（至少4点且必须闭合,首尾点必须相同）
	if (!Array.isArray(line) || line.length < 8 || line.length % 2 !== 0 || `${line[0]}${line[1]}` !== `${line[line.length - 2]}${line[line.length - 1]}`) {
		throw new Error('line 必须是长度不少于8且为偶数的坐标数组,至少包含4点且必须闭合');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
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
 * 批量创建多边形(边界)。
 * 遍历 boundsList 逐个复用单条创建;任一条失败抛出带索引错误并中断。
 * @param {{boundsList: Array}} params 多边形参数数组
 * @returns {Promise<{content: Array}>} 各多边形创建结果集合
 */
const SCH_PRIMITIVE_POLYGON_CREATE_BATCH_SCHEMA = {
	name: 'sch_PrimitivePolygon$createBatch',
	description: '批量创建多个多边形(批量绘制元件/板框边界);每条 line 须为闭合连续坐标数组',
	inputSchema: {
		type: 'object',
		properties: {
			boundsList: {
				type: 'array',
				description: '多边形数组,每项为一个待创建多边形',
				items: {
					type: 'object',
					properties: {
						line: { type: 'array', items: { type: 'number' }, description: '连续坐标数组,须闭合' },
						color: { type: ['string', 'null'], description: '描边颜色,可传 null' },
						fillColor: { type: ['string', 'null'], description: '填充颜色,可传 null' },
						lineWidth: { type: ['number', 'null'], description: '线宽,可传 null' },
						lineType: {
							type: 'number',
							enum: [0, 1, 2, 3],
							description: '线型,0:实线,1:虚线,2:点划线,3:点线'
						}
					},
					required: ['line']
				}
			},
		},
		required: ['boundsList'],
	},
	semantic_tags: ['多边形', '批量', '边界'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitivePolygon$createBatch({ boundsList }) {
	const results = await batchWrap(boundsList, 'boundsList', async (bounds) => {
		const result = await window.curatedTools.sch_PrimitivePolygon$create({
			line: bounds.line,
			color: bounds.color,
			fillColor: bounds.fillColor,
			lineWidth: bounds.lineWidth,
			lineType: bounds.lineType,
		});
		return result.content;
	});
	return { content: results };
}

/**
 * 删除多边形(边界)。
 * primitiveIds 支持单个 ID 或 ID 数组,统一透传原生 API 删除。
 * @param {Object} params 含 primitiveIds(单个/数组)
 * @returns {Promise<{content: Object}>} 删除结果
 */
const SCH_PRIMITIVE_POLYGON_DELETE_SCHEMA = {
	name: 'sch_PrimitivePolygon$delete',
	description: '删除多边形(边界);primitiveIds 支持单个图元 ID 或 ID 数组',
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
	semantic_tags: ['多边形', '删除'],
	source: 'curated',
	domain: 'component_design',
};

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

/**
 * 获取原理图中全部多边形(边界,无参数)。
 * @returns {Promise<{content: Array}>} 全部多边形对象列表
 */
const SCH_PRIMITIVE_POLYGON_GET_ALL_SCHEMA = {
	name: 'sch_PrimitivePolygon$getAll',
	description: '获取原理图中全部多边形(边界);无参数',
	inputSchema: {
		type: 'object',
		properties: {},
		required: []
	},
	semantic_tags: ['多边形', '列表'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitivePolygon$getAll() {
	// 调用原生 API 获取全部多边形
	const result = await eda.sch_PrimitivePolygon.getAll();
	// 返回统一的 content 包装
	return { content: result };
}

/**
 * 获取文档中所有封装的源码信息(含 Width/Height 等边界属性)。
 * 供 getCanvasSize 解析画布尺寸使用;直接透传原生 API。
 * @returns {Promise<{content: Array}>} 封装源码集合
 */
const SYS_FILEMANAGER_FOOTPRINT_SCHEMA = {
	name: 'sys_FileManager$getDocumentFootprintSources',
	description: '获取文档中所有封装的源码信息(含 Width/Height 等边界属性,供 getCanvasSize 解析)',
	inputSchema: {
		type: 'object',
		properties: {},
		required: [],
	},
	semantic_tags: ['封装', '源码', 'Footprint'],
	source: 'curated',
	domain: 'component_design',
};

async function sys_FileManager$getDocumentFootprintSources() {
	const result = await eda.sys_FileManager.getDocumentFootprintSources();
	return { content: result };
}

/**
 * 计算单个元件的矩形边界(供碰撞检测)。
 * 按引脚坐标求最小外接矩形,支持 expandMil 膨胀;无引脚返回空数组。
 * 返回顺时针四点:左下、右下、右上、左上。
 * @param {{pins: Array, expandMil?: number}} params 引脚坐标列表与膨胀距离
 * @returns {{content: Array}} 四角坐标数组
 */
const CALCULATE_COMPONENT_BOUNDS_SCHEMA = {
	name: 'calculateComponentBounds',
	description: '计算单个元件的矩形边界(供碰撞检测);按引脚坐标求最小外接矩形,支持 expandMil 膨胀',
	inputSchema: {
		type: 'object',
		properties: {
			pins: {
				type: 'array',
				description: '引脚坐标列表 [{x, y}]',
				items: {
					type: 'object',
					properties: {
						x: { type: 'number', description: '引脚 X 坐标' },
						y: { type: 'number', description: '引脚 Y 坐标' }
					},
					required: ['x', 'y']
				}
			},
			expandMil: { type: 'number', description: '引脚膨胀距离,默认 10mil' }
		},
		required: ['pins']
	},
	semantic_tags: ['边界', '碰撞', '引脚', '矩形'],
	source: 'curated',
	domain: 'component_design',
};

async function calculateComponentBounds({ pins, expandMil = 10 }) {
	const bounds = computeBounds(pins, expandMil);
	return { content: bounds };
}

/**
 * 批量计算多个元件的矩形边界(供碰撞检测)。
 * 遍历 pinsList 逐个复用单条边界算法(取引脚极值 + expandMil 膨胀);
 * 无引脚或空列表的元素返回空数组。返回与输入顺序一致的边界数组。
 * @param {{pinsList: Array<Array>, expandMil?: number}} params 多个元件的引脚坐标数组与膨胀距离
 * @returns {{content: Array<Array>}} 各元件顺时针四点边界集合
 */
const CALCULATE_COMPONENT_BOUNDS_BATCH_SCHEMA = {
	name: 'calculateComponentBoundsBatch',
	description: '批量计算多个元件的矩形边界(供碰撞检测);返回每个元件的顺时针四点边界',
	inputSchema: {
		type: 'object',
		properties: {
			pinsList: {
				type: 'array',
				description: '多个元件的引脚坐标数组 [[{x,y},...], ...]',
				items: {
					type: 'array',
					items: {
						type: 'object',
						properties: { x: { type: 'number', description: '引脚 X 坐标' }, y: { type: 'number', description: '引脚 Y 坐标' } },
						required: ['x', 'y']
					}
				}
			},
			expandMil: { type: 'number', description: '引脚膨胀距离,默认 10mil' }
		},
		required: ['pinsList']
	},
	semantic_tags: ['边界', '批量', '碰撞', '矩形'],
	source: 'curated',
	domain: 'component_design',
};

async function calculateComponentBoundsBatch({ pinsList, expandMil = 10 }) {
	// 边界校验：无引脚列表时返回空数组
	if (!Array.isArray(pinsList) || pinsList.length === 0) {
		return { content: [] };
	}
	const results = pinsList.map(pins => computeBounds(pins, expandMil));
	return { content: results };
}
