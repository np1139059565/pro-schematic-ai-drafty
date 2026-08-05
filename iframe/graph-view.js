/**
 * 视图层 graph-view.js —— 「关系图谱」可视化模块（D3 v7 力导向）
 *
 * 职责（单一职责：只负责图谱渲染与交互，数据全部委托 data-store.js）：
 * 1. 从 window.dataStore.buildGraph() 实时拉取节点与连线（提示词 / 函数 / 工具的全量引用关系）；
 * 2. 力导向布局（forceSimulation + link/charge/center/collide），按引用类型着色、按强弱定粗细；
 * 3. 弧线连接（linkArc）、逐类型箭头 marker、悬停 tooltip、图例过滤；
 * 4. 交互：节点拖拽、画布缩放平移、搜索命中后引用链路 BFS 高亮、右键菜单驱动增删改查；
 * 5. 与列表编辑区共用 dataStore 数据通道，所有增删改经 refreshRuntimeCache 双向实时同步。
 *
 * 性能约定（详见《界面原型说明》§5「关系图谱视图」）：EDA 原生 API（jdb）千级节点默认折叠为聚合节点，
 * 图谱仅渲染 prompt + custom + mcp；图例中可手动展开 jdb 命名空间。
 *
 * 加载顺序要求：必须在 d3.min.js、data-store.js、editor-drawer.js 之后加载。
 * 若 window.d3 缺失（离线加载失败），render() 降级为文字版引用列表，不抛错。
 */

