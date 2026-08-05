# 嘉立创 EDA 原理图设计 AI 执行框架（AI巧绘）设计说明

> 本文档基于插件实际源码整理，覆盖 `src/`、`iframe/`、`extension.json` 的整体架构、模块职责、核心流程与关键实现细节。
> 包名 `pro-schematic-ai-drafty`，运行依赖 `eda >= 2.3.0`。
> 关于「本地数据化 + 可编辑抽屉 + 关系图谱」这一子系统的完整描述，另见同目录《系统设计说明.md》。

---

## 一、背景

嘉立创 EDA 专业版开放了JavaScript 扩展能力（`eda.*` 原生 API），允许扩展通过 `iframe` 嵌入自定义界面并与编辑器交互。本项目 **AI巧绘** 是一款原理图设计智能助手扩展，目标是：

- 让开发者用自然语言描述原理图设计意图；
- 由大模型（LLM）理解意图、规划步骤、调用 EDA 工具完成"搜索元件 → 放置元件 → 连线 → 校验"的自动化操作；
- 在自动修改设计文件前，以"代码块 + 确认执行"的方式保证安全可控；代码块在确认前支持实时编辑，并保留原始代码副本可一键回退。

技术选型上，AI巧绘采用 **火山引擎方舟（ARK）Responses API** 作为对话与函数调用（Function Calling）后端，并通过 **MCP（Model Context Protocol）风格** 的封装层把嘉立创原生 `eda.*` API 暴露给模型作为可调用的"工具（Tool）"。

---

## 二、需求

| 编号 | 需求 | 说明 |
| --- | --- | --- |
| N1 | AI 自然语言对话 | 支持多轮上下文问答，解答原理图设计问题 |
| N2 | 工具调用读写原理图 | 读取选中图元、元件/导线/引脚信息，放置/修改/删除图元 |
| N3 | 代码生成与确认执行 | AI 生成操作代码，用户在界面确认后才落地到画布；可开启"自动执行" |
| N4 | 双后端兼容 | 既支持直连火山引擎 ARK API，也支持走"私服"代理（独立 Token 计费体系） |
| N5 | 三层执行框架 | 规则约束层 + 流程引导层 + 智能执行层，保证 AI 在规范内工作 |
| N6 | 安全与可控 | 停止生成、清空对话、危险写操作需确认、画布边界与间距校验 |

---

## 三、设计

### 3.1 整体架构

```
┌──────────────────────────────────────────────────────────────┐
│  嘉立创 EDA 专业版（宿主环境，提供 eda.* 原生 API）            │
│                                                                │
│  src/index.ts  (扩展入口)                                      │
│    ├─ about()            → 关于弹窗                            │
│    └─ openAiChat()       → eda.sys_IFrame.openIFrame(         │
│                            '/iframe/ai-chat.html', 800, 600)   │
└───────────────────────────────┬────────────────────────────────┘
                                 │ 打开 iframe
                                 ▼
┌──────────────────────────────────────────────────────────────┐
│  iframe/ai-chat.html  (对话界面)                               │
│   按序加载脚本（顺序即依赖顺序，不可调换）：                   │
│   1. vendor/alasql.min.js → window.alasql  本地 SQL 引擎       │
│   2. vendor/d3.min.js     → window.d3      力导向图谱渲染      │
│   3. ark-api.js      → window.ArkAPI   对话后端（ARK / 私服）  │
│   4. mcp-prompt.js   → window.promptList 三层框架提示词       │
│   5. eda-api.js      → window.jdbToolDescriptions 原生API清单 │
│   6. mcp-eda.js      → window.mcpEDA(MCP封装)                 │
│                       window.customeTools(自定义工具实现)      │
│                       window.jdbResourceList(资源清单)         │
│   7. error-handler.js→ window.ErrorHandler 错误分类与恢复引导 │
│   8. abort-signal.js → window.AbortManager 取消/超时信号管理  │
│   9. data-store.js   → window.dataStore 本地数据层(IndexedDB) │
│  10. editor-drawer.js→ 数据管理抽屉界面（浏览/编辑/导入导出）  │
│  11. graph-view.js   → window.graphView 关系图谱视图           │
│  12. ai-chat.js      → 主控制器（UI / 对话流 / 执行流 / 日志） │
└──────────────────────────────────────────────────────────────┘
```

**数据来源双模式（data-store.js）：**

```
未激活: 原始 JS 常量(mcp-prompt.js / eda-api.js / mcp-eda.js) → window.* → 消费方
已激活: IndexedDB(ProSchematicAiDB, AlaSQL 引擎)
          → refreshRuntimeCache() 覆盖 window.*（含函数体 new Function 重建）
          → 消费方（mcp-eda.js / ai-chat.js 不感知数据来源差异）
```

**数据流向（一次"放置元件"任务为例）：**

