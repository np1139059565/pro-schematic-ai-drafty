# Graph Report - pro-schematic-ai  (2026-08-29)

## Corpus Check
- Large corpus: 48 files · ~776,987 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 480 nodes · 892 edges · 30 communities (29 shown, 1 thin omitted)
- Extraction: 91% EXTRACTED · 9% INFERRED · 0% AMBIGUOUS · INFERRED: 78 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- 本地数据层 Data Store
- 精选工具 元件与画布
- 对话主控制器
- 关系图谱视图
- 数据管理抽屉
- 构建与 lint 依赖
- TypeScript 编译配置
- 包与脚本配置
- MCP 协议壳元工具
- README 功能全景
- AI 执行框架设计
- 知识冲击分析与页面骨架
- 渐进式提示词调优
- 系统设计模块分层
- 中断与超时管理
- 错误分类处理
- 界面原型说明
- ARK 双通道接口
- 对话与执行开关
- 提交前钩子
- EDA 原生 API 清单

## God Nodes (most connected - your core abstractions)
1. `compilerOptions` - 24 edges
2. `draw()` - 20 edges
3. `continueConversationAfterTools()` - 17 edges
4. `refreshRuntimeCache()` - 17 edges
5. `callAIAndHandleResponse()` - 15 edges
6. `persistTable()` - 15 edges
7. `renderToolEdit()` - 14 edges
8. `init()` - 13 edges
9. `nowISO()` - 13 edges
10. `assertActivated()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `注入策略对比` --conceptually_related_to--> `全局挂载对象`  [INFERRED]
  docs/如何解决海量业务知识对ai的冲击.md → iframe/ai-chat.html
- `版本 v1.0.7（2026-08-24）` --references--> `MCP 协议壳 / callTool 统一工具入口`  [EXTRACTED]
  CHANGELOG.md → README.md
- `版本 v1.0.7（2026-08-24）` --references--> `精选工具（含 *_SCHEMA 元数据聚合）`  [EXTRACTED]
  CHANGELOG.md → README.md
- `版本 v1.0.7（2026-08-24）` --references--> `提示词池（prompt_index/domain_*/knowledge_*/execution_*）`  [EXTRACTED]
  CHANGELOG.md → README.md

## Import Cycles
- None detected.

## Communities (30 total, 1 thin omitted)

### Community 0 - "本地数据层 Data Store"
Cohesion: 0.08
Nodes (64): addCustomTool(), addPrompt(), appendLog(), applyImport(), applySystemPromptFromList(), assertActivated(), buildFactoryPromptRow(), buildFactoryPromptRows() (+56 more)

### Community 1 - "精选工具 元件与画布"
Cohesion: 0.06
Nodes (52): CALCULATE_COMPONENT_BOUNDS_BATCH_SCHEMA, CALCULATE_COMPONENT_BOUNDS_SCHEMA, calculateComponentBounds(), calculateComponentBoundsBatch(), GET_CANVAS_SIZE_SCHEMA, getCanvasSize(), lib_Device$search(), LIB_DEVICE_SEARCH_SCHEMA (+44 more)

### Community 2 - "对话主控制器"
Cohesion: 0.10
Nodes (51): activeApiPromises, activeTimeouts, addAssistantMessageToHistory(), addLoadingIndicator(), addMessageToChat(), buildStatusText(), callAIAndHandleResponse(), cleanupAfterAIError() (+43 more)

### Community 3 - "关系图谱视图"
Cohesion: 0.13
Nodes (44): applySearchHighlight(), applySelectionHighlight(), categoryLabel(), computeDegrees(), copyText(), createItem(), deleteItem(), dragended() (+36 more)

### Community 4 - "数据管理抽屉"
Cohesion: 0.16
Nodes (37): buildButton(), buildField(), computeReferences(), ensureRefCard(), escapeHtml(), extractVisibleRefs(), filterRows(), generateDescriptionByAI() (+29 more)

### Community 5 - "构建与 lint 依赖"
Cohesion: 0.05
Nodes (39): esbuild, eslint, eslint-config-alloy, eslint-plugin-tsdoc, fs-extra, husky, ignore, @jlceda/pro-api-types (+31 more)

### Community 6 - "TypeScript 编译配置"
Cohesion: 0.07
Nodes (29): DOM, ESNext, ./node_modules/@jlceda/pro-api-types/, ./src/, compilerOptions, allowJs, allowSyntheticDefaultImports, alwaysStrict (+21 more)

### Community 7 - "包与脚本配置"
Cohesion: 0.09
Nodes (21): author, description, engines, node, homepage, license, lint-staged, *.{js,ts,html,css,json,md} (+13 more)

### Community 8 - "MCP 协议壳元工具"
Cohesion: 0.11
Nodes (14): buildTextResponse(), CALL_TOOL_SCHEMA, callTool(), GET_PROMPT_SCHEMA, GET_TOOL_SCHEMA, getTool(), LIST_PROMPTS_SCHEMA, LIST_RESOURCES_SCHEMA (+6 more)

### Community 9 - "README 功能全景"
Cohesion: 0.29
Nodes (11): 版本 v1.0.7（2026-08-24）, 精选工具（含 *_SCHEMA 元数据聚合）, 六栏数据管理抽屉（图谱/提示词/精选工具/EDA函数/资源/日志）, IndexedDB/AlaSQL 数据化与导入导出、恢复出厂, EDA 原生 API（嘉立创 EDA）, engines.eda 依赖（嘉立创 EDA 专业版 >= 2.3.0）, 日志会话（请求/响应按会话回溯）, MCP 协议壳 / callTool 统一工具入口 (+3 more)

### Community 10 - "AI 执行框架设计"
Cohesion: 0.27
Nodes (10): 双通道后端, 精选工具池26条, 数据化·日志·导入导出, EDA原生API清单, AI执行框架设计说明, AI巧绘执行框架, 意图识别与步骤规划, MCP元工具 (+2 more)

### Community 11 - "知识冲击分析与页面骨架"
Cohesion: 0.27
Nodes (10): 上下文预算/token成本, 动态上下文发现, 海量知识冲击分析文档, 注入策略对比, 渐进式披露/知识分片, RAG检索召回+双源记忆, 主DOM容器, 全局挂载对象 (+2 more)

### Community 12 - "渐进式提示词调优"
Cohesion: 0.27
Nodes (10): 上下文预算与 token, 文档同步清单, domain_* 领域包, 渐进式提示词调优方案, 知识叶/执行叶, listTools({scenario}), 9 条 MCP 元工具, 渐进式下钻 (+2 more)

### Community 13 - "系统设计模块分层"
Cohesion: 0.27
Nodes (10): ai-chat.js 主控制器, @引用标记与跳转, data-store.js 数据层, editor-drawer.js 六栏抽屉, 系统设计说明, graph-view.js D3图谱, 导入导出闭环 psa-export, 引用检测与删除保护 (+2 more)

### Community 14 - "中断与超时管理"
Cohesion: 0.38
Nodes (3): createAbortController(), createTimeoutSignal(), getAbortSignal()

### Community 15 - "错误分类处理"
Cohesion: 0.48
Nodes (6): classifyError(), ErrorType, identifyErrorType(), isKeyConfigIssue(), isQuotaIssue(), toToolError()

### Community 16 - "界面原型说明"
Cohesion: 0.53
Nodes (6): @引用高亮与跳转, 六栏数据管理抽屉, 界面原型说明, 图谱Tab交互, 导入导出与恢复出厂, 列表+编辑双栏

### Community 17 - "ARK 双通道接口"
Cohesion: 0.53
Nodes (4): callArkChat(), callPrivateChat(), getConfig(), getPrivateServerUrl()

### Community 18 - "对话与执行开关"
Cohesion: 0.40
Nodes (5): ARK 直连（火山引擎 ARK API）, 自动执行开关, 对话主流程 / AI 对话主界面, 私服模式（外部私服后端转发至 ARK）, 工具调用代码块确认执行

### Community 21 - "提交前钩子"
Cohesion: 0.67
Nodes (3): 配置对话框, 消息区气泡与代码块, 状态栏与停止按钮

## Knowledge Gaps
- **120 isolated node(s):** `conversationHistory`, `activeTimeouts`, `activeApiPromises`, `UI_STATE`, `ErrorType` (+115 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `构建与 lint 依赖` to `包与脚本配置`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `draw()` (e.g. with `dragended()` and `dragged()`) actually correct?**
  _`draw()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `conversationHistory`, `activeTimeouts`, `activeApiPromises` to the rest of the system?**
  _120 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `本地数据层 Data Store` be split into smaller, more focused modules?**
  _Cohesion score 0.07645875251509054 - nodes in this community are weakly interconnected._
- **Should `精选工具 元件与画布` be split into smaller, more focused modules?**
  _Cohesion score 0.05519480519480519 - nodes in this community are weakly interconnected._
- **Should `对话主控制器` be split into smaller, more focused modules?**
  _Cohesion score 0.102322206095791 - nodes in this community are weakly interconnected._
- **Should `关系图谱视图` be split into smaller, more focused modules?**
  _Cohesion score 0.12626262626262627 - nodes in this community are weakly interconnected._