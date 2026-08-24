// 精选工具聚合器(curated-tools/index)
// 各领域工具的实现已按 domain 拆分到同目录子文件:
//   component.js  —— 元件域(component_design):搜索/画布/元件增删改查/引脚/多边形/边界计算/封装源码
//   wiring.js     —— 布线域(wiring_design):导线增删改查
//   selection.js  —— 选择与交互域(selection_interaction):选中/清除/鼠标/缩放
// 本文件不重复实现,仅收集子文件已声明的全局 const *_SCHEMA 与 async function,统一挂载 window.curatedTools。
// 加载顺序(html):curated-tools/component.js → wiring.js → selection.js → 本文件,确保符号先定义后聚合。

window.curatedTools = {
	// 元件域(由 component.js 声明)
	getCanvasSize,//获取图纸边界
	lib_Device$search,//元件库搜索
	sch_PrimitiveComponent$create,//在原理图放置单个元件
	sch_PrimitiveComponent$createBatch,//批量放置元件
	sch_PrimitiveComponent$getAll,//获取所有元件
	sch_PrimitiveComponent$delete,//删除元件
	sch_PrimitiveComponent$getAllPinsByPrimitiveId,//获取元件引脚
	sch_PrimitiveComponent$getAllPinsByPrimitiveIdBatch,//批量获取引脚
	sch_PrimitiveComponent$modify,//修改元件
	sch_PrimitivePolygon$create,//放置多边形
	sch_PrimitivePolygon$createBatch,//批量放置多边形
	sch_PrimitivePolygon$delete,//删除多边形
	sch_PrimitivePolygon$getAll,//获取所有多边形
	sys_FileManager$getDocumentFootprintSources,//获取封装源码
	calculateComponentBounds,//计算元件矩形边界
	calculateComponentBoundsBatch,//批量计算边界
	// 布线域(由 wiring.js 声明)
	sch_PrimitiveWire$create,//创建导线
	sch_PrimitiveWire$createBatch,//批量创建导线
	sch_PrimitiveWire$modify,//修改导线
	sch_PrimitiveWire$delete,//删除导线
	sch_PrimitiveWire$getAll,//获取所有导线
	// 选择与交互域(由 selection.js 声明)
	sch_SelectControl$getAllSelectedPrimitives,//查询已选图元
	sch_SelectControl$doSelectPrimitives,//选中图元
	sch_SelectControl$clearSelected,//清除选择
	sch_SelectControl$getCurrentMousePosition,//获取鼠标位置
	dmt_EditorControl$zoomToSelectedPrimitives,//缩放至选中
	// 工具描述清单(由各领域 *_SCHEMA 聚合)
	curatedToolSchemas: [
		GET_CANVAS_SIZE_SCHEMA,
		LIB_DEVICE_SEARCH_SCHEMA,
		SCH_PRIMITIVE_COMPONENT_CREATE_SCHEMA,
		SCH_PRIMITIVE_COMPONENT_CREATE_BATCH_SCHEMA,
		SCH_PRIMITIVE_COMPONENT_GET_ALL_SCHEMA,
		SCH_PRIMITIVE_COMPONENT_DELETE_SCHEMA,
		SCH_PRIMITIVE_COMPONENT_GET_PINS_SCHEMA,
		SCH_PRIMITIVE_COMPONENT_GET_PINS_BATCH_SCHEMA,
		SCH_PRIMITIVE_COMPONENT_MODIFY_SCHEMA,
		CALCULATE_COMPONENT_BOUNDS_SCHEMA,
		CALCULATE_COMPONENT_BOUNDS_BATCH_SCHEMA,
		SCH_PRIMITIVE_WIRE_CREATE_SCHEMA,
		SCH_PRIMITIVE_WIRE_CREATE_BATCH_SCHEMA,
		SCH_PRIMITIVE_WIRE_DELETE_SCHEMA,
		SCH_PRIMITIVE_WIRE_MODIFY_SCHEMA,
		SCH_PRIMITIVE_WIRE_GET_ALL_SCHEMA,
		SCH_PRIMITIVE_POLYGON_CREATE_SCHEMA,
		SCH_PRIMITIVE_POLYGON_CREATE_BATCH_SCHEMA,
		SCH_PRIMITIVE_POLYGON_DELETE_SCHEMA,
		SCH_PRIMITIVE_POLYGON_GET_ALL_SCHEMA,
		SYS_FILEMANAGER_FOOTPRINT_SCHEMA,
		SCH_SELECT_CONTROL_GET_ALL_SCHEMA,
		SCH_SELECT_CONTROL_DO_SELECT_SCHEMA,
		SCH_SELECT_CONTROL_CLEAR_SCHEMA,
		SCH_SELECT_CONTROL_MOUSE_SCHEMA,
		DMT_EDITOR_ZOOM_SCHEMA,
	],
};

// 输出使用说明
console.log('[MCP] 精选工具已初始化,通过 window.curatedTools 访问');
