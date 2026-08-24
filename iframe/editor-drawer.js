/**
 * 视图层 editor-drawer.js —— 「可编辑抽屉」数据管理界面
 *
 * 职责(单一职责:只管界面,数据操作全部委托 data-store.js):
 * 1. 渲染右侧滑出抽屉:状态徽标、分类标签页、搜索、分页列表、编辑面板;
 * 2. 提供 图谱/提示词/精选工具(含元工具)/EDA函数(原生API)/资源/日志 六个分栏的浏览与编辑
 *    (分栏顺序严格对应本文件 TABS 常量;图谱分栏本身由 graph-view.js 渲染,本模块只负责分栏切换与画布容器);
 * 3. 提供全局操作(顶部状态区仅保留三个高频按钮):
 *    - 导入:弹自定义询问框二选一——「从源码导入」(importFromMemory,读取运行时内存常量,
 *      首次激活起点)或「从本地文件导入」(importLocalFiles,仅支持 .json 格式);
 *    - 导出:输入一次版本号,经 exportAll 产出单个 JSON 文件(含业务数据 + 函数源码 impl_code);
 *    - 删除数据库:deleteDatabase 回退原始 JS 即等价于恢复默认;
 *    另在日志分栏工具栏提供「清空日志」(clearLogs,仅清日志两表);
 * 4. 提供辅助能力:引用关系提示(调用了哪些工具/被哪些工具与提示词引用)、
 *    「AI 格式化并补全(代码+描述)」一键对函数做格式化/修复/补注释并重生成工具描述与参数模式;
 * 5. 提供交互增强:@引用 高亮(单击展开信息卡、双击跳转)、可拖拽分隔条调整列表宽度、
 *    提示词新增/删除(删除前经 findReferences 做引用保护)。
 *
 * 编辑面板以 editMode 区分「显示态(只读高亮预览)」与「编辑态(可编辑表单)」两种互斥状态,
 * 二者不并存:@引用 只读预览区仅出现在显示态,编辑态只展示表单与保存/取消按钮。
 *
 * 数据库未激活时为只读预览模式(展示出厂数据,编辑与保存禁用,日志 Tab 隐藏);
 * 加载顺序要求:必须在 data-store.js 之后、ai-chat.js 之前加载。
 */

