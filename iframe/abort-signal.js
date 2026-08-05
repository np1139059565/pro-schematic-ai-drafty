// ========================================================================
// 取消信号管理模块
// ------------------------------------------------------------------------
// 设计目标(对标 Cursor / Claude Code 的 AbortSignal 单点贯穿):
//   1. 用 AbortController 替代散布在渲染层的全局 isStop 标志,让"取消"语义
//      不再侵入纯 UI 函数(原 addMessageToChat 内部会因 isStop 直接 return 并重置状态机);
//   2. 每次会话请求绑定独立 controller,handleStop 调用 abort() 即可真正中断 fetch;
//   3. 渲染层只通过 isCancelled() 查询状态,不再承担"重置状态机"的副作用。
// ========================================================================

/** 当前会话的 AbortController;每发起一轮请求时重建 */
let currentController = null;

/** 标记本次会话是否被用户主动取消(用于区分"主动停止"与"请求自然结束") */
let cancelledFlag = false;

/**
 * 创建(或重置)当前会话的 AbortController
 * @returns {AbortController} 新建的 controller
 */
function createAbortController() {
	currentController = new AbortController(); // 重建 controller,使上一次请求信号失效
	cancelledFlag = false; // 新一轮会话,清除取消标记
	return currentController;
}

/**
 * 获取当前 controller 的 signal(供 fetch 与超时合并使用)
 * @returns {AbortSignal}
 */
function getAbortSignal() {
	if (!currentController) {
		createAbortController(); // 防御性:未初始化时自动创建
	}
	return currentController.signal;
}

/**
 * 合并默认超时与手动取消信号
 * 超时到达或用户主动停止都会触发中断(二者取"任一先到")。
 * @param {number} timeoutMs 超时毫秒数
 * @returns {AbortSignal} 合并后的 signal
 */
function createTimeoutSignal(timeoutMs) {
	const timeout = AbortSignal.timeout(timeoutMs); // 超时信号
	const manual = getAbortSignal(); // 用户手动取消信号
	return AbortSignal.any([timeout, manual]); // 任一触发即中断
}

/**
 * 主动停止当前会话(由"停止"按钮调用)
 * 真正中断后台 fetch/工具执行,而非仅置标志位。
 */
function abortCurrent() {
	cancelledFlag = true; // 标记为主动取消
	if (currentController) {
		currentController.abort(); // 真正中断底层请求
	}
}

/**
 * 标记会话自然结束(请求成功返回后调用)
 * 释放 controller,避免悬挂引用。
 */
function endAbortSession() {
	currentController = null; // 释放 controller
	cancelledFlag = false; // 清除取消标记
}

/**
 * 查询当前会话是否被取消
 * 渲染层通过本函数查询状态,而不再直接读写全局 isStop。
 * @returns {boolean}
 */
function isCancelled() {
	return cancelledFlag;
}

// 导出到全局
window.AbortManager = {
	createAbortController,
	getAbortSignal,
	createTimeoutSignal,
	abortCurrent,
	endAbortSession,
	isCancelled,
};
