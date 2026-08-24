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
	const xs = pins.map(p => p.x);
	const ys = pins.map(p => p.y);
	const minX = Math.min(...xs) - expandMil;
	const maxX = Math.max(...xs) + expandMil;
	const minY = Math.min(...ys) - expandMil;
	const maxY = Math.max(...ys) + expandMil;
	return [
		{ x: minX, y: minY },
		{ x: maxX, y: minY },
		{ x: maxX, y: maxY },
		{ x: minX, y: maxY }
	];
}