```
用户输入
  → ai-chat.js 构造 messages（含 system_message）
  → ArkAPI.callArkChat / callPrivateChat
       → 火山引擎 Responses API / 私服 /api/ark-chat
  ← 返回 output（含 message + function_call）
  → parseAIResponse 解析出 toolCalls
  → generateCodeFromToolCalls 生成 mcpEDA.callTool({...}) 代码块
  → 界面展示"确认执行"按钮
  →（用户点击）executeToolCalls
       → window.mcpEDA.callTool
            → 解析 name(className.methodName)
            → 命中 window.customeTools 或 eda[className][methodName]
            → 调用原生 eda.* API 落地到画布
  ← 返回执行结果（function_call_output）
  → continueConversationAfterTools 把结果回传模型，模型给出最终说明
```

### 3.2 扩展入口（src/index.ts）

- `activate()`：空实现（按需激活，无需启动逻辑）。
- `about()`：调用 `eda.sys_Dialog.showInformationMessage` 显示版本号（来自 `extension.json`）。
- `openAiChat()`：调用 `eda.sys_IFrame.openIFrame('/iframe/ai-chat.html', 800, 600, 'ai-chat-dialog', { maximizeButton, minimizeButton, grayscaleMask })` 打开对话窗口。

菜单注册见 `extension.json` 的 `headerMenus`，在 `home` / `sch` / `pcb` 三个上下文均挂载 **AI巧绘** 菜单，含 `About...`（`about`）与 `原理图设计助手`（`openAiChat`）。

### 3.3 模块职责划分

| 文件 | 全局对象 | 职责 |
| --- | --- | --- |
| `ai-chat.html` | — | 页面骨架、DOM 容器、按序引入脚本 |
| `ai-chat.css` | — | 全部界面样式（气泡、加载动画、代码块、对话框） |
| `ai-chat.js` | — | 主控制器：UI 状态机、对话流、工具调用代码生成、确认执行、停止/清空；数据库激活时负责调用日志的写入与回填；`init()` 时经 `installGlobalRejectionGuard()` 注册全局异常兜底，拦截 EDA 宿主原生 API 逃逸的未捕获 rejection/同步错误，转为日志而非页面崩溃 |
| `ark-api.js` | `window.ArkAPI` | 两个对话后端：`callArkChat`（直连 ARK）、`callPrivateChat`（私服）；另暴露 `updateConfig` 写入配置（读取用的 `getConfig` 为模块内私有函数，不对外暴露）。两个后端均接收第四个参数 `signal`（超时+取消合并信号），HTTP 非 2xx 时在 Error 上挂载 `status` 供错误分级 |
| `error-handler.js` | `window.ErrorHandler` | 错误分类与恢复引导：`ErrorType` 八类枚举（AUTH / RATE_LIMIT / NETWORK / TIMEOUT / PARAM / TOOL_EXEC / PARSE / UNKNOWN）、`identifyErrorType`（按 status、error.name、message 特征识别）、`classifyError`（返回 `{type,title,message,action}` 展示模型）、`toToolError`（工具错误转为可回喂模型的结构） |
| `abort-signal.js` | `window.AbortManager` | 取消信号单点管理，替代旧的全局 `isStop` 标志：`createAbortController`（每轮会话重建）、`createTimeoutSignal(ms)`（`AbortSignal.any` 合并超时与手动取消）、`abortCurrent`（真正中断 fetch）、`endAbortSession`、`isCancelled`（供渲染层只读查询） |
| `mcp-prompt.js` | `window.promptList` | 三层框架提示词（系统角色、工作流、业务规则、执行模式） |
| `eda-api.js` | `window.jdbToolDescriptions` | 自动生成的全量原生 EDA API 工具清单（约 17900 行，供 `searchTools` 检索），「出厂默认1.0」数据载体 |
| `mcp-eda.js` | `window.mcpEDA`<br>`window.customeTools`<br>`window.jdbResourceList` | MCP 协议封装（callTool/listTools/...）；`customeTools` 为针对原理图场景封装的具体工具实现；`jdbResourceList` 出厂默认为空数组 |
| `data-store.js` | `window.dataStore` | 本地数据层：出厂快照捕获、IndexedDB（AlaSQL）读写、导入（`importFromMemory` 从内存快照首次激活 / `importLocalFiles` 从本地 JSON 文件 / `importFromFile` 单 JSON，合并策略按修改标记）、导出（`exportAll` 主入口 → `exportData` 单个 JSON；另有 `exportFactoryJs` 出厂快照 JS 作为编程接口保留）、删除（`deleteDatabase`）、单条与全量恢复默认、运行时缓存刷新（内部函数 `refreshRuntimeCache`，含函数体重建与 system 消息即时生效）；另提供引用检测 `findReferences`、名称抽取 `extractNames`、引用标记还原 `stripRefMarks`、图谱数据派生 `buildGraph` 与日志存储 API |
| `editor-drawer.js` | `window.editorDrawer` | 数据管理抽屉视图：状态徽标、六个分栏（图谱/提示词/精选工具/EDA函数/资源/日志，日志分栏未激活时隐藏）、搜索分页（每页 50 条）、可拖拽分隔条（不持久化）、编辑表单（JSON/语法校验）、`@引用` 高亮与跳转（描述/内容/函数体/日志 JSON 均经 `renderRefs`/`extractVisibleRefs` 渲染）、双击 `@引用` 跳转来源栈（顶部「返回来源」按钮恢复原编辑器内容与滚动位置）、删除引用保护、「AI 根据函数更新描述」；对外暴露 `jumpToRef` 供图谱联动定位 |
| `graph-view.js` | `window.graphView` | 关系图谱视图：基于 D3 力导向布局渲染节点与引用连线，支持类型图例过滤、搜索链路高亮、缩放平移、拖拽与钉住、节点选中态、右键增删改查菜单、导出 PNG |
| `vendor/alasql.min.js` | `window.alasql` | AlaSQL v4.17.3 本地 SQL 引擎（INDEXEDDB 存储引擎），随扩展离线打包 |
| `vendor/d3.min.js` | `window.d3` | D3 力导向布局与选择集库，随扩展离线打包（无外网依赖） |

