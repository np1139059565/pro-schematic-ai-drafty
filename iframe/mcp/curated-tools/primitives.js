// 精选工具 · 非电气绘图图元域(primitives)
// 覆盖圆/圆弧/矩形/文本四类绘图图元的创建(原生 API 缺位部分,多边形已由 component.js 覆盖);
// 统一模式:参数与画布边界校验 → 原生 create(显式按位传参,规避 callTool 位置散列的错位风险)
// → await done() 提交绘制 → getAll 回读验证(以回读为最终判定,规避 save/done 返回值语义不明)。
// 加载顺序(html):shared.js 之后、index.js 之前,由 index.js 统一聚合挂载。

/**
 * 创建单个圆。
 * 校验圆心与半径、圆心不越界画布;创建后 done 提交并回读验证。
 * @param {Object} params 含 centerX/centerY/radius 及可选 color/fillColor/lineWidth/lineType/fillStyle
 * @returns {Promise<{content: Object, verification: Object}>} 新建圆对象与回读验证结果
 */
const SCH_PRIMITIVE_CIRCLE_CREATE_SCHEMA = {
	name: 'sch_PrimitiveCircle$create',
	description: '在原理图创建单个圆(非电气绘图图元);自动提交绘制并回读验证是否落到画布',
	inputSchema: {
		type: 'object',
		properties: {
			centerX: { type: 'number', description: '圆心 X(必填)' },
			centerY: { type: 'number', description: '圆心 Y(必填)' },
			radius: { type: 'number', description: '半径(必填,正数)' },
			color: { type: ['string', 'null'], description: '描边颜色,null 表示默认' },
			fillColor: { type: ['string', 'null'], description: '填充颜色,none 表示无填充,null 表示默认' },
			lineWidth: { type: ['number', 'null'], description: '线宽,范围 1-10,null 表示默认' },
			lineType: { type: ['string', 'null'], description: '线型,null 表示默认' },
			fillStyle: { type: ['string', 'null'], description: '填充样式,null 表示默认' },
		},
		required: ['centerX', 'centerY', 'radius'],
	},
	semantic_tags: ['圆', '绘图', '图元', 'create'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveCircle$create({
	centerX,
	centerY,
	radius,
	color = null,
	fillColor = null,
	lineWidth = null,
	lineType = null,
	fillStyle = null,
}) {
	if (![centerX, centerY, radius].every((v) => typeof v === 'number' && Number.isFinite(v)) || radius <= 0) {
		throw new Error('centerX/centerY 必填且为数值,radius 必须为正数');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
	assertInCanvas(centerX, centerY, canvasSize.content.width.value, canvasSize.content.height.value);
	const circle = await eda.sch_PrimitiveCircle.create(centerX, centerY, radius, color, fillColor, lineWidth, lineType, fillStyle);
	if (!circle) {
		throw new Error('宿主未返回圆实例,创建被拒绝(请确认当前打开的是原理图页面后重试)');
	}
	if (typeof circle.done === 'function') {
		await circle.done(); // 提交绘制:宿主 create 仅内存创建,缺提交会导致画布无变化
	}
	const verification = await verifyPrimitiveCreated('sch_PrimitiveCircle', circle);
	return { content: circle, verification };
}

/**
 * 创建单个圆弧。
 * 校验三点坐标(起点/参考点/终点)不越界画布;创建后 done 提交并回读验证。
 * @param {Object} params 含 startX/startY/referenceX/referenceY/endX/endY 及可选颜色线型
 * @returns {Promise<{content: Object, verification: Object}>} 新建圆弧对象与回读验证结果
 */
const SCH_PRIMITIVE_ARC_CREATE_SCHEMA = {
	name: 'sch_PrimitiveArc$create',
	description: '在原理图创建单个圆弧(由起点/参考点/终点三点确定);自动提交绘制并回读验证',
	inputSchema: {
		type: 'object',
		properties: {
			startX: { type: 'number', description: '起始点 X(必填)' },
			startY: { type: 'number', description: '起始点 Y(必填)' },
			referenceX: { type: 'number', description: '参考点 X(必填,确定弧所在圆)' },
			referenceY: { type: 'number', description: '参考点 Y(必填)' },
			endX: { type: 'number', description: '终止点 X(必填)' },
			endY: { type: 'number', description: '终止点 Y(必填)' },
			color: { type: ['string', 'null'], description: '描边颜色,null 表示默认' },
			fillColor: { type: ['string', 'null'], description: '填充颜色,null 表示默认' },
			lineWidth: { type: ['number', 'null'], description: '线宽,范围 1-10,null 表示默认' },
			lineType: { type: ['string', 'null'], description: '线型,null 表示默认' },
		},
		required: ['startX', 'startY', 'referenceX', 'referenceY', 'endX', 'endY'],
	},
	semantic_tags: ['圆弧', '绘图', '图元', 'create'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveArc$create({
	startX,
	startY,
	referenceX,
	referenceY,
	endX,
	endY,
	color = null,
	fillColor = null,
	lineWidth = null,
	lineType = null,
}) {
	const points = [startX, startY, referenceX, referenceY, endX, endY];
	if (!points.every((v) => typeof v === 'number' && Number.isFinite(v))) {
		throw new Error('startX/startY/referenceX/referenceY/endX/endY 必填且均为数值');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	assertInCanvas(startX, startY, canvasWidth, canvasHeight);
	assertInCanvas(referenceX, referenceY, canvasWidth, canvasHeight);
	assertInCanvas(endX, endY, canvasWidth, canvasHeight);
	const arc = await eda.sch_PrimitiveArc.create(startX, startY, referenceX, referenceY, endX, endY, color, fillColor, lineWidth, lineType);
	if (!arc) {
		throw new Error('宿主未返回圆弧实例,创建被拒绝(请确认当前打开的是原理图页面后重试)');
	}
	if (typeof arc.done === 'function') {
		await arc.done();
	}
	const verification = await verifyPrimitiveCreated('sch_PrimitiveArc', arc);
	return { content: arc, verification };
}

/**
 * 创建单个矩形。
 * 校验左上角坐标与宽高(右下角 = 左上角 + 宽高 也不越界);创建后 done 提交并回读验证。
 * @param {Object} params 含 topLeftX/topLeftY/width/height 及可选圆角/旋转/颜色线型
 * @returns {Promise<{content: Object, verification: Object}>} 新建矩形对象与回读验证结果
 */
const SCH_PRIMITIVE_RECTANGLE_CREATE_SCHEMA = {
	name: 'sch_PrimitiveRectangle$create',
	description: '在原理图创建单个矩形(非电气绘图图元);自动提交绘制并回读验证',
	inputSchema: {
		type: 'object',
		properties: {
			topLeftX: { type: 'number', description: '左上点 X(必填)' },
			topLeftY: { type: 'number', description: '左上点 Y(必填)' },
			width: { type: 'number', description: '宽(必填,正数)' },
			height: { type: 'number', description: '高(必填,正数)' },
			cornerRadius: { type: ['number', 'null'], description: '圆角半径,null 表示默认' },
			rotation: { type: ['number', 'null'], description: '旋转角度(绕左上点),0/90/180/270' },
			color: { type: ['string', 'null'], description: '描边颜色,null 表示默认' },
			fillColor: { type: ['string', 'null'], description: '填充颜色,none 表示无填充,null 表示默认' },
			lineWidth: { type: ['number', 'null'], description: '线宽,范围 1-10,null 表示默认' },
			lineType: { type: ['string', 'null'], description: '线型,null 表示默认' },
			fillStyle: { type: ['string', 'null'], description: '填充样式,null 表示默认' },
		},
		required: ['topLeftX', 'topLeftY', 'width', 'height'],
	},
	semantic_tags: ['矩形', '绘图', '图元', 'create'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveRectangle$create({
	topLeftX,
	topLeftY,
	width,
	height,
	cornerRadius = null,
	rotation = null,
	color = null,
	fillColor = null,
	lineWidth = null,
	lineType = null,
	fillStyle = null,
}) {
	if (![topLeftX, topLeftY, width, height].every((v) => typeof v === 'number' && Number.isFinite(v)) || width <= 0 || height <= 0) {
		throw new Error('topLeftX/topLeftY 必填且为数值,width/height 必须为正数');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
	const canvasWidth = canvasSize.content.width.value;
	const canvasHeight = canvasSize.content.height.value;
	assertInCanvas(topLeftX, topLeftY, canvasWidth, canvasHeight);
	assertInCanvas(topLeftX + width, topLeftY + height, canvasWidth, canvasHeight);
	const rectangle = await eda.sch_PrimitiveRectangle.create(
		topLeftX,
		topLeftY,
		width,
		height,
		cornerRadius,
		rotation,
		color,
		fillColor,
		lineWidth,
		lineType,
		fillStyle,
	);
	if (!rectangle) {
		throw new Error('宿主未返回矩形实例,创建被拒绝(请确认当前打开的是原理图页面后重试)');
	}
	if (typeof rectangle.done === 'function') {
		await rectangle.done();
	}
	const verification = await verifyPrimitiveCreated('sch_PrimitiveRectangle', rectangle);
	return { content: rectangle, verification };
}

/**
 * 创建单个文本。
 * 校验坐标与内容(内容非空字符串);创建后 done 提交并回读验证。
 * @param {Object} params 含 x/y/content 及可选旋转/颜色/字体/对齐模式
 * @returns {Promise<{content: Object, verification: Object}>} 新建文本对象与回读验证结果
 */
const SCH_PRIMITIVE_TEXT_CREATE_SCHEMA = {
	name: 'sch_PrimitiveText$create',
	description: '在原理图创建单个文本标注;自动提交绘制并回读验证',
	inputSchema: {
		type: 'object',
		properties: {
			x: { type: 'number', description: '坐标 X(必填)' },
			y: { type: 'number', description: '坐标 Y(必填)' },
			content: { type: 'string', description: '文本内容(必填,非空)' },
			rotation: { type: ['number', 'null'], description: '旋转角度,0/90/180/270' },
			textColor: { type: ['string', 'null'], description: '文本颜色,null 表示默认' },
			fontName: { type: ['string', 'null'], description: '字体名称,null 表示默认' },
			fontSize: { type: ['number', 'null'], description: '字体大小,null 表示默认' },
			bold: { type: ['boolean', 'null'], description: '是否加粗' },
			italic: { type: ['boolean', 'null'], description: '是否斜体' },
			underLine: { type: ['boolean', 'null'], description: '是否下划线' },
			alignMode: { type: ['number', 'null'], description: '对齐模式,0 左顶 ~ 8 右底(0左顶,1中顶,2右顶,3左中,4中中,5右中,6左底,7中底,8右底)' },
		},
		required: ['x', 'y', 'content'],
	},
	semantic_tags: ['文本', '标注', '绘图', 'create'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_PrimitiveText$create({
	x,
	y,
	content,
	rotation = null,
	textColor = null,
	fontName = null,
	fontSize = null,
	bold = null,
	italic = null,
	underLine = null,
	alignMode = null,
}) {
	if (typeof x !== 'number' || typeof y !== 'number' || !Number.isFinite(x) || !Number.isFinite(y)) {
		throw new Error('x/y 必填且为数值');
	}
	if (typeof content !== 'string' || content.trim().length === 0) {
		throw new Error('content 必填且为非空字符串');
	}
	const canvasSize = await window.curatedTools.getCanvasSize();
	assertInCanvas(x, y, canvasSize.content.width.value, canvasSize.content.height.value);
	const text = await eda.sch_PrimitiveText.create(x, y, content, rotation, textColor, fontName, fontSize, bold, italic, underLine, alignMode);
	if (!text) {
		throw new Error('宿主未返回文本实例,创建被拒绝(请确认当前打开的是原理图页面后重试)');
	}
	if (typeof text.done === 'function') {
		await text.done();
	}
	const verification = await verifyPrimitiveCreated('sch_PrimitiveText', text);
	return { content: text, verification };
}

/**
 * 画布可视化验证(带能力探测与降级,替代直接调用 dmt_EditorControl.getCurrentRenderedAreaImage)。
 * 宿主侧该 API 在部分 EDA 版本返回空对象(难点复盘 #4),直接调用会诱导模型反复重试浪费 token;
 * 本工具先探测可用性:可用时返回图像数据,不可用时一次性返回明确的降级指引
 * (以各图元 getAll 回读数据作为验证手段),避免无效重试。
 * @param {{tabId?: string}} [params] tabId 可选,缺省取最后输入焦点的画布
 * @returns {Promise<{available: boolean, image?: Object, guidance?: string}>} 可用性判定与图像数据/降级指引
 */
const SCH_VISUAL_VERIFY_SCHEMA = {
	name: 'sch_VisualVerify',
	description:
		'画布可视化验证:探测截图能力,可用时返回渲染区域图像;部分 EDA 版本不支持截图(返回空),此时一次性给出降级指引(改用图元 getAll 回读验证),请勿重复尝试截图',
	inputSchema: {
		type: 'object',
		properties: {
			tabId: { type: ['string', 'null'], description: '可选,标签页 ID,缺省取最后输入焦点的画布' },
		},
		required: [],
	},
	semantic_tags: ['截图', '验证', '画布', '可视化'],
	source: 'curated',
	domain: 'component_design',
};

async function sch_VisualVerify({ tabId = null } = {}) {
	let image = null;
	try {
		image = tabId ? await eda.dmt_EditorControl.getCurrentRenderedAreaImage(tabId) : await eda.dmt_EditorControl.getCurrentRenderedAreaImage();
	} catch (error) {
		image = null; // 宿主抛错同样归入"不可用",统一走降级指引
	}
	const unusable = !image || (typeof image === 'object' && Object.keys(image).length === 0) || (typeof image === 'string' && image.length === 0);
	if (unusable) {
		return {
			available: false,
			guidance:
				'当前 EDA 版本不支持画布截图(宿主返回空数据),请勿再重复尝试截图;' +
				'图元是否成功落布请以各图元 getAll 回读数据为最终判定' +
				'(如 callTool sch_PrimitiveCircle.getAll / sch_PrimitiveComponent.getAll,或查看创建工具返回中的 verification 字段)',
		};
	}
	return { available: true, image };
}
