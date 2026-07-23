# 嘉立创 EDA 原理图设计 AI 执行框架（AI巧绘）设计说明

> 本文档基于插件实际源码整理，覆盖 `src/`、`iframe/`、`extension.json` 的整体架构、模块职责、核心流程与关键实现细节。
> 版本对应：`extension.json` 中 `version = 1.0.5`（包名 `pro-schematic-ai-drafty`），运行依赖 `eda >= 2.3.0`。

---

## 一、背景

嘉立创 EDA 专业版开放了JavaScript 扩展能力（`eda.*` 原生 API），允许扩展通过 `iframe` 嵌入自定义界面并与编辑器交互。本项目 **AI巧绘** 是一款原理图设计智能助手扩展，目标是：

- 让开发者用自然语言描述原理图设计意图；
- 由大模型（LLM）理解意图、规划步骤、调用 EDA 工具完成"搜索元件 → 放置元件 → 连线 → 校验"的自动化操作；
- 在自动修改设计文件前，以"代码块 + 确认执行"的方式保证安全可控。

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
│   按序加载脚本：                                               │
│   1. ark-api.js      → window.ArkAPI   对话后端（ARK / 私服）  │
│   2. mcp-prompt.js   → window.promptList 三层框架提示词       │
│   3. eda-api.js      → window.jdbToolDescriptions 原生API清单 │
│   4. mcp-eda.js      → window.mcpEDA(MCP封装)                 │
│                       window.customeTools(自定义工具实现)      │
│   5. ai-chat.js      → 主控制器（UI / 对话流 / 执行流）        │
└──────────────────────────────────────────────────────────────┘
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
| `ai-chat.js` | — | 主控制器：UI 状态机、对话流、工具调用代码生成、确认执行、停止/清空 |
| `ark-api.js` | `window.ArkAPI` | 两个对话后端：`callArkChat`（直连 ARK）、`callPrivateChat`（私服）；`updateConfig`/`getConfig` |
| `mcp-prompt.js` | `window.promptList` | 三层框架提示词（系统角色、工作流、业务规则、执行模式） |
| `eda-api.js` | `window.jdbToolDescriptions` | 自动生成的全量原生 EDA API 工具清单（约 17900 行，供 `searchTools` 检索） |
| `mcp-eda.js` | `window.mcpEDA`<br>`window.customeTools` | MCP 协议封装（callTool/listTools/...）；`customeTools` 为针对原理图场景封装的具体工具实现 |

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
- `execution_guidance`：总指导原则（按需求自主选工作流、按需 `getPrompt` 取规则、执行后自检检查点）。

> 注：`execution_guidance` 文本中提及了 `workflow_library_management`、`workflow_drc_check`、`workflow_manufacture_data_export` 等更多工作流名称，但当前 `promptList` 尚未全部定义，属于预留扩展点。

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
- 解析优先级：`window.mcpEDA[name]` → `window.customeTools[mname]` → `eda[className][methodName]`。
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
- 多轮上下文靠 `previous_response_id` 串联（首轮且历史长度为 2 时直接把整段历史作为 `input`）；每轮累加 `total_tokens` 并打印对话历史到控制台。
- 工具结果以 `function_call_output`（含 `call_id`/`output`）形式回传，符合 Responses API 规范。

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
- **停止**：`handleStop` 设置 `isStop`，清空 `activeTimeouts` 与 `activeApiPromises`；无在途请求立即恢复空闲，否则等当前请求完成后由 `resumeStop` 恢复。
- **边界校验**：`customeTools` 中各创建/修改工具均调用 `getCanvasSize` 校验坐标不越界；间距规范由 AI 在框架提示中遵循并利用 `calculateComponentBounds` 计算。

### 4.4 错误处理

- `parseAIResponse` 对格式异常返回固定提示文案。
- `callTool` 用 `try/catch` 包装，错误以 MCP 格式 `isError:true` 返回，并在对话气泡以红色样式展示（`handleAIError`）。
- API 失败统一走 `handleAIError` 并恢复 `IDLE` 状态。

### 4.5 资源（Resource）能力说明

`window.mcpEDA.listResources`/`readResource` 引用了 `window.jdbResourceList`，但当前 `iframe/` 内未定义该变量（规范源码 `standardCode1/2/3` 仅在提示词中被引用）。即资源读取相关工具目前为预留能力，调用会返回空/异常，属已知扩展点。

---

## 五、测试

本插件以**手动/场景化测试**为主（无自动化单元测试）：

1. **导入与入口**：本地导入 `./build/dist/` 扩展包，在 Home/Sch/PCB 菜单确认"AI巧绘"可见，`原理图设计助手` 能打开对话框。
2. **配置**：填写 ARK `api_key`/`api_model` 或开启"私服"并登录；确认刷新后配置保留。
3. **问答**：输入原理图设计问题，确认多轮上下文连续、`total_tokens` 累加。
4. **工具读取**：在原理图选中元件后问"查询该元件引脚"，确认 AI 调用 `sch_SelectControl$getAllSelectedPrimitives`/`getAllPinsByPrimitiveId` 并正确返回。
5. **写操作确认**：下达"放置一个电阻"，确认先展示代码块，点击"确认执行"后画布出现元件；开启"自动执行"后 2 秒自动落地。
6. **停止/清空**：生成中点击"停止"可中断；"清空"可重置对话（保留欢迎语）。
7. **边界与间距**：尝试越界坐标，确认被 `getCanvasSize` 校验拦截。

---

## 六、总结

**设计亮点**
- 以 MCP 风格统一封装原生 `eda.*` API，工具可被发现、校验、调用，结构清晰、易扩展。
- "三层执行框架 + 按需 `getPrompt`"把规范约束注入大模型，兼顾可控性与灵活性，避免一次性注入大段提示浪费 Token。
- 直连/私服双后端解耦 Token 计费，降低使用门槛。
- "代码块确认执行 + 自动执行开关 + 停止"三重安全机制，保障对设计文件的写操作可控。

**已知局限 / 后续可优化**
- `window.jdbResourceList` 未定义，资源类工具暂不可用。
- 注入模型的仅 6 个通用 MCP 元工具，自定义工具的具体参数 Schema 主要靠提示词文本描述，模型对参数结构依赖"从工作流提示中识别工具名 + `callTool` 传参"，可进一步优化为直接把 `customeTools.toolDescriptions` 注入函数调用。
- `execution_guidance` 引用的部分工作流尚未在 `promptList` 中定义。
- 自动执行注释写"5 秒"而实际 `setTimeout` 为 2000ms（以代码为准）。

---

*文档整理自插件源码，如需对接私服或扩展新工具，请参考 `iframe/mcp-eda.js`（新增 `customeTools` 实现并登记到 `toolDescriptions`）、`iframe/mcp-prompt.js`（新增 `promptList` 提示）与 `iframe/ark-api.js`（后端适配）。*