### 3.4 三层执行框架（mcp-prompt.js → window.promptList）

系统消息（`system_message`）定义了"规则约束 + 流程引导 + 智能执行"的三层架构，模型通过 `getPrompt` 工具**按需**拉取对应提示词（避免一次性注入浪费 Token）。

**第一层 · 规则约束层（`business_rules_*`）**

- `business_rules_spacing`：间距标准（画布-元件 ≥10mil、元件-元件 ≥80mil、导线-导线 ≥6mil 等，均基于边界而非中心点计算）。
- `business_rules_layout`：布局策略（功能分组、输入→处理→输出流向、网络标签优先）。
- `business_rules_wiring`：布线规则（A* 寻路、45° 优先禁锐角、障碍绕行、关键信号优先）。
- `business_rules_tools`：各工具调用的特殊注意事项（如 `subPartName` 必填、`invertY` 默认 `true`）。
- `business_rules_collision`：统一图元碰撞检测机制与重试（最多 3 次）。

**第二层 · 流程引导层（`workflow_*`）**

- `workflow_requirement_analysis`：需求理解 → 确认 → 流程选择。
- `workflow_component_design`：搜索 → 选择 → 布局 → 放置 → 取引脚 → 算边界 → 碰撞检测 → 移动 → 画边界 → 验证（10 个节点）。
- `workflow_wiring_design`：规划 → 障碍分析 → A* 寻路+碰撞 → 创建导线 → 验证。
- `workflow_validation_optimization`：设计检查 → 规范验证 → 优化建议/执行 → 最终验证。
- `workflow_selection_interaction`：感知用户已选中图元并结合意图操作。

**第三层 · 智能执行层（`execution_*`）**

- `execution_mode_react`：ReAct（思考-行动-观察）模式。
- `execution_mode_plan`：Plan（规划-执行-验证-调整）模式。
- `execution_guidance`：总指导原则（按需求自主选工作流、按需 `getPrompt` 取规则、执行后自检检查点）。工作流不再硬编码枚举，而是引导模型先经 `listPrompts` 动态发现当前可用的提示词清单再按需拉取，因此新增工作流无需改写本条提示词。

### 3.5 工具系统（MCP 封装 + 自定义工具）

**原生 API 清单**：`eda-api.js` 导出 `window.jdbToolDescriptions`，是自动生成的全部 `eda.*` 原生 API 描述（含 name/description/inputSchema）。它被 `searchTools`（在 `customeTools` 中）用于按关键词检索原生 API。

**MCP 元工具**（`window.mcpEDA.toolDescriptions`，随对话注入模型）：
`callTool`、`listTools`、`listResources`、`readResource`、`listPrompts`、`getPrompt` 共 6 个通用工具。模型通过它们间接操作原理图与获取提示。

**自定义工具**（`window.customeTools.*` + `window.customeTools.toolDescriptions`）：针对原理图设计的高频操作做了封装与安全校验，命名风格为 `类名$方法名`（如 `sch_PrimitiveComponent$create`）。核心类别：

- 元件：`lib_Device$search`、`sch_PrimitiveComponent$create`、`sch_PrimitiveComponent$createBatch`、`sch_PrimitiveComponent$getAll`、`sch_PrimitiveComponent$modify`、`sch_PrimitiveComponent$delete`、`sch_PrimitiveComponent$getAllPinsByPrimitiveId(Batch)`。
- 导线：`sch_PrimitiveWire$create(Batch)`、`sch_PrimitiveWire$modify`、`sch_PrimitiveWire$delete`、`sch_PrimitiveWire$getAll`。
- 多边形（边界）：`sch_PrimitivePolygon$create(Batch)`、`sch_PrimitivePolygon$delete`、`sch_PrimitivePolygon$getAll`。
- 几何辅助：`calculateComponentBounds(Batch)`（按引脚计算元件最小外接矩形）、`getCanvasSize`（读取画布边界，默认 1170×825 mil）。
- 选择/交互：`sch_SelectControl$getAllSelectedPrimitives/doSelectPrimitives/clearSelected/getCurrentMousePosition`、`dmt_EditorControl$zoomToSelectedPrimitives`。
- 文档：`sys_FileManager$getDocumentFootprintSources`、`searchTools`。

