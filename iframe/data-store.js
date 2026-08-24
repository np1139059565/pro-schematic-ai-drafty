/**
 * 数据层 data-store.js —— 「本地数据化」核心模块
 *
 * 职责(单一职责:只管数据,不管界面):
 * 1. 启动时捕获「出厂默认 1.0」运行时快照(promptList / edaApi /
 *    mcpProtocol.metaToolSchemas / curatedTools 及其函数体),作为恢复默认与导出的数据源;
 * 2. 基于 AlaSQL 的 INDEXEDDB 引擎管理本地数据库 ProSchematicAiDB
 *    (业务四表 prompts / tools / resources / meta + 日志两表 chat_sessions / chat_logs);
 * 3. 提供数据维护能力:
 *    - 导入:importFromMemory(读运行时内存常量,首次激活起点) /
 *            importLocalFiles(本地 .json 文件) / importFromFile(单个 psa-export JSON) /
 *            parseSourceFiles(沙箱解析 JS 源码) / importFactoryDefaults(出厂快照);
 *    - 导出:exportAll(单文件 JSON,含业务数据与函数源码) / exportData(业务数据 JSON) /
 *            exportFunctionJs(当前库函数源码) / exportFactoryJs(出厂快照重建 JS);
 *    - 其它:deleteDatabase、单条增删改查、单条/全量恢复默认、
 *            提示词新增/删除(addPrompt/deletePrompt)、引用检测(findReferences)、
 *            引用标记还原(stripRefMarks)、图谱数据派生(buildGraph);
 * 4. 数据库激活后,通过 refreshRuntimeCache() 将数据库数据覆盖到 window.* 运行时缓存
 *    (含 new Function 重建函数体),使 mcp/curated-tools/index.js / mcp/meta-tools.js / ai-chat.js 等消费方无感知数据来源;
 * 5. 管理独立的两张日志表 chat_sessions / chat_logs,提供会话与调用日志的存储 API
 *    (createSession / appendLog / updateLogResponse / getSessions / getSessionLogs / clearLogs),
 *    日志仅追加、不参与导入/导出/恢复默认,写日志职责在 ai-chat.js。
 *
 * 数据流:
 *   未激活: 原始 JS 常量(mcp/prompts.js / eda-api.js / mcp/curated-tools/index.js / mcp/meta-tools.js / mcp/resources.js) → window.* → 消费方
 *   已激活: IndexedDB → refreshRuntimeCache() → window.* → 消费方
 *
 * 加载顺序要求:必须在 mcp/prompts.js / eda-api.js / mcp/curated-tools/index.js / mcp/meta-tools.js / mcp/resources.js 与 .vendor/alasql.min.js
 * 之后、editor-drawer.js / ai-chat.js 之前加载。
 */

