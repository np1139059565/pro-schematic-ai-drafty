# Graph Report - pro-schematic-ai  (2026-08-24)

## Corpus Check
- Large corpus: 52 files · ~782,699 words. Semantic extraction will be expensive (many Claude tokens). Consider running on a subfolder.

## Summary
- 424 nodes · 814 edges · 31 communities (21 shown, 10 thin omitted)
- Extraction: 92% EXTRACTED · 8% INFERRED · 0% AMBIGUOUS · INFERRED: 63 edges (avg confidence: 0.85)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- iframe_data_store
- iframe_mcp_curated
- iframe_ai_chat
- iframe_graph_view
- iframe_editor_draw
- esbuild
- ref_dom
- package
- iframe_mcp_meta_to
- iframe_abort_signa
- iframe_error_handl
- iframe_ark_api
- husky_pre_commit
- doc:CHANGELOG.md
- doc:README.en.md
- doc:README.md
- doc:docs/ai_mindma
- doc:docs/如何解决海量业务知
- doc:docs/渐进式智能提示词调
- doc:docs/界面原型说明.md
- doc:docs/系统设计说明.md
- doc:iframe/ai-chat

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
- None detected - all connections are within the same source files.

## Import Cycles
- None detected.

## Communities (31 total, 10 thin omitted)

### Community 0 - "iframe_data_store"
Cohesion: 0.08
Nodes (64): addCustomTool(), addPrompt(), appendLog(), applyImport(), applySystemPromptFromList(), assertActivated(), buildFactoryPromptRow(), buildFactoryPromptRows() (+56 more)

### Community 1 - "iframe_mcp_curated"
Cohesion: 0.06
Nodes (52): CALCULATE_COMPONENT_BOUNDS_BATCH_SCHEMA, CALCULATE_COMPONENT_BOUNDS_SCHEMA, calculateComponentBounds(), calculateComponentBoundsBatch(), GET_CANVAS_SIZE_SCHEMA, getCanvasSize(), lib_Device$search(), LIB_DEVICE_SEARCH_SCHEMA (+44 more)

### Community 2 - "iframe_ai_chat"
Cohesion: 0.10
Nodes (51): activeApiPromises, activeTimeouts, addAssistantMessageToHistory(), addLoadingIndicator(), addMessageToChat(), buildStatusText(), callAIAndHandleResponse(), cleanupAfterAIError() (+43 more)

### Community 3 - "iframe_graph_view"
Cohesion: 0.13
Nodes (44): applySearchHighlight(), applySelectionHighlight(), categoryLabel(), computeDegrees(), copyText(), createItem(), deleteItem(), dragended() (+36 more)

### Community 4 - "iframe_editor_draw"
Cohesion: 0.16
Nodes (37): buildButton(), buildField(), computeReferences(), ensureRefCard(), escapeHtml(), extractVisibleRefs(), filterRows(), generateDescriptionByAI() (+29 more)

### Community 5 - "esbuild"
Cohesion: 0.05
Nodes (39): esbuild, eslint, eslint-config-alloy, eslint-plugin-tsdoc, fs-extra, husky, ignore, @jlceda/pro-api-types (+31 more)

### Community 6 - "ref_dom"
Cohesion: 0.07
Nodes (29): DOM, ESNext, ./node_modules/@jlceda/pro-api-types/, ./src/, compilerOptions, allowJs, allowSyntheticDefaultImports, alwaysStrict (+21 more)

### Community 7 - "package"
Cohesion: 0.09
Nodes (21): author, description, engines, node, homepage, license, lint-staged, *.{js,ts,html,css,json,md} (+13 more)

### Community 8 - "iframe_mcp_meta_to"
Cohesion: 0.11
Nodes (14): buildTextResponse(), CALL_TOOL_SCHEMA, callTool(), GET_PROMPT_SCHEMA, GET_TOOL_SCHEMA, getTool(), LIST_PROMPTS_SCHEMA, LIST_RESOURCES_SCHEMA (+6 more)

### Community 9 - "iframe_abort_signa"
Cohesion: 0.38
Nodes (3): createAbortController(), createTimeoutSignal(), getAbortSignal()

### Community 10 - "iframe_error_handl"
Cohesion: 0.48
Nodes (6): classifyError(), ErrorType, identifyErrorType(), isKeyConfigIssue(), isQuotaIssue(), toToolError()

### Community 11 - "iframe_ark_api"
Cohesion: 0.53
Nodes (4): callArkChat(), callPrivateChat(), getConfig(), getPrivateServerUrl()

## Knowledge Gaps
- **111 isolated node(s):** `conversationHistory`, `activeTimeouts`, `activeApiPromises`, `UI_STATE`, `ErrorType` (+106 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **10 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `devDependencies` connect `esbuild` to `package`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 4 inferred relationships involving `draw()` (e.g. with `dragended()` and `dragged()`) actually correct?**
  _`draw()` has 4 INFERRED edges - model-reasoned connections that need verification._
- **What connects `conversationHistory`, `activeTimeouts`, `activeApiPromises` to the rest of the system?**
  _111 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `iframe_data_store` be split into smaller, more focused modules?**
  _Cohesion score 0.07645875251509054 - nodes in this community are weakly interconnected._
- **Should `iframe_mcp_curated` be split into smaller, more focused modules?**
  _Cohesion score 0.05519480519480519 - nodes in this community are weakly interconnected._
- **Should `iframe_ai_chat` be split into smaller, more focused modules?**
  _Cohesion score 0.102322206095791 - nodes in this community are weakly interconnected._
- **Should `iframe_graph_view` be split into smaller, more focused modules?**
  _Cohesion score 0.12626262626262627 - nodes in this community are weakly interconnected._