**工具调用解析**（`mcp-eda.js` → `callTool`）：
- 输入 `name` 形如 `className.methodName`；内部用 `name.replace('.', '$')` 兼容自定义工具命名。
- 调度优先级：优先自定义工具 `window.mcpEDA[name]` → `window.customeTools[mname]`（参数对象整体调用），无匹配时降级原生 `eda[className][methodName]`（位置参数展开调用）。
- 已禁用（`enabled === false`）的工具在 `listTools` / `searchTools` 中被过滤，`callTool` 调用时被拦截。
- 工具间互调统一走 `window.customeTools.*` 全局路径（如批量工具调用单体工具），保证单体工具被数据库编辑重建后批量工具调用到最新实现。
- 参数校验基于 JSON Schema（`validateArguments`），返回统一 MCP 格式 `{ content:[{type:'text',text}], isError }`。

### 3.6 对话状态机（ai-chat.js → UI_STATE）

界面用 `UI_STATE` 枚举管理按钮与输入可用性：

| 状态 | 输入框/发送 | 停止按钮 | 清空 | 自动执行 | 配置 |
| --- | --- | --- | --- | --- | --- |
| `IDLE` 空闲 | 可用 | 隐藏 | 可用 | 可用 | 可用 |
| `SENDING` 发送中 | 禁用 | 显示 | 禁用 | 可用 | 可用 |
| `STOPPED` 停止中 | 禁用 | 隐藏 | 禁用 | 禁用(并取消选中) | 可用 |
| `EXECUTING` 执行中 | 禁用 | 显示 | 禁用 | 可用 | 可用 |

### 3.7 多轮对话与 Responses API

- 直连 ARK 使用 `https://ark.cn-beijing.volces.com/api/v3/responses`。
- 请求参数：`model`、`input`（默认仅最后一条消息）、`store:true`、`caching:{type:"enabled"}`、`temperature:0.2`、`top_p:0.9`。
- 多轮上下文靠 `previous_response_id` 串联（首轮且历史长度为 2 时直接把整段历史作为 `input`）；每轮累加 `total_tokens`（带空值保护，响应缺 `usage` 时不抛异常）并打印对话历史到控制台。
- 工具结果以 `function_call_output`（含 `call_id`/`output`）形式回传，符合 Responses API 规范。
- 每轮请求绑定 `AbortManager.createTimeoutSignal(60000)`，即 60 秒超时与用户手动取消的合并信号。

### 3.8 双后端设计（ark-api.js）

| 维度 | ARK 直连 `callArkChat` | 私服 `callPrivateChat` |
| --- | --- | --- |
| 地址 | `ARK_API_URL=/api/v3` | `PRIVATE_SERVER_URL`（默认 `https://113.46.209.138`，可 `localStorage.private_server_url` 覆盖）+ `/api/ark-chat` |
| 鉴权 | `Authorization: Bearer <api_key>`，需 `api_model` | 仅 `user_api_key`，私服转发并记账 |
| 模型 | 必须配置 `api_model` | 由私服侧决定，前端无需 model |
| 登录入口 | 火山引擎官网 | 配置框内"私服登录"链接指向 `https://113.46.209.138/login` |

切换逻辑（`ai-chat.js`）：`usePrivateServer` 为真时调用 `callPrivateChat`，否则 `callArkChat`。启用私服时隐藏 Model 输入框。

---

## 四、实现

### 4.1 配置与持久化

`localStorage` 键：`api_key`、`api_model`、`use_private_server`、`private_server_url`。
- `loadConfig()`：页面初始化时读取并调用 `ArkAPI.updateConfig`。
- `handleSaveConfig()`：保存并即时生效。
- 系统消息来自 `window.top.systemMessage = promptList.find('system_message')...text`，用户可在控制台临时改写以定制 AI 角色。

### 4.2 对话主流程（ai-chat.js）

1. `handleSendMessage` → `runSendFlow`：切换 `SENDING` 状态、写历史、加加载动画、调 `callAIAndHandleResponse`。
2. `callAIAndHandleResponse`：确保 system 消息存在（`ensureSystemMessage`），调用后端，解析响应；若有 `function_call` 则 `generateCodeFromToolCalls` 生成代码块。
3. `generateCodeFromToolCalls`：把每个工具调用渲染为 `mcpEDA.callTool({ name, arguments })`；多调用时拼成结果数组。
4. `createToolCallCodeBlock`：在界面展示代码块与"确认执行"按钮；若开启"自动执行"（`autoExecWriteEnabled`），2 秒后自动点击。
5. 用户确认 → `executeToolCallsAndContinue` → `executeSingleToolCall`（经 `mcpEDA.callTool` 落地原生 API）→ `handleToolExecutionResults`（展示结果并构造 `function_call_output`）→ `continueConversationAfterTools`（把结果回传模型，进入下一轮或收尾）。

