// 出厂默认 1.0 资源数据(海量嘉立创 EDA 资料,按主题域铺开);数据库激活后由 data-store.js 覆盖 window.resourceList(本文件仅作兜底)
window.resourceList = [
    {
        uri: 'resource_jlc_sch_overview',
        name: '嘉立创原理图开发总览',
        description: '原理图开发资料库根索引：按主题域导航至基础操作、图元、元件、网络、符号封装、设计规则、层次化、导入导出、BOM、协作、AI 工作流、快捷键、常见错误排查。',
        mime_type: 'text/markdown',
        content: `# 嘉立创原理图开发总览（资料库根索引）

本资源是「嘉立创 EDA 原理图开发资料库」的导航入口。资料综合自官方用户指南（docs.lceda.cn / docs.easyeda.com）与专业版 AI Agent 实施方案，按主题域铺开，供 AI 绘制原理图时按需检索。

## 一、主题域导航（点 @名称 下钻）
- **基础操作**：画布与网格 @resource_jlc_sch_canvas / 快捷键 @resource_jlc_sch_shortcuts / 选择与控制 @resource_jlc_sch_selection / 撤销重做 @resource_jlc_sch_history
- **图元详解**：导线 @resource_jlc_sch_wiring / 总线 @resource_jlc_sch_bus / 多边形与敷铜 @resource_jlc_sch_polygon / 文本与图形 @resource_jlc_sch_drawing / 引脚 @resource_jlc_sch_pin / 网络标号 @resource_jlc_sch_netlabel / 网络端口 @resource_jlc_sch_netport / 非连接标志 @resource_jlc_sch_noconnect / 离图连接器 @resource_jlc_sch_offsheet
- **元件**：元件放置全流程 @resource_jlc_sch_primitive / 位号管理 @resource_jlc_sch_designator / 多部件符号 @resource_jlc_sch_multipart / 元件属性 @resource_jlc_sch_comp_attr / 库搜索 @resource_jlc_sch_libsearch
- **网络**：网络表 @resource_jlc_sch_netlist / ERC 电气规则 @resource_jlc_sch_erc
- **符号与封装**：符号库 @resource_jlc_sch_symbol_lib / 封装向导 @resource_jlc_sch_footprint / 3D 模型 @resource_jlc_sch_3dmodel / 封装管理器 @resource_jlc_sch_pkgmgr
- **设计规则**：间距与线宽 @resource_jlc_sch_design_rule / 差分对 @resource_jlc_sch_diffpair / 高速规则 @resource_jlc_sch_hsrules / DRC 检查 @resource_jlc_sch_drc
- **层次化**：多页原理图 @resource_jlc_sch_multisheet / 复用模块 @resource_jlc_sch_reuse
- **导入导出**：AD/KiCad/Eagle 导入 @resource_jlc_sch_import / 网表与 JSON 导出 @resource_jlc_sch_doc_format
- **BOM**：BOM 表 @resource_jlc_sch_bom / LCSC 物料关联 @resource_jlc_sch_lcsc
- **协作**：版本与协作 @resource_jlc_sch_collab
- **AI 工作流**：自动生成原理图 @resource_jlc_sch_ai_workflow / 网表生成 @resource_jlc_sch_ai_netlist / 自动布局布线 @resource_jlc_sch_ai_layout / DRC 自动检查 @resource_jlc_sch_ai_drc
- **排查**：常见错误 @resource_jlc_sch_troubleshoot

## 二、与提示词森林的对应
- 需求分析 @domain_requirement / 元件 @domain_component / 布线 @domain_wiring / 验证 @domain_validation
- 知识叶：@knowledge_spacing / @knowledge_wiring / @knowledge_collision / @knowledge_tools / @knowledge_layout`
    },
    {
        uri: 'resource_jlc_sch_canvas',
        name: '画布与网格',
        description: '嘉立创 EDA 原理图画布设置：无限缩放、网格、吸附、单位(mil/mm)、原点与适应画布。',
        mime_type: 'text/markdown',
        content: `# 画布与网格

- 画布区域**无限缩放**，滚动滚轮缩放；快捷键 \`K\` 快速适应画布到中央。
- 点击空白区在右侧属性面板查看/修改画布属性，或右键空白区打开属性弹窗。
- 网格：可设置 \`gridVisible\`（可见）、\`gridColor\`、\`gridSize\`（网格尺寸）、\`gridStyle\`（样式）、\`snapSize\`（吸附栅格）、\`altSnapSize\`（Alt 键吸附尺寸）、\`unit\`（单位）。
- 单位：支持 mil 与 mm；AI 生成坐标须注意单位与画布一致（用 \`getCanvasSize\` 感知画布尺寸与单位）。
- 原点：\`originX\`/\`originY\` 画布原点坐标；背景色 \`backGround\`。
- 这些属性最终序列化进文档 JSON 的 \`canvas\` 字段（见 @resource_jlc_sch_doc_format）。`
    },
    {
        uri: 'resource_jlc_sch_shortcuts',
        name: '快捷键大全',
        description: '嘉立创 EDA 原理图常用快捷键：缩放/适应/导线/网络标号/复制粘贴/撤销重做/全选/对齐等。',
        mime_type: 'text/markdown',
        content: `# 快捷键大全

每个快捷键均可在「右上设置 → 快捷键」中配置。常用（综合官方「快捷键」指南与社区速查）：
- 画布：滚轮缩放；\`K\` 适应画布到中央；空格+拖动平移。
- 编辑：\`Ctrl+C\`/\`Ctrl+V\` 复制粘贴；\`Ctrl+Z\` 撤销；\`Ctrl+Y\` 重做；\`Ctrl+A\` 全选当前页。
- 电气工具：\`W\` 导线；\`N\` 网络标号；\`Ctrl+G\` GND；\`Ctrl+Q\` VCC。
- 对齐：选中多个对象后可对齐/等距分布。
- 旋转/翻转：放置时按空格或 \`R\` 旋转，\`X\`/\`Y\` 翻转。
- 删除：\`Delete\`；拖动元件 \`D\` 或方向键移动（导线不跟随）。
- 搜索：顶部搜索框可定位元件/封装/图纸。

> 完整列表见官方「快捷键」页面；AI 执行操作时无须模拟快捷键，直接调用对应 \`eda.sch_*\` API 即可。`
    },
    {
        uri: 'resource_jlc_sch_selection',
        name: '选择与控制',
        description: 'sch_SelectControl 选择集管理：getAllSelectedPrimitives 取选中图元、框选/点选、选择过滤。',
        mime_type: 'text/markdown',
        content: `# 选择与控制

- 原理图交互通过 \`sch_SelectControl\` 管理选择集。
- \`sch_SelectControl$getAllSelectedPrimitives()\`：获取当前选中的全部图元（AI 读取用户选择、做批量操作的前提）。
- 支持点选、框选、Shift 多选；可按类型过滤选择。
- 清空选择：\`sch_SelectControl$clearSelected()\`。
- AI 工作流中常先取选中图元 → 分析 → 再创建/修改，避免误改未选对象。`
    },
    {
        uri: 'resource_jlc_sch_history',
        name: '撤销与重做',
        description: '嘉立创 EDA 撤销/重做机制：Ctrl+Z 撤销、Ctrl+Y 重做，操作历史栈。',
        mime_type: 'text/markdown',
        content: `# 撤销与重做

- \`Ctrl+Z\` 撤销上一步；\`Ctrl+Y\` 重做（撤销多了按一下恢复）。
- 操作历史为栈式，可连续撤销多步。
- AI 批量创建图元时，若需回滚，优先用 \`delete(uuid)\` 精确删除而非依赖撤销栈（撤销栈更适合人工交互）。
- 注意：通过 API 创建的图元同样进入历史栈，人工 \`Ctrl+Z\` 可能误删 AI 成果，AI 流程结束应提示用户。`
    },
    {
        uri: 'resource_jlc_sch_wiring',
        name: '导线',
        description: '导线(Wire)创建、快捷键 W、自动断线、节点、坐标规则，与网络标号配合形成电气连接。',
        mime_type: 'text/markdown',
        content: `# 导线（Wire）

- 快捷键 \`W\` 进入绘制；或点引脚端点移动鼠标自动进入；或点电气工具「导线」图标。
- 自动断线：电阻/电容放在导线上自动连接引脚两端并去除中间线段；并排电阻电容可直接从左往右走线自动连接并移除多余走线。
- 导线节点：白色虚拟节点、红色真实节点；拖虚拟节点生成真实节点；右键删除线段删真实节点间线段。
- 移动器件：鼠标拖动导线自动跟随；\`D\`/方向键移动器件时导线不跟随。
- 导线具电气特性，必须连接引脚才形成网络（见 @resource_jlc_sch_netlabel / @resource_jlc_sch_erc）。`
    },
    {
        uri: 'resource_jlc_sch_bus',
        name: '总线',
        description: '总线(Bus)与总线分支(BE)表达并行多网络，用于数据总线等成组信号。',
        mime_type: 'text/markdown',
        content: `# 总线（Bus）

- 总线用于表达一组并行网络（如数据总线 D0..D7），提升原理图可读性。
- 图元字母码：总线 \`B\`、总线分支 \`BE\`（见 @resource_jlc_sch_doc_format）。
- 总线本身不承载电气连接，需经总线分支(BE)与网络标号引出到具体引脚。
- 命名规范：总线名如 \`DATA[0..7]\`，分支网络标号须落在总线范围内方自动归属。`
    },
    {
        uri: 'resource_jlc_sch_polygon',
        name: '多边形与敷铜',
        description: 'sch_PrimitivePolygon 创建多边形：铺铜区、禁止区、板框、标识框等。',
        mime_type: 'text/markdown',
        content: `# 多边形与敷铜（Polygon）

- \`sch_PrimitivePolygon$create\`：绘制多边形，用途包括铺铜区、禁止布线区、板框、标注框。
- 坐标点数组定义闭合多边形；创建后 \`done()\` 提交。
- 原理图侧多边形多为标识/禁止区；真正的敷铜在 PCB 侧（\`copperArea\`）。
- AI 绘制禁止区/标识框时常用此接口（见 @resource_jlc_sch_primitive 通用原则）。`
    },
    {
        uri: 'resource_jlc_sch_drawing',
        name: '文本与绘图图形',
        description: '文本(T)、直线(L)、圆弧(A)、矩形(R)、椭圆(E)、路径(PT)等非电气绘图图形。',
        mime_type: 'text/markdown',
        content: `# 文本与绘图图形（非电气）

- 文本 \`T\`：注释说明，支持字体/大小/颜色；AI 常加网络名注释或模块说明。
- 直线 \`L\`、圆弧 \`A\`、矩形 \`R\`、椭圆 \`E\`、路径 \`PT\`：纯绘图，无电气特性（区别于电气工具的导线）。
- 绘图用「绘图工具」而非「电气工具」，避免被当成电气连接。
- 这些图元字母码见 @resource_jlc_sch_doc_format 的 \`shape\` 字段说明。`
    },
    {
        uri: 'resource_jlc_sch_pin',
        name: '引脚',
        description: '原理图符号引脚(Pin)：电气连接点，属性含名称/编号/类型(输入/输出/电源)，方向判定。',
        mime_type: 'text/markdown',
        content: `# 引脚（Pin）

- 引脚是元件最重要的组成部分，允许导线连接以构成电路（官方「符号属性」指南）。
- 引脚属性：名称(Name)、编号(Number)、类型（输入/输出/电源/地/双向/无连接等）。
- 引脚方向决定电气规则：输入脚连输出脚合法；两输出脚相连会 ERC 报错（见 @resource_jlc_sch_erc）。
- 符号绘制时引脚须与封装焊盘一一对应；AI 放置元件前应确认引脚定义（用 \`sch_PrimitiveComponent$getAllPinsByPrimitiveId\`）。
- 连接前确认引脚方向，避免电源/地误接（见 @resource_jlc_sch_design_rule）。`
    },
    {
        uri: 'resource_jlc_sch_netlabel',
        name: '网络标号',
        description: '网络标号(NetLabel)命名规则、跨页连通、多标签仅取首个、重名加(1)、不支持中文。',
        mime_type: 'text/markdown',
        content: `# 网络标号（NetLabel）

- 快捷键 \`N\` 放置；标识导线网络名，同名在不同页自动连通（跨页连接核心）。
- 命名：仅英文/符号/数字，**不支持中文、不支持换行**；数字结尾自动 +1（VCC1→VCC2）。
- 多标签：同一条导线可放多个不同网络名；仿真/转 PCB 仅取第一个（如 NETLABEL1）。
- 重名：自动生成网络名（如 P1_1）与手动标签重名时，手动标签自动变 \`P1_1(1)\`。
- **致命坑**：标签名差一字被当独立网络（如 UART_TX vs UART1_TX）→ 飞线消失/ERC 报错；AI 生成网络名须严格一致。
- 与导线配合：导线连引脚 + 网络标号命名 = 完整电气网络（见 @resource_jlc_sch_wiring / @resource_jlc_sch_erc）。`
    },
    {
        uri: 'resource_jlc_sch_netport',
        name: '网络端口',
        description: '网络端口(Net Port)跨页连接，与网络标号等效，用于多页原理图简化图面。',
        mime_type: 'text/markdown',
        content: `# 网络端口（Net Port）

- 用于多页原理图或不连导线时的简洁连接；同一原理图下功能与网络标签一致，视为不同样式。
- 同网络名端口跨页连通；与网络标号等效。
- 仅支持英文字母/符号/数字；命名须与标签一致才能连通（见 @resource_jlc_sch_netlabel）。
- 图元字母码 \`AR\`（箭头类端口标记，见 @resource_jlc_sch_doc_format）。`
    },
    {
        uri: 'resource_jlc_sch_noconnect',
        name: '非连接标志',
        description: '非连接标志(No-Connect)用于悬空引脚，避免 DRC/ERC 报"引脚未连接"错误。',
        mime_type: 'text/markdown',
        content: `# 非连接标志（No-Connect）

- 悬空引脚须放非连接标志，否则设计管理器/DRC 报"引脚未连接"错误。
- 不可在已连导线末端又放网络标签（网络列表报错）。
- 图元字母码 \`O\`（见 @resource_jlc_sch_doc_format）。
- AI 生成原理图时，对明确不用的输入脚应加非连接标志而非忽略（见 @resource_jlc_sch_troubleshoot）。`
    },
    {
        uri: 'resource_jlc_sch_offsheet',
        name: '离图连接器',
        description: '离图连接器(Off-Sheet Connector)用于同一工程内跨图页信号连接。',
        mime_type: 'text/markdown',
        content: `# 离图连接器（Off-Sheet Connector）

- 在同一工程内跨图页传递信号，与网络端口/网络标号配合实现多页连通（见 @resource_jlc_sch_multisheet）。
- 同名离图连接器在全局网络表中连通。
- 注意嘉立创 EDA 暂不支持真正的层次化设计（每页单独转 PCB），离图连接器是平面多页下的跨页手段。`
    },
    {
        uri: 'resource_jlc_sch_primitive',
        name: '元件放置全流程',
        description: 'sch_PrimitiveComponent 创建链：create→setSupplierId→setDesignator→setX/Y→done，及网络标志、查询删除。',
        mime_type: 'text/markdown',
        content: `# 元件放置全流程（sch_PrimitiveComponent）

基于专业版扩展 API：
1. \`eda.sch_PrimitiveComponent.create()\` 创建实例
2. \`setSupplierId(lcsc)\` 绑定 LCSC 编号
3. \`setDesignator('U1')\` 设位号
4. \`setX(x)/setY(y)/setRotation(r)\` 坐标旋转
5. \`await component.done()\` 提交（**必须 await**）
- 网络标志：\`createNetFlag()\` + \`setNetFlagComponentUuid_Ground/Power/...\` + \`done()\`
- 查询：\`getAll()\` 取全部 UUID；\`get(uuid)\` 读取；\`delete(uuid)\` 删除
- 批量：\`$createBatch\` + \`calculateComponentBoundsBatch\` 算包围盒（见 @resource_jlc_sch_ai_layout）
- 符号与封装经位号关联（见 @resource_jlc_sch_symbol_lib / @resource_jlc_sch_designator）`
    },
    {
        uri: 'resource_jlc_sch_designator',
        name: '位号管理',
        description: '元件编号(Designator)全局连续、自动增序、冲突检测、批量分配；与封装一一对应。',
        mime_type: 'text/markdown',
        content: `# 位号管理（Designator）

- 元件编号全局连续：即使多页原理图也保持编号连续性，放置时编辑器自动增序（如 R9 后放 R10），也可手动修改（双击编号或属性面板）。
- 编号冲突：若工程内存在两个相同编号，仿真/设计管理器/转 PCB 会出错，须避免（见 @resource_jlc_sch_troubleshoot）。
- 批量分配：可批量给多个元件自动分配位号（从已有最大值续编，如从 R10 开始）。
- 位号是原理图符号与 PCB 封装的关联键（见 @resource_jlc_sch_symbol_lib）。`
    },
    {
        uri: 'resource_jlc_sch_multipart',
        name: '多部件符号',
        description: '多部件元件(Multi-Part Symbol)：如逻辑门、运放多单元，单封装多符号的位号与部件管理。',
        mime_type: 'text/markdown',
        content: `# 多部件符号（Multi-Part Symbol）

- 多部件元件：一个物理封装含多个独立逻辑符号（如 74HC00 四与非门、双运放），每个部件有独立部件号（A/B/C/D）。
- 放置时按部件选择；位号(Designator)共享同一前缀（如 U1A、U1B 同属 U1）。
- 原理图符号绘制时须正确划分部件，否则封装绑定混乱。
- AI 放置多部件元件时，应明确目标部件，避免全部落入部件 A。`
    },
    {
        uri: 'resource_jlc_sch_comp_attr',
        name: '元件属性',
        description: '元件属性面板：名称/值/封装/供应商编号/LCSC/参数，属性用于 BOM 与仿真。',
        mime_type: 'text/markdown',
        content: `# 元件属性（Component Attributes）

- 选中元件在右侧属性面板查看/修改：名称(Name)、值(Value)、封装(Footprint)、供应商编号、LCSC 编号、自定义参数。
- 属性直接决定 BOM 输出（见 @resource_jlc_sch_bom）与 LCSC 物料匹配（见 @resource_jlc_sch_lcsc）。
- 关键字段：\`SupplierId\`（setSupplierId 绑定）、\`Designator\`、\`Footprint\`、\`SpiceModel\`（仿真用）。
- AI 创建元件时应尽量补全属性，减少后续人工补填。`
    },
    {
        uri: 'resource_jlc_sch_libsearch',
        name: '元件库搜索',
        description: 'lib_Device$search 搜索官方/共享元件库，按名称/封装/类别检索并放置。',
        mime_type: 'text/markdown',
        content: `# 元件库搜索（lib_Device$search）

- \`lib_Device$search(keyword)\`：搜索官方/共享元件库，返回匹配元件（含封装、LCSC 编号等信息）。
- AI 放置前先搜索确认存在标准元件，优先用现成料号而非自建符号（提高 BOM 可采购性）。
- 搜索结果含 \`Footprint\`、\`SupplierId\` 等，可直接用于创建链（见 @resource_jlc_sch_primitive）。
- 流程提示 @domain_component 的函数白名单含 \`lib_Device$search\`（mid 优先级）。`
    },
    {
        uri: 'resource_jlc_sch_netlist',
        name: '网络表',
        description: '网络表(Netlist)结构、元件-引脚-网络映射、跨页全局网络、转 PCB 依据。',
        mime_type: 'text/markdown',
        content: `# 网络表（Netlist）

- 网络表描述"哪些引脚通过何种网络相连"，是原理图转 PCB 的核心数据。
- 嘉立创 EDA 全局网络：多页原理图通过同名网络标签/端口/离图连接器自动合并为同一网络（见 @resource_jlc_sch_multisheet）。
- 网络表由图元隐式生成（导线 + 网络标号 + 引脚），原理图 JSON 无独立顶层 nets 字段（见 @resource_jlc_sch_doc_format）。
- AI 生成的网表 JSON（components/nets/netFlags）需在放置后由 EDA 自动构建网络表（见 @resource_jlc_sch_ai_netlist）。
- 网络表错误（如悬空脚、短路）会在 ERC/DRC 暴露（见 @resource_jlc_sch_erc / @resource_jlc_sch_drc）。`
    },
    {
        uri: 'resource_jlc_sch_erc',
        name: 'ERC 电气规则检查',
        description: '电气规则检查：引脚悬空、输出冲突、单端网络、未连接电源等逻辑连接错误。',
        mime_type: 'text/markdown',
        content: `# ERC 电气规则检查（Electrical Rule Check）

- 原理图阶段提前发现逻辑连接问题：**引脚悬空、电源冲突、输出脚互连、单端网络**等。
- 建议完成约 70% 进度时首次运行 ERC，留有修改空间。
- 常见 ERC 错误：
  - 未用引脚未放非连接标志 → 报错（见 @resource_jlc_sch_noconnect）
  - 两输出脚相连 → 电源/信号冲突
  - 网络标号名差一字 → 被当独立网络导致连接缺失
  - 输入脚悬空 → 逻辑不确定
- ERC 通过是转 PCB 与 DRC 的前置（见 @resource_jlc_sch_drc）。`
    },
    {
        uri: 'resource_jlc_sch_symbol_lib',
        name: '符号库',
        description: '符号库管理、符号向导(DIP/QFP/SIP)、AD/KiCad/Eagle 导入、原理图模块复用。',
        mime_type: 'text/markdown',
        content: `# 符号库（Symbol Library）

- 复制官方/共享符号到个人库编辑，或从头绘制；符号向导快速建 \`DIP\`/\`QFP\`/\`SIP\`（自动引脚排布）。
- 导入：支持 Altium Designer(AD)、KiCad(v4.06+，需 zip)、Eagle 导入原理图与封装库符号。
- 原理图模块：把常用电路存为模块（文件→另存为模块），放置时输入唯一标识字母（如 \`U3\`+\`K\`→\`KU3\`），原理图与 PCB 模块须同标识字母才自动对应（见 @resource_jlc_sch_reuse）。
- 符号只描述引脚与逻辑，封装描述物理焊盘，经位号关联（见 @resource_jlc_sch_footprint / @resource_jlc_sch_designator）。`
    },
    {
        uri: 'resource_jlc_sch_footprint',
        name: '封装向导',
        description: '封装(Footprint)创建向导：焊盘、丝印、阻焊、DIP/QFP/SOP 等封装绘制与 3D 关联。',
        mime_type: 'text/markdown',
        content: `# 封装向导（Footprint Wizard）

- 封装描述元件物理焊盘布局，与原理图符号经位号一一对应。
- 封装向导可快速创建常见封装：\`DIP\`/\`QFP\`/\`SOP\`/\`BGA\` 等，自动生成焊盘阵列与丝印框。
- 封装要素：焊盘(Pad)形状/尺寸、丝印层(Silkscreen)、阻焊层(Solder Mask)、1脚标识。
- 封装须与符号引脚数/顺序匹配，否则导入报错（见 @resource_jlc_sch_troubleshoot）。
- 3D 模型可关联 Step 文件（见 @resource_jlc_sch_3dmodel）。`
    },
    {
        uri: 'resource_jlc_sch_3dmodel',
        name: '3D 模型',
        description: '元件 3D 模型(Step)关联、3D 预览、与封装绑定，用于 PCB 3D 检查。',
        mime_type: 'text/markdown',
        content: `# 3D 模型（3D Model）

- 封装可关联 3D 模型（Step 文件），用于 PCB 3D 预览与干涉检查。
- 元件完整性建议"符号 + 封装 + 3D 模型"三要素齐全，减少后期调整。
- 官方库常用料多已带 3D 模型；自建封装需手动上传 Step。
- 导入后建议检查 3D 模型绑定（见 @resource_jlc_sch_import 的导入坑）。`
    },
    {
        uri: 'resource_jlc_sch_pkgmgr',
        name: '封装管理器',
        description: '封装管理器：批量修改封装、符号-封装映射检查、封装库维护。',
        mime_type: 'text/markdown',
        content: `# 封装管理器（Package Manager）

- 封装管理器用于查看/批量修改元件封装、检查符号-封装映射一致性。
- 可全局替换某类元件封装（如全工程电阻改 0603→0402）。
- 导入外部库后须在此确认封装正确绑定（见 @resource_jlc_sch_import / @resource_jlc_sch_troubleshoot）。`
    },
    {
        uri: 'resource_jlc_sch_design_rule',
        name: '间距与线宽规则',
        description: 'IPC 绘图规范、元件间距、信号/电源线宽、电源地网络、原理图可读性规范。',
        mime_type: 'text/markdown',
        content: `# 间距与线宽规则（设计规则基础）

- 元件间距：引脚间距、文字标注不重叠（对应 @knowledge_spacing），便于评审。
- 电源/接地：电源网络加粗、流向清晰；GND 统一标号避免地弹。
- 线宽（PCB 侧，原理图预留）：信号 ≥8mil、电源 ≥15mil（局部可 10mil）。
- 电压域：不同电压等级用不同电源符号区分，避免 DRC 报潜在短路。
- 可读性：信号流左→右、电源在上、地在下；网络标号命名一致无歧义；电源网络着色。
- 碰撞：元件/文字/引脚避免重叠（对应 @knowledge_collision），AI 布局优先网格对齐。`
    },
    {
        uri: 'resource_jlc_sch_diffpair',
        name: '差分对',
        description: '差分对(Differential Pair)等长等距规则、命名规范(如 USB_D+/USB_D-)、原理图阶段预留。',
        mime_type: 'text/markdown',
        content: `# 差分对（Differential Pair）

- 高速差分信号（USB、以太网、LVDS）要求**等长等距**走线。
- 原理图阶段即应命名规范：正负端用成对后缀（如 \`USB_D+\`/\`USB_D-\`、\`ETH_RX+\`/\`ETH_RX-\`）。
- 命名规范使 PCB 差分对规则能自动识别并约束等长。
- 差分对网络在原理图用网络标号/端口连接，转 PCB 后由差分规则驱动布线（见 @resource_jlc_sch_hsrules）。`
    },
    {
        uri: 'resource_jlc_sch_hsrules',
        name: '高速设计规则',
        description: '高速信号：阻抗控制、等长、串扰、参考平面，原理图命名与网络规划要点。',
        mime_type: 'text/markdown',
        content: `# 高速设计规则（High-Speed）

- 高速信号关注：阻抗控制（50Ω 单端/100Ω 差分）、等长（时序）、串扰（间距≥3 倍线宽）、连续参考平面。
- 原理图阶段规划：网络命名体现速率/组别（CLK、DATA、差分 +/-），便于 PCB 规则分组。
- 关键网络（时钟、差分）在原理图标色便于审阅。
- 这些规则主要在 PCB 侧 DRC 实施，但原理图命名与连接规划是前提（见 @resource_jlc_sch_drc / @resource_jlc_sch_diffpair）。`
    },
    {
        uri: 'resource_jlc_sch_drc',
        name: 'DRC 设计规则检查',
        description: 'DRC 实时/批处理模式、规则设置入口、常见违规类型与排查。',
        mime_type: 'text/markdown',
        content: `# DRC 设计规则检查（Design Rule Check）

- 入口：顶部菜单 工具→设计规则 打开设置；或画布右键→设计规则。
- 两种模式：**实时 DRC**（绘制时即时提示违规）+ **批处理 DRC**（设计→检查 DRC 全盘，读底部 DRC 标签页）。
- 专业版扩展 API：\`eda.sch_Drc.check(strict, userInterface, includeVerboseError)\` 供自动化检查（见 @resource_jlc_sch_ai_drc）。
- 常见违规：间距不足、线宽过细、短路、未连接网络、封装缺失。
- DRC 须在 ERC 通过后做（见 @resource_jlc_sch_erc）。`
    },
    {
        uri: 'resource_jlc_sch_multisheet',
        name: '多页原理图',
        description: '多页原理图（平面式）：全局网络、网络标签/端口跨页连通，暂不支持层次化设计。',
        mime_type: 'text/markdown',
        content: `# 多页原理图（Multi-Sheet，平面式）

- 一个工程内支持多页原理图，支持**全局网络**：同名网络标签/网络端口/离图连接器跨页自动连通。
- 嘉立创 EDA **暂不支持层次化设计**（不支持每页单独转 PCB）；多页为平面式结构，按功能模块（电源/MCU/接口）拆分页面提升可读性。
- 与 Altium 层次化设计有本质区别：无 sheet symbol 层级实例化。
- 跨页连接用网络标签/端口（见 @resource_jlc_sch_netlabel / @resource_jlc_sch_netport / @resource_jlc_sch_offsheet）。`
    },
    {
        uri: 'resource_jlc_sch_reuse',
        name: '复用模块',
        description: '原理图模块/复用块：保存常用电路、批量复用、标识字母关联规则。',
        mime_type: 'text/markdown',
        content: `# 复用模块（Reuse Block / Schematic Module）

- 原理图模块：把常用电路存为模块（文件→另存为模块），下次从元件库直接放置，避免重复绘制。
- 复用块（专业版）：支持批量复用，简化重复电路。
- 放置规则：模块内器件编号不能出现 \`?\` 和重复；放置时输入唯一标识字母（仅大写、最多 5 个，如 \`U3\`+\`K\`→\`KU3\`）；原理图与 PCB 模块须同标识字母才自动对应。
- 模块由单独器件与导线组成，不能嵌套绑定另一模块（见 @resource_jlc_sch_symbol_lib）。`
    },
    {
        uri: 'resource_jlc_sch_import',
        name: '导入外部文件',
        description: '从 AD/KiCad/Eagle/OrCAD 导入：版本要求、zip 打包、网络标签游离/封装未绑定等坑。',
        mime_type: 'text/markdown',
        content: `# 导入外部文件（AD / KiCad / Eagle / OrCAD）

- **KiCad**：仅支持 v4.06 及以上；须先压缩为 zip 再导入（单个原理图/PCB 因库关联性无法单独导入）。
- **AD / Eagle / OrCAD**：均支持原理图与封装库符号导入。
- 常见导入坑（来自更新记录）：
  - OrCad 导入：网络标签游离、单部件符号变多部件、跨页连接标识变网络标识。
  - KiCad 导入：元件引脚连接处出现未连接点、封装未绑定 3D 模型。
  - Allegro 导入：板框丢失、焊盘大小不正确、文件无法导入。
  - DXF 导入：进度条卡死。
- 导入后务必检查：元件完整性（符号+封装+3D）、网络连通、封装绑定（见 @resource_jlc_sch_pkgmgr / @resource_jlc_sch_troubleshoot）。`
    },
    {
        uri: 'resource_jlc_sch_doc_format',
        name: '文档格式(JSON源码)',
        description: 'sch 类型 JSON：head/canvas/shape/BBox 字段、图元字母码、~ 分隔、无顶层 nets。',
        mime_type: 'text/markdown',
        content: `# 文档格式（JSON 源码结构）

嘉立创 EDA 文档为严格 JSON 字符串（官方「文档格式标准」2020.08.11）。
- 类型：\`sch\`(原理图页 docType:"1"；工程 docType:"5" 含 schematics 数组) / \`pcb\`。
- \`head\`：docType、editorVersion、c_para、x/y、hasIdFlag、newgId、isSheet 等。
- \`canvas\`：\`~\` 分隔——CA/viewWidth/viewHeight/backGround/gridVisible/gridColor/gridSize/canvasWidth/canvasHeight/gridStyle/snapSize/unit/altSnapSize/originX/originY。
- \`shape\`：图元字符串数组，\`~\` 分隔。字母码：折线 PL、导线 W、总线 B、多边形 PG、矩形 R、图片 I、椭圆 E、直线 L、路径 PT、圆弧 A、文本 T；复杂：引脚 P、连接点 J、标识符 F、网络标号 N、总线分支 BE、箭头 AR、非连接 O；特殊：器件 schlib(LIB 开头)。
- \`BBox\`：x/y/width/height 边界盒。
- **网络信息**：原理图无独立顶层 nets 字段，网络靠图元隐式（网络标号 N、标识符 F、导线 W）定义（见 @resource_jlc_sch_netlist）。`
    },
    {
        uri: 'resource_jlc_sch_bom',
        name: 'BOM 表',
        description: 'BOM 导出：从原理图自动提取、UNICODE/制表符 CSV、属性映射、立创商城对接。',
        mime_type: 'text/markdown',
        content: `# BOM 表（Bill of Materials）

- BOM 从原理图自动提取并结构化输出；内置 LCSC 商城元件数据库，常用料有现成编号，支持一键匹配 SMT 贴片料号。
- 导出格式：CSV 采用 UNICODE 编码、以**制表符**为分隔符（非逗号）；上传商城/制造商无法识别时需用 Excel/WPS 另存转换编码与分隔符。
- BOM 字段来自元件属性（名称/值/封装/供应商编号/LCSC）（见 @resource_jlc_sch_comp_attr / @resource_jlc_sch_lcsc）。
- AI 创建元件时补全属性，BOM 才能正确生成。`
    },
    {
        uri: 'resource_jlc_sch_lcsc',
        name: 'LCSC 物料关联',
        description: 'LCSC 嘉立创商城编号(SupplierId)绑定、物料匹配、SMT 下单、参数管理器填编号。',
        mime_type: 'text/markdown',
        content: `# LCSC 物料关联

- \`SupplierId\`（setSupplierId 绑定）即 LCSC 嘉立创商城编号（如 \`C17577866\`），决定可采购性与 SMT 下单。
- 元件属性中应填写 LCSC 编号，BOM 才能对接商城/制造商（见 @resource_jlc_sch_bom）。
- 优先用官方库带料号的元件（lib_Device$search 结果含 SupplierId），减少手动填号。
- 未填 LCSC 编号的元件在 SMT 下单时需人工补，易漏（见 @resource_jlc_sch_troubleshoot）。`
    },
    {
        uri: 'resource_jlc_sch_collab',
        name: '版本与协作',
        description: '工程版本管理、云端存储、多人协作、历史回退。',
        mime_type: 'text/markdown',
        content: `# 版本与协作

- 工程存于云端，支持版本历史与回退。
- 多人协作：可共享工程，注意同时编辑冲突（建议分工到不同图页，见 @resource_jlc_sch_multisheet）。
- 本地备份：导出 JSON（见 @resource_jlc_sch_doc_format）或 psa-export（data-store 导出）做离线存档。
- AI 修改前建议先确认工程已保存，避免覆盖他人成果。`
    },
    {
        uri: 'resource_jlc_sch_ai_workflow',
        name: 'AI 自动生成原理图',
        description: 'AI Agent 绘制原理图总体架构与完整 API 序列（创建→网络标志→保存→布局→布线→DRC）。',
        mime_type: 'text/markdown',
        content: `# AI 自动生成原理图工作流

基于专业版 AI 巧绘实施方案（@jlceda/pro-api-types，2026-07）：
- 工作流由 AI 生成网表，经 LCEDA 扩展层完成创建/布局/布线/检查，最终落到编辑器核心。
- 完整 API 序列见 @resource_jlc_sch_ai_netlist / @resource_jlc_sch_ai_layout / @resource_jlc_sch_ai_drc。
- 提示词衔接：@domain_requirement → @domain_component → @domain_wiring → @domain_validation。`
    },
    {
        uri: 'resource_jlc_sch_ai_netlist',
        name: 'AI 网表生成',
        description: 'AI 从需求生成标准化网表 JSON：components/nets/netFlags 结构与字段规范。',
        mime_type: 'text/markdown',
        content: `# AI 网表生成（AIGeneratedNetlist）

- AI Agent 分析需求 → 生成标准化网表 JSON，含：
  - \`components\`：每个元件的 lcsc(供应商编号)、designator(位号)、x/y/rotation。
  - \`nets\`：网络定义（引脚到引脚连接）。
  - \`netFlags\`：电源/地标志（GND/VCC 等）。
- 网表是扩展层创建元件的输入（见 @resource_jlc_sch_primitive / @resource_jlc_sch_ai_layout）。
- 网表命名须严格一致（如 UART_TX 不能变 UART1_TX），否则连接失败（见 @resource_jlc_sch_netlabel）。`
    },
    {
        uri: 'resource_jlc_sch_ai_layout',
        name: 'AI 自动布局布线',
        description: 'autoLayout/autoRouting 调用参数：uuids/netlist/designatorDeviceTypeMap，批量创建与包围盒。',
        mime_type: 'text/markdown',
        content: `# AI 自动布局与布线

- 创建后 \`eda.sch_Document.save()\` 保存。
- \`eda.sch_PrimitiveComponent.getAll()\` 取全部 UUID → \`getPrimitiveId()\`。
- \`autoLayout({ uuids, netlist, designatorDeviceTypeMap })\`：基于包围盒与网格自动布局。
- \`autoRouting({ uuids, netlist, designatorDeviceTypeMap })\`：自动布线（需先完成原理图与网络表）。
- \`designatorDeviceTypeMap\`：位号→设备类型（"chip"|"resistor" 等），供布局算法识别。
- 批量创建：\`$createBatch\` + \`calculateComponentBoundsBatch\` 算整体包围盒。
- 完成后再次 \`save()\`（见 @resource_jlc_sch_ai_drc）。`
    },
    {
        uri: 'resource_jlc_sch_ai_drc',
        name: 'AI DRC 自动检查',
        description: 'sch_Drc.check 自动检查调用、strict 参数、与 ERC 闭环，AI 自校验生成结果。',
        mime_type: 'text/markdown',
        content: `# AI DRC 自动检查

- 生成完成后调用 \`eda.sch_Drc.check(strict, userInterface, includeVerboseError)\` 自动校验。
- 配合 ERC（原理图阶段，见 @resource_jlc_sch_erc）形成检查闭环。
- 图元变更监听：\`eda.sch_Event.addPrimitiveEventListener()\` 调试/增量用。
- AI 应在返回结果前自跑 DRC，暴露并修复违规（间距/短路/未连接），再交付用户。`
    },
    {
        uri: 'resource_jlc_sch_troubleshoot',
        name: '常见错误排查',
        description: '飞线消失/ERC报错/封装未绑定/网络悬空/编号冲突/标签差字等高频问题与根因。',
        mime_type: 'text/markdown',
        content: `# 常见错误排查

- **飞线消失 / ERC 报连接缺失**：网络标号名差一字被当独立网络（UART_TX vs UART1_TX）；跨页标签名不一致（见 @resource_jlc_sch_netlabel）。
- **引脚未连接报错**：悬空脚未放非连接标志（见 @resource_jlc_sch_noconnect）。
- **编号冲突**：两个相同 Designator 导致仿真/转 PCB 出错（见 @resource_jlc_sch_designator）。
- **封装未绑定 / 3D 缺失**：导入后封装或 3D 未关联（见 @resource_jlc_sch_pkgmgr / @resource_jlc_sch_3dmodel）。
- **电压域短路**：不同电源网络误连（见 @resource_jlc_sch_design_rule）。
- **网络标签与导线末端冲突**：已连导线末端又放网络标签 → 网络列表报错。
- AI 生成后应主动跑 ERC/DRC 并修复上述高频问题再交付（见 @resource_jlc_sch_erc / @resource_jlc_sch_drc）。`
    }








];