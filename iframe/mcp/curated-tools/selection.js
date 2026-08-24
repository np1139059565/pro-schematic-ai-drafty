// 精选工具 · 选择与交互域(selection_interaction)
// 本文件仅声明本域的 const *_SCHEMA 与 async function,不挂载 window;统一由 curated-tools/index.js 聚合挂载。

/**
 * 查询当前所有已选中图元的对象列表(含完整属性,无参数)。
 * @returns {Promise<{content: Array}>} 选中图元对象列表
 */
const SCH_SELECT_CONTROL_GET_ALL_SCHEMA = {
	name: 'sch_SelectControl$getAllSelectedPrimitives',
	description: '查询当前所有已选中图元的对象列表(含完整属性)',
	inputSchema: {
		type: 'object',
		properties: {},
		required: [],
	},
	semantic_tags: ['选择', '查询', '图元'],
	source: 'curated',
	domain: 'selection_interaction',
};

async function sch_SelectControl$getAllSelectedPrimitives() {
	const result = await eda.sch_SelectControl.getAllSelectedPrimitives();
	return { content: result };
}

/**
 * 按图元 ID 选中图元。
 * primitiveIds 必填,支持单个 ID 或 ID 数组,统一透传原生 API 选中。
 * @param {Object} params 含 primitiveIds(单个/数组)
 * @returns {Promise<{content: Object}>} 选中结果
 */
const SCH_SELECT_CONTROL_DO_SELECT_SCHEMA = {
	name: 'sch_SelectControl$doSelectPrimitives',
	description: '按图元 ID 选中图元;primitiveIds 支持单个 ID 或 ID 数组',
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
	semantic_tags: ['选择', '图元', '交互'],
	source: 'curated',
	domain: 'selection_interaction',
};

async function sch_SelectControl$doSelectPrimitives({ primitiveIds }) {
	if (!primitiveIds) {
		throw new Error('primitiveIds 必填');
	}
	const result = await eda.sch_SelectControl.doSelectPrimitives(primitiveIds);
	return { content: result };
}

/**
 * 清除所有选中状态(无参数)。
 * @returns {Promise<{content: Object}>} 清除结果
 */
const SCH_SELECT_CONTROL_CLEAR_SCHEMA = {
	name: 'sch_SelectControl$clearSelected',
	description: '清除所有选中状态;无参数',
	inputSchema: {
		type: 'object',
		properties: {},
		required: [],
	},
	semantic_tags: ['选择', '清除', '交互'],
	source: 'curated',
	domain: 'selection_interaction',
};

async function sch_SelectControl$clearSelected() {
	const result = await eda.sch_SelectControl.clearSelected();
	return { content: result };
}

/**
 * 获取当前鼠标在画布上的坐标(x, y,无参数)。
 * @returns {Promise<{content: Object}>} 鼠标坐标
 */
const SCH_SELECT_CONTROL_MOUSE_SCHEMA = {
	name: 'sch_SelectControl$getCurrentMousePosition',
	description: '获取当前鼠标在画布上的坐标(x, y)',
	inputSchema: {
		type: 'object',
		properties: {},
		required: [],
	},
	semantic_tags: ['鼠标', '坐标', '交互'],
	source: 'curated',
	domain: 'selection_interaction',
};

async function sch_SelectControl$getCurrentMousePosition() {
	const result = await eda.sch_SelectControl.getCurrentMousePosition();
	return { content: result };
}

/**
 * 缩放到已选中图元(适应选中视图)。
 * tabId 可选,默认作用于最后输入焦点的画布,统一透传原生 API。
 * @param {{tabId?: string}} [params] 可选标签页 ID
 * @returns {Promise<{content: Object}>} 缩放结果
 */
const DMT_EDITOR_ZOOM_SCHEMA = {
	name: 'dmt_EditorControl$zoomToSelectedPrimitives',
	description: '缩放到已选中图元(适应选中);tabId 可选,默认最后输入焦点的画布',
	inputSchema: {
		type: 'object',
		properties: {
			tabId: { type: 'string', description: '标签页 ID，如若未传入，则为最后输入焦点的画布' }
		},
		required: [],
	},
	semantic_tags: ['缩放', '视图', '交互', '反馈'],
	source: 'curated',
	domain: 'selection_interaction',
};

async function dmt_EditorControl$zoomToSelectedPrimitives({ tabId = null }) {
	const result = await eda.dmt_EditorControl.zoomToSelectedPrimitives(tabId);
	return { content: result };
}