### 4.3 安全与可控机制

- **确认执行**：所有工具调用默认生成代码块，需手动点击"确认执行"才会调用原生 API（写操作不自动落地）。
- **自动执行开关**：右上角"自动执行"复选框，开启后延迟 2 秒自动执行（停止后会自动取消选中态）。
- **停止（AbortSignal 单点贯穿）**：`handleStop` 调用 `AbortManager.abortCurrent()` **真正中断底层 fetch**，而非仅置标志位；同时清除 `activeTimeouts`（自动执行延时）。无在途请求时立即 `resumeStop` 恢复空闲，否则切到 `STOPPED` 态，待请求因 abort 结束后恢复。
  - 设计要点：取消语义不再侵入纯 UI 函数——`addMessageToChat` 等渲染函数不再读写全局 `isStop`、也不再承担"重置状态机"的副作用；渲染层只通过 `AbortManager.isCancelled()` 只读查询。
  - 用户主动取消引发的错误在 `callAIAndHandleResponse` / `continueConversationAfterTools` / `handleAIError` 三处被识别并静默结束，不展示为失败。
- **请求超时**：每轮调用经 `AbortManager.createTimeoutSignal(60000)` 绑定 60 秒超时与手动取消的合并信号（`AbortSignal.any`），任一先到即中断。
- **边界校验**：`customeTools` 中各创建/修改工具均调用 `getCanvasSize` 校验坐标不越界；间距规范由 AI 在框架提示中遵循并利用 `calculateComponentBounds` 计算。

### 4.4 错误处理（分类型 + 恢复引导）

错误处理由 `error-handler.js` 统一承担，渲染层只消费结构化结果、不感知错误规则：

- **识别**（`identifyErrorType`）按优先级依次判断：显式 `error.errorType` 标记 → HTTP `status`（401/403→AUTH、429→RATE_LIMIT、5xx→NETWORK、400→PARAM）→ `error.name`（`TimeoutError`/`AbortError`→TIMEOUT）→ 消息特征（`failed to fetch`、`networkerror` 等→NETWORK）。
- **归类**（`classifyError`）返回 `{type, title, message, action, raw}`，`handleAIError` 据此渲染"❌ 标题 / 原因 / 💡 可操作建议"三段式提示，并在状态栏显示错误类型。
- **鉴权错误引导**：`AUTH` 类型会给「配置」按钮加上 `config-btn-alert` 样式（变红脉冲），引导用户修正 Key/Model。
- **工具执行错误自愈**：`toToolError` 把工具异常转为 `{isError, errorType, message}`，作为 `function_call_output` 回喂模型，让模型自行调整策略重试，而非直接终止对话。
- `parseAIResponse` 对格式异常返回固定提示文案；`callTool` 用 `try/catch` 包装，错误以 MCP 格式 `isError:true` 返回。
- **全局兜底（最后一道防线）**：嘉立创 EDA 宿主原生 API（如 `eda.sch_PrimitiveComponent.create`）在内部 UI 校验失败、画布未激活、元件 `uuid` 不存在等场景下，会在 `ui.js`/`api.js` 深处自行 `reject` 一个**未返回到插件 await 链上的内部 promise**（fire-and-forget），在 microtask 阶段被浏览器抛为 `Uncaught (in promise)`（如 `#<Mt>`）。此类逃逸 rejection 不会中断当前 `await`（外层已拿到包装结果），但逐轮累积会触发宿主「不可处理的错误」导致页面卡死。`ai-chat.js` 在 `init()` 时经 `installGlobalRejectionGuard()` 注册 `window` 的 `unhandledrejection` 与 `error` 监听器，统一拦截并转为带上下文的 `console.error` 日志（同时 `preventDefault` 阻止浏览器致命上报），**不抛出、不阻断对话主流程**。该兜底仅处理「宿主逃逸异常」，工具执行链路上的可预期错误仍由 `executeSingleToolCall`/`callTool` 的 `try/catch` 正常回喂模型自愈，不在兜底中重复处理。

### 4.5 资源（Resource）能力说明

`window.jdbResourceList` 在 `mcp-eda.js` 顶部初始化为空数组（出厂默认无资源）；本地数据库激活后，由 `data-store.js` 用 `resources` 表数据覆盖。`readResource` 对不存在的 URI 抛出 `RESOURCE_NOT_FOUND` 错误。资源内容可通过导入 `psa-export.v*.json` 数据文件补充，并在数据管理抽屉的「资源」分栏查看。

### 4.6 本地数据化（data-store.js + editor-drawer.js + graph-view.js）

