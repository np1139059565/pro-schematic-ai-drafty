/**
 * 入口文件
 *
 * 本文件为默认扩展入口文件，如果你想要配置其它文件作为入口文件，
 * 请修改 `extension.json` 中的 `entry` 字段；
 *
 * 请在此处使用 `export`  导出所有你希望在 `headerMenus` 中引用的方法，
 * 方法通过方法名与 `headerMenus` 关联。
 *
 * 如需了解更多开发细节，请阅读：
 * https://prodocs.lceda.cn/cn/api/guide/
 */
import * as extensionConfig from '../extension.json';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function activate(status?: 'onStartupFinished', arg?: string): void {}

export function about(): void {
	eda.sys_Dialog.showInformationMessage(
		eda.sys_I18n.text('EasyEDA extension SDK v', undefined, undefined, extensionConfig.version),
		eda.sys_I18n.text('About'),
	);
}


/**
 * 打开原理图设计 AI 助手对话框
 * 使用 iframe 方式打开原理图设计 AI 助手界面，支持与火山引擎 ARK API 交互
 * 专门用于原理图设计相关的 AI 对话和咨询
 */
export function openAiChat(): void {
	// 打开 iframe 对话框，显示 AI 对话界面
	eda.sys_IFrame.openIFrame(
		'/iframe/ai-chat.html', // HTML 文件路径
		800, // 对话框宽度（像素）
		600, // 对话框高度（像素）
		'ai-chat-dialog', // 对话框唯一 ID，用于后续关闭或显示操作
		{
			maximizeButton: true, // 显示最大化按钮
			minimizeButton: true, // 显示最小化按钮
			grayscaleMask: true, // 显示灰色遮罩层
		},
	);
}