(function () {
	'use strict';

	// ==================== 常量定义 ====================

	/** IndexedDB 数据库名称 */
	const DB_NAME = 'ProSchematicAiDB';
	/** 出厂默认数据版本(与原始 JS 常量对应) */
	const FACTORY_VERSION = '1.0';
	/** localStorage 激活标记键名(用于不支持 indexedDB.databases() 的环境兜底检测) */
	const LS_ACTIVATED_KEY = 'psa_db_activated';
	/** 导出 JSON 文件名模板 */
	const EXPORT_FILE_PREFIX = 'psa-export.v';

	// ==================== 出厂默认快照 ====================
	// 本文件在原始 JS(mcp/prompts.js / eda-api.js / mcp/curated-tools/index.js / mcp/meta-tools.js / mcp/resources.js)之后加载,
	// 此时 window.* 均为原始常量(即各原始 JS 文件所定义的全局对象,如 mcp/meta-tools.js 顶部「超级对象挂载区」所列),
	// 直接持有引用即可作为出厂快照。
	// 注意:refreshRuntimeCache() 永远以「赋新数组/新对象」方式覆盖 window.*,
	// 绝不原地修改,因此快照引用始终保持出厂状态不被污染。

	/** 从对象上收集所有函数属性,返回 {函数名: 函数引用} 映射 */
	function collectFunctions(obj) {
		const map = {};
		for (const key of Object.keys(obj || {})) {
			if (typeof obj[key] === 'function') {
				map[key] = obj[key];
			}
		}
		return map;
	}

	/**
	 * 在沙箱中执行源码文本,拦截其中对 window.* 的赋值并提取数据。
	 * 仅捕获以下目标,避免执行未知的副作用代码:
	 *   window.promptList / window.edaApi / window.resourceList /
	 *   window.mcpProtocol.metaToolSchemas / window.curatedTools.curatedToolSchemas /
	 *   window.mcpProtocol[name] / window.curatedTools[name](函数实现)。
	 * 返回结构化结果,未出现的字段为 undefined。
	 */
	function extractSourceAssignments(code) {
		const result = {};
		// 捕获器:记录目标属性写入的值
		const capture = (target, key, value) => {
			if (target === 'promptList') result.promptList = value;
			else if (target === 'edaApi') result.edaApi = value;
			else if (target === 'mcpDesc') result.mcpToolDescriptions = value;
			else if (target === 'customDesc') result.customToolDescriptions = value;
		else if (target === 'mcpFn') { result.mcpFunctions = result.mcpFunctions || {}; result.mcpFunctions[key] = value; }
		else if (target === 'customFn') { result.customFunctions = result.customFunctions || {}; result.customFunctions[key] = value; }
		};
		// 用 Proxy 构造可层层拦截的 window/mcpProtocol/curatedTools
		const makeProxy = (kind, keyName) => new Proxy({}, {
			get(_t, prop) {
				// 继续向下代理,支持 window.mcpProtocol.metaToolSchemas
				return makeProxy(kind, prop);
			},
			set(_t, prop, value) {
				capture(kind, prop, value);
				return true;
			},
			apply(_t, _this, args) {
				// 处理函数形式的导出:window.mcpProtocol[name] = (fn)
				capture(kind, keyName, args[0]);
				return undefined;
			}
		});
		const sandboxWindow = new Proxy({}, {
			get(_t, prop) {
				if (prop === 'promptList') return makeProxy('promptList');
				if (prop === 'edaApi') return makeProxy('edaApi');
			if (prop === 'mcpProtocol') return makeProxy('mcpDesc');
			if (prop === 'curatedTools') return makeProxy('customDesc');
				return undefined;
			},
			set(_t, prop, value) {
				if (prop === 'promptList') result.promptList = value;
				else if (prop === 'edaApi') result.edaApi = value;
				else if (prop === 'resourceList') result.resourceList = value;
				captureStandalone(prop, value);
				return true;
			}
		});
		// 兼容 window.mcpProtocol[name] = (fn) 中 name 为动态键的写法
		function captureStandalone(prop, value) {
		if (prop === 'mcpProtocol') result._mcpProxy = makeProxy('mcpDesc');
		if (prop === 'curatedTools') result._customProxy = makeProxy('customDesc');
		}
		// 执行源码(严格模式避免静默失败),仅用于读取赋值,不关心返回值
		try {
			// eslint-disable-next-line no-new-func
			const runner = new Function('window', `"use strict";\n${code}`);
			runner(sandboxWindow);
		} catch (error) {
			throw new Error('源码解析失败,文件格式不符合预期: ' + error.message);
		}
		return result;
	}

	/**
	 * 将源码提取出的原始数据构建为统一的业务行结构(供 applyImport 合并)。
	 * 工具区分为 jdb(原生API)/ meta(元工具)/ curated(精选工具)三类。
	 */
	function buildRowsFromSource(promptList, jdbList, mcpDescList, customDescList, mcpFns, customFns, resourceList) {
		const time = nowISO();
		const prompts = (promptList || []).map(p => ({
			name: p.name,
			description: p.description || '',
			messages: typeof p.messages === 'string' ? p.messages : JSON.stringify(p.messages || []),
			category: p.category || p.name.split('_')[0],
			is_modified: false,
			updated_at: time
		}));
		const tools = [];
		const pushTool = (list, source, fnMap) => {
			for (const t of (list || [])) {
				const impl = (fnMap && fnMap[t.name]) ? fnMap[t.name].toString() : null;
				tools.push({
					name: t.name,
					description: t.description || '',
					input_schema: JSON.stringify(t.inputSchema || t.input_schema || {}),
					impl_code: impl,
					domain: t.domain ?? null,
				source,
				enabled: true,
					is_modified: false,
					updated_at: time
				});
			}
		};
		pushTool(jdbList, 'jdb', null);
		pushTool(mcpDescList, 'meta', mcpFns);
		pushTool(customDescList, 'curated', customFns);
		const resources = (resourceList && resourceList.length) ? resourceList : buildFactoryResourceRows();
		return { prompts, tools, resources };
	}

	/** 出厂默认快照(所有恢复默认/导出出厂 JS 操作的唯一数据源) */
	const factoryDefaults = {
		/** 出厂提示词列表(mcp/prompts.js) */
		promptList: window.promptList || [],
		/** 出厂原生API描述列表(eda-api.js) */
		edaApi: window.edaApi || [],
		/** 出厂 MCP 元工具描述列表(mcp/meta-tools.js 挂载的 window.mcpProtocol) */
		mcpToolDescriptions: (window.mcpProtocol && window.mcpProtocol.metaToolSchemas) || [],
		/** 出厂精选工具描述列表(mcp/curated-tools/index.js 挂载的 window.curatedTools) */
		customToolDescriptions: (window.curatedTools && window.curatedTools.curatedToolSchemas) || [],
		/** 出厂 MCP 元工具函数体映射 */
		mcpFunctions: collectFunctions(window.mcpProtocol),
		/** 出厂精选工具函数体映射 */
		customFunctions: collectFunctions(window.curatedTools),
		/** 出厂资源列表(mcp/resources.js 定义的 window.resourceList,内置海量嘉立创原理图资料集) */
		resourceList: window.resourceList || []
	};

	// ==================== 模块内部状态 ====================

	/** 数据库是否已激活(存在且成功加载) */
	let activated = false;
	/** AlaSQL 是否已完成 ATTACH(避免重复附加报错) */
	let attached = false;
	/** 当前数据种子版本(来自 meta 表 seed_version,未激活时为出厂版本) */
	let seedVersion = FACTORY_VERSION;
	/**
	 * 全量内存缓存(与 IndexedDB 保持同步)。
	 * 读操作直接走缓存;写操作先改缓存再整表回写,保证一致性与性能。
	 */
	const cache = { prompts: [], tools: [], resources: [] };

	/** 会话缓存（日志，独立于业务数据，不参与导入/导出/恢复默认） */
	let sessionCache = [];
	/** 调用日志缓存（日志，独立于业务数据） */
	let logCache = [];

	// ==================== 工具函数 ====================

	/**
	 * 生成当前时间的本地 ISO 字符串（不带时区后缀 Z，按运行环境本地时区）。
	 * 日志与记录展示均直接使用该字符串，避免 toISOString() 返回 UTC 导致
	 * 显示时间比真实系统时间偏移（如东八区慢 8 小时）的问题。
	 */
	function nowISO() {
		const d = new Date();
		const pad = (n) => String(n).padStart(2, '0');
		return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
			+ `T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
	}

	/** 根据提示词名称推断分类(用于抽屉界面分组展示)
	 * 提示命名分类:prompt_index(全局索引)/domain_*(流程提示)/knowledge_*(知识叶)/execution_*(执行叶) */
	function categorizeByName(name) {
		if (name === 'prompt_index') return 'index';
		if (name.startsWith('domain')) return 'domain';
		if (name.startsWith('knowledge')) return 'knowledge';
		if (name.startsWith('execution')) return 'execution';
		return 'other';
	}

	/** 执行 AlaSQL 语句(Promise 形式),集中封装便于统一排查 SQL 层错误 */
	function sql(query, params) {
		return window.alasql.promise(query, params);
	}

	/** 触发浏览器下载(文本内容 → 文件) */
	function downloadTextFile(fileName, text, mimeType) {
		const blob = new Blob([text], { type: mimeType || 'application/octet-stream' });
		const url = URL.createObjectURL(blob);
		const anchor = document.createElement('a');
		anchor.href = url;
		anchor.download = fileName;
		document.body.appendChild(anchor);
		anchor.click();
		document.body.removeChild(anchor);
		URL.revokeObjectURL(url);
	}

	// ==================== 数据库底层操作 ====================

	/**
	 * 检测数据库是否已存在(轻量检测,不创建数据库)。
	 * 优先使用 indexedDB.databases()(Chromium 支持);
	 * 不支持时回退 localStorage 激活标记。
	 */
	async function detectDatabaseExists() {
		try {
			if (typeof indexedDB.databases === 'function') {
				const dbs = await indexedDB.databases();
				return dbs.some(db => db.name === DB_NAME);
			}
		} catch (error) {
			console.warn('[data-store] indexedDB.databases() 检测失败,回退 localStorage 标记:', error);
		}
		return localStorage.getItem(LS_ACTIVATED_KEY) === '1';
	}

	/**
	 * 安全解析 JSON 字符串
	 * 用于把持久化到数据库中的文本字段(如 request_payload / response_payload / tool_snapshot /
	 * input_schema)反序列化为对象。解析失败时保留原文本而非抛错,
	 * 避免单条脏数据导致 loadAllTables 中断、进而使 init 降级为未激活。
	 * 调用点:loadAllTables(读日志两表)、exportFunctionJs(还原 inputSchema)。
	 * @param {*} text 待解析的值,可能是字符串、对象或 null
	 * @returns {*} 解析后的对象;非字符串直接原样返回;解析失败返回原文本
	 */
	function safeParse(text) {
		// 非字符串无需解析,直接返回(例如已经是对象/数组的字段)
		if (typeof text !== 'string') {
			return text;
		}
		// 空字符串或纯空白无法构成合法 JSON,直接返回原值
		if (text.trim() === '') {
			return text;
		}
		try {
			return JSON.parse(text); // 尝试解析 JSON
		} catch (error) {
			// 解析失败时保留原始文本,避免上层因异常中断
			console.warn('[data-store] safeParse 解析失败,保留原文本:', error);
			return text;
		}
	}

	/** 确保数据库已创建并 ATTACH 到 AlaSQL(幂等) */
	async function ensureAttached() {
		if (attached) return;
		await sql(`CREATE INDEXEDDB DATABASE IF NOT EXISTS ${DB_NAME}`);
		await sql(`ATTACH INDEXEDDB DATABASE ${DB_NAME}`);
		await sql(`USE ${DB_NAME}`);
		// 日志表:仅创建不删除(历史不被 import/export/reset 影响),幂等
		await sql(`CREATE TABLE IF NOT EXISTS chat_sessions (session_id STRING, title STRING, created_at STRING, updated_at STRING)`);
		await sql(`CREATE TABLE IF NOT EXISTS chat_logs (log_id STRING, session_id STRING, turn NUMBER, request_payload STRING, response_payload STRING, prompt_snapshot STRING, tool_snapshot STRING, created_at STRING)`);
		attached = true;
	}

	/**
	 * 整表覆写(DROP + CREATE + 批量 INSERT)。
	 * 采用 AlaSQL INDEXEDDB 引擎最稳定的原语组合,规避引擎对 UPDATE/DELETE 的兼容性风险;
	 * 数据量级(约 1000 行)下整表回写耗时可忽略。
	 */
	async function overwriteTable(tableName, rows) {
		await sql(`DROP TABLE IF EXISTS ${tableName}`);
		await sql(`CREATE TABLE ${tableName}`);
		if (rows && rows.length > 0) {
			await sql(`INSERT INTO ${tableName} SELECT * FROM ?`, [rows]);
		}
	}

	/** 读取整表数据(表不存在时返回空数组) */
	async function readTable(tableName) {
		try {
			const rows = await sql(`SELECT * FROM ${tableName}`);
			return Array.isArray(rows) ? rows : [];
		} catch (error) {
			return [];
		}
	}

	/** 将内存缓存的指定表持久化到 IndexedDB */
	async function persistTable(tableName) {
		await ensureAttached();
		await overwriteTable(tableName, cache[tableName]);
	}

	/** 将种子版本写入 meta 表并同步内存 */
	async function persistMeta(version) {
		seedVersion = version;
		await ensureAttached();
		await overwriteTable('meta', [
			{ key: 'seed_version', value: version },
			{ key: 'factory_version', value: FACTORY_VERSION }
		]);
	}

	/** 从 IndexedDB 加载全部表到内存缓存 */
	async function loadAllTables() {
		await ensureAttached();
		cache.prompts = await readTable('prompts');
		cache.tools = await readTable('tools');
		cache.resources = await readTable('resources');
		const metaRows = await readTable('meta');
		const versionRow = metaRows.find(row => row.key === 'seed_version');
		seedVersion = versionRow ? versionRow.value : FACTORY_VERSION;
		// 读取日志表（按时间排序：会话倒序、日志正序）
		sessionCache = (await readTable('chat_sessions')).map(row => ({
			session_id: row.session_id,
			title: row.title,
			created_at: row.created_at,
			updated_at: row.updated_at
		}));
		logCache = (await readTable('chat_logs')).map(row => ({
			log_id: row.log_id,
			session_id: row.session_id,
			turn: row.turn,
			request_payload: safeParse(row.request_payload),
			response_payload: safeParse(row.response_payload),
			prompt_snapshot: row.prompt_snapshot,
			tool_snapshot: safeParse(row.tool_snapshot),
			created_at: row.created_at
		}));
	}

	// ==================== 出厂数据 → 数据库行 转换 ====================

	/** 由出厂快照构建 prompts 表行数组 */
	function buildFactoryPromptRows() {
		const time = nowISO();
		return factoryDefaults.promptList.map(prompt => ({
			name: prompt.name,
			description: prompt.description || '',
			messages: JSON.stringify(prompt.messages || []),
			category: categorizeByName(prompt.name),
			is_modified: false,
			updated_at: time
		}));
	}

	/** 由出厂快照构建 tools 表行数组(jdb 原生API + mcp 元工具 + custom 精选工具) */
	function buildFactoryToolRows() {
		const time = nowISO();
		const rows = [];
		// 原生API:无函数体(调用时由 callTool 走 eda.* 原生对象)
		for (const tool of factoryDefaults.edaApi) {
			rows.push({
				name: tool.name,
				description: tool.description || '',
				input_schema: JSON.stringify(tool.inputSchema || {}),
				impl_code: null,
				source: 'jdb',
				enabled: true,
				is_modified: false,
				updated_at: time
			});
		}
		// MCP 元工具:函数体取自出厂函数快照的源码
		for (const tool of factoryDefaults.mcpToolDescriptions) {
			const fn = factoryDefaults.mcpFunctions[tool.name];
			rows.push({
				name: tool.name,
				description: tool.description || '',
				input_schema: JSON.stringify(tool.inputSchema || {}),
				impl_code: fn ? fn.toString() : null,
				domain: tool.domain ?? null,
				source: 'meta',
				enabled: true,
				is_modified: false,
				updated_at: time
			});
		}
		// 精选工具:函数体取自出厂函数快照的源码
		for (const tool of factoryDefaults.customToolDescriptions) {
			const fn = factoryDefaults.customFunctions[tool.name];
			rows.push({
				name: tool.name,
				description: tool.description || '',
				input_schema: JSON.stringify(tool.inputSchema || {}),
				impl_code: fn ? fn.toString() : null,
				domain: tool.domain ?? null,
				source: 'curated',
				enabled: true,
				is_modified: false,
				updated_at: time
			});
		}
		return rows;
	}

	/** 由出厂快照构建 resources 表行数组 */
	function buildFactoryResourceRows() {
		const time = nowISO();
		return factoryDefaults.resourceList.map(res => ({
			uri: res.uri,
			name: res.name,
			description: res.description || '',
			mime_type: res.mime_type || 'text/markdown',
			content: res.content || '',
			is_modified: false,
			updated_at: time
		}));
	}

	/** 在出厂快照中查找指定工具的出厂行(用于单条恢复默认),找不到返回 null */
	function buildFactoryToolRow(name) {
		return buildFactoryToolRows().find(row => row.name === name) || null;
	}

	/** 在出厂快照中查找指定提示词的出厂行(用于单条恢复默认),找不到返回 null */
	function buildFactoryPromptRow(name) {
		return buildFactoryPromptRows().find(row => row.name === name) || null;
	}

	/** 在出厂快照中查找指定资源的出厂行(用于单条恢复默认),找不到返回 null */
	function buildFactoryResourceRow(uri) {
		return buildFactoryResourceRows().find(row => row.uri === uri) || null;
	}

	// ==================== 导入合并策略 ====================

	/**
	 * 合并「已有行」与「新导入行」:
	 * - 用户已修改(is_modified=true)的行保留用户版本;
	 * - 未修改的行以新数据覆盖;
	 * - 新数据中已删除、但用户改过的行保留(避免丢失用户成果);
	 * - 新数据中已删除且未修改的行随之删除。
	 */
	function mergeRows(existingRows, incomingRows, keyField) {
		const existingByKey = new Map(existingRows.map(row => [row[keyField], row]));
		const incomingKeys = new Set(incomingRows.map(row => row[keyField]));
		const merged = [];
		for (const row of incomingRows) {
			const existing = existingByKey.get(row[keyField]);
			merged.push(existing && existing.is_modified ? existing : row);
		}
		for (const existing of existingRows) {
			if (existing.is_modified && !incomingKeys.has(existing[keyField])) {
				merged.push(existing);
			}
		}
		return merged;
	}

	/** 执行导入(合并 + 持久化 + 刷新运行时缓存),incoming 为三表行数据 */
	async function applyImport(incoming, version) {
		await ensureAttached();
		// 若数据库已激活,与现有数据做合并;首次导入直接使用新数据
		if (activated) {
			await loadAllTables();
			cache.prompts = mergeRows(cache.prompts, incoming.prompts, 'name');
			cache.tools = mergeRows(cache.tools, incoming.tools, 'name');
			cache.resources = mergeRows(cache.resources, incoming.resources, 'uri');
		} else {
			cache.prompts = incoming.prompts;
			cache.tools = incoming.tools;
			cache.resources = incoming.resources;
		}
		await persistTable('prompts');
		await persistTable('tools');
		await persistTable('resources');
		await persistMeta(version);
		localStorage.setItem(LS_ACTIVATED_KEY, '1');
		activated = true;
		refreshRuntimeCache();
	}

	// ==================== 运行时缓存刷新与出厂回退 ====================

	/**
	 * 用数据库数据覆盖 window.* 运行时缓存(数据库已激活时的唯一数据出口)。
	 * 覆盖内容:提示词列表、三类工具描述、资源列表、system 消息,
	 * 并对携带 impl_code 的 mcp/custom 工具执行函数体重建。
	 */
	function refreshRuntimeCache() {
		// ---- 提示词 ----
		window.promptList = cache.prompts.map(row => ({
			name: row.name,
			description: row.description,
			messages: JSON.parse(row.messages)
		}));

	// ---- 工具描述(按来源分流,携带 enabled 与 domain 供 mcp/meta-tools.js 与 mcp/curated-tools/index.js 过滤) ----
	const jdbDescriptions = [];
	const mcpDescriptions = [];
	const customDescriptions = [];
	for (const row of cache.tools) {
		// domain 取自数据库行;旧库行缺该字段时回退出厂快照同名工具,保证 listTools({scenario}) 场景过滤始终可用
		let domain = row.domain;
		if (domain == null) {
			const factoryRow = buildFactoryToolRow(row.name);
			domain = factoryRow ? factoryRow.domain : null;
		}
		const description = {
			name: row.name,
			description: row.description,
			inputSchema: JSON.parse(row.input_schema),
			enabled: row.enabled !== false,
			domain
		};
		if (row.source === 'jdb') jdbDescriptions.push(description);
		else if (row.source === 'meta') mcpDescriptions.push(description);
		else customDescriptions.push(description);
	}
		window.edaApi = jdbDescriptions;
		// 保活协议层对象后再注入 schema,统一收口至 ensureMCPObjects(),避免时序异常路径下 undefined
		ensureMCPObjects();
		window.mcpProtocol.metaToolSchemas = mcpDescriptions;
		window.curatedTools.curatedToolSchemas = customDescriptions;

		// ---- 函数体重建(用户可编辑 impl_code;重建失败时回退出厂函数并告警) ----
		for (const row of cache.tools) {
			if (!row.impl_code || (row.source !== 'meta' && row.source !== 'curated')) continue;
			const target = row.source === 'meta' ? window.mcpProtocol : window.curatedTools;
			const factoryFn = row.source === 'meta'
				? factoryDefaults.mcpFunctions[row.name]
				: factoryDefaults.customFunctions[row.name];
			try {
				const rebuiltFn = new Function(`return (${row.impl_code})`)();
				if (typeof rebuiltFn !== 'function') throw new Error('impl_code 未生成函数');
				target[row.name] = rebuiltFn;
			} catch (error) {
				console.warn(`[data-store] 工具 ${row.name} 函数体重建失败,已回退出厂实现:`, error);
				if (factoryFn) target[row.name] = factoryFn;
			}
		}

		// ---- 资源列表 ----
		window.resourceList = cache.resources.map(row => ({
			uri: row.uri,
			name: row.name,
			description: row.description,
			mime_type: row.mime_type,
			content: row.content
		}));

		// ---- system 消息即时生效(优先走 ai-chat.js 暴露的入口以同步会话历史) ----
		applySystemPromptFromList(window.promptList);
	}

	/** 从提示词列表提取 prompt_index（系统消息承载者）并应用到会话运行时 */
	function applySystemPromptFromList(promptList) {
		const systemPrompt = promptList.find(prompt => prompt.name === 'prompt_index');
		const raw = systemPrompt && systemPrompt.messages && systemPrompt.messages[0]
			&& systemPrompt.messages[0].content && systemPrompt.messages[0].content.text;
		if (!raw) return;
		// 发送前将 @name 引用标记还原为裸 name，保证送入模型的文本与标记化前逐字节一致，不改变模型行为
		const text = stripRefMarks(raw);
		if (typeof window.applySystemMessage === 'function') {
			window.applySystemMessage(text);
		} else {
			window.top.systemMessage = text;
		}
	}

	/**
	 * 确保协议层运行时对象存在(最小骨架保活)。
	 * 拆分后 window.mcpProtocol / window.curatedTools 分属 mcp/meta-tools.js 与 mcp/curated-tools/index.js 两个文件,
	 * 在「从内存导入」「激活」「删除数据库后恢复出厂」等早于源码挂载或时序异常的路径下可能为 undefined;
	 * 故此处先确保两个运行时对象存在(缺失则初始化最小空骨架),避免后续写入「Cannot set properties of undefined」。
	 * 统一收口原本散落在 refreshRuntimeCache / restoreFactoryRuntime 两处的相同保活逻辑。
	 */
	function ensureMCPObjects() {
		if (!window.mcpProtocol || typeof window.mcpProtocol !== 'object') window.mcpProtocol = {};
		if (!window.curatedTools || typeof window.curatedTools !== 'object' || !window.curatedTools.curatedToolSchemas) window.curatedTools = {};
	}

	/** 将 window.* 运行时缓存全部恢复为出厂快照(删除数据库后调用) */
	function restoreFactoryRuntime() {
		ensureMCPObjects(); // 保活协议层对象,避免时序异常路径下 undefined
		window.promptList = factoryDefaults.promptList;
		window.edaApi = factoryDefaults.edaApi;
		window.mcpProtocol.metaToolSchemas = factoryDefaults.mcpToolDescriptions;
		window.curatedTools.curatedToolSchemas = factoryDefaults.customToolDescriptions;
		for (const [name, fn] of Object.entries(factoryDefaults.mcpFunctions)) {
			window.mcpProtocol[name] = fn;
		}
		for (const [name, fn] of Object.entries(factoryDefaults.customFunctions)) {
			window.curatedTools[name] = fn;
		}
		applySystemPromptFromList(factoryDefaults.promptList);
	}

	// ==================== 引用检测 / 提示词增删 ====================

	/** 工具函数体引用扫描：剥离注释与字符串后提取 @name 引用 */
	const SANITIZE_FN = (code) =>
		(code || '')
			.replace(/\/\*[\s\S]*?\*\//g, ' ') // 块注释
			.replace(/\/\/[^\n]*/g, ' ') // 行注释
			.replace(/`(?:\\.|[^`\\])*`/g, ' ') // 模板字符串
			.replace(/'(?:\\.|[^'\\])*'/g, ' ') // 单引号字符串
			.replace(/"(?:\\.|[^"\\])*"/g, ' '); // 双引号字符串

	/**
	 * 从文本提取 @name 形式的显式引用名称（工具名/提示词名，允许字母数字下划线.$）
	 * 解析器只承认带 @ 前缀的显式标记，对未加前缀的裸名称不做子串猜测，从而杜绝"前缀同名"造成的误报。
	 * @param {string} text 待扫描文本
	 * @returns {string[]} 去重后的引用名称列表
	 */
	function extractNames(text) {
		if (!text) return [];
		const names = new Set();
		// 匹配 @name 显式引用形式
		for (const m of (text.match(/@([A-Za-z0-9_.\$]+)/g) || [])) {
			names.add(m.slice(1));
		}
		return Array.from(names);
	}

	/**
	 * 将提示词/描述中的 @name 引用标记还原为裸 name
	 * 用于提示词发送给 AI 前的预处理：保证送入模型的文本与标记化前逐字节一致，不改变模型行为。
	 * @param {string} text 含 @name 标记的文本
	 * @returns {string} 还原后的文本
	 */
	function stripRefMarks(text) {
		if (!text) return text;
		return text.replace(/@([A-Za-z0-9_.\$]+)/g, '$1');
	}

	/** 收集当前有效全量数据（已激活取数据库缓存，否则取出厂快照），用于引用索引构建 */
	function collectAllData() {
		if (activated) {
			return {
				prompts: cache.prompts.map(row => ({
					name: row.name,
					description: row.description,
					messages: JSON.parse(row.messages || '[]')
				})),
				tools: cache.tools.map(row => ({ name: row.name, impl_code: row.impl_code, description: row.description }))
			};
		}
		const prompts = factoryDefaults.promptList.map(p => ({
			name: p.name, description: p.description, messages: p.messages || []
		}));
		const tools = [];
		// 注意：必须携带 description，否则 buildGraph 构造工具节点时 t.description 为 undefined，
		// 会导致图谱悬浮 tooltip 显示「（无描述）」而 eda-api.js / mcp/curated-tools/index.js / mcp/meta-tools.js 中明明有描述。
		for (const t of factoryDefaults.edaApi) tools.push({ name: t.name, impl_code: null, description: t.description });
		for (const t of factoryDefaults.mcpToolDescriptions) {
			tools.push({ name: t.name, impl_code: factoryDefaults.mcpFunctions[t.name] ? factoryDefaults.mcpFunctions[t.name].toString() : null, description: t.description });
		}
		for (const t of factoryDefaults.customToolDescriptions) {
			tools.push({ name: t.name, impl_code: factoryDefaults.customFunctions[t.name] ? factoryDefaults.customFunctions[t.name].toString() : null, description: t.description });
		}
		return { prompts, tools };
	}

	/** 构建全量引用索引（工具互调 + 提示词引用） */
	function buildRefIndex(prompts, tools) {
		const index = {};
		const ensure = (n) => (index[n] || (index[n] = { calls: [], calledBy: [], referencedByPrompts: [] }));
		for (const t of tools) {
			// 实现代码中的 @name 显式引用与全局调用 → tool 调用关系(tool_call)
			const names = extractNames(SANITIZE_FN(t.impl_code || ''));
			for (const n of names) {
				if (n === t.name) continue; // 跳过自引用
				ensure(t.name).calls.push({ source: t.name, target: n, kind: 'tool' }); // t 调用 n
				ensure(n).calledBy.push({ source: n, target: t.name, kind: 'tool' }); // n 被 t 调用
			}
			// 描述文本中的 @name 标记(对标提示词侧标记化,使工具描述侧也能参与图谱引用)
			// 例如工具描述书写 @lib_Device$search 时,建立该工具对目标工具的引用关系
			const descNames = extractNames(t.description || '');
			for (const n of descNames) {
				if (n === t.name) continue; // 跳过自引用
				// 描述为弱引用(不触发调用,仅表达"推荐/关联"),与 impl_code 强调用区分
				ensure(t.name).calls.push({ source: t.name, target: n, kind: 'desc_ref' });
				ensure(n).calledBy.push({ source: n, target: t.name, kind: 'desc_ref' });
			}
		}
		for (const p of prompts) {
			const names = extractNames((p.description || '') + '\n' + JSON.stringify(p.messages || []));
			for (const n of names) {
				ensure(n).referencedByPrompts.push(p.name); // 提示词 p 引用 n
			}
		}
		return index;
	}

	/**
	 * 引用检测：返回 name 的活跃引用关系（供删除保护与引用图谱使用）
	 * 数据来源：已激活取数据库，否则取出厂快照（由 collectAllData 统一）
	 * @returns {{calls: Array, calledBy: Array, referencedByPrompts: Array}}
	 */
	function findReferences(name) {
		const all = collectAllData();
		const index = buildRefIndex(all.prompts, all.tools);
		return index[name] || { calls: [], calledBy: [], referencedByPrompts: [] };
	}

	/**
	 * 从主表实时派生关系图谱数据（nodes / links）
	 *
	 * 引用关系是内容的派生物，不额外落库，避免冗余存储导致的不一致；
	 * 图谱、删除保护、引用图谱三者共用 extractNames / buildRefIndex 同一套解析器，判定口径完全一致。
	 *
	 * 节点类型（type）：prompt（提示词）/ custom（精选工具）/ mcp（元工具）/ jdb（EDA 原生 API）
	 * 连线类型（refType）与强弱（strength）：
	 *   - prompt_ref      提示词引用提示词（messages 中 @name 显式引用）       强
	 *   - prompt_tool     提示词引用函数（正文 @工具名，含「推荐工具」清单）    强
	 *   - tool_call       函数调用函数（impl_code 中 window.curatedTools/mcpProtocol 调用） 强
	 *   - describes       描述-实现配对（同 name 的 description/inputSchema 与 impl_code 绑定） 强
	 *   - native_fallback 自定义工具降级调用原生 API（impl_code 中 eda.* 调用）  弱
	 *   - example_call    提示词内 getPrompt({name:'x'}) 调用范例（保留原样不标记部分） 弱
	 *
	 * @returns {{nodes: Array, links: Array}}
	 */
	function buildGraph() {
		const all = collectAllData();
		const nodes = [];
		const links = [];
		const nodeSet = new Set();

		const addNode = (id, type, category, label, desc) => {
			if (nodeSet.has(id)) return;
			nodeSet.add(id);
			nodes.push({ id, type, category: category || null, label: label || id, description: desc || '' });
		};

		// 1. 提示词节点 + 提示词侧引用（prompt_ref / prompt_tool / example_call）
		for (const p of all.prompts) {
			addNode(p.name, 'prompt', categorizeByName(p.name), p.name, p.description);
			const body = (p.description || '') + '\n' + JSON.stringify(p.messages || []);
			// 显式 @name 引用 → prompt_ref 或 prompt_tool
			for (const n of extractNames(body)) {
				if (n === p.name) continue;
				const isPrompt = all.prompts.some(x => x.name === n);
				links.push({
					source: p.name,
					target: n,
					refType: isPrompt ? 'prompt_ref' : 'prompt_tool',
					strength: 'strong'
				});
			}
			// getPrompt({name:'x'}) 字面量范例 → example_call（弱）
			for (const m of (body.match(/getPrompt\(\{\s*name\s*:\s*['"]([A-Za-z0-9_.\$]+)['"]\s*\}\)/g) || [])) {
				const name = m.match(/name\s*:\s*['"]([A-Za-z0-9_.\$]+)['"]/)[1];
				if (name === p.name) continue;
				links.push({ source: p.name, target: name, refType: 'example_call', strength: 'weak' });
			}
		}

		// 2. 工具节点 + 函数侧引用（tool_call / native_fallback / describes）
		const customNames = new Set((window.curatedTools.curatedToolSchemas || []).map(t => t.name));
		const mcpNames = new Set((window.mcpProtocol.metaToolSchemas || []).map(t => t.name));
		const jdbNames = new Set((window.edaApi || []).map(t => t.name));
		for (const t of all.tools) {
			let type = 'custom';
			if (jdbNames.has(t.name)) type = 'jdb';
			else if (mcpNames.has(t.name)) type = 'mcp';
			else if (customNames.has(t.name)) type = 'custom';
			addNode(t.name, type, null, t.name, t.description);
		// describes：同 name 的实现与描述配对（强）。
		// 注意：自环边 source===target 无任何信息增量，且 D3 渲染会在节点旁画出带箭头的弧线（视觉上的「三角」），
		// 故此处不再生成自环边；实现/描述配对关系由节点自身半径与 tooltip 入/出度表达，无需自环边。
		// （graph-view.js 的 draw() 也已对 source===target 做双保险过滤）
			const code = SANITIZE_FN(t.impl_code || '');
			// 显式 @name 引用（若实现内书写 @name）→ tool_call
			for (const n of extractNames(code)) {
				if (n === t.name) continue;
				links.push({ source: t.name, target: n, refType: 'tool_call', strength: 'strong' });
			}
		// window.curatedTools.x() / window.mcpProtocol.x() 全局路径调用 → tool_call（强）
		// 该识别逻辑与编辑器 extractVisibleRefs 对真实调用的高亮同源,保证图谱边与代码高亮一致
		// 仅取「第一级方法名」(字符集不含 '.'),切断链式调用后缀(.find 等),避免把 toolDescriptions.find 误判为被调用工具
		for (const m of (code.match(/window\.(?:curatedTools|mcpProtocol)\.([A-Za-z0-9_$]+)\s*\(/g) || [])) {
			const callee = m.match(/window\.(?:curatedTools|mcpProtocol)\.([A-Za-z0-9_$]+)/)[1];
			if (callee === t.name) continue;
			links.push({ source: t.name, target: callee, refType: 'tool_call', strength: 'strong' });
		}
		// eda.* 原生 API 调用 → native_fallback（弱，降级路径）
		// 同上,与编辑器 extractVisibleRefs 对 eda.* 的高亮同源
		for (const m of (code.match(/\beda\.[A-Za-z0-9_.\$]+/g) || [])) {
			const api = m.slice(4);
			if (api === t.name) continue;
			links.push({ source: t.name, target: api, refType: 'native_fallback', strength: 'weak' });
		}
		}

		// 3. 资源节点：由 window.resourceList 提供（出厂默认集在 mcp/resources.js 定义，
		//    激活后来自 cache.resources）。提示词以 @uri 引用资源时，此处补全节点使 prompt_tool 连线落地。
		for (const r of (window.resourceList || [])) {
			addNode(r.uri, 'resource', null, r.name || r.uri, r.description || '');
		}

		return { nodes, links };
	}

	/** 新增自定义提示词（仅数据库已激活时可用） */
	async function addPrompt(name, description, messages) {
		this.assertActivated();
		if (!name) throw new Error('提示词 name 不能为空');
		const time = nowISO();
		const row = {
			name,
			description: description || '',
			messages: JSON.stringify(messages || []),
			category: categorizeByName(name),
			is_modified: true,
			updated_at: time
		};
		const existing = cache.prompts.find(item => item.name === name);
		if (existing) Object.assign(existing, row);
		else cache.prompts.push(row);
		await persistTable('prompts');
		refreshRuntimeCache();
	}

	/** 删除提示词（仅数据库已激活时可用；删除前调用方应先做引用保护检查） */
	async function deletePrompt(name) {
		this.assertActivated();
		const index = cache.prompts.findIndex(item => item.name === name);
		if (index < 0) throw new Error(`提示词不存在: ${name}`);
		cache.prompts.splice(index, 1);
		await persistTable('prompts');
		refreshRuntimeCache();
	}

	// ==================== 日志存储 API（写日志职责在 ai-chat.js，本模块仅提供存储） ====================

	/** 会话写入（fire-and-forget，失败不影响主流程） */
	function persistSessions() {
		ensureAttached()
			.then(() => overwriteTable('chat_sessions', sessionCache))
			.catch(error => console.error('[data-store] 会话持久化失败:', error));
	}

	/** 调用日志写入（fire-and-forget，失败不影响主流程） */
	function persistLogs() {
		ensureAttached()
			.then(() => overwriteTable('chat_logs', logCache))
			.catch(error => console.error('[data-store] 日志持久化失败:', error));
	}

	/**
	 * 创建会话（同步返回 sessionId，写入异步执行）
	 * @param {string} title - 会话标题（取用户首句前 20 字）
	 * @returns {string|null}
	 */
	function createSession(title) {
		if (!activated) return null;
		const sessionId = 's_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
		const now = nowISO();
		sessionCache.unshift({ session_id: sessionId, title: title || '未命名会话', created_at: now, updated_at: now });
		persistSessions();
		return sessionId;
	}

	/**
	 * 追加一条调用日志（同步返回 logId，写入异步）
	 * @returns {string|null}
	 */
	function appendLog({ sessionId, turn, requestPayload, promptSnapshot, toolSnapshot }) {
		if (!activated || !sessionId) return null;
		const logId = 'l_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
		const now = nowISO();
		logCache.push({
			log_id: logId,
			session_id: sessionId,
			turn: turn || 0,
			request_payload: requestPayload ?? null,
			response_payload: null,
			prompt_snapshot: promptSnapshot ?? '',
			tool_snapshot: toolSnapshot ?? null,
			created_at: now
		});
		// 刷新会话时间并落库
		const s = sessionCache.find(x => x.session_id === sessionId);
		if (s) s.updated_at = now;
		persistLogs();
		return logId;
	}

	/** 回填日志响应（收到 AI 响应后调用） */
	function updateLogResponse(logId, responsePayload) {
		if (!logId) return;
		const r = logCache.find(x => x.log_id === logId);
		if (r) r.response_payload = responsePayload ?? null;
		persistLogs();
	}

	/** 获取全部会话（按创建时间倒序） */
	function getSessions() {
		return [...sessionCache].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''));
	}

	/** 获取指定会话的调用日志（按轮次正序） */
	function getSessionLogs(sessionId) {
		// 按 log_id 去重:写入侧因并发 persistLogs / 会话重载可能产生重复条目,
		// 在读取出口去重可保证导出(复制全部)内容单份,且不动写入逻辑避免数据丢失风险。
		const seen = new Set();
		return logCache
			.filter(x => x.session_id === sessionId && !seen.has(x.log_id) && seen.add(x.log_id))
			.sort((a, b) => (a.turn || 0) - (b.turn || 0));
	}

	// ==================== 对外 API ====================

	window.dataStore = {
		/** 常量导出(供抽屉界面展示) */
		DB_NAME,
		FACTORY_VERSION,

		/** 数据库是否已激活 */
		isActivated() {
			return activated;
		},

		/** 当前数据种子版本 */
		getSeedVersion() {
			return seedVersion;
		},

		/**
		 * 启动初始化(由 ai-chat.js 的 init() 调用):
		 * 轻量检测数据库是否存在 → 不存在则保持原始 JS 数据不动;
		 * 存在则附加数据库、加载全表并刷新运行时缓存。
		 */
		async init() {
			if (!window.alasql) {
				console.warn('[data-store] AlaSQL 未加载,本地数据化功能不可用');
				return;
			}
			const exists = await detectDatabaseExists();
			if (!exists) {
				activated = false;
				localStorage.removeItem(LS_ACTIVATED_KEY);
				return;
			}
			try {
				await loadAllTables();
				// 数据库存在但内容为空(异常残留)视为未激活
				if (cache.prompts.length === 0 && cache.tools.length === 0) {
					activated = false;
					return;
				}
				activated = true;
				localStorage.setItem(LS_ACTIVATED_KEY, '1');
				refreshRuntimeCache();
			} catch (error) {
				console.error('[data-store] 数据库加载失败,保持原始 JS 数据运行:', error);
				activated = false;
			}
		},

		/** 导入出厂默认 1.0(从出厂快照构建数据;已激活时与用户修改合并) */
		async importFactoryDefaults() {
			await applyImport({
				prompts: buildFactoryPromptRows(),
				tools: buildFactoryToolRows(),
				resources: buildFactoryResourceRows()
			}, FACTORY_VERSION);
		},

		/**
		 * 从源码导入(真正的激活起点,无需任何文件选择)。
		 * 源码文件(mcp/prompts.js / eda-api.js / mcp/curated-tools/index.js / mcp/meta-tools.js / mcp/resources.js)在页面加载时已由宿主执行,
		 * 其数据已存在于运行时内存的 window.promptList / window.edaApi /
		 * window.mcpProtocol / window.curatedTools / window.resourceList 全局对象中。
		 * 本方法直接读取这些内存中的源码常量(即 factoryDefaults 快照)构建业务行并写入库激活,
		 * 不弹任何文件选择框。
		 */
		async importFromMemory() {
			const rows = buildRowsFromSource(
				factoryDefaults.promptList,
				factoryDefaults.edaApi,
				factoryDefaults.mcpToolDescriptions,
				factoryDefaults.customToolDescriptions,
				factoryDefaults.mcpFunctions,
				factoryDefaults.customFunctions
			);
			await applyImport(rows, FACTORY_VERSION);
		},

		/**
		 * 解析本地源码/重建版 JS 文件(供"从本地文件导入"复用)。
		 * 仅当用户选择了 *.export.v*.js 这类文件时才需要执行源码文本解析:
		 * 通过沙箱执行提取 window.promptList / window.mcpProtocol / window.curatedTools 等赋值,
		 * 未提供的部分回退出厂快照,构建业务行后合并写入并激活。
		 * 注意:此方法与 importFromMemory 的区别在于——它解析"用户选中的文件",而非内存常量。
		 */
		async parseSourceFiles(files) {
			let prompts = null;
			let jdb = null;
			let mcpDesc = null;
			let customDesc = null;
			let resourceList = null;
			const mcpFns = {};
			const customFns = {};
			for (const file of files) {
				const code = await file.text();
				const extracted = extractSourceAssignments(code);
				if (extracted.promptList) prompts = extracted.promptList;
				if (extracted.edaApi) jdb = extracted.edaApi;
				if (extracted.mcpToolDescriptions) mcpDesc = extracted.mcpToolDescriptions;
				if (extracted.customToolDescriptions) customDesc = extracted.customToolDescriptions;
				if (extracted.resourceList) resourceList = extracted.resourceList;
				Object.assign(mcpFns, extracted.mcpFunctions || {});
				Object.assign(customFns, extracted.customFunctions || {});
			}
			if (!prompts) prompts = factoryDefaults.promptList;
			if (!jdb) jdb = factoryDefaults.edaApi;
			if (!mcpDesc) mcpDesc = factoryDefaults.mcpToolDescriptions;
			if (!customDesc) customDesc = factoryDefaults.customToolDescriptions;
			if (!resourceList) resourceList = factoryDefaults.resourceList;
			const rows = buildRowsFromSource(prompts, jdb, mcpDesc, customDesc, mcpFns, customFns, resourceList);
			await applyImport(rows, FACTORY_VERSION);
		},

		/**
		 * 从本地 JSON 文件导入(psa-export.v{version}.json 格式)。
		 * 仅支持 .json 文件,每次选取第一个 JSON 文件进行导入。
		 */
		async importLocalFiles(files) {
			const jsonFiles = [];
			for (const file of files) {
				const name = (file.name || '').toLowerCase();
				if (name.endsWith('.json')) jsonFiles.push(file);
				else throw new Error(`不支持的文件类型: ${file.name},仅支持 .json 格式`);
			}
			if (jsonFiles.length === 0) {
				throw new Error('请选择一个 .json 文件');
			}
			// 取第一个 JSON 文件导入,其版本号作为当前版本
			const firstFile = jsonFiles[0];
			const text = await firstFile.text();
			let seedVer = null;
			try {
				const data = JSON.parse(text);
				if (typeof data.version === 'string') seedVer = data.version;
			} catch (_) { /* JSON 解析失败交由 importFromFile 统一报错 */ }
			await this.importFromFile(firstFile);
			if (seedVer) seedVersion = seedVer;
		},

		/**
		 * 从 JSON 文件导入(psa-export.v{version}.json 格式)。
		 * 文件结构:{ version, exportedAt, prompts:[], tools:[], resources:[] }
		 */
		async importFromFile(file) {
			const text = await file.text();
			let data;
			try {
				data = JSON.parse(text);
			} catch (error) {
				throw new Error('文件不是合法的 JSON: ' + error.message);
			}
			if (!data || typeof data.version !== 'string' || !Array.isArray(data.prompts) || !Array.isArray(data.resources)) {
				throw new Error('文件格式不符合 psa-export 规范(缺少 version/prompts/resources 字段)');
			}
			// 兼容两种 tools 格式:旧版扁平数组 vs 新版按 source 分组的对象
			let tools = [];
			if (Array.isArray(data.tools)) {
				// 旧版格式:tools 为扁平数组,source 字段在每行内部
				tools = data.tools;
			} else if (data.tools && typeof data.tools === 'object') {
				// 新版格式:tools 为 { jdb: [...], mcp: [...], custom: [...] }
				for (const source of ['jdb', 'mcp', 'custom']) {
					if (Array.isArray(data.tools[source])) {
						// 确保每行 source 字段正确标记
						for (const row of data.tools[source]) {
							row.source = source;
							tools.push(row);
						}
					}
				}
			} else {
				throw new Error('文件格式不符合 psa-export 规范(缺少 tools 字段)');
			}
			await applyImport({
				prompts: data.prompts,
				tools,
				resources: data.resources
			}, data.version);
		},

		/** 导出当前数据库数据为 JSON 文件(按 source 分组工具,可另存为新版本号) */
		exportData(version) {
			if (!activated) throw new Error('数据库未激活,无数据可导出');
			const exportVersion = (version || seedVersion).trim();
			// 按 source 字段将工具分类为三组,方便导入后还原分类
			const toolsBySource = { jdb: [], mcp: [], custom: [] };
			for (const row of cache.tools) {
				const src = row.source || 'custom';
				if (toolsBySource[src]) {
					toolsBySource[src].push(row);
				} else {
					toolsBySource.custom.push(row);
				}
			}
			const payload = {
				version: exportVersion,
				exportedAt: nowISO(),
				prompts: cache.prompts,
				tools: toolsBySource,
				resources: cache.resources
			};
			downloadTextFile(
				`${EXPORT_FILE_PREFIX}${exportVersion}.json`,
				JSON.stringify(payload, null, 2),
				'application/json'
			);
		},

		/**
		 * 导出「出厂默认 1.0」的数据重建版 JS 文件(共 4 个):
		 * 用于离线备份或替换源文件时的数据重建,内容仅为 window.* 重新赋值。
		 */
		exportFactoryJs() {
			// 提示词重建版
			downloadTextFile(
				`mcp-prompt.export.v${FACTORY_VERSION}.js`,
				`// 出厂默认 ${FACTORY_VERSION} 提示词数据重建版(由 data-store 导出)\n`
				+ `window.promptList = ${JSON.stringify(factoryDefaults.promptList, null, '\t')};\n`,
				'text/javascript'
			);
		// 原生API描述重建版
		downloadTextFile(
			`eda-api.export.v${FACTORY_VERSION}.js`,
			`// 出厂默认 ${FACTORY_VERSION} 原生API描述数据重建版(由 data-store 导出)\n`
			+ `window.edaApi = ${JSON.stringify(factoryDefaults.edaApi, null, '\t')};\n`,
			'text/javascript'
		);
		// 资源重建版(与 window.resourceList 挂载区默认集一致)
		downloadTextFile(
			`resource-list.export.v${FACTORY_VERSION}.js`,
			`// 出厂默认 ${FACTORY_VERSION} 资源列表数据重建版(由 data-store 导出)\n`
			+ `window.resourceList = ${JSON.stringify(factoryDefaults.resourceList, null, '\t')};\n`,
			'text/javascript'
		);
			// 元工具/精选工具重建版(描述 + 函数源码)
			const functionLines = [];
			for (const [name, fn] of Object.entries(factoryDefaults.mcpFunctions)) {
				functionLines.push(`window.mcpProtocol[${JSON.stringify(name)}] = (${fn.toString()});`);
			}
			for (const [name, fn] of Object.entries(factoryDefaults.customFunctions)) {
				functionLines.push(`window.curatedTools[${JSON.stringify(name)}] = (${fn.toString()});`);
			}
			downloadTextFile(
				`mcp-tools.export.v${FACTORY_VERSION}.js`,
				`// 出厂默认 ${FACTORY_VERSION} 元工具/精选工具数据重建版(由 data-store 导出)\n`
				+ `window.mcpProtocol.metaToolSchemas = ${JSON.stringify(factoryDefaults.mcpToolDescriptions, null, '\t')};\n`
				+ `window.curatedTools.curatedToolSchemas = ${JSON.stringify(factoryDefaults.customToolDescriptions, null, '\t')};\n`
				+ functionLines.join('\n') + '\n',
				'text/javascript'
			);
		},

		/**
		 * 一键导出:仅产出一个 JSON 文件(psa-export.v{版本}.json),
		 * 包含提示词/业务数据/函数实现源码(impl_code 字段内嵌),
		 * 单文件即可完成完整导入与还原。
		 */
		exportAll(version) {
			if (!activated) throw new Error('数据库未激活,无数据可导出');
			const exportVersion = (version || seedVersion).trim();
			this.exportData(exportVersion);
		},

		/**
		 * 导出当前数据库的函数实现源码为 JS 重建版(供「从本地导入」回灌)。
		 * 与 exportFactoryJs 的区别:数据源为当前库缓存,而非出厂快照。
		 */
		exportFunctionJs(exportVersion) {
			const ver = (exportVersion || FACTORY_VERSION).trim();
			const mcpDesc = [];
			const customDesc = [];
			const mcpFns = [];
			const customFns = [];
			for (const row of cache.tools) {
				if (row.source === 'meta') {					mcpDesc.push({ name: row.name, description: row.description, inputSchema: safeParse(row.input_schema) });
					if (row.impl_code) mcpFns.push(`window.mcpProtocol[${JSON.stringify(row.name)}] = (${row.impl_code});`);
				} else if (row.source === 'curated') {
					customDesc.push({ name: row.name, description: row.description, inputSchema: safeParse(row.input_schema) });
					if (row.impl_code) customFns.push(`window.curatedTools[${JSON.stringify(row.name)}] = (${row.impl_code});`);
				}
			}
			downloadTextFile(
				`mcp-tools.export.v${ver}.js`,
				'// 数据库 v' + ver + ' 元工具/精选工具数据重建版(由 data-store 导出)\n'
				+ 'window.mcpProtocol.metaToolSchemas = ' + JSON.stringify(mcpDesc, null, '\t') + ';\n'
				+ 'window.curatedTools.curatedToolSchemas = ' + JSON.stringify(customDesc, null, '\t') + ';\n'
				+ mcpFns.concat(customFns).join('\n') + '\n',
				'text/javascript'
			);
		},

		/** 删除本地数据库并回退到出厂默认(原始 JS 常量) */
		async deleteDatabase() {
			// 先与 AlaSQL 解除附加,再物理删除 IndexedDB 数据库
			try {
				await sql('USE alasql');
				await sql(`DETACH DATABASE ${DB_NAME}`);
			} catch (error) {
				// 未附加时忽略
			}
			attached = false;
			await new Promise((resolve, reject) => {
				const request = indexedDB.deleteDatabase(DB_NAME);
				request.onsuccess = () => resolve();
				request.onblocked = () => resolve();
				request.onerror = () => reject(request.error);
			});
		localStorage.removeItem(LS_ACTIVATED_KEY);
		activated = false;
		seedVersion = FACTORY_VERSION;
		cache.prompts = [];
		cache.tools = [];
		cache.resources = [];
		sessionCache = []; // 清空日志缓存
		logCache = []; // 清空日志缓存
		restoreFactoryRuntime();
		},

		// ---------- 查询(抽屉界面数据源;未激活时返回出厂只读数据) ----------

		/** 获取提示词行列表(统一行结构;未激活时由出厂快照即时构建) */
		listPromptRows() {
			return activated ? cache.prompts.slice() : buildFactoryPromptRows();
		},

		/** 获取工具行列表(可按来源过滤:'jdb' | 'mcp' | 'custom';未激活时由出厂快照即时构建) */
		listToolRows(source) {
			const rows = activated ? cache.tools.slice() : buildFactoryToolRows();
			return source ? rows.filter(row => row.source === source) : rows;
		},

		/** 获取资源行列表(统一行结构;未激活时由出厂快照即时构建) */
		listResourceRows() {
			return activated ? cache.resources.slice() : buildFactoryResourceRows();
		},

		// ---------- 修改(仅数据库激活后可用) ----------

		/** 断言数据库已激活(所有写操作的前置校验) */
		assertActivated() {
			if (!activated) throw new Error('数据库未激活,请先「导入 → 从源码导入」或导入本地数据文件');
		},

		/** 更新提示词(patch: {description?, messages?(JSON字符串)}) */
		async updatePrompt(name, patch) {
			this.assertActivated();
			const row = cache.prompts.find(item => item.name === name);
			if (!row) throw new Error(`提示词不存在: ${name}`);
			if (patch.messages !== undefined) {
				JSON.parse(patch.messages); // 保存前强校验 JSON
				row.messages = patch.messages;
			}
			if (patch.description !== undefined) row.description = patch.description;
			row.is_modified = true;
			row.updated_at = nowISO();
		await persistTable('prompts');
		refreshRuntimeCache();
	},

	/** 更新资源(patch: {description?, content?}) */
	async updateResource(uri, patch) {
		this.assertActivated();
		const row = cache.resources.find(item => item.uri === uri);
		if (!row) throw new Error(`资源不存在: ${uri}`);
		if (patch.description !== undefined) row.description = patch.description;
		if (patch.content !== undefined) row.content = patch.content;
		row.is_modified = true;
		row.updated_at = nowISO();
		await persistTable('resources');
		refreshRuntimeCache();
	},

	/** 更新工具(patch: {description?, inputSchema?(JSON字符串), implCode?, enabled?}) */
		async updateTool(name, patch) {
			this.assertActivated();
			const row = cache.tools.find(item => item.name === name);
			if (!row) throw new Error(`工具不存在: ${name}`);
			if (patch.inputSchema !== undefined) {
				JSON.parse(patch.inputSchema); // 保存前强校验 JSON
				row.input_schema = patch.inputSchema;
			}
			if (patch.implCode !== undefined) {
				if (patch.implCode) {
					// 保存前强校验函数语法(可解析且求值为函数)
					const fn = new Function(`return (${patch.implCode})`)();
					if (typeof fn !== 'function') throw new Error('函数实现代码必须是一个函数表达式');
				}
				row.impl_code = patch.implCode || null;
			}
			if (patch.description !== undefined) row.description = patch.description;
			if (patch.enabled !== undefined) row.enabled = !!patch.enabled;
			row.is_modified = true;
			row.updated_at = nowISO();
			await persistTable('tools');
			refreshRuntimeCache();
		},

		/** 新增自定义精选工具(name 需唯一;初始为模板实现,is_modified=true) */
		async addCustomTool(name) {
			this.assertActivated();
			if (!name || !/^[A-Za-z_][\w$]*$/.test(name)) {
				throw new Error('工具名称不合法(需以字母/下划线开头,可含字母数字下划线和$)');
			}
			if (cache.tools.some(item => item.name === name)) {
				throw new Error(`工具已存在: ${name}`);
			}
			cache.tools.push({
				name,
				description: '新增自定义工具(请完善描述)',
				input_schema: JSON.stringify({ type: 'object', properties: {}, required: [] }),
				impl_code: `async function ${name}(args) {\n\t// TODO: 实现工具逻辑,args 为参数对象\n\treturn 'ok';\n}`,
				source: 'curated',
				enabled: true,
				is_modified: true,
				updated_at: nowISO()
			});
			await persistTable('tools');
			refreshRuntimeCache();
		},

		/** 删除工具(仅允许删除无出厂对应的用户新增工具;出厂工具请用「禁用」) */
		async deleteTool(name) {
			this.assertActivated();
			if (buildFactoryToolRow(name)) {
				throw new Error('出厂工具不允许删除,请使用「禁用」');
			}
			const index = cache.tools.findIndex(item => item.name === name);
			if (index < 0) throw new Error(`工具不存在: ${name}`);
			cache.tools.splice(index, 1);
			await persistTable('tools');
			refreshRuntimeCache();
		},

		/** 单条提示词恢复出厂默认 */
		async resetPrompt(name) {
			this.assertActivated();
			const factoryRow = buildFactoryPromptRow(name);
			if (!factoryRow) throw new Error(`该提示词无出厂默认版本: ${name}`);
			const index = cache.prompts.findIndex(item => item.name === name);
			if (index < 0) cache.prompts.push(factoryRow);
			else cache.prompts[index] = factoryRow;
			await persistTable('prompts');
			refreshRuntimeCache();
		},

		/** 单条工具恢复出厂默认 */
		async resetTool(name) {
			this.assertActivated();
			const factoryRow = buildFactoryToolRow(name);
			if (!factoryRow) throw new Error(`该工具无出厂默认版本: ${name}`);
			const index = cache.tools.findIndex(item => item.name === name);
			if (index < 0) cache.tools.push(factoryRow);
			else cache.tools[index] = factoryRow;
			await persistTable('tools');
			refreshRuntimeCache();
		},

		/** 单条资源恢复出厂默认 */
		async resetResource(uri) {
			this.assertActivated();
			const factoryRow = buildFactoryResourceRow(uri);
			if (!factoryRow) throw new Error(`该资源无出厂默认版本: ${uri}`);
			const index = cache.resources.findIndex(item => item.uri === uri);
			if (index < 0) cache.resources.push(factoryRow);
			else cache.resources[index] = factoryRow;
			await persistTable('resources');
			refreshRuntimeCache();
		},

		/** 全部恢复出厂默认(整库重建为出厂数据,用户修改全部丢弃) */
		async resetAllDefaults() {
			this.assertActivated();
			cache.prompts = buildFactoryPromptRows();
			cache.tools = buildFactoryToolRows();
			cache.resources = buildFactoryResourceRows();
			await persistTable('prompts');
			await persistTable('tools');
			await persistTable('resources');
			await persistMeta(FACTORY_VERSION);
			refreshRuntimeCache();
		},

		// ---------- 提示词新增 / 删除 ----------
		addPrompt,
		deletePrompt,

		// ---------- 引用检测 ----------
		findReferences,
		/** 发送前还原 @name → 裸 name，保证送入模型的文本与标记化前一致 */
		stripRefMarks,
		/** 从主表实时派生关系图谱数据（nodes/links），供 graph-view.js 渲染 */
		buildGraph,

		// ---------- 日志存储 API ----------
		createSession,
		appendLog,
		updateLogResponse,
		getSessions,
		getSessionLogs,

		/** 清空全部会话与调用日志（仅删日志两表，不影响业务数据） */
		async clearLogs() {
			if (!activated) return;
			await ensureAttached();
			await overwriteTable('chat_sessions', []);
			await overwriteTable('chat_logs', []);
			sessionCache = [];
			logCache = [];
		}
	};
})();