- **存储**：AlaSQL INDEXEDDB 引擎管理数据库 `ProSchematicAiDB`，业务四表 `prompts`（name/description/messages/category/is_modified/updated_at）、`tools`（name/description/input_schema/impl_code/source[jdb|mcp|custom]/enabled/is_modified/updated_at）、`resources`（uri/name/description/mime_type/content）、`meta`（key/value，固定 `seed_version` 与 `factory_version` 两行），以及独立的日志两表 `chat_sessions`（session_id/title/created_at/updated_at）、`chat_logs`（log_id/session_id/turn/request_payload/response_payload/prompt_snapshot/tool_snapshot/created_at）。业务表在 AlaSQL 中不声明列类型，字段由写入行对象隐式决定；日志两表有显式字段声明。日志不参与导入/导出/恢复默认，仅「删除数据库」随库整体清除。写操作采用「内存缓存 + 整表覆写（DROP/CREATE/INSERT）」的保守组合，规避引擎兼容性风险；读操作全部直接命中内存缓存，不查库。
- **版本常量**：代码中仅有 `FACTORY_VERSION = '1.0'` 一个常量（出厂基线），导出文件名前缀 `psa-export.v`。种子版本为模块内可变变量，初值等于出厂版本，激活后从 `meta` 表 `seed_version` 行读取，随导入的数据文件版本变化。
- **出厂快照**：`data-store.js` 加载时捕获原始 `window.*` 常量与函数引用，作为「恢复默认 / 删除回退 / 导出出厂 JS」的唯一数据源；运行时覆盖始终赋新数组与新对象，不污染快照。
- **启动策略**：`init()` 轻量检测数据库是否存在（优先 `indexedDB.databases()`，不可用时回退 `localStorage` 的 `psa_db_activated` 标记）；若库存在但 `prompts` 与 `tools` 均为空则视为异常残留、按未激活处理；任一环节抛错均安全降级为未激活。未激活保持原始 JS 数据零成本运行，已激活则加载全表并刷新运行时缓存。
- **导入**（界面入口为单一「导入」按钮 + 自定义询问框二选一）：
  - `importFromMemory()`——「从源码导入」，**首次激活起点**。源码文件已由宿主在页面加载时执行，其数据即在 `factoryDefaults` 内存快照中，故直接读取内存常量建库，**不弹文件选择框**。
  - `importLocalFiles(files)`——「从本地文件导入」，**仅接受 `.json` 文件**（遇到其它扩展名直接抛错），取首个 JSON 交给 `importFromFile` 解析 `psa-export.v*.json`，强校验 `version` 为字符串且 `prompts`/`resources` 为数组；`tools` 兼容旧版扁平数组与新版按 `source`（jdb/mcp/custom）分组的对象两种格式。
  - `importFactoryDefaults()` 从出厂快照建库入库（版本恒为 `FACTORY_VERSION`），当前界面未直接暴露，作为编程接口保留。
  - 合并策略：首次导入整体替换；已激活时按修改标记合并——已修改条目保留，未修改条目覆盖，已修改且新数据中不存在的条目保留，未修改且新数据中不存在的条目移除。
- **导出**（界面入口为单一「导出」按钮，输入一次版本号产出**单个 JSON 文件**）：
  - `exportAll(version)`——对外主入口，需先激活，内部直接调用 `exportData`。为保证浏览器「用户激活」不过期从而正常触发下载，整条导出链路为同步调用，不得声明为 `async`。
  - `exportData(version)` 导出业务三表的完整行结构（含 `is_modified`/`updated_at`/`impl_code`），文件名 `psa-export.v{version}.json`。函数实现源码以 `impl_code` 字段内嵌于该 JSON 中，导入时经 `new Function` 重建，故单文件即可完成完整还原，无需附带独立 JS 文件。
  - `exportFactoryJs()` 一次性下载三个**出厂快照**重建版 JS 文件，数据源恒为出厂快照、不校验激活状态；当前界面未直接暴露，作为编程接口保留。