(function () {
    'use strict';

    // ==================== 常量与状态 ====================

    /** 每页展示条目数 */
    const PAGE_SIZE = 50;

    /** 标签页配置(id 用于取数分流,label 用于展示) */
    const TABS = [
        { id: 'graph', label: '图谱' },
        { id: 'prompts', label: '提示词' },
        { id: 'featured', label: '精选工具' },
        { id: 'jdb', label: 'EDA函数' },
        { id: 'resources', label: '资源' },
        { id: 'logs', label: '日志' }
    ];

    /** 当前激活的标签页 id */
    let currentTab = 'prompts';
    /** 当前搜索关键字(小写) */
    let searchKeyword = '';
    /** 当前页码(从 1 开始) */
    let currentPage = 1;
    /** 当前选中条目的主键(prompts/tools 为 name,resources 为 uri) */
    let selectedKey = null;
    /**
     * 编辑面板模式开关:false=显示态(只读高亮预览,展示 @引用),true=编辑态(可编辑表单)。
     * 切换选中条目时由列表点击重置为 false;点「编辑」进入 true,点「保存/取消」回到 false。
     */
    let editMode = false;

    // ==================== DOM 引用(脚本位于抽屉 DOM 之后,可直接获取) ====================

    const drawer = document.getElementById('dataDrawer');
    const overlay = document.getElementById('dmOverlay');
    const statusBadge = document.getElementById('dmStatusBadge');
    const tabsBar = document.getElementById('dmTabs');
    const searchInput = document.getElementById('dmSearchInput');
    const addToolBtn = document.getElementById('dmAddToolBtn');
    const listEl = document.getElementById('dmList');
    const pageInfoEl = document.getElementById('dmPageInfo');
    const prevPageBtn = document.getElementById('dmPrevPageBtn');
    const nextPageBtn = document.getElementById('dmNextPageBtn');
    const editPane = document.getElementById('dmEdit');

    // ==================== 通用工具函数 ====================

    /** 转义 HTML 特殊字符,防止数据内容注入界面 */
    function escapeHtml(text) {
        return String(text == null ? '' : text)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    /** 统一的错误提示(集中封装便于后续替换为更优雅的提示组件) */
    function notifyError(error) {
        console.error('[editor-drawer]', error);
        alert(error && error.message ? error.message : String(error));
    }

    /** 统一的成功提示 */
    function notifyOk(message) {
        alert(message);
    }

    // ==================== 取数(全部来自 data-store) ====================

    /** 获取当前标签页的全部行数据 */
    function getRowsForTab(tabId) {
        switch (tabId) {
            case 'prompts': return window.dataStore.listPromptRows();
            case 'jdb': return window.dataStore.listToolRows('jdb');
            // 精选工具标签页同时展示 curated(精选封装)与 meta(元工具)
            case 'featured': return window.dataStore.listToolRows('curated').concat(window.dataStore.listToolRows('meta'));
            case 'resources': return window.dataStore.listResourceRows();
            default: return [];
        }
    }

    /** 获取行主键(prompts/tools 为 name,resources 为 uri) */
    function rowKey(row) {
        return row.uri !== undefined ? row.uri : row.name;
    }

    /** 按搜索关键字过滤行(匹配 name/uri/description,不区分大小写) */
    function filterRows(rows) {
        if (!searchKeyword) return rows;
        return rows.filter(row =>
            String(rowKey(row)).toLowerCase().includes(searchKeyword)
            || String(row.description || '').toLowerCase().includes(searchKeyword)
        );
    }

    // ==================== 渲染:状态徽标 / 标签页 / 列表 ====================

    /** 渲染数据状态徽标(未导入·原始JS / 已激活·数据库 v{版本}) */
    function renderStatus() {
        const activated = window.dataStore.isActivated();
        statusBadge.textContent = activated
            ? `已激活 · 数据库 v${window.dataStore.getSeedVersion()}`
            : '未导入 · 原始JS(只读预览)';
        statusBadge.className = 'dm-status ' + (activated ? 'dm-status-on' : 'dm-status-off');
    }

    /** 渲染分类标签页(附带各分类条目数) */
    function renderTabs() {
        // 日志 Tab 仅在数据库已激活时展示(未激活为只读预览,无日志可看)
        if (currentTab === 'logs' && !window.dataStore.isActivated()) currentTab = 'prompts';
        tabsBar.innerHTML = '';
        for (const tab of TABS) {
            if (tab.id === 'logs' && !window.dataStore.isActivated()) continue; // 只读模式隐藏日志 Tab
            const button = document.createElement('button');
            button.className = 'dm-tab' + (tab.id === currentTab ? ' dm-tab-active' : '');
            button.textContent = tab.id === 'logs'
                ? `日志(${window.dataStore.getSessions().length})`
                : tab.id === 'graph'
                ? `${tab.label}`
                : `${tab.label}(${getRowsForTab(tab.id).length})`;
            button.addEventListener('click', () => {
                currentTab = tab.id;
                currentPage = 1;
                selectedKey = null;
                renderAll();
            });
            tabsBar.appendChild(button);
        }
        // 「新增」按钮:提示词 / 精选工具标签页且数据库已激活时可见
        addToolBtn.style.display =
            (currentTab === 'featured' || currentTab === 'prompts') && window.dataStore.isActivated() ? '' : 'none';
        // 搜索框:日志 Tab 与图谱 Tab 均隐藏(图谱自带搜索框)
        searchInput.style.display = (currentTab === 'logs' || currentTab === 'graph') ? 'none' : '';
        // 清空日志按钮:仅日志 Tab 且已激活可见
        const clearLogBtn = document.getElementById('dmClearLogBtn');
        if (clearLogBtn) clearLogBtn.style.display = currentTab === 'logs' ? '' : 'none';
    }

    /** 渲染当前页列表(含修改标记●与禁用标记) */
    function renderList() {
        if (currentTab === 'graph') { renderGraph(); return; } // 图谱 Tab 走独立渲染(自身负责添加布局类)
        // 从图谱 Tab 切回普通 Tab：恢复左侧列表与分隔条布局
        // (必须位于 logs 分支之前:日志 Tab 依赖左侧列表,否则 dm-body-graph 类残留会把列表隐藏成"记录为空")
        const body = document.querySelector('.dm-body');
        if (body) body.classList.remove('dm-body-graph');
        listEl.style.display = '';
        const splitter = document.getElementById('dmSplitter');
        if (splitter) splitter.style.display = '';
        if (currentTab === 'logs') { renderLogList(); return; } // 日志 Tab 走独立列表渲染
        const rows = filterRows(getRowsForTab(currentTab));
        const totalPages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
        if (currentPage > totalPages) currentPage = totalPages;
        const pageRows = rows.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

        listEl.innerHTML = '';
        for (const row of pageRows) {
            const key = rowKey(row);
            const item = document.createElement('li');
            item.className = 'dm-item' + (key === selectedKey ? ' dm-item-active' : '');
            item.innerHTML =
                `<span class="dm-item-name">${escapeHtml(key)}</span>`
                + (row.is_modified ? '<span class="dm-item-dot" title="已修改">●</span>' : '')
                + (row.enabled === false ? '<span class="dm-item-off">已禁用</span>' : '')
                + `<span class="dm-item-desc">${escapeHtml(row.description || '')}</span>`;
            item.addEventListener('click', () => {
                selectedKey = key;
                editMode = false; // 切换条目回到显示态,避免编辑态残留
                renderList();
                renderEdit(row);
            });
            listEl.appendChild(item);
        }
        pageInfoEl.textContent = `${currentPage} / ${totalPages} 页 · 共 ${rows.length} 条`;
        prevPageBtn.disabled = currentPage <= 1;
        nextPageBtn.disabled = currentPage >= totalPages;
    }

    /** 全量刷新抽屉界面(不清空编辑面板选中态时可单独调 renderList) */
    function renderAll() {
        editorHistoryStack = []; // 整体重渲染时清空跳转来源栈,避免「返回来源」残留指向旧状态
        renderStatus();
        renderTabs();
        renderList();
        if (currentTab === 'graph') return; // 图谱 Tab 由 renderGraph 自行填充主区
        if (!selectedKey) {
            editPane.innerHTML = '<div class="dm-edit-empty">请选择左侧条目进行查看 / 编辑</div>';
        }
    }

    /** 渲染图谱 Tab（委托 graph-view.js，主区交付画布容器） */
    function renderGraph() {
        // 图谱需要全宽画布：隐藏左侧列表区与分隔条，编辑区占满（通过 body 上的布局类切换）
        const body = document.querySelector('.dm-body');
        if (body) body.classList.add('dm-body-graph');
        listEl.style.display = 'none';
        const splitter = document.getElementById('dmSplitter');
        if (splitter) splitter.style.display = 'none';
        editPane.style.display = '';
        // 复用 dmEdit 作为图谱画布容器（与编辑区同一主区位置，现占满整行）
        editPane.innerHTML = '<div class="dm-graph-canvas" id="dmGraphCanvas"></div>';
        const canvas = document.getElementById('dmGraphCanvas');
        if (window.graphView && window.graphView.render) {
            window.graphView.render(canvas);
        } else {
            canvas.innerHTML = '<div class="dm-edit-empty">图谱模块未加载（请检查 graph-view.js 是否引入）</div>';
        }
    }

    // ==================== 双击 @引用跳转:编辑器状态栈(保持原编辑器内容与位置) ====================

    /**
     * 编辑器状态栈:双击 @引用跳转到关联条目前,先把「当前编辑器状态」压栈保存,
     * 跳转后可在编辑面板顶部点击「返回来源」恢复原来的标签页 / 选中项 / 编辑态 / 输入值 / 滚动位置,
     * 避免用户未保存的编辑内容因跳转而丢失(详见任务要求:双击跳转不应清空原编辑器)。
     */
    let editorHistoryStack = [];

    /** 采集当前编辑面板内所有 input/textarea 的值(按出现顺序,用于返回时按序回填) */
    function snapshotEditInputs() {
        return [...editPane.querySelectorAll('input, textarea')].map(el => el.value);
    }

    /** 按序把快照值回填到当前编辑面板的 input/textarea(依赖同一编辑态控件顺序一致) */
    function restoreEditInputs(values) {
        if (!values || !values.length) return;
        const els = [...editPane.querySelectorAll('input, textarea')];
        values.forEach((v, i) => { if (els[i] !== undefined) els[i].value = v; });
    }

    /** 返回上一处跳转来源:恢复标签页 / 选中项 / 编辑态 / 输入值 / 滚动位置 */
    function popHistory() {
        const snap = editorHistoryStack.pop();
        if (!snap) return;
        currentTab = snap.tab;
        selectedKey = snap.key;
        editMode = snap.editMode;
        renderStatus();
        renderTabs();
        renderList();
        const row = filterRows(getRowsForTab(currentTab)).find(item => rowKey(item) === snap.key)
            || getRowsForTab(currentTab).find(item => rowKey(item) === snap.key);
        if (row) renderEdit(row);
        else editPane.innerHTML = '<div class="dm-edit-empty">请选择左侧条目进行查看 / 编辑</div>';
        // 回填未保存的输入并恢复滚动位置(先渲染再回填,确保控件已存在)
        if (snap.scrollTop != null) editPane.scrollTop = snap.scrollTop;
        restoreEditInputs(snap.inputs);
    }

    // ==================== @引用高亮 / 引用信息卡 / 跳转 ====================

    /**
     * 将文本中的 @name 显式引用渲染为可点击高亮的 dm-ref 片段(其余内容转义)
     * 渲染时只显示 name 本身，保持人类阅读观感(详见《界面原型说明》§4.7「@引用 标记交互」)；
     * 单击展开信息卡、双击跳转逻辑由全局委托统一处理。
     */
    function renderRefs(text) {
        if (!text) return '';
        // @name 显式引用：渲染为可点击高亮的 dm-ref 片段(其余内容转义)
        // 关键约束(D3)：高亮前必须先用 getRefInfo 校验目标是否真实存在
        // (即在 精选工具 / 元工具 / EDA函数 / 资源 / 提示词 任一集合中能命中);
        // 若目标不存在(脏引用 / 拼写错误 / 尚未创建)，则保持原文本不高亮，
        // 避免双击信息卡无法跳转造成误导。与 extractVisibleRefs 的 @name 分支口径一致。
        return escapeHtml(text)
            .replace(/@([A-Za-z0-9_.\$]+)/g,
                (_, name) => getRefInfo(name)
                    ? `<span class="dm-ref" data-ref="${name}">${name}</span>`
                    : `@${name}`);
    }

	/**
	 * 从函数实现/提示词正文等源码文本中提取引用并渲染为可点击高亮的 dm-ref 片段
	 * （其余源码转义并保持等宽展示）。
	 * 识别三类引用,均与 @引用 共享同一套「单击信息卡 / 双击跳转」机制(由全局委托统一处理):
	 *   1. @name 显式标记引用(如 @sch_PrimitiveComponent$createBatch);
 *   2. 全局对象调用引用:window.curatedTools.<name>(...) / window.mcpProtocol.<name>(...)
 *      —— 这些「真实调用」与 @引用 拥有同等效力,信息卡按 <name> 命中精选工具/元工具;
	 *   3. 原生 API 调用引用:eda.<完整路径>(如 eda.sch_PrimitiveComponent.create)
	 *      —— 按完整路径命中 EDA函数(jdb)节点。
	 * 与 renderRefs 区别：此处面向「代码正文」，对 @name 不隐去 @ 符号，完整保留引用标记以便定位。
	 * @param {string} text 源码文本
	 * @returns {string} HTML 片段（无引用返回空串）
	 */
	function extractVisibleRefs(text) {
		if (!text) return '';
		let html = escapeHtml(text);
		// 1. 全局对象调用引用:window.curatedTools.xxx(...) / window.mcpProtocol.xxx(...)
		//    仅取「第一级方法名」(如 curatedToolSchemas 而非 curatedToolSchemas.find),避免把链式调用后缀误并入引用名导致无法跳转;
		//    方法名自身不含 '.',故字符集不含 '.',自然切断后续链式属性(.find 等)
		//    高亮前必须用 getRefInfo 校验该引用是否真实存在(即在 custom/mcp 工具集合中能命中):
		//    像 window.curatedTools.curatedToolSchemas 这类「对象属性」(并非工具)即便被匹配也不应渲染成可点链接,
		//    否则双击信息卡无法跳转,造成误导;存在性校验不通过时保持原文本不高亮。
		html = html.replace(/window\.(curatedTools|mcpProtocol)\.([A-Za-z0-9_$]+)/g,
			(_m, obj, name) => getRefInfo(name)
				? `window.${obj}.<span class="dm-ref" data-ref="${name}">${name}</span>`
				: _m);
		// 2. 原生 API 调用引用:eda.完整路径(如 eda.isch_PrimitiveArc.done)
		//    按完整路径命中 EDA函数(jdb)节点(与 buildGraph 的 native_fallback 口径一致)
		//    同样需校验存在性:提取路径须能在 edaApi 原生清单中命中,否则不高亮
		html = html.replace(/\beda\.([A-Za-z0-9_.\$]+)/g,
			(_m, name) => getRefInfo(name)
				? `eda.<span class="dm-ref" data-ref="${name}">${name}</span>`
				: _m);
		// 3. @name 显式标记引用(保留 @ 符号,便于定位)
		//    同样校验存在性:@ 引用的目标若不存在于任意集合中,则不应渲染为可跳转链接
		html = html.replace(/(^|[^@])@([A-Za-z0-9_.\$]+)/g,
			(_m, pre, name) => getRefInfo(name)
				? `${pre}<span class="dm-ref" data-ref="${name}">@${name}</span>`
				: _m);
		return html ? `<pre class="dm-code-view">${html}</pre>` : '';
	}

    /**
     * 把日志快照字段归一为对象,供渲染前统一解析为真实结构。
     *
     * @param {*} value 日志快照字段(可能是对象、JSON 字符串或 null)
     * @returns {*} 解析后的对象;非字符串或解析失败则原样返回
     */
    function toJsonObject(value) {
        if (typeof value !== 'string') return value; // 非字符串(对象/数组/null)直接透传
        if (value.trim() === '') return value; // 空字符串不构成合法 JSON,透传
        try {
            return JSON.parse(value); // 字符串则解析回真实结构
        } catch (err) {
            return value; // 解析失败保留原文本,交由 renderJsonFoldable 降级处理
        }
    }

    /**
     * 将 JSON 字符串渲染为「按 { } [ ] 层级可折叠」的 HTML。
     *
     * 排版约定(彻底重写,避免旧版逗号孤行 / 键名丢失 / 块级错位):
     * 1. 先 JSON.parse 为真实结构,再递归生成 HTML;字符串字面量内部的括号属于值本身,不会误拆。
     * 2. 每个对象 / 数组是一个**块级** <details> 可折叠单元,summary 仅显示 '{' 或 '[';
     *    展开后 body 显示子项(子项若仍为对象/数组则递归可继续折叠)。
     * 3. 子项统一用 .dm-json-line(块级)包裹,逗号作为**行内文本**追加在值 / 闭括号后,
     *    因此逗号永远紧贴上一元素结尾(如 "}," 或 "],"),绝不出现在孤立行。
     * 4. 父级键名(label)作为 .dm-json-line 的前导 span,与折叠单元同处一行,不会丢失。
     * 5. 字符串值内部经 renderRefs 保留 @引用高亮;值内换行由 CSS white-space: pre-wrap 自动折行,
     *    既保留缩进观感又不破坏 JSON 树层级(CSS 控制,不在 JS 内插入真实换行)。
     * 6. 折叠态 summary 追加 "... }" / "... ]" 并带尾逗号,使收起时层级与分隔依然完整可辨。
     * 7. 解析失败(非法 JSON)降级为纯文本 + renderRefs,避免整段日志无法展示。
     *
     * @param {string} jsonString JSON 文本
     * @returns {string} 可折叠 HTML
     */
    function renderJsonFoldable(jsonString) {
        let value;
        try {
            value = JSON.parse(jsonString); // 解析为真实结构(失败则走降级)
        } catch (err) {
            // 降级:非 JSON 内容直接转义 + @引用高亮
            return `<pre class="dm-code-view">${renderRefs(jsonString)}</pre>`;
        }

        /** 递归生成单个 JSON 节点的 HTML;isLast 控制当前节点后是否追加逗号 */
        function nodeHtml(val, keyLabel, isLast) {
            const comma = isLast ? '' : ','; // 逗号紧贴本节点末尾(非末项时)
            const label = keyLabel ? `<span class="dm-json-key">${escapeHtml(keyLabel)}:</span> ` : '';

            // 对象:块级可折叠单元,summary 显示 '{',body 显示子项,末尾 '}' 自带行内逗号
            if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
                const entries = Object.keys(val);
                const body = entries
                    .map((k, i) => `<div class="dm-json-line">${nodeHtml(val[k], k, i === entries.length - 1)}</div>`)
                    .join('');
                const summaryHint = entries.length === 0 ? '}' : '... }';
                return `<div class="dm-json-node">${label}<details class="dm-json-fold" open>`
                    + `<summary>{<span class="dm-json-hint">${summaryHint}</span></summary>`
                    + `<div class="dm-json-body">${body}</div>}`
                    + `<span class="dm-json-comma">${comma}</span></details></div>`;
            }

            // 数组:块级可折叠单元,summary 显示 '[',body 显示元素,末尾 ']' 自带行内逗号
            if (Array.isArray(val)) {
                const body = val
                    .map((item, i) => `<div class="dm-json-line">${nodeHtml(item, null, i === val.length - 1)}</div>`)
                    .join('');
                const summaryHint = val.length === 0 ? ']' : '... ]';
                return `<div class="dm-json-node">${label}<details class="dm-json-fold" open>`
                    + `<summary>[<span class="dm-json-hint">${summaryHint}</span></summary>`
                    + `<div class="dm-json-body">${body}</div>]`
                    + `<span class="dm-json-comma">${comma}</span></details></div>`;
            }

            // 基本类型:键名(若有) + 值 + 行内逗号,整段处于同一 .dm-json-line 内
            if (typeof val === 'string') {
                return `${label}<span class="dm-json-str">"${renderRefs(val)}"</span><span class="dm-json-comma">${comma}</span>`;
            }
            if (typeof val === 'number' || typeof val === 'boolean') {
                return `${label}<span class="dm-json-num">${String(val)}</span><span class="dm-json-comma">${comma}</span>`;
            }
            if (val === null) {
                return `${label}<span class="dm-json-null">null</span><span class="dm-json-comma">${comma}</span>`;
            }
            return `${label}<span class="dm-json-str">${escapeHtml(String(val))}</span><span class="dm-json-comma">${comma}</span>`;
        }

        return `<div class="dm-json-tree">${nodeHtml(value, null, true)}</div>`;
    }

    /** 引用信息卡浮动元素(惰性创建) */
    let refCardEl = null;
    function ensureRefCard() {
        if (refCardEl) return refCardEl;
        refCardEl = document.createElement('div');
        refCardEl.className = 'dm-ref-card';
        refCardEl.style.display = 'none';
        document.body.appendChild(refCardEl);
        return refCardEl;
    }

    /** 从当前运行数据查找引用目标的摘要信息(类型/描述/启用态) */
    function getRefInfo(name) {
        const custom = (window.curatedTools.curatedToolSchemas || []).find(t => t.name === name);
        const meta = (window.mcpProtocol.metaToolSchemas || []).find(t => t.name === name);
        const jdb = (window.edaApi || []).find(t => t.name === name);
        const res = (window.resourceList || []).find(r => r.uri === name || r.name === name);
        const prompt = (window.promptList || []).find(p => p.name === name);
        if (custom) return { type: '精选工具', name, description: custom.description, enabled: custom.enabled };
        if (meta) return { type: '元工具', name, description: meta.description, enabled: meta.enabled };
        if (jdb) return { type: 'EDA函数', name, description: jdb.description, enabled: jdb.enabled };
        if (res) return { type: '资源', name, description: res.description };
        if (prompt) return { type: '提示词', name, description: prompt.description };
        return null;
    }

    /** 显示引用信息卡(校验引用是否存在,不存在标红提示) */
    function showRefCard(name, anchorEl) {
        const card = ensureRefCard();
        const info = getRefInfo(name);
        if (!info) {
            card.innerHTML = `<div class="dm-ref-card-title">@${escapeHtml(name)}</div>`
                + `<div class="dm-ref-card-body" style="color:#e74c3c">未找到该引用(可能为拼写错误或已删除)</div>`;
        } else {
            card.innerHTML = `<div class="dm-ref-card-title">${escapeHtml(info.type)}: @${escapeHtml(info.name)}</div>`
                + `<div class="dm-ref-card-body">${escapeHtml(info.description || '(无描述)')}</div>`
                + (info.enabled === false ? '<div class="dm-ref-card-warn">⚠ 该工具已禁用</div>' : '');
        }
        card.style.display = 'block';
        const rect = anchorEl.getBoundingClientRect();
        card.style.left = Math.min(rect.left, window.innerWidth - 320) + 'px';
        card.style.top = (rect.bottom + 6) + 'px';
    }

    /** 隐藏引用信息卡 */
    function hideRefCard() {
        if (refCardEl) refCardEl.style.display = 'none';
    }

    /** 双击引用跳转到对应条目(切换分栏并选中) */
    function jumpToRef(name) {
        hideRefCard();
        // 跳转前保存当前编辑器状态(仅当确有来源可返回),以便「返回来源」恢复原内容与位置
        if (selectedKey) {
            editorHistoryStack.push({
                tab: currentTab,
                key: selectedKey,
                editMode: editMode,
                scrollTop: editPane ? editPane.scrollTop : 0,
                inputs: snapshotEditInputs()
            });
        }
        const info = getRefInfo(name);
        let tab = 'prompts';
        if (info) {
            if (info.type === 'EDA函数') tab = 'jdb';
            else if (info.type === '精选工具' || info.type === '元工具') tab = 'featured';
            else if (info.type === '资源') tab = 'resources';
        }
        currentTab = tab;
        currentPage = 1;
        searchKeyword = '';
        searchInput.value = '';
        openDrawer();
        const rows = filterRows(getRowsForTab(currentTab));
        const match = rows.find(r => rowKey(r) === name);
        if (match) {
            selectedKey = name;
            editMode = false; // 跳转目标回到显示态
            renderList();
            renderEdit(match);
        }
    }

    // 全局委托:单击展开引用卡,双击跳转(详见《界面原型说明》§4.7「@引用 标记交互」)
    document.addEventListener('click', (e) => {
        const el = e.target.closest('.dm-ref');
        if (el) { showRefCard(el.dataset.ref, el); return; }
        if (refCardEl && !refCardEl.contains(e.target)) hideRefCard();
    });
    document.addEventListener('dblclick', (e) => {
        const el = e.target.closest('.dm-ref');
        if (el) { e.preventDefault(); jumpToRef(el.dataset.ref); }
    });

    // ==================== 日志 Tab（会话列表 + 轮次详情） ====================

    /** 渲染日志 Tab 的左侧会话列表 */
    function renderLogList() {
        const sessions = window.dataStore.getSessions();
        listEl.innerHTML = '';
        if (sessions.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'dm-item';
            empty.innerHTML = '<span class="dm-item-desc">暂无会话日志</span>';
            listEl.appendChild(empty);
            pageInfoEl.textContent = '共 0 个会话';
        } else {
            for (const s of sessions) {
                const item = document.createElement('li');
                item.className = 'dm-item';
                item.innerHTML =
                    `<span class="dm-item-name">${escapeHtml(s.title)}</span>`
                    + `<span class="dm-item-desc">${escapeHtml(s.created_at || '')}</span>`;
                item.addEventListener('click', () => renderLogDetail(s.session_id));
                listEl.appendChild(item);
            }
            pageInfoEl.textContent = `共 ${sessions.length} 个会话`;
        }
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        editPane.innerHTML = '<div class="dm-edit-empty">请选择左侧会话查看调用日志</div>';
    }

    /** 渲染日志 Tab 右侧:指定会话的逐轮请求/响应快照 */
    function renderLogDetail(sessionId) {
        const logs = window.dataStore.getSessionLogs(sessionId);
        editPane.innerHTML = '';
        const header = document.createElement('div');
        header.className = 'dm-edit-header';
        // 统计本会话 token 消耗总量:逐轮累加响应快照 usage.total_tokens(响应缺失/无 usage 时按 0 计)
        let totalTokens = 0;
        for (const log of logs) {
            const resp = toJsonObject(log.response_payload);
            totalTokens += (resp && resp.usage && resp.usage.total_tokens) || 0;
        }
        header.innerHTML =
            `<span class="dm-edit-name">会话日志</span>`
            + `<span class="dm-edit-meta">${logs.length} 轮</span>`
            + `<span class="dm-edit-meta">累计 ${totalTokens} tokens</span>`;
        // 复制全部按钮:一键复制该会话所有轮次的请求/响应 JSON(与单轮复制按钮并列于标题栏)
        const copyAllBtn = document.createElement('button');
        copyAllBtn.className = 'dm-log-copy-btn';
        copyAllBtn.textContent = '复制全部';
        copyAllBtn.title = '复制该会话全部轮次请求/响应 JSON';
        copyAllBtn.addEventListener('click', () => {
            // 复制前统一用 toJsonObject 归一字符串态快照,避免二次 JSON.stringify 双重编码
            const text = JSON.stringify(logs.map(log => ({
                turn: log.turn,
                created_at: log.created_at,
                request: toJsonObject(log.request_payload),
                response: toJsonObject(log.response_payload)
            })), null, 2);
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(text).then(
                    () => notifyOk('已复制全部轮次日志 JSON 到剪贴板'),
                    () => notifyError('复制失败,请手动选择复制')
                );
            } else {
                notifyError('当前环境不支持剪贴板复制');
            }
        });
        header.appendChild(copyAllBtn);
        editPane.appendChild(header);

        for (const log of logs) {
            // 整轮外层折叠容器:默认折叠,避免日志过长时全部铺开难以定位(用户要求)
            const block = document.createElement('details');
            block.className = 'dm-log-item';
            block.open = false; // 默认折叠,点击 summary 可展开整轮
            const turn = document.createElement('summary');
            turn.className = 'dm-log-turn';

            // 提取该轮 token 消耗:从响应快照 usage 中读取(ARK Responses API 结构为
            // {input_tokens, output_tokens, total_tokens};旧日志可能缺字段,统一按 0 保底)
            const resp4turn = toJsonObject(log.response_payload) || {};
            const usage = resp4turn.usage || {};
            const inTok = usage.input_tokens || usage.prompt_tokens || 0;
            const outTok = usage.output_tokens || usage.completion_tokens || 0;
            const totalTok = usage.total_tokens || (inTok + outTok);
            // 标题栏文本:轮次 + 时间 + 该轮 token 消耗(一目了然)
            const turnText = document.createElement('span');
            turnText.className = 'dm-log-turn-text';
            turnText.textContent = `第 ${log.turn} 轮 · ${log.created_at || ''}`;
            turn.appendChild(turnText);
            // 单轮 token 消耗徽标(置于标题栏,与复制按钮并列)
            const turnTokens = document.createElement('span');
            turnTokens.className = 'dm-log-turn-tokens';
            turnTokens.textContent = `↓${inTok} ↓${outTok} ∑${totalTok}`;
            turnTokens.title = `本轮回填:输入 ${inTok} tokens · 输出 ${outTok} tokens · 合计 ${totalTok} tokens`;
            turn.appendChild(turnTokens);

            // 复制按钮(置于标题栏,点击复制该轮完整 JSON;双击复制功能已移除)
            const copyBtn = document.createElement('button');
            copyBtn.className = 'dm-log-copy-btn';
            copyBtn.textContent = '复制';
            copyBtn.title = '复制该轮请求/响应 JSON';
            copyBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // 阻止触发 summary 的折叠切换
                // 复制前用 toJsonObject 归一:即便日志字段因历史写入仍是字符串态,也先解析回真实结构,
                // 避免对已序列化的 JSON 字符串二次 JSON.stringify 造成双重编码(转义嵌套)。
                const text = JSON.stringify({ request: toJsonObject(log.request_payload), response: toJsonObject(log.response_payload) }, null, 2);
                if (navigator.clipboard && navigator.clipboard.writeText) {
                    navigator.clipboard.writeText(text).then(
                        () => notifyOk('已复制该轮请求/响应 JSON 到剪贴板'),
                        () => notifyError('复制失败,请手动选择复制')
                    );
                } else {
                    notifyError('当前环境不支持剪贴板复制');
                }
            });
            turn.appendChild(copyBtn);
            block.appendChild(turn);

            // 请求快照:仅保留标签,JSON 内容改为按 { } [ ] 层级可折叠(移除原内层整体折叠,见需求4)
            const reqLabel = document.createElement('div');
            reqLabel.className = 'dm-log-label';
            reqLabel.textContent = '请求快照(request)';
            block.appendChild(reqLabel);
            const reqPre = document.createElement('div');
            reqPre.className = 'dm-code-view';
            reqPre.innerHTML = renderJsonFoldable(JSON.stringify(toJsonObject(log.request_payload), null, 2));
            block.appendChild(reqPre);

            // 响应快照:仅保留标签,JSON 内容改为按 { } [ ] 层级可折叠(移除原内层整体折叠,见需求4)
            const respLabel = document.createElement('div');
            respLabel.className = 'dm-log-label';
            respLabel.textContent = '响应快照(response)';
            block.appendChild(respLabel);
            const respPre = document.createElement('div');
            respPre.className = 'dm-code-view';
            respPre.innerHTML = renderJsonFoldable(JSON.stringify(toJsonObject(log.response_payload), null, 2));
            block.appendChild(respPre);

            editPane.appendChild(block);
        }
    }

    // ==================== 引用关系分析(轻量文本扫描) ====================

    /**
     * 计算指定工具的引用关系:
     * - outgoing: 该工具函数体中调用了哪些其他工具(custom/mcp 工具名与原生API名);
     * - incoming: 哪些工具的函数体、哪些提示词的内容中引用了该工具名。
     * 用于编辑保存后提示「修改函数需同步检查的关联项」。
     */
    function computeReferences(row) {
        // 委托 data-store.findReferences 统一扫描(工具互调 + 提示词引用)
        const refs = window.dataStore.findReferences(row.name);
        const outgoing = refs.calls.map(c => c.target); // 该工具调用了谁
        // 被引用方以 @name 形式呈现,便于后续引用高亮与跳转
        const incoming = refs.calledBy.map(c => `工具: @${c.target}`)
            .concat(refs.referencedByPrompts.map(p => `提示词: @${p}`));
        return { outgoing, incoming };
    }

    // ==================== 渲染:编辑面板 ====================

    /** 创建一个表单区块(标签 + 控件),返回外层容器 */
    function buildField(labelText, controlEl) {
        const wrap = document.createElement('div');
        wrap.className = 'dm-field';
        const label = document.createElement('label');
        label.className = 'dm-field-label';
        label.textContent = labelText;
        wrap.appendChild(label);
        wrap.appendChild(controlEl);
        return wrap;
    }

    /** 创建按钮 */
    function buildButton(text, className, onClick, disabled) {
        const button = document.createElement('button');
        button.className = className || 'dm-btn';
        button.textContent = text;
        button.disabled = !!disabled;
        button.addEventListener('click', onClick);
        return button;
    }

    /** 渲染编辑面板入口(按标签页类型分流) */
    function renderEdit(row) {
        editPane.innerHTML = '';
        // 若存在双击 @引用跳转来源,顶部提供「返回来源」按钮,点击恢复原编辑器内容与位置
        if (editorHistoryStack.length > 0) {
            const back = buildButton('← 返回来源', 'dm-btn dm-btn-back', popHistory);
            back.style.marginBottom = '8px';
            editPane.appendChild(back);
        }
        if (currentTab === 'prompts') renderPromptEdit(row);
        else if (currentTab === 'resources') renderResourceView(row);
        else renderToolEdit(row);
    }

    /** 渲染编辑面板头部(名称 + 元信息标签) */
    function renderEditHeader(titleText, metaTexts) {
        const header = document.createElement('div');
        header.className = 'dm-edit-header';
        header.innerHTML = `<span class="dm-edit-name">${escapeHtml(titleText)}</span>`
            + (metaTexts || []).map(text => `<span class="dm-edit-meta">${escapeHtml(text)}</span>`).join('');
        editPane.appendChild(header);
        // 未激活时展示只读横幅提示
        if (!window.dataStore.isActivated()) {
            const banner = document.createElement('div');
            banner.className = 'dm-readonly-banner';
            banner.textContent = '当前为只读预览(原始JS数据),请先「导入 → 从源码导入」激活数据库后再编辑';
            editPane.appendChild(banner);
        }
    }

    /** 渲染提示词编辑面板(显示态 / 编辑态二选一,由 editMode 控制,二者不并存) */
    function renderPromptEdit(row) {
        const activated = window.dataStore.isActivated();
        if (!activated) editMode = false; // 未激活强制显示态(只读预览)
        renderEditHeader(row.name, [`分类: ${row.category}`, row.is_modified ? '已修改' : '出厂默认']);

        // 内容解析:单条纯文本消息用「纯文本模式」,否则「JSON 模式」,供编辑态回写与显示态展示
        let messages;
        try {
            messages = JSON.parse(row.messages);
        } catch (error) {
            messages = [];
        }
        const isPlainTextMode = messages.length === 1
            && messages[0] && messages[0].content && messages[0].content.type === 'text';
        const contentText = isPlainTextMode
            ? messages[0].content.text
            : JSON.stringify(messages, null, '\t');

        if (editMode) {
            // ===== 编辑态:可编辑表单 + 保存/取消,不展示 @引用预览(避免编辑与显示并存) =====
            const descInput = document.createElement('input');
            descInput.className = 'dm-input';
            descInput.value = row.description || '';
            editPane.appendChild(buildField('描述(description)', descInput));

            const contentArea = document.createElement('textarea');
            contentArea.className = 'dm-textarea dm-textarea-lg';
            contentArea.value = contentText;
            editPane.appendChild(buildField(
                isPlainTextMode ? '内容(messages[0].content.text)' : '内容(messages 完整 JSON)',
                contentArea
            ));

            const actions = document.createElement('div');
            actions.className = 'dm-actions';
            // 保存:纯文本模式回写正文,JSON 模式强校验后整体替换
            actions.appendChild(buildButton('保存', 'dm-btn dm-btn-primary', async () => {
                try {
                    let newMessages;
                    if (isPlainTextMode) {
                        messages[0].content.text = contentArea.value;
                        newMessages = JSON.stringify(messages);
                    } else {
                        newMessages = JSON.stringify(JSON.parse(contentArea.value));
                    }
                    await window.dataStore.updatePrompt(row.name, {
                        description: descInput.value,
                        messages: newMessages
                    });
                    notifyOk(`提示词「${row.name}」已保存并即时生效`);
                    editMode = false; // 保存后回到显示态查看结果
                    refreshAfterMutation(row.name);
                } catch (error) {
                    notifyError(error);
                }
            }));
            // 取消:放弃未保存修改,回到显示态
            actions.appendChild(buildButton('取消', 'dm-btn', () => {
                editMode = false;
                renderEdit(row);
            }));
            editPane.appendChild(actions);
        } else {
            // ===== 显示态:只读高亮预览(含 @引用高亮),底部「编辑」按钮(未激活禁用) =====
            const descView = document.createElement('div');
            descView.className = 'dm-refs';
            // 描述文本经 renderRefs 处理,使其内部的 @引用(如 @sch_PrimitiveComponent$createBatch)高亮并支持单击/双击跳转
            descView.innerHTML = `<div class="dm-refs-line"><b>描述:</b> ${renderRefs(row.description || '(无)')}</div>`;
            editPane.appendChild(descView);

            const contentBox = document.createElement('div');
            contentBox.className = 'dm-refs';
            contentBox.innerHTML = `<div class="dm-refs-line"><b>${isPlainTextMode ? '内容(messages[0].content.text):' : '内容(messages 完整 JSON):'}</b></div>`
                + `<div class="dm-refs-line">${extractVisibleRefs(contentText)}</div>`;
            editPane.appendChild(contentBox);

            const actions = document.createElement('div');
            actions.className = 'dm-actions';
            // 编辑:进入编辑态重渲染(未激活时禁用)
            actions.appendChild(buildButton('编辑', 'dm-btn dm-btn-primary', () => {
                editMode = true;
                renderEdit(row);
            }, !activated));
            // 恢复此条默认:显示态专属(编辑态不提供,避免误操作)
            actions.appendChild(buildButton('恢复此条默认', 'dm-btn', async () => {
                if (!confirm(`确认将提示词「${row.name}」恢复为出厂默认吗?当前修改将丢失。`)) return;
                try {
                    await window.dataStore.resetPrompt(row.name);
                    notifyOk(`提示词「${row.name}」已恢复出厂默认`);
                    refreshAfterMutation(row.name);
                } catch (error) {
                    notifyError(error);
                }
            }, !activated));
            // 删除:显示态专属,删除前做引用保护检查(详见《界面原型说明》§4.6「编辑面板」与《系统设计说明》§4.4「引用检测与删除保护」)
            actions.appendChild(buildButton('删除', 'dm-btn dm-btn-danger', async () => {
                const refs = window.dataStore.findReferences(row.name);
                const blockers = refs.calledBy.map(c => `工具: ${c.target}`).concat(refs.referencedByPrompts.map(p => `提示词: ${p}`));
                if (blockers.length > 0) {
                    if (!confirm(`提示词「${row.name}」被以下条目引用,删除可能导致其失效:\n${blockers.join('\n')}\n仍要强制删除?`)) return;
                } else if (!confirm(`确认删除提示词「${row.name}」?`)) {
                    return;
                }
                try {
                    await window.dataStore.deletePrompt(row.name);
                    selectedKey = null;
                    notifyOk(`提示词「${row.name}」已删除`);
                    renderAll();
                } catch (error) {
                    notifyError(error);
                }
            }, !activated));
            editPane.appendChild(actions);
        }
    }
    /** 渲染工具编辑面板(EDA函数 / 精选工具 / 元工具通用,显示态 / 编辑态二选一由 editMode 控制) */
    function renderToolEdit(row) {
        const activated = window.dataStore.isActivated();
        if (!activated) editMode = false; // 未激活强制显示态(只读预览)
        const sourceLabel = { jdb: '原生API', mcp: '元工具', custom: '精选工具' }[row.source] || row.source;
        renderEditHeader(row.name, [
            `来源: ${sourceLabel}`,
            row.is_modified ? '已修改' : '出厂默认',
            row.enabled === false ? '已禁用' : '已启用'
        ]);

        // 参数模式文本(供编辑态回写与显示态展示)
        let schemaText;
        try {
            schemaText = JSON.stringify(JSON.parse(row.input_schema), null, '\t');
        } catch (error) {
            schemaText = row.input_schema || '';
        }

        if (editMode) {
            // ===== 编辑态:可编辑表单 + 保存/取消/AI生成,不展示 @引用预览(避免编辑与显示并存) =====
            const descArea = document.createElement('textarea');
            descArea.className = 'dm-textarea';
            descArea.value = row.description || '';
            editPane.appendChild(buildField('描述(description)', descArea));

            const schemaArea = document.createElement('textarea');
            schemaArea.className = 'dm-textarea';
            schemaArea.value = schemaText;
            editPane.appendChild(buildField('参数模式(inputSchema JSON)', schemaArea));

            // 函数实现编辑(仅 mcp/custom 有函数体;jdb 原生API无函数体不展示)
            let implArea = null;
            if (row.source !== 'jdb') {
                implArea = document.createElement('textarea');
                implArea.className = 'dm-textarea dm-textarea-lg dm-code';
                implArea.value = row.impl_code || '';
                editPane.appendChild(buildField('函数实现(impl_code,保存前校验语法)', implArea));
            }

            // 启用开关
            const enabledLabel = document.createElement('label');
            enabledLabel.className = 'dm-enabled-label';
            const enabledCheckbox = document.createElement('input');
            enabledCheckbox.type = 'checkbox';
            enabledCheckbox.checked = row.enabled !== false;
            enabledLabel.appendChild(enabledCheckbox);
            enabledLabel.appendChild(document.createTextNode(' 启用该工具(禁用后不参与 listTools / searchTools / callTool)'));
            editPane.appendChild(enabledLabel);

            // 引用关系提示(修改函数时需同步检查的关联项)
            const references = computeReferences(row);
            if (references.outgoing.length > 0 || references.incoming.length > 0) {
                const refBox = document.createElement('div');
                refBox.className = 'dm-refs';
                const outgoingText = references.outgoing.length ? '调用了: ' + references.outgoing.map(n => '@' + n).join('、') : '';
                const incomingText = references.incoming.length ? '被引用: ' + references.incoming.join('、') : '';
                refBox.innerHTML =
                    (outgoingText ? `<div class="dm-refs-line">${renderRefs(outgoingText)}</div>` : '')
                    + (incomingText ? `<div class="dm-refs-line">${renderRefs(incomingText)}</div>` : '')
                    + '<div class="dm-refs-tip">单击高亮引用可查看详情,双击可跳转到该条目;修改本工具后请同步检查关联项的描述与实现是否需要更新</div>';
                editPane.appendChild(refBox);
            }

            // 操作按钮区
            const actions = document.createElement('div');
            actions.className = 'dm-actions';
            actions.appendChild(buildButton('保存', 'dm-btn dm-btn-primary', async () => {
                try {
                    const patch = {
                        description: descArea.value,
                        inputSchema: JSON.stringify(JSON.parse(schemaArea.value)),
                        enabled: enabledCheckbox.checked
                    };
                    if (implArea) patch.implCode = implArea.value;
                    await window.dataStore.updateTool(row.name, patch);
                    notifyOk(`工具「${row.name}」已保存并即时生效`);
                    editMode = false; // 保存后回到显示态查看结果
                    refreshAfterMutation(row.name);
                } catch (error) {
                    notifyError(error);
                }
            }));
            actions.appendChild(buildButton('取消', 'dm-btn', () => {
                editMode = false;
                renderEdit(row);
            }));
            // 「AI 格式化并补全(代码+描述)」仅对携带函数体的工具开放(编辑态专属)
            if (implArea) {
                actions.appendChild(buildButton('AI 格式化并补全(代码+描述)', 'dm-btn', async (event) => {
                    const button = event.currentTarget;
                    button.disabled = true;
                    button.textContent = 'AI 处理中...';
                    try {
                        const result = await generateDescriptionByAI(row.name, implArea.value);
                        if (result.implCode) implArea.value = result.implCode;
                        if (result.description) descArea.value = result.description;
                        if (result.inputSchema) schemaArea.value = JSON.stringify(result.inputSchema, null, '\t');
                        notifyOk('AI 已格式化、修复并补充注释与描述,请人工确认后点击「保存」');
                    } catch (error) {
                        notifyError(error);
                    } finally {
                        button.disabled = false;
                        button.textContent = 'AI 格式化并补全(代码+描述)';
                    }
                }));
            }
            // 「删除」仅对无出厂对应的用户新增工具开放(出厂工具用「禁用」)
            if (row.source === 'curated' && row.is_modified) {
                actions.appendChild(buildButton('删除', 'dm-btn dm-btn-danger', async () => {
                    if (!confirm(`确认删除工具「${row.name}」吗?出厂工具会被拒绝删除。`)) return;
                    try {
                        await window.dataStore.deleteTool(row.name);
                        selectedKey = null;
                        notifyOk(`工具「${row.name}」已删除`);
                        renderAll();
                    } catch (error) {
                        notifyError(error);
                    }
                }));
            }
            editPane.appendChild(actions);
        } else {
            // ===== 显示态:只读高亮预览(含 @引用高亮),底部「编辑」按钮(未激活禁用) =====
            const descBox = document.createElement('div');
            descBox.className = 'dm-refs';
            // 描述文本经 renderRefs 处理,使其内部的 @引用(如 @sch_PrimitiveComponent$createBatch)高亮并支持单击/双击跳转
            descBox.innerHTML = `<div class="dm-refs-line"><b>描述:</b> ${renderRefs(row.description || '(无)')}</div>`
                + `<div class="dm-refs-line"><b>参数模式(inputSchema JSON):</b></div>`
                + `<div class="dm-refs-line"><pre class="dm-code-view">${escapeHtml(schemaText)}</pre></div>`;
            editPane.appendChild(descBox);

            // 函数实现只读预览(jdb 原生API无函数体跳过)
            if (row.source !== 'jdb' && row.impl_code) {
                const implBox = document.createElement('div');
                implBox.className = 'dm-refs';
                implBox.innerHTML = `<div class="dm-refs-line"><b>函数实现(impl_code):</b></div>`
                    + `<div class="dm-refs-line">${extractVisibleRefs(row.impl_code)}</div>`;
                editPane.appendChild(implBox);
            }

            // 启用状态只读展示
            const enabledBox = document.createElement('div');
            enabledBox.className = 'dm-refs';
            enabledBox.innerHTML = `<div class="dm-refs-line"><b>启用状态:</b> ${row.enabled === false ? '已禁用' : '已启用'}</div>`;
            editPane.appendChild(enabledBox);

            // 引用关系提示(显示态同样提示关联项,便于阅读时排查)
            const references = computeReferences(row);
            if (references.outgoing.length > 0 || references.incoming.length > 0) {
                const refBox = document.createElement('div');
                refBox.className = 'dm-refs';
                const outgoingText = references.outgoing.length ? '调用了: ' + references.outgoing.map(n => '@' + n).join('、') : '';
                const incomingText = references.incoming.length ? '被引用: ' + references.incoming.join('、') : '';
                refBox.innerHTML =
                    (outgoingText ? `<div class="dm-refs-line">${renderRefs(outgoingText)}</div>` : '')
                    + (incomingText ? `<div class="dm-refs-line">${renderRefs(incomingText)}</div>` : '')
                    + '<div class="dm-refs-tip">单击高亮引用可查看详情,双击可跳转到该条目</div>';
                editPane.appendChild(refBox);
            }

            // 操作按钮区:显示态仅提供「编辑」「恢复此条默认」「删除」
            const actions = document.createElement('div');
            actions.className = 'dm-actions';
            actions.appendChild(buildButton('编辑', 'dm-btn dm-btn-primary', () => {
                editMode = true;
                renderEdit(row);
            }, !activated));
            actions.appendChild(buildButton('恢复此条默认', 'dm-btn', async () => {
                if (!confirm(`确认将工具「${row.name}」恢复为出厂默认吗?当前修改将丢失。`)) return;
                try {
                    await window.dataStore.resetTool(row.name);
                    notifyOk(`工具「${row.name}」已恢复出厂默认`);
                    refreshAfterMutation(row.name);
                } catch (error) {
                    notifyError(error);
                }
            }, !activated));
            if (row.source === 'curated' && row.is_modified) {
                actions.appendChild(buildButton('删除', 'dm-btn dm-btn-danger', async () => {
                    if (!confirm(`确认删除工具「${row.name}」吗?出厂工具会被拒绝删除。`)) return;
                    try {
                        await window.dataStore.deleteTool(row.name);
                        selectedKey = null;
                        notifyOk(`工具「${row.name}」已删除`);
                        renderAll();
                    } catch (error) {
                        notifyError(error);
                    }
                }, !activated));
            }
            editPane.appendChild(actions);
        }
    }

    /** 渲染资源编辑面板(显示态 / 编辑态二选一,由 editMode 控制,二者不并存,与提示词编辑面板完全同构) */
    function renderResourceView(row) {
        const activated = window.dataStore.isActivated();
        if (!activated) editMode = false; // 未激活强制显示态(只读预览)
        renderEditHeader(row.name || row.uri, [`URI: ${row.uri}`, `类型: ${row.mime_type || '未知'}`, row.is_modified ? '已修改' : '出厂默认']);

        if (editMode) {
            // ===== 编辑态:可编辑表单 + 保存/取消,不展示 @引用预览(避免编辑与显示并存) =====
            const descInput = document.createElement('input');
            descInput.className = 'dm-input';
            descInput.value = row.description || '';
            editPane.appendChild(buildField('描述(description)', descInput));

            const contentArea = document.createElement('textarea');
            contentArea.className = 'dm-textarea dm-textarea-lg';
            contentArea.value = row.content || '';
            editPane.appendChild(buildField('内容(content)', contentArea));

            const actions = document.createElement('div');
            actions.className = 'dm-actions';
            // 保存:回写 description 与 content
            actions.appendChild(buildButton('保存', 'dm-btn dm-btn-primary', async () => {
                try {
                    await window.dataStore.updateResource(row.uri, {
                        description: descInput.value,
                        content: contentArea.value
                    });
                    notifyOk(`资源「${row.uri}」已保存并即时生效`);
                    editMode = false; // 保存后回到显示态查看结果
                    refreshAfterMutation(row.uri);
                } catch (error) {
                    notifyError(error);
                }
            }));
            // 取消:放弃未保存修改,回到显示态
            actions.appendChild(buildButton('取消', 'dm-btn', () => {
                editMode = false;
                renderEdit(row);
            }));
            editPane.appendChild(actions);
        } else {
            // ===== 显示态:只读高亮预览(含 @引用高亮),底部「编辑」按钮(未激活禁用) =====
            const descView = document.createElement('div');
            descView.className = 'dm-refs';
            // 描述文本经 renderRefs 处理,使其内部的 @引用(如 @resource_jlc_sch_primitive)高亮并支持单击/双击跳转
            descView.innerHTML = `<div class="dm-refs-line"><b>描述:</b> ${renderRefs(row.description || '(无)')}</div>`;
            editPane.appendChild(descView);

            const contentBox = document.createElement('div');
            contentBox.className = 'dm-refs';
            contentBox.innerHTML = `<div class="dm-refs-line"><b>内容:</b></div>`
                + `<div class="dm-refs-line">${extractVisibleRefs(row.content || '(空)')}</div>`;
            editPane.appendChild(contentBox);

            const actions = document.createElement('div');
            actions.className = 'dm-actions';
            // 编辑:进入编辑态重渲染(未激活时禁用)
            actions.appendChild(buildButton('编辑', 'dm-btn dm-btn-primary', () => {
                editMode = true;
                renderEdit(row);
            }, !activated));
            // 恢复此条默认:显示态专属(编辑态不提供,避免误操作)
            actions.appendChild(buildButton('恢复此条默认', 'dm-btn', async () => {
                if (!confirm(`确认将资源「${row.uri}」恢复为出厂默认吗?当前修改将丢失。`)) return;
                try {
                    await window.dataStore.resetResource(row.uri);
                    notifyOk(`资源「${row.uri}」已恢复出厂默认`);
                    refreshAfterMutation(row.uri);
                } catch (error) {
                    notifyError(error);
                }
            }, !activated));
            editPane.appendChild(actions);
        }
    }

    /** 变更保存后的界面刷新(保持当前选中条目并重新渲染其最新数据) */
    function refreshAfterMutation(key) {
        editorHistoryStack = []; // 保存/删除后清空跳转来源栈,避免「返回来源」指向已变更的旧状态
        selectedKey = key;
        renderStatus();
        renderTabs();
        renderList();
        const row = filterRows(getRowsForTab(currentTab)).find(item => rowKey(item) === key)
            || getRowsForTab(currentTab).find(item => rowKey(item) === key);
        if (row) renderEdit(row);
        else editPane.innerHTML = '<div class="dm-edit-empty">请选择左侧条目进行查看 / 编辑</div>';
    }

    // ==================== AI 生成描述(复用聊天配置的 ARK / 私服通道) ====================

    /**
     * 调用 AI 对用户编写的工具函数做「格式化 + 修复 + 补注释 + 生成描述」:
     * - 格式化:统一缩进与代码风格,保持函数语义不变;
     * - 修复不足:修正明显的语法错误、边界条件缺陷与健壮性问题,不改变函数对外行为;
     * - 补注释:在函数体内补充详尽的中文注释,说明函数逻辑与关键参数;
     * - 生成描述:输出中文工具描述与 JSON Schema 参数模式,供回填编辑表单。
     * 要求 AI 仅返回 JSON:{ "implCode": string, "description": string, "inputSchema": object }
     */
    async function generateDescriptionByAI(toolName, implCode) {
        if (!implCode || !implCode.trim()) throw new Error('函数实现为空,无法生成描述');
        const usePrivateServer = localStorage.getItem('use_private_server') === 'true';
        const messages = [
            {
                role: 'system',
                content: '你是一名资深前端代码审查与工具元数据生成助手。用户提供一个 JavaScript 工具函数的源码,'
                    + '请依次完成以下任务,保持函数语义与对外行为完全不变:'
                    + '1. 格式化函数代码:统一缩进与代码风格;'
                    + '2. 修复不足:修正明显的语法错误、边界条件缺陷与健壮性问题(如缺失空值保护),不改变返回结构与对外行为;'
                    + '3. 在函数体内补充详尽的中文注释,说明函数逻辑与关键参数;'
                    + '4. 生成简洁准确的中文描述(含参数与返回值说明)与 JSON Schema 参数模式。'
                    + '只返回一个 JSON 对象(不要 markdown 代码块),格式为:'
                    + '{"implCode":"格式化修复并补充注释后的完整函数源码","description":"工具功能描述(含参数与返回值说明)","inputSchema":{"type":"object","properties":{},"required":[]}}'
            },
            {
                role: 'user',
                content: `工具名称: ${toolName}\n函数源码:\n${implCode}`
            }
        ];
        const response = await window.ArkAPI[usePrivateServer ? 'callPrivateChat' : 'callArkChat'](messages, null, []);
        // ArkAPI 统一返回 {data, request}(data 为 ARK 真实响应、request 为真实请求体),解析 data.output 中的助手文本
        const data = (response && response.data) ? response.data : response;
        let text = '';
        if (data && Array.isArray(data.output)) {
            for (const item of data.output) {
                if (item.type === 'message' && item.role === 'assistant' && Array.isArray(item.content)) {
                    text += item.content.filter(c => c.type === 'output_text').map(c => c.text).join('');
                }
            }
        }
        if (!text) throw new Error('AI 未返回有效内容');
        // 容错剥离可能存在的 markdown 代码块包裹
        const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```\s*$/, '').trim();
        const parsed = JSON.parse(jsonText);
        if (!parsed || typeof parsed.description !== 'string') {
            throw new Error('AI 返回内容不符合 {implCode, description, inputSchema} 格式');
        }
        return parsed;
    }

    // ==================== 全局操作事件绑定 ====================

    /** 打开抽屉并刷新全部内容 */
    function openDrawer() {
        drawer.style.display = 'block';
        // 清空高度限制,防止放大后高度被限制导致下面留空
        window.parent.document.querySelector('div[data-dialog-tagitem=lc_modal_dialog__body]').style.maxHeight = null;
        renderAll();
    }

    /** 关闭抽屉 */
    function closeDrawer() {
        drawer.style.display = 'none';
    }

    // 「数据」按钮与关闭交互
    document.getElementById('dataBtn').addEventListener('click', openDrawer);
    document.getElementById('dmCloseBtn').addEventListener('click', closeDrawer);
    overlay.addEventListener('click', closeDrawer);

    // 搜索(输入即过滤并回到第一页)
    searchInput.addEventListener('input', () => {
        searchKeyword = searchInput.value.trim().toLowerCase();
        currentPage = 1;
        renderList();
    });

    // 分页
    prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            renderList();
        }
    });
    nextPageBtn.addEventListener('click', () => {
        currentPage++;
        renderList();
    });

	// 导入(弹出来源选择浮层:用户需明确二选一;取消/关闭不触发任何文件框)
	const importLocalInput = document.getElementById('dmImportLocalInput');
	document.getElementById('dmImportBtn').addEventListener('click', () => {
		// 自建浮层替代 confirm,避免"取消也弹文件框"的问题
		const overlay = document.createElement('div');
		overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.45);display:flex;align-items:center;justify-content:center;z-index:9999;';
		const box = document.createElement('div');
		box.style.cssText = 'background:#fff;border-radius:8px;padding:20px 24px;min-width:320px;max-width:420px;box-shadow:0 8px 30px rgba(0,0,0,.2);font-family:system-ui,sans-serif;';
		box.innerHTML =
			'<div style="font-size:15px;font-weight:600;margin-bottom:6px;">选择导入来源</div>'
			+ '<div style="font-size:12px;color:#666;margin-bottom:16px;">请明确选择一种导入方式,关闭本框不会执行任何导入。</div>'
			+ '<button data-act="source" style="display:block;width:100%;margin-bottom:10px;padding:10px 12px;text-align:left;border:1px solid #d0d7de;border-radius:6px;background:#f6f8fa;cursor:pointer;font-size:13px;">'
			+ '<b>从源码导入</b><br><span style="color:#57606a;">读取运行时内存中的出厂默认数据快照(由 mcp/prompts.js / eda-api.js / mcp/curated-tools/index.js / mcp/meta-tools.js 等源码加载时写入)并写入数据库(首次使用)</span></button>'
			+ '<button data-act="local" style="display:block;width:100%;margin-bottom:10px;padding:10px 12px;text-align:left;border:1px solid #d0d7de;border-radius:6px;background:#f6f8fa;cursor:pointer;font-size:13px;">'
			+ '<b>从本地文件导入</b><br><span style="color:#57606a;">选择 psa-export.v*.json 文件</span></button>'
			+ '<button data-act="cancel" style="display:block;width:100%;padding:8px;border:none;background:transparent;color:#888;cursor:pointer;font-size:12px;">取消</button>';
		overlay.appendChild(box);
		document.body.appendChild(overlay);
		const close = () => overlay.remove();
		overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
		box.querySelector('[data-act="source"]').addEventListener('click', () => {
			close();
			// 从源码导入:直接读取出厂默认数据快照(内存常量),无需文件选择框
			window.dataStore.importFromMemory()
				.then(() => { notifyOk('源码数据导入完成,数据库已激活'); renderAll(); })
				.catch(notifyError);
		});
		box.querySelector('[data-act="local"]').addEventListener('click', () => { close(); importLocalInput.click(); });
		box.querySelector('[data-act="cancel"]').addEventListener('click', close);
	});
	// 从本地 JSON 文件导入
	importLocalInput.addEventListener('change', async () => {
		const files = importLocalInput.files && Array.from(importLocalInput.files);
		importLocalInput.value = ''; // 允许重复选择
		if (!files || files.length === 0) return;
		try {
			await window.dataStore.importLocalFiles(files);
			notifyOk(`本地数据导入完成,当前数据版本 v${window.dataStore.getSeedVersion()}`);
			renderAll();
		} catch (error) {
			notifyError(error);
		}
	});

	// 导出(单文件 JSON,含业务数据与函数源码 impl_code)
	document.getElementById('dmExportBtn').addEventListener('click', async () => {
		try {
			window.dataStore.assertActivated();
			const version = prompt('请输入导出版本号(可另存为新版本):', window.dataStore.getSeedVersion());
			if (version === null) return; // 用户取消
			if (!version.trim()) throw new Error('版本号不能为空');
			window.dataStore.exportAll(version.trim());
			// notifyOk('数据已导出');
		} catch (error) {
			notifyError(error);
		}
	});

	// 删除数据库(回退到原始 JS 数据即恢复默认)
	document.getElementById('dmDeleteBtn').addEventListener('click', async () => {
		if (!confirm('确认删除本地数据库吗?删除后回退到原始 JS 数据(只读)即恢复默认状态,您的所有修改将丢失(建议先导出备份)。')) return;
		try {
			await window.dataStore.deleteDatabase();
			selectedKey = null;
			// notifyOk('本地数据库已删除,已回退到原始 JS 数据(恢复默认)');
			renderAll();
		} catch (error) {
			notifyError(error);
		}
	});

    // 新增自定义精选工具
	addToolBtn.addEventListener('click', async () => {
		const isPrompt = currentTab === 'prompts';
		const name = prompt(isPrompt
			? '请输入新提示词名称(建议格式: custom_xxx):'
			: '请输入新工具名称(建议格式: className$methodName 或独立函数名):');
		if (name === null) return;
		const trimmed = name.trim();
		if (!trimmed) return;
		try {
			if (isPrompt) {
				await window.dataStore.addPrompt(trimmed, '新建自定义提示词', [{ role: 'user', content: '' }]);
			} else {
				await window.dataStore.addCustomTool(trimmed);
			}
			selectedKey = trimmed;
			renderAll();
			refreshAfterMutation(trimmed);
		} catch (error) {
			notifyError(error);
		}
	});
    // ==================== 日志清空 + 分隔条 ====================

    // 清空日志(仅删 sessions / logs 两表,不影响业务数据)
    const clearLogBtn = document.getElementById('dmClearLogBtn');
    if (clearLogBtn) {
        clearLogBtn.addEventListener('click', async () => {
            if (!confirm('确认清空全部会话与调用日志吗?此操作仅删除日志,不影响业务数据。')) return;
            try {
                await window.dataStore.clearLogs();
                // notifyOk('日志已清空');
                renderAll();
            } catch (error) {
                notifyError(error);
            }
        });
    }

    /** 初始化可拖拽分隔条(拖动调整左侧列表宽度) */
    function initSplitter() {
        const splitter = document.getElementById('dmSplitter');
        const listWrap = document.querySelector('.dm-list-wrap');
        const body = document.querySelector('.dm-body');
        if (!splitter || !listWrap || !body) return;
        let dragging = false;
        splitter.addEventListener('mousedown', (e) => {
            dragging = true;
            splitter.classList.add('dm-dragging');
            document.body.style.cursor = 'col-resize';
            e.preventDefault();
        });
        document.addEventListener('mousemove', (e) => {
            if (!dragging) return;
            const rect = body.getBoundingClientRect();
            let w = e.clientX - rect.left;
            w = Math.max(200, Math.min(rect.width - 320, w));
            listWrap.style.flex = `0 0 ${w}px`;
        });
        document.addEventListener('mouseup', () => {
            if (!dragging) return;
            dragging = false;
            splitter.classList.remove('dm-dragging');
            document.body.style.cursor = '';
        });
    }
    initSplitter(); // 绑定一次即可(分隔条元素常驻 DOM)

    // ==================== 对外接口(供 graph-view.js 复用跳转/编辑能力) ====================
    window.editorDrawer = {
        /** 跳转到指定 name 的条目并定位编辑(双击图谱节点 / 连线右键「解除引用」复用) */
        jumpToRef,
        /** 打开抽屉并刷新(图谱新建/编辑后回到顶层视图) */
        openDrawer,
        /** 图谱数据变更后刷新当前视图(若处于图谱 Tab 则重绘) */
        refresh: () => { if (currentTab === 'graph') renderGraph(); else renderAll(); }
    };
})();