(function () {
    'use strict';

    // ==================== 常量配置 ====================

    /** 节点类型 → 颜色映射（与图例、tooltip 一致） */
    const NODE_COLORS = {
        prompt: '#4e79f7', // 提示词：蓝
        custom: '#2ecc71', // 精选工具：绿
        mcp:    '#f39c12', // MCP 元工具：橙
        jdb:    '#95a5a6'  // EDA 原生 API：灰
    };

    /** 连线类型 → 颜色映射 */
    const LINK_COLORS = {
        prompt_ref:     '#4e79f7',
        prompt_tool:    '#16a085',
        tool_call:      '#2ecc71',
        describes:      '#7f8c8d',
        native_fallback:'#e67e22',
        example_call:   '#bdc3c7'
    };

    /** 连线强弱 → 宽度与力导向距离 */
    const STRENGTH_WIDTH = { strong: 2, weak: 1 };

    /** 完全离线：EDA 原生 API 默认折叠，仅展示 prompt/custom/mcp */
    const DEFAULT_VISIBLE_TYPES = new Set(['prompt', 'custom', 'mcp']);

    // ==================== 内部状态 ====================

    let svg = null;          // D3 选择集
    let gRoot = null;        // 最外层 <g>（受 zoom 控制）
    let gLinks = null, gNodes = null, gLabels = null;
    let simulation = null;   // 力导向模拟器
    let graphData = { nodes: [], links: [] };
    let visibleTypes = new Set(DEFAULT_VISIBLE_TYPES);
    let nodeIndex = {};      // id → node 对象
    let linkSel = null, nodeSel = null, labelSel = null;
    let zoomBehavior = null;
    let tooltipEl = null;
    let ctxMenuEl = null;
    let searchKeyword = '';
    let containerEl = null;
    /** 当前选中节点 id（跨重绘持久，切换 tab 回来仍高亮） */
    let selectedNodeId = null;

    // ==================== 工具函数 ====================

    /** 转义 HTML（防止 name 注入 tooltip） */
    function escapeHtml(s) {
        return String(s == null ? '' : s)
            .replace(/&/g, '&amp;').replace(/</g, '&lt;')
            .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    /** 取得图谱容器元素（.dm-panel 内部 .dm-graph） */
    function getGraphHost() {
        return document.querySelector('.dm-graph');
    }

    /**
     * 取得浮层宿主元素（overlay host）。
     * 浮层（tooltip / 右键菜单）原先挂在 document.body + position:fixed，
     * 在 VSCode 扩展的 webview 内会被宿主层级裁剪/遮挡（菜单渲染了却看不到）。
     * 现改为挂到 .dm-panel（数据管理面板，overflow 默认可见）并使用 position:absolute 相对定位，
     * 这样浮层在 webview 内相对一个不被裁剪的祖先绝对定位，不会再被宿主层级吃掉。
     * 兜底：若找不到 .dm-panel（理论上不应发生），仍回退到 document.body。
     */
    function overlayHost() {
        const containerEl = getGraphHost();
        if (containerEl) {
            const panel = containerEl.closest('.dm-panel');
            if (panel) return panel;
        }
        return document.body;
    }

    /**
     * 将鼠标的视口坐标（clientX/clientY）换算为相对浮层宿主（.dm-panel）左上角的坐标。
     * absolute 定位必须减去宿主自身的视口偏移，否则会错位到视口坐标而非宿主内坐标。
     * 返回的 {x, y} 直接作为浮层元素的 left / top 使用。
     */
    function toHostXY(event) {
        const host = overlayHost();
        const rect = host.getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    /** 惰性创建悬停 tooltip 元素（挂到 .dm-panel 浮层宿主，配合 absolute 定位） */
    function ensureTooltip() {
        if (tooltipEl) return tooltipEl;
        tooltipEl = document.createElement('div');
        tooltipEl.className = 'dm-graph-tooltip';
        tooltipEl.style.display = 'none';
        overlayHost().appendChild(tooltipEl);
        return tooltipEl;
    }

    /** 惰性创建右键上下文菜单（挂到 .dm-panel 浮层宿主，配合 absolute 定位） */
    function ensureCtxMenu() {
        if (ctxMenuEl) return ctxMenuEl;
        ctxMenuEl = document.createElement('div');
        ctxMenuEl.className = 'dm-graph-ctxmenu';
        ctxMenuEl.style.display = 'none';
        overlayHost().appendChild(ctxMenuEl);
        return ctxMenuEl;
    }

    /** 关闭右键菜单 */
    function hideCtxMenu() {
        if (ctxMenuEl) ctxMenuEl.style.display = 'none';
    }

    /** 根据类型取中文标签 */
    function typeLabel(type) {
        return { prompt: '提示词', custom: '精选工具', mcp: 'MCP元工具', jdb: 'EDA原生API' }[type] || type;
    }

    /** 根据分类（提示词 category）取中文标签 */
    function categoryLabel(cat) {
        if (!cat) return '';
        return { mindmap: '思维导图', flow: '流程定义', prompt: '提示词', tool: '工具', example: '范例' }[cat] || cat;
    }

    /** 根据连线类型取中文标签 */
    function refTypeLabel(rt) {
        return {
            prompt_ref: '提示词引用提示词', prompt_tool: '提示词引用函数',
            tool_call: '函数调用函数', describes: '描述-实现配对',
            native_fallback: '降级调用原生API', example_call: '调用范例'
        }[rt] || rt;
    }

    // ==================== 数据准备 ====================

    /** 从 dataStore 拉取并过滤图谱数据（按当前可见类型） */
    function loadData() {
        const raw = window.dataStore.buildGraph();
        const nodes = raw.nodes.filter(n => visibleTypes.has(n.type));
        const visibleIds = new Set(nodes.map(n => n.id));
        const links = raw.links.filter(l => visibleIds.has(l.source) && visibleIds.has(l.target));
        graphData = { nodes, links };
        nodeIndex = {};
        nodes.forEach(n => { nodeIndex[n.id] = n; });
    }

    // ==================== 渲染核心 ====================

    /**
     * 渲染关系图谱到指定容器
     * @param {HTMLElement} container 图谱容器 DOM
     */
    function render(container) {
        containerEl = container || containerEl;
        if (!containerEl) return;
        if (typeof window.d3 === 'undefined') {
            renderTextFallback(containerEl);
            return;
        }
        containerEl.innerHTML = '';

        const width = containerEl.clientWidth || 800;
        const height = containerEl.clientHeight || 600;

        svg = window.d3.select(containerEl).append('svg')
            .attr('class', 'dm-graph-svg')
            .attr('width', '100%')
            .attr('height', '100%');

        // 定义逐类型箭头 marker（marker 不继承 stroke，必须逐类型定义并 fill 对应颜色）
        const defs = svg.append('defs');
        Object.entries(LINK_COLORS).forEach(([rt, color]) => {
            defs.append('marker')
                .attr('id', `dm-arrow-${rt}`)
                .attr('viewBox', '0 -5 10 10')
                .attr('refX', 18).attr('refY', 0)
                .attr('markerWidth', 6).attr('markerHeight', 6)
                .attr('orient', 'auto')
                .append('path')
                .attr('d', 'M0,-5L10,0L0,5')
                .attr('fill', color);
        });

        gRoot = svg.append('g');
        gLinks = gRoot.append('g').attr('class', 'dm-graph-links');
        gNodes = gRoot.append('g').attr('class', 'dm-graph-nodes');
        gLabels = gRoot.append('g').attr('class', 'dm-graph-labels');

        // 缩放平移（作用于最外层 g）
        zoomBehavior = window.d3.zoom().scaleExtent([0.1, 8])
            .on('zoom', (event) => gRoot.attr('transform', event.transform));
        svg.call(zoomBehavior)
            // 点击画布空白处关闭右键菜单（点击菜单本身时事件已被菜单 mousedown 拦截，不会冒泡到这里）
            .on('click', (event) => { if (!ctxMenuEl || !ctxMenuEl.contains(event.target)) hideCtxMenu(); })
            // 画布空白处右键 → 显示空白右键菜单（新建 / 视图操作）
            .on('contextmenu', (event) => {
                // 仅当右键落在空白（非节点、非连线）时弹出
                if (event.target.closest('.dm-graph-node') || event.target.closest('.dm-graph-link')) return;
                event.preventDefault();
                hideCtxMenu();
                showBlankCtxMenu(event);
            });

        loadData();
        draw();
        renderLegend(containerEl);
        renderToolbar(containerEl);
    }

    /** 真正绘制力导向图 */
    function draw() {
        hideTooltip(); // 重绘（含切回非图谱 tab 时 renderGraphInternal 调用此处）时强制隐藏悬浮框，避免节点移出视口/被移除后 mouseout 不触发导致残留
        computeDegrees(); // 先计算入/出度，供节点半径与 tooltip 度数展示
        if (!graphData.nodes.length) {
            gNodes.html('<text class="dm-graph-empty">暂无可见节点（可在图例中展开 EDA 原生 API）</text>');
            gLinks.selectAll('*').remove();
            gLabels.selectAll('*').remove();
            return;
        }

        // 连线（自环 source===target 无信息价值且会渲染出节点旁三角箭头，数据层已过滤，此处双保险）
        const links = graphData.links.filter(l => l.source !== l.target);
        linkSel = gLinks.selectAll('path.dm-graph-link')
            .data(links, d => `${d.source}->${d.target}:${d.refType}`)
            .join('path')
            .attr('class', 'dm-graph-link')
            .attr('stroke', d => LINK_COLORS[d.refType] || '#999')
            .attr('stroke-width', d => STRENGTH_WIDTH[d.strength] || 1)
            .attr('stroke-dasharray', d => d.strength === 'weak' ? '4 3' : null)
            .attr('fill', 'none')
            .attr('marker-end', d => `url(#dm-arrow-${d.refType})`)
            .on('mouseover', (event, d) => showLinkTooltip(event, d))
            .on('mouseout', () => { if (tooltipEl) tooltipEl.style.display = 'none'; })
            .on('contextmenu', (event, d) => { event.preventDefault(); showLinkCtxMenu(event, d); });

        // 节点。注意：data join 复用 g 元素，但 circle 是子节点，需在每次重绘前清理，避免重复 append 造成「多重圆/三角」残留
        nodeSel = gNodes.selectAll('g.dm-graph-node')
            .data(graphData.nodes, d => d.id)
            .join(
                enter => {
                    const g = enter.append('g').attr('class', 'dm-graph-node');
                    g.append('circle'); // 仅新建时添加一次圆球，杜绝重复 append
                    return g;
                },
                update => update,
                exit => exit.remove()
            )
            .attr('class', 'dm-graph-node')
            .call(window.d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended))
            .on('mouseover', (event, d) => showNodeTooltip(event, d))
            .on('mouseout', () => { if (tooltipEl) tooltipEl.style.display = 'none'; })
            .on('click', (event, d) => { selectNode(d); })
            .on('dblclick', (event, d) => { event.preventDefault(); openEdit(d); })
            .on('contextmenu', (event, d) => { event.preventDefault(); showNodeCtxMenu(event, d); });

        // 圆球：仅更新属性（不重复创建），按选中态切换描边
        nodeSel.select('circle')
            .attr('r', d => nodeRadius(d))
            .attr('fill', d => NODE_COLORS[d.type] || '#999')
            .attr('stroke', d => d.id === selectedNodeId ? '#ff1493' : '#fff')
            .attr('stroke-width', d => d.id === selectedNodeId ? 4 : 1.5);

        // 标签：默认不显示节点名称（画布保持清爽，节点名称/类型/描述等信息统一由悬浮 tooltip 展示，见 showNodeTooltip）。
        // 仅保留占位元素结构以备将来可选开启，文本置空。
        labelSel = gLabels.selectAll('text.dm-graph-label')
            .data(graphData.nodes, d => d.id)
            .join('text')
            .attr('class', 'dm-graph-label')
            .attr('dx', d => nodeRadius(d) + 3)
            .attr('dy', 4)
            .text('');

        // 力导向模拟（collide 半径加大，文字参与避让，缓解节点密集时文字互相覆盖）
        simulation = window.d3.forceSimulation(graphData.nodes)
            .force('link', window.d3.forceLink(links).id(d => d.id)
                .distance(d => d.strength === 'strong' ? 90 : 160)
                .strength(d => d.strength === 'strong' ? 0.6 : 0.2))
            .force('charge', window.d3.forceManyBody().strength(-400))
            .force('center', window.d3.forceCenter(
                (containerEl.clientWidth || 800) / 2,
                (containerEl.clientHeight || 600) / 2))
            .force('collide', window.d3.forceCollide().radius(d => nodeRadius(d) + 22))
            .on('tick', ticked);

        // 重绘后回写选中态（保证切换 tab 回来仍高亮）
        nodeSel.classed('dm-graph-node-selected', d => d.id === selectedNodeId);
        applySearchHighlight();
    }

    /** 选中节点并高亮（跨重绘持久） */
    function selectNode(d) {
        selectedNodeId = d.id;
        if (nodeSel) nodeSel.classed('dm-graph-node-selected', n => n.id === selectedNodeId);
        if (nodeSel) nodeSel.select('circle')
            .attr('stroke', n => n.id === selectedNodeId ? '#ff1493' : '#fff')
            .attr('stroke-width', n => n.id === selectedNodeId ? 4 : 1.5);
        hideCtxMenu();
    }

    /** 每帧更新位置 */
    function ticked() {
        // 弧线连接（避免双向重叠）
        linkSel.attr('d', d => {
            const s = d.source, t = d.target;
            const dx = t.x - s.x, dy = t.y - s.y;
            const dr = Math.sqrt(dx * dx + dy * dy) * 1.6 || 1;
            return `M${s.x},${s.y}A${dr},${dr} 0 0,1 ${t.x},${t.y}`;
        });
        nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
        labelSel.attr('transform', d => `translate(${d.x},${d.y})`);
    }

    /** 节点半径按被引用度数缩放（4~14px） */
    function nodeRadius(d) {
        const deg = (d.__in || 0) + (d.__out || 0);
        return Math.max(4, Math.min(14, 4 + Math.sqrt(deg) * 2));
    }

    /** 计算各节点入/出度（用于半径与搜索 BFS） */
    function computeDegrees() {
        graphData.nodes.forEach(n => { n.__in = 0; n.__out = 0; });
        graphData.links.forEach(l => {
            const s = nodeIndex[l.source] || graphData.nodes.find(n => n.id === l.source);
            const t = nodeIndex[l.target] || graphData.nodes.find(n => n.id === l.target);
            if (s) s.__out = (s.__out || 0) + 1;
            if (t) t.__in = (t.__in || 0) + 1;
        });
    }

    // ==================== 图例与工具栏 ====================

    /** 渲染图例（可点击过滤类型） */
    function renderLegend(container) {
        const legend = document.createElement('div');
        legend.className = 'dm-graph-legend';
        Object.entries(NODE_COLORS).forEach(([type, color]) => {
            const item = document.createElement('span');
            item.className = 'dm-graph-legend-item' + (visibleTypes.has(type) ? '' : ' off');
            item.innerHTML = `<i style="background:${color}"></i>${typeLabel(type)}`;
            item.addEventListener('click', () => {
                if (visibleTypes.has(type)) visibleTypes.delete(type);
                else visibleTypes.add(type);
                // jdb 展开时重新拉取数据并重绘
                loadData(); computeDegrees(); draw();
                renderLegend(container);
            });
            legend.appendChild(item);
        });
        container.appendChild(legend);
    }

    /** 渲染图谱顶部工具栏（搜索框 + 适应画布 + 重置布局） */
    function renderToolbar(container) {
        const bar = document.createElement('div');
        bar.className = 'dm-graph-toolbar';
        const search = document.createElement('input');
        search.type = 'text';
        search.className = 'dm-graph-search';
        search.placeholder = '搜索节点（name/描述/内容）…';
        search.addEventListener('input', () => {
            searchKeyword = search.value.trim().toLowerCase();
            applySearchHighlight();
        });
        search.addEventListener('keydown', (e) => { if (e.key === 'Enter') focusNextMatch(); });

        const fitBtn = document.createElement('button');
        fitBtn.className = 'dm-btn';
        fitBtn.textContent = '适应画布';
        fitBtn.addEventListener('click', fitToScreen);

        const resetBtn = document.createElement('button');
        resetBtn.className = 'dm-btn';
        resetBtn.textContent = '重置布局';
        resetBtn.addEventListener('click', () => { loadData(); computeDegrees(); draw(); });

        bar.appendChild(search);
        bar.appendChild(fitBtn);
        bar.appendChild(resetBtn);
        container.appendChild(bar);
    }

    // ==================== 搜索与高亮 ====================

    /** 根据搜索关键字高亮命中节点并点亮其完整引用链路（BFS） */
    function applySearchHighlight() {
        if (!nodeSel) return;
        if (!searchKeyword) {
            nodeSel.classed('dim', false).classed('hl', false);
            linkSel.classed('dim', false).classed('hl', false);
            labelSel.classed('dim', false);
            return;
        }
        // 命中节点集合
        const hit = new Set();
        graphData.nodes.forEach(n => {
            if (n.id.toLowerCase().includes(searchKeyword)
                || String(n.label || '').toLowerCase().includes(searchKeyword)) {
                hit.add(n.id);
            }
        });
        // 唯一匹配优化：仅命中一个节点时自动选中并居中，免去用户手动定位
        // （命中多个或零个时不强制跳转，避免输入过程抖动；多结果仍可用 Enter 循环定位）
        if (hit.size === 1) {
            const onlyId = [...hit][0];
            const onlyNode = graphData.nodes.find(n => n.id === onlyId);
            if (onlyNode && nodeSel) {
                selectNode(onlyNode);   // 高亮选中态（跨重绘持久）
                focusNode(onlyNode);    // 平移至画布中心并放大
            }
        }
        // BFS 沿出/入边点亮关联链路
        const related = new Set(hit);
        const queue = [...hit];
        while (queue.length) {
            const cur = queue.shift();
            graphData.links.forEach(l => {
                if (l.source === cur && !related.has(l.target)) { related.add(l.target); queue.push(l.target); }
                if (l.target === cur && !related.has(l.source)) { related.add(l.source); queue.push(l.source); }
            });
        }
        nodeSel.classed('hl', d => hit.has(d.id))
            .classed('dim', d => !related.has(d.id));
        labelSel.classed('dim', d => !related.has(d.id));
        linkSel.classed('hl', d => related.has(d.source) && related.has(d.target))
            .classed('dim', d => !(related.has(d.source) && related.has(d.target)));
    }

    /** Enter 键在多个命中结果间循环定位（缩放到目标居中） */
    let lastFocusIdx = -1;
    function focusNextMatch() {
        if (!searchKeyword || !nodeSel) return;
        const matches = graphData.nodes.filter(n =>
            n.id.toLowerCase().includes(searchKeyword) || String(n.label || '').toLowerCase().includes(searchKeyword));
        if (!matches.length) return;
        lastFocusIdx = (lastFocusIdx + 1) % matches.length;
        const target = matches[lastFocusIdx];
        focusNode(target);
    }

    /** 将某节点平移至画布中心 */
    function focusNode(node) {
        if (!zoomBehavior || !svg) return;
        const w = containerEl.clientWidth, h = containerEl.clientHeight;
        const scale = 1.5;
        const transform = window.d3.zoomIdentity
            .translate(w / 2, h / 2)
            .scale(scale)
            .translate(-node.x, -node.y);
        svg.transition().duration(500).call(zoomBehavior.transform, transform);
    }

    /** 适应画布（计算包围盒后归位） */
    function fitToScreen() {
        if (!nodeSel || !zoomBehavior || !svg) return;
        const nodes = graphData.nodes;
        if (!nodes.length) return;
        const xs = nodes.map(n => n.x), ys = nodes.map(n => n.y);
        const minX = Math.min(...xs), maxX = Math.max(...xs);
        const minY = Math.min(...ys), maxY = Math.max(...ys);
        const w = maxX - minX || 1, h = maxY - minY || 1;
        const cw = containerEl.clientWidth, ch = containerEl.clientHeight;
        const scale = Math.min(0.95 * cw / w, 0.95 * ch / h, 4);
        const tx = (cw - scale * (minX + maxX)) / 2;
        const ty = (ch - scale * (minY + maxY)) / 2;
        const transform = window.d3.zoomIdentity.translate(tx, ty).scale(scale);
        svg.transition().duration(500).call(zoomBehavior.transform, transform);
    }

    // ==================== Tooltip ====================

    function showNodeTooltip(event, d) {
        const tip = ensureTooltip();
        // 类型对应的填充色，用于标题前缀色块，与画布节点配色一致
        const color = NODE_COLORS[d.type] || '#888';
        const cat = categoryLabel(d.category);
        // 描述：多行文本，escape 后放入带滚动限制的容器（CSS .dm-graph-tt-desc 控制）
        const desc = d.description ? escapeHtml(d.description) : '<span style="color:#aaa">（无描述）</span>';
        tip.innerHTML = ''
            + `<div class="dm-graph-tt-title">`
            +   `<span class="dm-graph-tt-dot" style="background:${color}"></span>`
            +   `${escapeHtml(d.label)}`
            + `</div>`
            + `<div class="dm-graph-tt-row"><b>类型：</b>${typeLabel(d.type)}${cat ? ' · ' + cat : ''}</div>`
            + `<div class="dm-graph-tt-row"><b>标识：</b><code>${escapeHtml(d.id)}</code></div>`
            + `<div class="dm-graph-tt-row"><b>引用：</b>被引用 ${d.__in || 0} 次 · 引用他人 ${d.__out || 0} 次</div>`
            + `<div class="dm-graph-tt-desc"><b>描述：</b>${desc}</div>`
            + `<div class="dm-graph-tt-row" style="color:#888">双击编辑 · 右键更多操作</div>`;
        tip.style.display = 'block';
        // 浮层挂 .dm-panel 且采用 absolute 定位，坐标需换算为相对宿主左上角
        const xy = toHostXY(event);
        tip.style.left = (xy.x + 12) + 'px';
        tip.style.top = (xy.y + 12) + 'px';
    }

    function showLinkTooltip(event, d) {
        const tip = ensureTooltip();
        // D3 forceLink 会把 links[].source/target 从字符串 id 解析为节点对象引用，
        // 故此处需取 .id（字符串情形直接返回），否则会显示成 [object Object]
        const sId = (d.source && typeof d.source === 'object') ? d.source.id : d.source;
        const tId = (d.target && typeof d.target === 'object') ? d.target.id : d.target;
        tip.innerHTML = `<div class="dm-graph-tt-title">${refTypeLabel(d.refType)}</div>`
            + `<div class="dm-graph-tt-row">${escapeHtml(sId)} → ${escapeHtml(tId)}</div>`
            + `<div class="dm-graph-tt-row" style="color:#888">${d.strength === 'strong' ? '强引用' : '弱引用（降级/范例）'}</div>`;
        tip.style.display = 'block';
        // 浮层挂 .dm-panel 且采用 absolute 定位，坐标需换算为相对宿主左上角
        const xy = toHostXY(event);
        tip.style.left = (xy.x + 12) + 'px';
        tip.style.top = (xy.y + 12) + 'px';
    }

    // ==================== 右键菜单（增删改查） ====================

    /**
     * 统一的菜单项渲染：使用 mousedown 触发动作并 stopPropagation，
     * 避免 D3 zoom 在 svg 上的 click 监听抢先隐藏菜单（右键菜单完全弹不出或使用后立刻消失的根因）。
     */
    function renderCtxItems(menu, items) {
        menu.innerHTML = '';
        items.forEach(it => {
            const el = document.createElement('div');
            el.className = 'dm-graph-ctx-item' + (it.danger ? ' danger' : '');
            el.textContent = it.label;
            // mousedown 先于 click 触发，stopPropagation 阻止冒泡到 svg 的 click（关闭菜单）
            el.addEventListener('mousedown', (e) => {
                e.stopPropagation();
                e.preventDefault();
                hideCtxMenu();
                it.action();
            });
            menu.appendChild(el);
        });
    }

    /** 显示节点右键菜单 */
    function showNodeCtxMenu(event, d) {
        const menu = ensureCtxMenu();
        renderCtxItems(menu, [
            { label: '编辑', action: () => openEdit(d) },
            { label: '复制 name', action: () => copyText(d.id) },
            { label: d.__pinned ? '解钉' : '钉住', action: () => { d.__pinned = !d.__pinned; if (d.__pinned) { d.fx = d.x; d.fy = d.y; } else { d.fx = null; d.fy = null; } if (simulation) simulation.alpha(0.3).restart(); } },
            { label: '以此为中心聚焦', action: () => focusNode(d) },
            { label: '删除', danger: true, action: () => deleteItem(d) }
        ]);
        menu.style.display = 'block';
        // 浮层挂 .dm-panel 且采用 absolute 定位，坐标需换算为相对宿主左上角
        const xy = toHostXY(event);
        menu.style.left = xy.x + 'px';
        menu.style.top = xy.y + 'px';
    }

    /** 显示连线右键菜单 */
    function showLinkCtxMenu(event, d) {
        const menu = ensureCtxMenu();
        // D3 forceLink 已将 d.source 解析为节点对象，jumpToSource 需传 id 字符串才能匹配到条目
        const srcId = (d.source && typeof d.source === 'object') ? d.source.id : d.source;
        renderCtxItems(menu, [
            { label: '查看引用上下文', action: () => jumpToSource(srcId) },
            { label: '解除引用（定位编辑）', action: () => jumpToSource(srcId) },
            { label: d.strength === 'strong' ? '切换为弱引用' : '切换为强引用', action: () => alert('引用强弱由内容语法（@{}/window.调用/eda.调用）自动判定，无需手动切换') }
        ]);
        menu.style.display = 'block';
        // 浮层挂 .dm-panel 且采用 absolute 定位，坐标需换算为相对宿主左上角
        const xy = toHostXY(event);
        menu.style.left = xy.x + 'px';
        menu.style.top = xy.y + 'px';
    }

    /** 空白右键菜单：新建 / 视图操作 */
    function showBlankCtxMenu(event) {
        const menu = ensureCtxMenu();
        renderCtxItems(menu, [
            { label: '新建提示词', action: () => createItem('prompt') },
            { label: '新建函数（精选工具）', action: () => createItem('custom') },
            { label: '适应画布', action: fitToScreen },
            { label: '重置布局', action: () => { loadData(); computeDegrees(); draw(); } },
            { label: '导出图谱 PNG', action: exportPng }
        ]);
        menu.style.display = 'block';
        // 浮层挂 .dm-panel 且采用 absolute 定位，坐标需换算为相对宿主左上角
        const xy = toHostXY(event);
        menu.style.left = xy.x + 'px';
        menu.style.top = xy.y + 'px';
    }

        // ==================== 增删改查（委托 dataStore + editorDrawer） ====================

    /** 统一隐藏悬浮 tooltip（供各类「离开图谱/打开编辑」场景显式调用，避免依赖 mouseout 不触发导致残留） */
    function hideTooltip() {
        if (tooltipEl) tooltipEl.style.display = 'none';
    }

    /** 双击 / 菜单「编辑」：联动打开 editor-drawer 对应条目编辑区 */
    function openEdit(d) {
        // 双击时鼠标仍停留在节点上，mouseout 不会自然触发，故在此显式隐藏 tooltip，
        // 否则编辑面板打开后悬浮框会残留在原坐标（DOM 已渲染但视觉多余）。
        hideTooltip();
        if (window.editorDrawer && window.editorDrawer.jumpToRef) {
            window.editorDrawer.jumpToRef(d.id);
        } else {
            alert('请先打开数据管理抽屉以编辑该条目');
        }
    }

    /** 连线右键「解除引用」/「查看上下文」：跳转到源节点编辑定位 */
    function jumpToSource(sourceId) {
        if (window.editorDrawer && window.editorDrawer.jumpToRef) {
            window.editorDrawer.jumpToRef(sourceId);
        }
    }

    /** 删除节点（走引用保护流程：存在活跃引用时阻止并提示逐一清理） */
    function deleteItem(d) {
        if (!window.dataStore || !window.dataStore.isActivated || !window.dataStore.isActivated()) {
            alert('请先「导入 → 从源码导入」激活数据库后再删除');
            return;
        }
        const refs = window.dataStore.findReferences(d.id);
        const blockers = (refs.calledBy || []).map(c => `工具: ${c.target}`)
            .concat((refs.referencedByPrompts || []).map(p => `提示词: ${p}`));
        if (blockers.length > 0) {
            if (!confirm(`「${d.id}」被以下条目引用，删除可能导致其失效:\n${blockers.join('\n')}\n\n需先逐一清理引用（双击引用列表项可跳转定位）。仍要强制删除?`)) return;
        }
        try {
            if (d.type === 'prompt') window.dataStore.deletePrompt(d.id);
            else window.dataStore.deleteTool(d.id);
            refresh();
        } catch (e) {
            alert('删除失败：' + (e.message || e));
        }
    }

    /** 新建条目（提示词 / 精选工具） */
    function createItem(type) {
        const name = prompt(`请输入新${type === 'prompt' ? '提示词' : '函数（精选工具）'}的 name（唯一标识）：`);
        if (!name) return;
        if (!window.dataStore.isActivated || !window.dataStore.isActivated()) {
            alert('请先「导入 → 从源码导入」激活数据库后再新建');
            return;
        }
        try {
            if (type === 'prompt') {
                window.dataStore.addPrompt(name, '', []);
            } else {
                // 精选工具统一走 addCustomTool（创建模板实现，is_modified=true）
                window.dataStore.addCustomTool(name);
            }
            refresh();
            if (window.editorDrawer && window.editorDrawer.jumpToRef) window.editorDrawer.jumpToRef(name);
        } catch (e) {
            alert('新建失败：' + (e.message || e));
        }
    }

    /** 复制文本到剪贴板 */
    function copyText(text) {
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {}, () => fallbackCopy(text));
        } else fallbackCopy(text);
    }
    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.left = '-9999px';
        document.body.appendChild(ta); ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
    }

    /** 导出图谱为 PNG（基于当前 SVG 序列化） */
    function exportPng() {
        if (!svg) { alert('图谱尚未渲染'); return; }
        try {
            const xml = new XMLSerializer().serializeToString(svg.node());
            const svgBlob = new Blob([xml], { type: 'image/svg+xml;charset=utf-8' });
            const url = URL.createObjectURL(svgBlob);
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = containerEl.clientWidth; canvas.height = containerEl.clientHeight;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob(blob => {
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'relation-graph.png';
                    a.click();
                    URL.revokeObjectURL(a.href);
                });
                URL.revokeObjectURL(url);
            };
            img.src = url;
        } catch (e) {
            alert('导出 PNG 失败：' + (e.message || e));
        }
    }

    // ==================== 拖拽 ====================

    function dragstarted(event, d) {
        if (!event.active && simulation) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
    }
    function dragged(event, d) { d.fx = event.x; d.fy = event.y; }
    function dragended(event, d) {
        if (!event.active && simulation) simulation.alphaTarget(0);
        // 未钉住则释放（保留自由布局）；Shift 拖拽视为钉住
        if (!event.shiftKey && !d.__pinned) { d.fx = null; d.fy = null; }
    }

    // ==================== 刷新（数据变更后重绘） ====================

    /** 数据变更后重新加载并平滑重绘 */
    function refresh() {
        if (!svg) return;
        loadData();
        computeDegrees();
        simulation.stop();
        draw();
    }

    // ==================== 离线降级：文字版引用列表 ====================

    /** D3 缺失时降级为纯文字引用列表，保证功能不丢失 */
    function renderTextFallback(container) {
        const raw = window.dataStore.buildGraph();
        let html = '<div class="dm-graph-fallback"><b>关系图谱（离线降级模式，未加载 D3）</b><br><br>';
        html += '<div>提示词节点：' + raw.nodes.filter(n => n.type === 'prompt').map(n => escapeHtml(n.id)).join('、') + '</div><br>';
        html += '<div>函数/工具节点：' + raw.nodes.filter(n => n.type !== 'prompt').map(n => escapeHtml(n.id)).join('、') + '</div><br>';
        html += '<div>引用关系（' + raw.links.length + ' 条）：</div><ul>';
        raw.links.slice(0, 200).forEach(l => {
            html += `<li>${escapeHtml(l.source)} --[${refTypeLabel(l.refType)}]--> ${escapeHtml(l.target)}</li>`;
        });
        if (raw.links.length > 200) html += `<li>… 其余 ${raw.links.length - 200} 条省略</li>`;
        html += '</ul></div>';
        container.innerHTML = html;
    }

    // ==================== 全局事件（模块级注册一次） ====================

    /** Esc 关闭 tooltip / 右键菜单 */
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            hideCtxMenu();
            if (tooltipEl) tooltipEl.style.display = 'none';
        }
    });

    // ==================== 对外接口 ====================

    window.graphView = {
        render,
        refresh,
        resize: () => { if (simulation) { /* 容器尺寸变化时重绘中心 */ refresh(); } }
    };
})();
