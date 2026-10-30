/**
 * markdown-renderer.js - 轻量 Markdown 渲染器(零依赖,escape-first 防注入)
 *
 * 用途:把 AI 回复的 markdown 文本渲染为安全 HTML(对话场景常用语法全覆盖):
 *   围栏代码块(带语言标签)、行内代码、标题、粗体/斜体/删除线、链接(仅 http/https)、
 *   无序/有序列表(两级嵌套)、引用、表格、水平线、单换行保留(对话友好)。
 *
 * 安全策略:先对全文做 HTML 转义,再基于转义后的文本做结构解析,
 * 任何输入(包括 AI 幻觉出的 <script>、onerror= 等)都不会产生可执行 HTML;
 * 链接仅放行 http/https 协议,杜绝 javascript: 伪协议注入。
 *
 * 暴露:window.MarkdownRenderer.render(md) / .renderPlainText(s) / .escapeHtml(s)
 */
(function () {
	'use strict';

	/** HTML 转义(& < > " '),必须在任何结构解析之前执行 */
	function escapeHtml(s) {
		return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
	}

	/** 纯文本渲染:转义 + 保留换行(供用户输入等不需要 markdown 解析的场景) */
	function renderPlainText(s) {
		return escapeHtml(s).replace(/\r\n|\r|\n/g, '<br>');
	}

	/** 行内代码/占位符仓库:解析期间暂存已生成的 HTML,防止被后续行内规则二次加工 */
	let stash = [];
	/** 生成占位符并暂存 HTML 片段 */
	function stash_(html) {
		stash.push(html);
		return '\x00' + (stash.length - 1) + '\x00';
	}
	/** 把占位符还原为真实 HTML */
	function unstash_(text) {
		return text.replace(/\x00(\d+)\x00/g, (_, i) => stash[Number(i)]);
	}

	/**
	 * 行内规则:粗体/斜体/删除线/行内代码/链接(输入必须是已转义文本)
	 * @param {string} text - 已转义的行文本
	 * @returns {string} 行内 HTML
	 */
	function renderInline(text) {
		// 1. 行内代码最先处理并占位,其内容不再参与后续规则(避免 *`[ 被误解析)
		text = text.replace(/`([^`\n]+)`/g, (_, code) => stash_('<code class="md-code">' + code + '</code>'));
		// 2. 链接:[text](url) 仅放行 http/https(AI 幻觉的 javascript: 直接降级为纯文本)
		text = text.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g, (_, label, url) =>
			stash_('<a class="md-link" href="' + url + '" target="_blank" rel="noopener noreferrer">' + label + '</a>'),
		);
		// 3. 粗体 **x**(先于斜体,避免 ** 被拆成两个 *)
		text = text.replace(/\*\*([^*\n]+)\*\*/g, (_, inner) => stash_('<strong class="md-strong">' + inner + '</strong>'));
		// 4. 斜体 *x*
		text = text.replace(/\*([^*\n]+)\*/g, (_, inner) => stash_('<em class="md-em">' + inner + '</em>'));
		// 5. 删除线 ~~x~~
		text = text.replace(/~~([^~\n]+)~~/g, (_, inner) => stash_('<del class="md-del">' + inner + '</del>'));
		// 6. 还原全部占位符
		return unstash_(text);
	}

	/** 判断表格分隔行(如 | --- | :---: | ---: |) */
	function isTableSeparator(line) {
		return /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(line) && line.includes('-');
	}

	/** 解析表格行为单元格数组(去首尾空单元格) */
	function splitTableRow(line) {
		return line
			.replace(/^\s*\|/, '')
			.replace(/\|\s*$/, '')
			.split('|')
			.map((c) => c.trim());
	}

	/**
	 * 渲染围栏代码块为 HTML(已转义内容 + 语言标签)
	 * @param {string[]} lines - 代码行(已转义)
	 * @param {string} lang - 语言标识(已转义)
	 */
	function renderCodeBlock(lines, lang) {
		const langLabel = lang ? '<span class="md-code-lang">' + lang + '</span>' : '';
		return '<div class="md-pre-wrap">' + langLabel + '<pre class="md-pre"><code>' + lines.join('\n') + '</code></pre></div>';
	}

	/**
	 * 渲染 markdown 全文(入口)
	 * @param {string} md - 原始 markdown 文本
	 * @returns {string} 安全 HTML
	 */
	function render(md) {
		if (md === null || md === undefined) return '';
		stash = []; // 每次渲染重置占位仓库
		const srcLines = escapeHtml(String(md)).split(/\r\n|\r|\n/);
		const out = []; // 块级 HTML 依次推入,最终 join('') 避免元素间裸换行(配合容器 white-space)
		let i = 0;
		let paraBuffer = []; // 段落缓冲(非块级行)

		/** 冲刷段落缓冲:行内渲染后以 <br> 连接(保留 AI 输出的单换行观感) */
		const flushPara = () => {
			if (paraBuffer.length === 0) return;
			out.push('<p class="md-p">' + paraBuffer.map(renderInline).join('<br>') + '</p>');
			paraBuffer = [];
		};

		while (i < srcLines.length) {
			const line = srcLines[i];

			// ---- 围栏代码块 ``` / ~~~ ----
			const fence = line.match(/^\s*(`{3,}|~{3,})\s*(\S*)\s*$/);
			if (fence) {
				flushPara();
				const closeMark = fence[1][0]; // 用同类字符匹配闭合围栏
				const lang = fence[2] || '';
				const codeLines = [];
				i++;
				while (i < srcLines.length && !new RegExp('^\\s*' + closeMark + '{3,}\\s*$').test(srcLines[i])) {
					codeLines.push(srcLines[i]); // 内容已整体转义,此处直接收集
					i++;
				}
				i++; // 跳过闭合围栏(缺失时循环自然结束)
				out.push(renderCodeBlock(codeLines, lang));
				continue;
			}

			// ---- 空行:分段 ----
			if (/^\s*$/.test(line)) {
				flushPara();
				i++;
				continue;
			}

			// ---- 标题 # ~ ###### ----
			const heading = line.match(/^\s*(#{1,6})\s+(.+?)\s*#*\s*$/);
			if (heading) {
				flushPara();
				const level = heading[1].length; // 1-6
				out.push('<h' + level + ' class="md-h">' + renderInline(heading[2]) + '</h' + level + '>');
				i++;
				continue;
			}

			// ---- 水平线 --- *** ___ ----
			if (/^\s*([-*_])\s*(\1\s*){2,}$/.test(line)) {
				flushPara();
				out.push('<hr class="md-hr">');
				i++;
				continue;
			}

			// ---- 引用 >(注意:escape-first 后字面 > 已变为 &gt;) ----
			if (/^\s*&gt;\s?/.test(line)) {
				flushPara();
				const quoteLines = [];
				while (i < srcLines.length && /^\s*&gt;\s?/.test(srcLines[i])) {
					quoteLines.push(srcLines[i].replace(/^\s*&gt;\s?/, ''));
					i++;
				}
				out.push('<blockquote class="md-quote">' + quoteLines.map(renderInline).join('<br>') + '</blockquote>');
				continue;
			}

			// ---- 表格:表头行 + 分隔行 ----
			if (line.includes('|') && i + 1 < srcLines.length && isTableSeparator(srcLines[i + 1])) {
				flushPara();
				const headerCells = splitTableRow(line);
				i += 2; // 跳过表头与分隔行
				const bodyRows = [];
				while (i < srcLines.length && srcLines[i].includes('|') && !/^\s*$/.test(srcLines[i])) {
					bodyRows.push(splitTableRow(srcLines[i]));
					i++;
				}
				let table =
					'<table class="md-table"><thead><tr>' +
					headerCells.map((c) => '<th>' + renderInline(c) + '</th>').join('') +
					'</tr></thead><tbody>';
				for (const row of bodyRows) {
					table += '<tr>' + headerCells.map((_, ci) => '<td>' + renderInline(row[ci] || '') + '</td>').join('') + '</tr>';
				}
				table += '</tbody></table>';
				out.push(table);
				continue;
			}

			// ---- 列表(两级嵌套:子项缩进≥2空格) ----
			const listMatch = line.match(/^(\s*)([-*+]|\d+[.)])\s+(.+)$/);
			if (listMatch) {
				flushPara();
				const ordered = /\d/.test(listMatch[2]); // 数字开头为有序列表
				const items = []; // {level, html}
				while (i < srcLines.length) {
					const m = srcLines[i].match(/^(\s*)([-*+]|\d+[.)])\s+(.+)$/);
					if (!m) {
						// 列表项的续行(非空非新列表)并入当前项,增强对 AI 换行输出的兼容
						if (!/^\s*$/.test(srcLines[i]) && items.length > 0 && !/^\s*(#{1,6}\s|&gt;\s?|(`{3,}|~{3,}))/.test(srcLines[i])) {
							items[items.length - 1].html += '<br>' + renderInline(srcLines[i].trim());
							i++;
							continue;
						}
						break;
					}
					// 相邻不同类型列表(如 - 项后接 1. 项)分段为两个独立列表
					if (/\d/.test(m[2]) !== ordered) break;
					items.push({ level: m[1].length >= 2 ? 1 : 0, html: renderInline(m[3]) });
					i++;
				}
				// 组装两级列表
				const tag = ordered ? 'ol' : 'ul';
				let html = '<' + tag + ' class="md-list">';
				let subOpen = false; // 子列表是否展开中
				for (const item of items) {
					if (item.level === 1) {
						if (!subOpen) {
							html += '<' + tag + ' class="md-list md-sub">';
							subOpen = true;
						}
						html += '<li>' + item.html + '</li>';
					} else {
						if (subOpen) {
							html += '</' + tag + '>';
							subOpen = false;
						}
						html += '<li>' + item.html + '</li>';
					}
				}
				if (subOpen) html += '</' + tag + '>';
				html += '</' + tag + '>';
				out.push(html);
				continue;
			}

			// ---- 普通文本:进段落缓冲 ----
			paraBuffer.push(line);
			i++;
		}
		flushPara(); // 冲刷末尾段落
		return unstash_(out.join('')); // 兜底还原(理论上已全部还原)
	}

	window.MarkdownRenderer = { render, renderPlainText, escapeHtml };
})();
