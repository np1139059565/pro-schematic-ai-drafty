// 精选工具 · 跨域共享辅助函数(shared)
// 本文件仅声明无副作用的纯函数与常量,不挂载 window、不依赖任何全局对象;
// 供 component.js / wiring.js / selection.js 等子文件复用,消除复制粘贴的重复逻辑。
// 加载顺序(html):本文件须位于 curated-tools/component.js 之前,确保符号先定义后被聚合挂载。

/**
 * 画布越界校验辅助函数。
 * 校验任意坐标点是否落在 [0, canvasWidth] × [0, canvasHeight] 范围内;
 * 越界则抛出带坐标信息的错误,供创建/修改类工具统一拦截。
 * @param {number} x 待校验 X 坐标
 * @param {number} y 待校验 Y 坐标
 * @param {number} canvasWidth 画布宽度(单位 mil)
 * @param {number} canvasHeight 画布高度(单位 mil)
 * @throws {Error} 坐标越界时抛出
 */
function assertInCanvas(x, y, canvasWidth, canvasHeight) {
	if (x < 0 || x > canvasWidth || y < 0 || y > canvasHeight) {
		throw new Error('坐标超出画布边界');
	}
}

/**
 * 批量包装辅助函数(消除各域「遍历数组逐个复用单条函数」的复制粘贴模板)。
 * 对 items 逐项调用 singleFn;任一项失败抛出带索引的聚合错误,便于定位是第几项出错。
 * @param {Array} items 批量入参数组
 * @param {string} itemsName 数组字段名(用于必填校验与错误提示,如 'components'/'wires')
 * @param {Function} singleFn 单条处理函数,签名为 async (item, index) => 单条结果(content 前的原始结果)
 * @returns {Promise<Array>} 各单项 content 前的原始结果集合
 * @throws {Error} items 非数组或为空;或任一项处理失败时抛出带索引的错误
 */
async function batchWrap(items, itemsName, singleFn) {
	if (!Array.isArray(items) || items.length === 0) {
		throw new Error(`${itemsName} 必填且必须为非空数组`);
	}
	const results = [];
	for (let i = 0; i < items.length; i++) {
		try {
			const result = await singleFn(items[i], i);
			results.push(result);
		} catch (error) {
			throw new Error(`${itemsName}[${i}]: ${error.message}`);
		}
	}
	return results;
}

/**
 * 由引脚坐标极值计算顺时针四点矩形边界(消除单条/批量两处重复的极值算法)。
 * 取所有引脚的 x/y 极值并向外膨胀 expandMil,返回 [左下, 右下, 右上, 左上] 顺时针顺序。
 * @param {Array<{x:number, y:number}>} pins 引脚坐标数组
 * @param {number} expandMil 膨胀距离(单位 mil),默认 10
 * @returns {Array<{x:number, y:number}>} 顺时针四点边界;无引脚时返回空数组
 */
function computeBounds(pins, expandMil = 10) {
	if (!Array.isArray(pins) || pins.length === 0) {
		return [];
	}
	const xs = pins.map((p) => p.x);
	const ys = pins.map((p) => p.y);
	const minX = Math.min(...xs) - expandMil;
	const maxX = Math.max(...xs) + expandMil;
	const minY = Math.min(...ys) - expandMil;
	const maxY = Math.max(...ys) + expandMil;
	return [
		{ x: minX, y: minY },
		{ x: maxX, y: minY },
		{ x: maxX, y: maxY },
		{ x: minX, y: maxY },
	];
}

/**
 * 判断目标工具是否为需要原理图上下文的写操作(sch_ 域的创建/修改/删除)。
 * 纯函数,名称归一化($ 与 . 分隔等价);读操作(getAll/get/search)与 PCB(pcb_/ipcb_)域不命中。
 * @param {string} targetName 目标工具名,如 sch_PrimitiveCircle.create / sch_PrimitiveWire$createBatch
 * @returns {boolean} 是否需要前置文档上下文守卫
 */
function isSchematicWriteTool(targetName) {
	if (typeof targetName !== 'string') {
		return false;
	}
	const dotName = targetName.replace('$', '.');
	const dotIndex = dotName.lastIndexOf('.');
	if (dotIndex <= 0) {
		return false;
	}
	const className = dotName.slice(0, dotIndex);
	const methodName = dotName.slice(dotIndex + 1);
	return className.startsWith('sch_') && /^(create|createBatch|modify|delete|deleteBatch|remove)$/.test(methodName);
}

/**
 * 原理图文档上下文守卫。
 * 绘图写操作若在非原理图页(如 PCB,documentType=3)执行,图元会写入错误文档导致"画了却看不见";
 * 依据 dmt_SelectControl.getCurrentDocumentInfo 的 documentType 判定:1=原理图页允许,其余阻断;
 * 返回结构缺失时放行并告警(避免宿主 API 形状变化误伤全部绘图)。
 * @throws {Error} 当前不是原理图页时抛出,错误信息附切换指引
 */
async function assertSchematicContext() {
	const docInfo = await eda.dmt_SelectControl.getCurrentDocumentInfo();
	const documentType = docInfo ? docInfo.documentType : undefined;
	if (documentType === undefined || documentType === null) {
		console.warn('[MCP] 文档守卫: getCurrentDocumentInfo 未返回 documentType,放行写操作');
		return;
	}
	if (documentType !== 1) {
		throw new Error(
			`当前画布不是原理图页(documentType=${documentType}),已阻止 sch_ 绘图写操作;` +
				'请先用 callTool 调用 dmt_EditorControl.activateDocument 切换到原理图页(documentType=1)后重试',
		);
	}
}

/**
 * 图元创建回读验证(P1-8)。
 * 创建并 done 提交后按 getAll 回读,确认图元真正落到当前文档画布;
 * 以回读结果为最终判定依据,规避宿主 save/done 返回值语义不明的问题。
 * @param {string} namespace 原生命名空间,如 sch_PrimitiveCircle
 * @param {Object} createdPrimitive create 返回的图元实例(用于按 id 匹配)
 * @returns {Promise<Object>} {total, confirmedInCurrentDocument, primitiveId};回读失败时 {verified:false, reason}
 */
async function verifyPrimitiveCreated(namespace, createdPrimitive) {
	try {
		const all = await eda[namespace].getAll();
		const list = Array.isArray(all) ? all : all && Array.isArray(all.primitives) ? all.primitives : [];
		const primitiveId =
			createdPrimitive && typeof createdPrimitive === 'object'
				? (createdPrimitive.primitiveId ?? createdPrimitive.uuid ?? createdPrimitive.id ?? null)
				: null;
		const confirmed = primitiveId ? list.some((p) => p && typeof p === 'object' && p.primitiveId === primitiveId) : null;
		return { total: list.length, confirmedInCurrentDocument: confirmed, primitiveId };
	} catch (error) {
		return { verified: false, reason: error.message };
	}
}