- **删除**：`deleteDatabase()` 卸载并删除 IndexedDB 库、清除 localStorage 标记、版本复位、清空业务与日志全部缓存，随后 `restoreFactoryRuntime()` 将 `window.*` 全量还原为出厂快照。
- **即时生效**：`refreshRuntimeCache()`（内部函数，不对外暴露）覆盖 `window.promptList`、三类 `toolDescriptions` 与 `window.jdbResourceList`。工具 `impl_code` 保存前经 `new Function` 语法校验，保存后热重建并挂回 `window.mcpEDA` / `window.customeTools`，重建失败回退出厂实现并告警；`system_message` 先经 `stripRefMarks` 还原再经 `window.applySystemMessage`（ai-chat.js 暴露）同步替换当前会话中的 system 消息，该函数不存在时兜底赋值 `window.top.systemMessage`。
- **引用检测与删除保护**：`findReferences(name)` 统一扫描「工具实现内的互调」与「提示词描述及正文内的引用」，返回 `{calls, calledBy, referencedByPrompts}`。名称抽取由 `extractNames(text)` 完成：匹配 `@{name}` 花括号形式，并兼容裸 `@name` 形式；对未加 `@` 前缀的名称不做子串猜测。工具 `impl_code` 在抽取前先剥离注释与字符串字面量，提示词文本不做剥离。删除提示词或自定义工具前先做引用检测，若被引用则弹窗列出引用者并要求二次确认——确认后仍可强制删除，不强制要求引用清零（避免循环引用导致互相无法删除）。
- **`@引用` 标记与还原**：编辑区将正文中的引用渲染为可交互的高亮标记——单击展开信息卡（校验目标是否存在，不存在标红），双击跳转到对应条目。高亮覆盖提示词内容、工具描述（description）、函数实现（impl_code）、以及日志 JSON 快照中的字符串值（分别经 `renderRefs` 与 `extractVisibleRefs` 渲染，`renderRefs` 隐去 `{}` 包裹仅显示名，`extractVisibleRefs` 保留 `@` 便于代码定位）。**双击跳转时原编辑器状态不丢失**：跳转前把当前标签页 / 选中项 / 编辑态 / 输入值 / 滚动位置压入「编辑器状态栈」，跳转后编辑面板顶部出现「返回来源」按钮，点击经 `popHistory` 原样恢复（保存 / 删除 / 整体重渲染会清空该栈）。文本送入模型之前统一经 `stripRefMarks` 还原为裸 `name`（仅处理花括号形式），保证模型看到的内容与标记化之前完全一致。出厂数据（`mcp-prompt.js`）已书写 `@{}` 标记（三层框架提示词互引、各工作流「推荐工具：@{xxx}」「规则：…调用 @{business_rules_spacing} 获取精确数值」等），提示词侧引用在导入出厂默认后即可正常解析并渲染；工具描述中的跨引用（如 `sch_PrimitiveComponent$create` 引用 `@{sch_PrimitiveComponent$createBatch}`）亦以 `@{}` 书写。
- **图谱派生**：`buildGraph()` 从主表实时派生 `{nodes, links}`。节点类型分为 `prompt`（提示词）、`custom`（精选工具）、`mcp`（MCP 元工具）、`jdb`（EDA 原生 API）四类；连线类型分为 `prompt_ref`、`prompt_tool`、`tool_call`（三者为强引用）与 `native_fallback`、`example_call`（弱引用）共五种，`strength` 仅取 `strong`/`weak` 两值。`describes`（描述-实现配对）仅保留类型定义与图例配色，**不生成连线**——其 source 与 target 必为同一节点，无信息增量且会被渲染成节点旁的带箭头弧线，该关系改由节点半径与 tooltip 出入度表达。所有抽取点均跳过 `source === target` 自环边，渲染层 `draw()` 另做一次过滤作为双保险。
- **调用日志**：数据库激活后，每次 `sendMessage` 以 `previous_response_id` 划分会话边界——当 `previous_response_id` 为 `null`（对话真正重新开始、上下文未串联上一轮）时由 `ai-chat.js` 新建会话（`startLogSession` → `pro_schematic_ai_log_sessions`），否则复用当前会话 `currentSessionId`，把本轮请求经 `appendLog` 写入、响应返回后经 `updateLogResponse` 回填。会话按 `created_at` 倒序、轮次按 `turn` 正序；连续多轮对话因 `previous_response_id` 串联而归属同一会话，更贴合真实对话流程。日志持久化为 fire-and-forget，不阻塞对话主流程，失败仅控制台告警。日志详情渲染**仅保留最外层整轮折叠**：请求 / 响应快照不再各自整体折叠，而将 JSON 内容经 `renderJsonFoldable` 按 `{ } [ ]` 真实层级递归生成可折叠单元（每个对象 / 数组默认展开，**仅 `{`/`[` 前保留折叠 / 展开箭头图标（▶/▼，CSS `::before` 提供），不显示任何键名 / 数量等统计文字、闭合 `}`/`]` 后也不附加符号**；字符串字面量内的括号因基于结构解析而天然排除）；`dm-json-fold` 提供箭头图标与类型着色。**复制方式调整**：移除原「双击整轮复制」交互，改为在每轮标题栏（`summary`）右侧提供「复制」按钮，点击经剪贴板复制该轮完整请求 / 响应 JSON（按钮 `stopPropagation` 避免误触折叠）。日志为只读快照，不参与导入 / 导出 / 恢复默认；「清空日志」仅清空 `chat_sessions` 与 `chat_logs` 两表，不影响业务数据。

---

## 五、测试

本插件以**手动/场景化测试**为主（无自动化单元测试）：

1. **导入与入口**：本地导入 `./build/dist/` 扩展包，在 Home/Sch/PCB 菜单确认"AI巧绘"可见，`原理图设计助手` 能打开对话框。
2. **配置**：填写 ARK `api_key`/`api_model` 或开启"私服"并登录；确认刷新后配置保留。
3. **问答**：输入原理图设计问题，确认多轮上下文连续、`total_tokens` 累加。
4. **工具读取**：在原理图选中元件后问"查询该元件引脚"，确认 AI 调用 `sch_SelectControl$getAllSelectedPrimitives`/`getAllPinsByPrimitiveId` 并正确返回。
5. **写操作确认**：下达"放置一个电阻"，确认先展示代码块，点击"确认执行"后画布出现元件；开启"自动执行"后 2 秒自动落地。
6. **停止/清空**：生成中点击"停止"，确认网络面板中的请求被真正 abort（而非仅界面停住）、不弹出错误提示；"清空"可重置对话（保留欢迎语）。
7. **错误分类**：故意填错 API Key 确认提示"鉴权失败"且「配置」按钮变红脉冲；断网确认提示"网络异常"；长任务确认 60 秒后提示"请求超时"。
8. **边界与间距**：尝试越界坐标，确认被 `getCanvasSize` 校验拦截。
9. **数据管理**：打开「数据」抽屉，依次验证「导入」（从源码导入 / 从本地文件导入）、搜索分页、条目编辑保存后即时生效、单条与全量恢复默认、「导出」（产出单个 `psa-export.v{版本}.json`）、「删除数据库」回退原始 JS 数据。
10. **引用与图谱**：在提示词或工具正文中书写引用，确认 `@引用` 高亮可单击展开信息卡、双击跳转；删除被引用条目时确认弹出引用者清单并需二次确认；切换到「图谱」分栏确认节点按类型着色、图例可过滤、搜索可高亮链路、右键菜单可用、选中态在切换分栏后仍保留。
11. **日志**：激活数据库后进行若干轮对话，在「日志」分栏确认按会话与轮次记录了请求与响应快照，可展开查看、经轮次标题栏「复制」按钮复制该轮 JSON；「清空日志」后业务数据不受影响。

---

## 六、总结

**设计亮点**
- 以 MCP 风格统一封装原生 `eda.*` API，工具可被发现、校验、调用，结构清晰、易扩展。
- "三层执行框架 + 按需 `getPrompt`"把规范约束注入大模型，兼顾可控性与灵活性，避免一次性注入大段提示浪费 Token。
- 直连/私服双后端解耦 Token 计费，降低使用门槛。
- "代码块确认执行 + 自动执行开关 + 停止"三重安全机制，保障对设计文件的写操作可控。
- 取消语义以 `AbortSignal` 单点贯穿（`abort-signal.js`），"停止"真正中断底层 fetch，且不侵入纯 UI 函数，渲染层只做只读查询，职责边界清晰。
- 错误处理分八类并给出可操作恢复建议（`error-handler.js`），工具执行错误回喂模型自愈而非终止对话。
- 本地数据化把提示词与工具从"硬编码常量"变为"可检索、可编辑、可版本化的数据"，且默认不激活、零成本兼容原有运行方式。
- 引用检测、`@引用` 高亮跳转与关系图谱共用同一份派生数据，删除保护与可视化保持天然一致，降低了误删与断链风险。

**已知局限 / 后续可优化**
- 出厂默认无资源数据，资源需通过导入 `psa-export.v*.json` 数据文件补充。
- 注入模型的仅 6 个通用 MCP 元工具，自定义工具的具体参数 Schema 主要靠提示词文本描述，模型对参数结构依赖"从工作流提示中识别工具名 + `callTool` 传参"，可进一步优化为直接把 `customeTools.toolDescriptions` 注入函数调用。
- 数据写入采用「内存缓存 + 整表覆写」的保守策略，条目规模显著增长后写入开销会线性上升。
- 关系图谱默认折叠 `jdb`（EDA 原生 API）类型节点，全量展开时节点数较多，需依赖图例过滤与搜索聚焦来控制可读性。
- 出厂提示词已完成 `@{}` 引用标记化：提示词侧的三类引用（提示词引用提示词/引用工具、「推荐工具」清单）当前均可被解析，导入出厂默认后图谱中即出现提示词侧连线；引用关系同时来自工具 `impl_code` 的互调与 `eda.*` 原生调用。
- 引用抽取对提示词文本不剥离注释与字符串，若正文中出现 `@param` 等文档标签可能被误识别为引用。
- 抽屉分隔条比例不持久化，重新打开抽屉恢复默认布局。
- `resources` 表在导入合并时依赖 `is_modified` 字段，但当前无任何写入该字段的路径；因出厂资源为空表，实际影响可忽略。

---

*文档整理自插件源码，如需对接私服或扩展新工具，请参考 `iframe/mcp-eda.js`（新增 `customeTools` 实现并登记到 `toolDescriptions`）、`iframe/mcp-prompt.js`（新增 `promptList` 提示）与 `iframe/ark-api.js`（后端适配）；本地数据化子系统的模块划分、数据结构与交互流程详见《系统设计说明.md》。*
