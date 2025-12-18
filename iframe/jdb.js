// jdb.js:缓存数据库

// 资源列表(数据、信息、内容)
window.jdbResourceList = [
	{
		uri: 'standardCode1',
		name: '规范源码1',
		description: '规范源码是原理图设计专家的示例代码,用于评估ai助手生成原理图的质量,比如一些导线的部署是否绕路,是否重叠,经典场景应该怎么布线等,注意:示例代码非常庞大,不应该频繁调用',
		mimeType: 'text/plain',
		content: window.standardCode1,
	},
	{
		uri: 'standardCode2',
		name: '规范源码2',
		description: '规范源码是原理图设计专家的示例代码,用于评估ai助手生成原理图的质量,比如一些导线的部署是否绕路,是否重叠,经典场景应该怎么布线等,注意:示例代码非常庞大,不应该频繁调用',
		mimeType: 'text/plain',
		content: window.standardCode2,
	},
	{
		uri: 'standardCode3',
		name: '规范源码3',
		description: '规范源码是原理图设计专家的示例代码,用于评估ai助手生成原理图的质量,比如一些导线的部署是否绕路,是否重叠,经典场景应该怎么布线等,注意:示例代码非常庞大,不应该频繁调用',
		mimeType: 'text/plain',
		content: window.standardCode3,
	},
];

// 提示列表(流程、步骤、规则)
window.jdbPromptList = [

	{
		name: 'guideline_spacing_standards_prompt',
		description: '原理图设计间距标准规范',
		messages: [
			{
				role: 'spacing_standards',
				description: '间距标准规范',
				content: {
					type: 'text',
					text: `
**原理图设计间距与线宽/过孔标准**:
- 导线线宽: 最小6mil,默认8-10mil；关键网(电源/地/时钟/高速)最小12mil,默认15-20mil
- 边界线线宽: 默认10mil,禁止低于8mil
- 过孔: 孔径最小8mil,默认12mil,过孔环宽>=6mil,过孔-导线/过孔-元件边界间距>=12mil
- 导线-导线间距: 最小6mil,默认8mil
- 导线-元件边界间距: 最小6mil,默认8mil
- 导线-引脚间距: 最小6mil,默认8-10mil
- 元件-元件边界间距>=80mil
- 元件-导线边界间距: 最小6mil,默认8mil

**适用范围**: 所有布局规划和布线操作必须同时满足间距、线宽与过孔标准
`
				}
			}
		]
	},
	{
		name: 'guideline_layout_planning_prompt',
		description: '前期布局规划与网络标签策略',
		messages: [
			{
				role: 'layout_planning',
				description: '前期布局规划与网络标签策略',
				content: {
					type: 'text',
					text: `
**前期布局规划**:
- 功能分组: 按电源/信号/控制/接口等模块集中摆放,减少跨模块长距离布线
- 元件间距: 计算引脚/封装边界,模块边界之间预留安全距离(参考 guideline_spacing_standards_prompt)
- 网络标签优先: 相同网络标签视为同一路径,优先用标签替代跨图直线,源头减少交叉
- 流向布局: 按输入→处理→输出的信号流向摆放,避免反向走线

**强制要求**:
- 在代码中必须计算元件间距,确保模块边界之间预留安全距离(参考 guideline_spacing_standards_prompt)
`
				}
			}
		]
	},
	{
		name: 'guideline_smart_routing_prompt',
		description: '智能布线绕行与推挤策略',
		messages: [
			{
				role: 'smart_routing',
				description: '智能布线策略',
				content: {
					type: 'text',
					text: `
**智能布线策略**:
- 模式: 新导线遇障碍优先绕行,不可绕行时尝试推挤,禁止直接穿过障碍物
- 间距要求: 遵循 guideline_spacing_standards_prompt 的间距标准,实时检测违规立即重算路径
- 角度策略: 优先45°走线,禁止锐角(<45°)；必要的90°拐点用两段45°替代
- 过孔策略: 关键网尽量少过孔,单根关键网过孔数建议<=2,且过孔规格满足 guideline_spacing_standards_prompt 的过孔标准
- 路径探测: 预检查候选路径与现有导线/元件的碰撞,选无碰撞且长度/拐点数最优方案
- 动态调整: 绘制过程中若检测到重叠/压盖,即时偏移或改道
`
				}
			}
		]
	},
	{
		name: 'guideline_routing_constraints_prompt',
		description: '信号流向与布线优先级规则',
		messages: [
			{
				role: 'routing_constraints',
				description: '布线约束规则',
				content: {
					type: 'text',
					text: `
**布线约束**:
- 信号流向: 按输入→处理→输出的顺序布线,减少回流与交叉
- 角度要求: 45°优先,减少不必要的折线段；分段时尽量共线(参考 guideline_smart_routing_prompt)
- 优先级: 关键信号(时钟/高速差分/敏感模拟)优先布,确保最短/最少拐点并留隔离区
- 边界规则: 禁止穿越元件包络,保持安全间距(参考 guideline_spacing_standards_prompt)
- 复用: 发现已有可用网络标签/导线路径时优先复用,避免重复新线

**强制要求**:
- 关键信号(电源、地线、时钟等)必须优先布线,确保最短路径和最少拐点
`
				}
			}
		]
	},
	{
		name: 'guideline_routing_algorithm_prompt',
		description: '全局布线算法优化策略',
		messages: [
			{
				role: 'routing_algorithm',
				description: '算法优化策略',
				content: {
					type: 'text',
					text: `
**算法优化**:
- 路径搜索: 可用 A* 评估(距离+拐点+碰撞罚分),生成候选路径集合
- 全局优化: 用遗传/模拟退火等全局搜索对多条导线同时优化,目标最小总长/拐点/违规
- 约束编码: 将间距标准(参考 guideline_spacing_standards_prompt)、45°偏好(参考 guideline_smart_routing_prompt)、障碍物、关键网优先级编码进代价函数
- 拓扑识别: 识别星型/总线/树型等拓扑,针对拓扑选择分支/汇聚策略
- 迭代校验: 每轮生成方案后即时碰撞检测；保留最优解并输出可执行的线段序列
`
				}
			}
		]
	},
	{
		name: 'guideline_drc_repair_prompt',
		description: 'DRC校验与违规修正流程',
		messages: [
			{
				role: 'drc_check',
				description: 'DRC校验检查规则',
				content: {
					type: 'text',
					text: `
**DRC校验检查规则**:
- **强制要求**: 完成所有布线操作后,必须执行DRC校验代码块(read类型)
- **检查项目**:
  - 线宽: 禁止低于下限(参考 guideline_spacing_standards_prompt)
  - 间距: 线-线/线-引脚/线-元件边界(参考 guideline_spacing_standards_prompt)
  - 过孔: 关键网过孔数量与规格满足要求(参考 guideline_spacing_standards_prompt)
  - 拐角: 禁止锐角(<45°),优先45°；必要90°用两段45°替代 (参考 guideline_smart_routing_prompt)
  - 短路/未连: 检查意外短接与未连网络
  - 孤岛/残留: 清理孤立线段、悬空过孔/边界线(参考 guideline_spacing_standards_prompt)
- **检查方法**: 获取所有导线和元件状态,逐一计算间距、线宽、过孔、角度,记录所有违规项
- **输出格式**: 返回违规列表,包含违规类型、位置、当前值、标准值等信息；每次write后需复检
`
				}
			},
			{
				role: 'drc_repair',
				description: 'DRC违规修正流程',
				content: {
					type: 'text',
					text: `
**DRC违规修正流程**:
- **强制要求**: 若发现违规,必须立即生成write代码块修正违规线,不能仅报告违规而不修正
- **修正步骤**:
  - 先read获取最新导线和元件状态
  - 对每条违规线重算路径,确保符合:
    - 间距标准(参考 guideline_spacing_standards_prompt)
    - 45°角度要求(参考 guideline_smart_routing_prompt)
    - 推挤/绕行策略(参考 guideline_smart_routing_prompt)
  - 使用移动导线的API(sch_PrimitiveWire$modify)重新修正导线
  - 修正后必须再次执行DRC校验代码块,检查是否还有违规
  - 若仍有违规,继续修正,直到DRC校验通过(无违规)为止
- **优先级**: 先修关键网违规(电源、地线、时钟等),再修普通网；修完一条立即复检
- **禁止行为**: 禁止在发现违规后仅给出建议而不执行修正,必须实际生成修正代码块并执行
`
				}
			}
		]
	},
	{
		name: 'guideline_source_code_parse_prompt',
		description: '原理图源码规范解析标准流程',
		messages: [
			{
				role: 'sch_source_parse',
				description: '原理图源码规范解析标准流程',
				content: {
					type: 'text',
					text: `
**解析原理图源码字符串的规范流程**:
- 先界定目标字段:如 Width/Height/net/component 等,避免全文阅读
- 预检:用 includes/索引先判断目标字段是否存在；缺失则返回默认或提示
- 按行拆分:source.split('\\n') → 对每行再按 '|' 拆分 → 去空 → flatten
- 结构化:对拆分片段逐个 JSON.parse,异常立即捕获并跳过
- 筛选:仅处理 key 命中的对象（如 key === 'Width' / 'Height' / 目标字段）；对数值用 parseInt/parseFloat
- 兜底:未命中时使用安全默认值,并记录 warn；命中时输出解析结果
- 返回:仅返回需要的字段对象,避免回传整段大字符串
`
				}
			}
		]
	},
	{
		name: 'guideline_component_bounds_prompt',
		description: '元件边界计算与碰撞检测',
		messages: [
			{
				role: 'component_bounds',
				description: '元件边界与碰撞检测',
				content: {
					type: 'text',
					text: `
**元件边界计算与碰撞检测规则**:
- **重要流程**: 元件必须放置到原理图上才能获取元件坐标,因此流程为:先放置元件 → 获取元件信息 → 计算边界 → 绘制多边形 → 检查碰撞 → 如有问题则移动元件
- 放置元件: 使用放置元件的API将元件放置到原理图上
- 获取元件信息: 放置后使用获取所有元件的API获取元件列表,或通过返回的组件对象获取元件标识符
- 获取引脚坐标: 使用获取元件引脚坐标的API获取元件的所有引脚坐标
- 计算边界: 调用计算元件边界的API计算元件的矩形边界,建议使用 expandMil=20 作为默认膨胀距离
- 上面"放置元件""获取元件信息""获取引脚坐标""计算边界"四步可以在同一个代码块内一次性完成并返回,无需多代码块单独执行
- 边界格式: [x1,y1,x2,y2,x3,y3,x4,y4] (顺时针: 左下→右下→右上→左上)
- 绘制多边形: 使用绘制多边形的API绘制元件的边界多边形,必须是闭合的短划线DASHED多边形(ESCH_PrimitiveLineType.DASHED)
- 碰撞检测: 检查新放置的元件边界是否与已存在的元件边界/导线重叠或距离过近(具体标准参考 guideline_spacing_standards_prompt)
- 移动元件: 若检测到碰撞,必须重新计算元件位置并移动元件到合适位置
`
				}
			}
		]
	}
];


// mcp工具格式的原生API快速查询列表
window.jdbToolDescriptions = [
	{
		"name": "dmt_Board.copyBoard",
		"description": "复制板子",
		"inputSchema": {
			"type": "object",
			"properties": {
				"sourceBoardName": {
					"type": "string",
					"description": "源板子名称"
				}
			},
			"required": [
				"sourceBoardName"
			]
		}
	},
	{
		"name": "dmt_Board.createBoard",
		"description": "创建板子",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicUuid": {
					"type": "string",
					"description": "关联原理图 UUID"
				},
				"pcbUuid": {
					"type": "string",
					"description": "关联 PCB UUID"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_Board.deleteBoard",
		"description": "删除板子",
		"inputSchema": {
			"type": "object",
			"properties": {
				"boardName": {
					"type": "string",
					"description": "板子名称"
				}
			},
			"required": [
				"boardName"
			]
		}
	},
	{
		"name": "dmt_Board.getAllBoardsInfo",
		"description": "获取工程内所有板子的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Board.getBoardInfo",
		"description": "获取板子的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"boardName": {
					"type": "string",
					"description": "板子名称"
				}
			},
			"required": [
				"boardName"
			]
		}
	},
	{
		"name": "dmt_Board.getCurrentBoardInfo",
		"description": "获取当前板子的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Board.modifyBoardName",
		"description": "修改板子名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"originalBoardName": {
					"type": "string",
					"description": "原板子名称"
				},
				"boardName": {
					"type": "string",
					"description": "新板子名称"
				}
			},
			"required": [
				"originalBoardName",
				"boardName"
			]
		}
	},
	{
		"name": "dmt_EditorControl.activateDocument",
		"description": "激活文档",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tabId": {
					"type": "string",
					"description": "标签页 ID"
				}
			},
			"required": [
				"tabId"
			]
		}
	},
	{
		"name": "dmt_EditorControl.activateSplitScreen",
		"description": "激活分屏",
		"inputSchema": {
			"type": "object",
			"properties": {
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID"
				}
			},
			"required": [
				"splitScreenId"
			]
		}
	},
	{
		"name": "dmt_EditorControl.closeDocument",
		"description": "关闭文档",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tabId": {
					"type": "string",
					"description": "标签页 ID，此处支持 IDMT_SchematicPageItem.uuid、IDMT_PcbItem.uuid、IDMT_PanelItem.uuid 作为输入"
				}
			},
			"required": [
				"tabId"
			]
		}
	},
	{
		"name": "dmt_EditorControl.createSplitScreen",
		"description": "创建分屏",
		"inputSchema": {
			"type": "object",
			"properties": {
				"splitScreenType": {
					"type": "string",
					"description": "分屏类型，horizontal 水平、vertical 垂直"
				},
				"tabId": {
					"type": "string",
					"description": "标签页 ID，该标签页将会被移入新的分屏中"
				}
			},
			"required": [
				"splitScreenType",
				"tabId"
			]
		}
	},
	{
		"name": "dmt_EditorControl.generateIndicatorMarkers",
		"description": "生成指示标记",
		"inputSchema": {
			"type": "object",
			"properties": {
				"markers": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "指示标记外形对象数组"
				},
				"color": {
					"type": "number",
					"description": "指示标记颜色"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				},
				"zoom": {
					"type": "boolean",
					"description": "是否定位并缩放"
				},
				"tabId": {
					"type": "string",
					"description": "标签页 ID，如若未传入，则为最后输入焦点的画布"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_EditorControl.getCurrentRenderedAreaImage",
		"description": "获取画布渲染区域图像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tabId": {
					"type": "string",
					"description": "标签页 ID，如若未传入，则获取最后输入焦点的画布"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_EditorControl.getSplitScreenIdByTabId",
		"description": "使用标签页 ID 获取分屏 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tabId": {
					"type": "string",
					"description": "标签页 ID"
				}
			},
			"required": [
				"tabId"
			]
		}
	},
	{
		"name": "dmt_EditorControl.getSplitScreenTree",
		"description": "获取编辑器分屏属性树",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_EditorControl.getTabsBySplitScreenId",
		"description": "获取指定分屏 ID 下的所有标签页",
		"inputSchema": {
			"type": "object",
			"properties": {
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID"
				}
			},
			"required": [
				"splitScreenId"
			]
		}
	},
	{
		"name": "dmt_EditorControl.mergeAllDocumentFromSplitScreen",
		"description": "合并所有分屏",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_EditorControl.moveDocumentToSplitScreen",
		"description": "将文档移动到指定分屏",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tabId": {
					"type": "string",
					"description": "标签页 ID"
				},
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID"
				}
			},
			"required": [
				"tabId",
				"splitScreenId"
			]
		}
	},
	{
		"name": "dmt_EditorControl.openDocument",
		"description": "打开文档",
		"inputSchema": {
			"type": "object",
			"properties": {
				"documentUuid": {
					"type": "string",
					"description": "文档 UUID，此处支持 IDMT_SchematicItem.uuid、IDMT_SchematicPageItem.uuid、IDMT_PcbItem.uuid、IDMT_PanelItem.uuid 作为输入"
				},
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID，即 DMT_EditorControl.getSplitScreenTree() 方法获取到的 IDMT_EditorSplitScreenItem.id"
				}
			},
			"required": [
				"documentUuid"
			]
		}
	},
	{
		"name": "dmt_EditorControl.openLibraryDocument",
		"description": "打开库符号、封装文档",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"libraryType": {
					"type": "string",
					"description": "库类型，支持符号和封装"
				},
				"uuid": {
					"type": "string",
					"description": "符号、封装 UUID"
				},
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID，即 DMT_EditorControl.getSplitScreenTree() 方法获取到的 IDMT_EditorSplitScreenItem.id"
				}
			},
			"required": [
				"libraryUuid",
				"libraryType",
				"uuid"
			]
		}
	},
	{
		"name": "dmt_EditorControl.removeIndicatorMarkers",
		"description": "移除指示标记",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tabId": {
					"type": "string",
					"description": "标签页 ID，如若未传入，则为最后输入焦点的画布"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_EditorControl.tileAllDocumentToSplitScreen",
		"description": "平铺所有文档",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_EditorControl.zoomTo",
		"description": "缩放到坐标",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "中心坐标 X，如若不传入则不改变当前 X 坐标"
				},
				"y": {
					"type": "number",
					"description": "中心坐标 Y，如若不传入则不改变当前 Y 坐标"
				},
				"scaleRatio": {
					"type": "number",
					"description": "缩放比，如若不传入则不改变当前缩放比，单位跨度为 1/100，如若传入 200，则表示缩放比为 200%"
				},
				"tabId": {
					"type": "string",
					"description": "标签页 ID，如若未传入，则为最后输入焦点的画布"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_EditorControl.zoomToAllPrimitives",
		"description": "缩放到所有图元（适应全部）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tabId": {
					"type": "string",
					"description": "标签页 ID，如若未传入，则为最后输入焦点的画布"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_EditorControl.zoomToRegion",
		"description": "缩放到区域",
		"inputSchema": {
			"type": "object",
			"properties": {
				"left": {
					"type": "number",
					"description": "矩形框第一 X 坐标"
				},
				"right": {
					"type": "number",
					"description": "矩形框第二 X 坐标"
				},
				"top": {
					"type": "number",
					"description": "矩形框第一 Y 坐标"
				},
				"bottom": {
					"type": "number",
					"description": "矩形框第二 Y 坐标"
				},
				"tabId": {
					"type": "string",
					"description": "标签页 ID，如若未传入，则为最后输入焦点的画布"
				}
			},
			"required": [
				"left",
				"right",
				"top",
				"bottom"
			]
		}
	},
	{
		"name": "dmt_EditorControl.zoomToSelectedPrimitives",
		"description": "缩放到已选中图元（适应选中）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tabId": {
					"type": "string",
					"description": "标签页 ID，如若未传入，则为最后输入焦点的画布"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_Folder.createFolder",
		"description": "创建文件夹",
		"inputSchema": {
			"type": "object",
			"properties": {
				"folderName": {
					"type": "string",
					"description": "文件夹名称"
				},
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID"
				},
				"parentFolderUuid": {
					"type": "string",
					"description": "父文件夹 UUID，如若不指定，则为根文件夹"
				},
				"description": {
					"type": "string",
					"description": "文件夹描述"
				}
			},
			"required": [
				"folderName",
				"teamUuid"
			]
		}
	},
	{
		"name": "dmt_Folder.deleteFolder",
		"description": "删除文件夹",
		"inputSchema": {
			"type": "object",
			"properties": {
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID"
				},
				"folderUuid": {
					"type": "string",
					"description": "文件夹 UUID"
				}
			},
			"required": [
				"teamUuid",
				"folderUuid"
			]
		}
	},
	{
		"name": "dmt_Folder.getAllFoldersUuid",
		"description": "获取所有文件夹的 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID"
				}
			},
			"required": [
				"teamUuid"
			]
		}
	},
	{
		"name": "dmt_Folder.getFolderInfo",
		"description": "获取文件夹详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID"
				},
				"folderUuid": {
					"type": "string",
					"description": "文件夹 UUID"
				}
			},
			"required": [
				"teamUuid",
				"folderUuid"
			]
		}
	},
	{
		"name": "dmt_Folder.modifyFolderDescription",
		"description": "修改文件夹描述",
		"inputSchema": {
			"type": "object",
			"properties": {
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID"
				},
				"folderUuid": {
					"type": "string",
					"description": "文件夹 UUID"
				},
				"description": {
					"type": "string",
					"description": "文件夹描述，如若为 undefined 则清空工程现有描述"
				}
			},
			"required": [
				"teamUuid",
				"folderUuid"
			]
		}
	},
	{
		"name": "dmt_Folder.modifyFolderName",
		"description": "修改文件夹名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID"
				},
				"folderUuid": {
					"type": "string",
					"description": "文件夹 UUID"
				},
				"folderName": {
					"type": "string",
					"description": "文件夹名称"
				}
			},
			"required": [
				"teamUuid",
				"folderUuid",
				"folderName"
			]
		}
	},
	{
		"name": "dmt_Folder.moveFolderToFolder",
		"description": "移动文件夹",
		"inputSchema": {
			"type": "object",
			"properties": {
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID"
				},
				"folderUuid": {
					"type": "string",
					"description": "文件夹 UUID"
				},
				"parentFolderUuid": {
					"type": "string",
					"description": "父文件夹 UUID，如若不指定，则默认为根文件夹"
				}
			},
			"required": [
				"teamUuid",
				"folderUuid"
			]
		}
	},
	{
		"name": "dmt_Panel.copyPanel",
		"description": "复制面板",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelUuid": {
					"type": "string",
					"description": "源面板 UUID"
				}
			},
			"required": [
				"panelUuid"
			]
		}
	},
	{
		"name": "dmt_Panel.createPanel",
		"description": "创建面板",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Panel.deletePanel",
		"description": "删除面板",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelUuid": {
					"type": "string",
					"description": "面板 UUID"
				}
			},
			"required": [
				"panelUuid"
			]
		}
	},
	{
		"name": "dmt_Panel.getAllPanelsInfo",
		"description": "获取工程内所有面板的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Panel.getCurrentPanelInfo",
		"description": "获取当前面板的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Panel.getPanelInfo",
		"description": "获取面板的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelUuid": {
					"type": "string",
					"description": "面板 UUID"
				}
			},
			"required": [
				"panelUuid"
			]
		}
	},
	{
		"name": "dmt_Panel.modifyPanelName",
		"description": "修改面板名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelUuid": {
					"type": "string",
					"description": "面板 UUID"
				},
				"panelName": {
					"type": "string",
					"description": "面板名称"
				}
			},
			"required": [
				"panelUuid",
				"panelName"
			]
		}
	},
	{
		"name": "dmt_Pcb.copyPcb",
		"description": "复制 PCB",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pcbUuid": {
					"type": "string",
					"description": "源 PCB UUID"
				},
				"boardName": {
					"type": "string",
					"description": "新 PCB 所属板子名称，如若不指定则为游离 PCB"
				}
			},
			"required": [
				"pcbUuid"
			]
		}
	},
	{
		"name": "dmt_Pcb.createPcb",
		"description": "创建 PCB",
		"inputSchema": {
			"type": "object",
			"properties": {
				"boardName": {
					"type": "string",
					"description": "所属板子名称，如若不指定则为游离 PCB"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_Pcb.deletePcb",
		"description": "删除 PCB",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pcbUuid": {
					"type": "string",
					"description": "PCB UUID"
				}
			},
			"required": [
				"pcbUuid"
			]
		}
	},
	{
		"name": "dmt_Pcb.getAllPcbsInfo",
		"description": "获取工程内所有 PCB 的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Pcb.getCurrentPcbInfo",
		"description": "获取当前 PCB 的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Pcb.getPcbInfo",
		"description": "获取 PCB 的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pcbUuid": {
					"type": "string",
					"description": "PCB UUID"
				}
			},
			"required": [
				"pcbUuid"
			]
		}
	},
	{
		"name": "dmt_Pcb.modifyPcbName",
		"description": "修改 PCB 名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pcbUuid": {
					"type": "string",
					"description": "PCB UUID"
				},
				"pcbName": {
					"type": "string",
					"description": "PCB 名称"
				}
			},
			"required": [
				"pcbUuid",
				"pcbName"
			]
		}
	},
	{
		"name": "dmt_Project.createProject",
		"description": "创建工程",
		"inputSchema": {
			"type": "object",
			"properties": {
				"projectFriendlyName": {
					"type": "string",
					"description": "工程友好名称"
				},
				"projectName": {
					"type": "string",
					"description": "工程名称，不可重复，仅支持字母 a-zA-Z、数字 0-9、中划线 -，如若不指定，则根据工程友好名称自动生成"
				},
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID，如若不指定，则默认为个人；在不存在个人工程的环境下必须指定团队 UUID"
				},
				"folderUuid": {
					"type": "string",
					"description": "文件夹 UUID，如若不指定，则为根文件夹"
				},
				"description": {
					"type": "string",
					"description": "工程描述"
				},
				"collaborationMode": {
					"type": "string",
					"description": "工程协作模式，如若团队权限无需工程设置协作模式，则该参数将被忽略"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_Project.getAllProjectsUuid",
		"description": "获取所有工程的 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"teamUuid": {
					"type": "string",
					"description": "团队 UUID"
				},
				"folderUuid": {
					"type": "string",
					"description": "文件夹 UUID，如若不指定，则默认为团队的根文件夹"
				},
				"workspaceUuid": {
					"type": "string",
					"description": "工作区 UUID"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_Project.getCurrentProjectInfo",
		"description": "获取当前工程的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Project.getProjectInfo",
		"description": "获取工程属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"projectUuid": {
					"type": "string",
					"description": "工程 UUID"
				}
			},
			"required": [
				"projectUuid"
			]
		}
	},
	{
		"name": "dmt_Project.moveProjectToFolder",
		"description": "移动工程到文件夹",
		"inputSchema": {
			"type": "object",
			"properties": {
				"projectUuid": {
					"type": "string",
					"description": "工程 UUID"
				},
				"folderUuid": {
					"type": "string",
					"description": "文件夹 UUID，只能为当前工程所在团队或个人下的文件夹，如若为 undefined 则移动到当前团队的根文件夹"
				}
			},
			"required": [
				"projectUuid"
			]
		}
	},
	{
		"name": "dmt_Project.openProject",
		"description": "打开工程",
		"inputSchema": {
			"type": "object",
			"properties": {
				"projectUuid": {
					"type": "string",
					"description": "工程 UUID"
				}
			},
			"required": [
				"projectUuid"
			]
		}
	},
	{
		"name": "dmt_Schematic.copySchematic",
		"description": "复制原理图",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicUuid": {
					"type": "string",
					"description": "源原理图 UUID"
				},
				"boardName": {
					"type": "string",
					"description": "新原理图所属板子名称，如若不指定则为游离原理图"
				}
			},
			"required": [
				"schematicUuid"
			]
		}
	},
	{
		"name": "dmt_Schematic.copySchematicPage",
		"description": "复制原理图图页",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicPageUuid": {
					"type": "string",
					"description": "源原理图图页 UUID"
				},
				"schematicUuid": {
					"type": "string",
					"description": "目标原理图 UUID，如若不指定则为当前原理图"
				}
			},
			"required": [
				"schematicPageUuid"
			]
		}
	},
	{
		"name": "dmt_Schematic.createSchematic",
		"description": "创建原理图",
		"inputSchema": {
			"type": "object",
			"properties": {
				"boardName": {
					"type": "string",
					"description": "所属板子名称，如若不指定则为游离原理图"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_Schematic.createSchematicPage",
		"description": "创建原理图图页",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicUuid": {
					"type": "string",
					"description": "所属原理图 UUID"
				}
			},
			"required": [
				"schematicUuid"
			]
		}
	},
	{
		"name": "dmt_Schematic.deleteSchematic",
		"description": "删除原理图",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicUuid": {
					"type": "string",
					"description": "原理图 UUID"
				}
			},
			"required": [
				"schematicUuid"
			]
		}
	},
	{
		"name": "dmt_Schematic.deleteSchematicPage",
		"description": "删除原理图图页",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicPageUuid": {
					"type": "string",
					"description": "原理图图页 UUID"
				}
			},
			"required": [
				"schematicPageUuid"
			]
		}
	},
	{
		"name": "dmt_Schematic.getAllSchematicPagesInfo",
		"description": "获取工程内所有原理图图页的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Schematic.getAllSchematicsInfo",
		"description": "获取工程内所有原理图的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Schematic.getCurrentSchematicAllSchematicPagesInfo",
		"description": "获取当前原理图内所有原理图图页的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Schematic.getCurrentSchematicInfo",
		"description": "获取当前原理图的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Schematic.getCurrentSchematicPageInfo",
		"description": "获取当前原理图图页的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Schematic.getSchematicInfo",
		"description": "获取原理图的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicUuid": {
					"type": "string",
					"description": "原理图 UUID"
				}
			},
			"required": [
				"schematicUuid"
			]
		}
	},
	{
		"name": "dmt_Schematic.getSchematicPageInfo",
		"description": "获取原理图图页的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicPageUuid": {
					"type": "string",
					"description": "原理图图页 UUID"
				}
			},
			"required": [
				"schematicPageUuid"
			]
		}
	},
	{
		"name": "dmt_Schematic.modifySchematicName",
		"description": "修改原理图名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicUuid": {
					"type": "string",
					"description": "原理图 UUID"
				},
				"schematicName": {
					"type": "string",
					"description": "原理图名称"
				}
			},
			"required": [
				"schematicUuid",
				"schematicName"
			]
		}
	},
	{
		"name": "dmt_Schematic.modifySchematicPageName",
		"description": "修改原理图图页名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicPageUuid": {
					"type": "string",
					"description": "原理图图页 UUID"
				},
				"schematicPageName": {
					"type": "string",
					"description": "原理图图页名称"
				}
			},
			"required": [
				"schematicPageUuid",
				"schematicPageName"
			]
		}
	},
	{
		"name": "dmt_Schematic.modifySchematicPageTitleBlock",
		"description": "修改原理图图页明细表",
		"inputSchema": {
			"type": "object",
			"properties": {
				"showTitleBlock": {
					"type": "boolean",
					"description": "是否显示明细表，不定义将保持当前状态"
				},
				"titleBlockData": {
					"type": "string",
					"description": "需要修改的明细项及其修改的值"
				}
			},
			"required": []
		}
	},
	{
		"name": "dmt_Schematic.reorderSchematicPages",
		"description": "重新排序原理图图页",
		"inputSchema": {
			"type": "object",
			"properties": {
				"schematicUuid": {
					"type": "string",
					"description": "执行排序的图页所关联的原理图 UUID"
				},
				"schematicPageItemsArray": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "所有原理图图页属性的数组"
				}
			},
			"required": [
				"schematicUuid",
				"schematicPageItemsArray"
			]
		}
	},
	{
		"name": "dmt_SelectControl.getCurrentDocumentInfo",
		"description": "获取当前文档的属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Team.getAllInvolvedTeamInfo",
		"description": "获取所有参与的团队的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Team.getAllTeamsInfo",
		"description": "获取所有直接团队的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Team.getCurrentTeamInfo",
		"description": "获取当前团队的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Workspace.getAllWorkspacesInfo",
		"description": "获取所有工作区的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Workspace.getCurrentWorkspaceInfo",
		"description": "获取当前工作区的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "dmt_Workspace.toggleToWorkspace",
		"description": "切换到工作区",
		"inputSchema": {
			"type": "object",
			"properties": {
				"workspaceUuid": {
					"type": "string",
					"description": "工作区 UUID，如若不指定，则将切换到个人工作区"
				}
			},
			"required": []
		}
	},
	{
		"name": "ipcb_ComplexPolygon.addSource",
		"description": "添加多边形数据",
		"inputSchema": {
			"type": "object",
			"properties": {
				"complexPolygon": {
					"type": "string",
					"description": "复杂多边形数据"
				}
			},
			"required": [
				"complexPolygon"
			]
		}
	},
	{
		"name": "ipcb_ComplexPolygon.getSource",
		"description": "获取多边形数据",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_ComplexPolygon.getSourceStrictComplex",
		"description": "获取复杂多边形数据",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_Polygon.getSource",
		"description": "获取单多边形数据",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getAdjacentPrimitives",
		"description": "获取相邻的图元对象",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getEntireTrack",
		"description": "获取整段导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"includeVias": {
					"type": "string",
					"description": "是否包含导线两端的过孔"
				}
			},
			"required": [
				"includeVias"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getEntireTrack",
		"description": "获取整段导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"includeVias": {
					"type": "string",
					"description": "是否包含导线两端的过孔"
				}
			},
			"required": [
				"includeVias"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_ArcAngle",
		"description": "获取属性状态：圆弧角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_EndX",
		"description": "获取属性状态：终止位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_EndY",
		"description": "获取属性状态：终止位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_InteractiveMode",
		"description": "获取属性状态：交互模式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_StartX",
		"description": "获取属性状态：起始位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.getState_StartY",
		"description": "获取属性状态：起始位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_ArcAngle",
		"description": "设置属性状态：圆弧角度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"arcAngle": {
					"type": "number",
					"description": "圆弧角度"
				}
			},
			"required": [
				"arcAngle"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_EndX",
		"description": "设置属性状态：终止位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"endX": {
					"type": "number",
					"description": "终止位置 X"
				}
			},
			"required": [
				"endX"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_EndY",
		"description": "设置属性状态：终止位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"endY": {
					"type": "number",
					"description": "终止位置 Y"
				}
			},
			"required": [
				"endY"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_InteractiveMode",
		"description": "设置属性状态：交互模式",
		"inputSchema": {
			"type": "object",
			"properties": {
				"interactiveMode": {
					"type": "number",
					"description": "交互模式"
				}
			},
			"required": [
				"interactiveMode"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_Net",
		"description": "设置属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_StartX",
		"description": "设置属性状态：起始位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"startX": {
					"type": "number",
					"description": "起始位置 X"
				}
			},
			"required": [
				"startX"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.setState_StartY",
		"description": "设置属性状态：起始位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"startY": {
					"type": "number",
					"description": "起始位置 Y"
				}
			},
			"required": [
				"startY"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveArc.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveArc.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getAllPins",
		"description": "获取器件关联的所有焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_AddIntoBom",
		"description": "获取属性状态：是否加入 BOM",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Component",
		"description": "获取属性状态：关联库器件",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Designator",
		"description": "获取属性状态：位号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Footprint",
		"description": "获取属性状态：关联库封装",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Manufacturer",
		"description": "获取属性状态：制造商",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_ManufacturerId",
		"description": "获取属性状态：制造商编号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Model3D",
		"description": "获取属性状态：关联库 3D 模型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Name",
		"description": "获取属性状态：名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_OtherProperty",
		"description": "获取属性状态：其它参数",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Pads",
		"description": "获取属性状态：焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Supplier",
		"description": "获取属性状态：供应商",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_SupplierId",
		"description": "获取属性状态：供应商编号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_UniqueId",
		"description": "获取属性状态：唯一 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_X",
		"description": "获取属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.getState_Y",
		"description": "获取属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_AddIntoBom",
		"description": "设置属性状态：是否加入 BOM",
		"inputSchema": {
			"type": "object",
			"properties": {
				"addIntoBom": {
					"type": "boolean",
					"description": "是否加入 BOM"
				}
			},
			"required": [
				"addIntoBom"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_Designator",
		"description": "设置属性状态：位号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"designator": {
					"type": "string",
					"description": "位号"
				}
			},
			"required": [
				"designator"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_Manufacturer",
		"description": "设置属性状态：制造商",
		"inputSchema": {
			"type": "object",
			"properties": {
				"manufacturer": {
					"type": "string",
					"description": "制造商"
				}
			},
			"required": [
				"manufacturer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_ManufacturerId",
		"description": "设置属性状态：制造商编号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"manufacturerId": {
					"type": "string",
					"description": "制造商编号"
				}
			},
			"required": [
				"manufacturerId"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_Name",
		"description": "设置属性状态：名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string",
					"description": "名称"
				}
			},
			"required": [
				"name"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_OtherProperty",
		"description": "设置属性状态：其它参数",
		"inputSchema": {
			"type": "object",
			"properties": {
				"otherProperty": {
					"type": "number",
					"description": "其它参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_Rotation",
		"description": "设置属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_Supplier",
		"description": "设置属性状态：供应商",
		"inputSchema": {
			"type": "object",
			"properties": {
				"supplier": {
					"type": "string",
					"description": "供应商"
				}
			},
			"required": [
				"supplier"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_SupplierId",
		"description": "设置属性状态：供应商编号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"supplierId": {
					"type": "string",
					"description": "供应商编号"
				}
			},
			"required": [
				"supplierId"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_UniqueId",
		"description": "设置属性状态：唯一 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uniqueId": {
					"type": "string",
					"description": "唯一 ID"
				}
			},
			"required": [
				"uniqueId"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_X",
		"description": "设置属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				}
			},
			"required": [
				"x"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.setState_Y",
		"description": "设置属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"y": {
					"type": "number",
					"description": "坐标 Y"
				}
			},
			"required": [
				"y"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponent.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponentPad.done",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveComponentPad.getConnectedPrimitives",
		"description": "参数",
		"inputSchema": {
			"type": "object",
			"properties": {
				"onlyCentreConnection": {
					"type": "string"
				}
			},
			"required": [
				"onlyCentreConnection"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_CoordinateSet",
		"description": "获取属性状态：坐标集",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_DimensionType",
		"description": "获取属性状态：尺寸标注类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_Precision",
		"description": "获取属性状态：精度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_TextFollow",
		"description": "获取属性状态：文字跟随",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.getState_Unit",
		"description": "获取属性状态：单位",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.setState_CoordinateSet",
		"description": "设置属性状态：坐标集",
		"inputSchema": {
			"type": "object",
			"properties": {
				"coordinateSet": {
					"type": "string",
					"description": "坐标集"
				}
			},
			"required": [
				"coordinateSet"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.setState_DimensionType",
		"description": "设置属性状态：尺寸标注类型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"dimensionType": {
					"type": "string",
					"description": "尺寸标注类型"
				}
			},
			"required": [
				"dimensionType"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.setState_Precision",
		"description": "设置属性状态：精度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"precision": {
					"type": "number",
					"description": "精度"
				}
			},
			"required": [
				"precision"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.setState_Unit",
		"description": "设置属性状态：单位",
		"inputSchema": {
			"type": "object",
			"properties": {
				"unit": {
					"type": "string",
					"description": "单位"
				}
			},
			"required": [
				"unit"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveDimension.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.convertToPolyline",
		"description": "转换到：折线图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.convertToPour",
		"description": "转换到：覆铜边框图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.convertToRegion",
		"description": "转换到：区域图元(默认是禁止区域)",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.getState_ComplexPolygon",
		"description": "获取属性状态：复杂多边形",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.getState_FillMode",
		"description": "获取属性状态：填充模式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.setState_ComplexPolygon",
		"description": "设置属性状态：复杂多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"complexPolygon": {
					"type": "string",
					"description": "复杂多边形"
				}
			},
			"required": [
				"complexPolygon"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveFill.setState_FillMode",
		"description": "设置属性状态：填充模式",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fillMode": {
					"type": "string",
					"description": "填充模式"
				}
			},
			"required": [
				"fillMode"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveFill.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveFill.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveFill.setState_Net",
		"description": "设置属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveFill.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveFill.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveFill.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_ComplexPolygon",
		"description": "获取属性状态：图像源数据（复杂多边形）",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_Height",
		"description": "获取属性状态：高",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_HorizonMirror",
		"description": "获取属性状态：是否水平镜像",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_Width",
		"description": "获取属性状态：宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_X",
		"description": "获取属性状态：BBox 左上点坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.getState_Y",
		"description": "获取属性状态：BBox 左上点坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.setState_Height",
		"description": "设置属性状态：高",
		"inputSchema": {
			"type": "object",
			"properties": {
				"height": {
					"type": "number",
					"description": "高"
				}
			},
			"required": [
				"height"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveImage.setState_HorizonMirror",
		"description": "设置属性状态：是否水平镜像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"horizonMirror": {
					"type": "boolean",
					"description": "是否水平镜像"
				}
			},
			"required": [
				"horizonMirror"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveImage.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveImage.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveImage.setState_Rotation",
		"description": "设置属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveImage.setState_Width",
		"description": "设置属性状态：宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"width": {
					"type": "number",
					"description": "宽"
				}
			},
			"required": [
				"width"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveImage.setState_X",
		"description": "设置属性状态：BBox 左上点坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "BBox 左上点坐标 X"
				}
			},
			"required": [
				"x"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveImage.setState_Y",
		"description": "设置属性状态：BBox 左上点坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"y": {
					"type": "number",
					"description": "BBox 左上点坐标 Y"
				}
			},
			"required": [
				"y"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveImage.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveImage.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getAdjacentPrimitives",
		"description": "获取相邻的图元对象",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getEntireTrack",
		"description": "获取整段导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"includeVias": {
					"type": "string",
					"description": "是否包含导线两端的过孔"
				}
			},
			"required": [
				"includeVias"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getEntireTrack",
		"description": "获取整段导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"includeVias": {
					"type": "string",
					"description": "是否包含导线两端的过孔"
				}
			},
			"required": [
				"includeVias"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_EndX",
		"description": "获取属性状态：终止位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_EndY",
		"description": "获取属性状态：终止位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_StartX",
		"description": "获取属性状态：起始位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.getState_StartY",
		"description": "获取属性状态：起始位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.setState_EndX",
		"description": "设置属性状态：终止位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"endX": {
					"type": "number",
					"description": "终止位置 X"
				}
			},
			"required": [
				"endX"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.setState_EndY",
		"description": "设置属性状态：终止位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"endY": {
					"type": "number",
					"description": "终止位置 Y"
				}
			},
			"required": [
				"endY"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.setState_Net",
		"description": "设置属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.setState_StartX",
		"description": "设置属性状态：起始位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"startX": {
					"type": "number",
					"description": "起始位置 X"
				}
			},
			"required": [
				"startX"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.setState_StartY",
		"description": "设置属性状态：起始位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"startY": {
					"type": "number",
					"description": "起始位置 Y"
				}
			},
			"required": [
				"startY"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveLine.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveLine.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_BinaryData",
		"description": "获取属性状态：二进制数据",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_FileName",
		"description": "获取属性状态：文件名",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_Height",
		"description": "获取属性状态：高",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_Mirror",
		"description": "获取属性状态：是否水平镜像",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_TopLeftX",
		"description": "获取属性状态：左上点 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_TopLeftY",
		"description": "获取属性状态：左上点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.getState_Width",
		"description": "获取属性状态：宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_BinaryData",
		"description": "设置属性状态：二进制数据",
		"inputSchema": {
			"type": "object",
			"properties": {
				"binaryData": {
					"type": "string",
					"description": "二进制数据"
				}
			},
			"required": [
				"binaryData"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_FileName",
		"description": "设置属性状态：文件名",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": [
				"fileName"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_Height",
		"description": "设置属性状态：高",
		"inputSchema": {
			"type": "object",
			"properties": {
				"height": {
					"type": "number",
					"description": "高"
				}
			},
			"required": [
				"height"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "object",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_Mirror",
		"description": "设置属性状态：是否水平镜像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"mirror": {
					"type": "boolean",
					"description": "是否水平镜像"
				}
			},
			"required": [
				"mirror"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_Rotation",
		"description": "设置属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_TopLeftX",
		"description": "设置属性状态：左上点 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topLeftX": {
					"type": "number",
					"description": "左上点 X"
				}
			},
			"required": [
				"topLeftX"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_TopLeftY",
		"description": "设置属性状态：左上点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topLeftY": {
					"type": "number",
					"description": "左上点 Y"
				}
			},
			"required": [
				"topLeftY"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.setState_Width",
		"description": "设置属性状态：宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"width": {
					"type": "number",
					"description": "宽"
				}
			},
			"required": [
				"width"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveObject.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveObject.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.create",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.done",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_HeatWelding",
		"description": "获取属性状态：热焊优化参数",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_Hole",
		"description": "获取属性状态：孔",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_HoleOffsetX",
		"description": "获取属性状态：孔偏移 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_HoleOffsetY",
		"description": "获取属性状态：孔偏移 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_HoleRotation",
		"description": "获取属性状态：孔相对于焊盘的旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_Metallization",
		"description": "获取属性状态：是否金属化孔壁",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_Pad",
		"description": "获取属性状态：焊盘外形",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_PadNumber",
		"description": "获取属性状态：焊盘编号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_PadType",
		"description": "获取属性状态：焊盘类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_SolderMaskAndPasteMaskExpansion",
		"description": "获取属性状态：阻焊/助焊扩展",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_SpecialPad",
		"description": "获取属性状态：特殊焊盘外形",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_X",
		"description": "获取属性状态：位置 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.getState_Y",
		"description": "获取属性状态：位置 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.reset",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_HeatWelding",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"heatWelding": {
					"type": "string",
					"description": "热焊优化参数"
				}
			},
			"required": [
				"heatWelding"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_Hole",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"hole": {
					"type": "string",
					"description": "焊盘钻孔"
				}
			},
			"required": [
				"hole"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_HoleOffsetX",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"holeOffsetX": {
					"type": "number",
					"description": "孔偏移 X"
				}
			},
			"required": [
				"holeOffsetX"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_HoleOffsetY",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"holeOffsetY": {
					"type": "number",
					"description": "孔偏移 Y"
				}
			},
			"required": [
				"holeOffsetY"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_HoleRotation",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"holeRotation": {
					"type": "number",
					"description": "孔相对于焊盘的旋转角度"
				}
			},
			"required": [
				"holeRotation"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_Layer",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_Metallization",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"metallization": {
					"type": "boolean",
					"description": "是否金属化孔壁"
				}
			},
			"required": [
				"metallization"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_Net",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_Pad",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pad": {
					"type": "string",
					"description": "焊盘外形"
				}
			},
			"required": [
				"pad"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_PadNumber",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"padNumber": {
					"type": "string",
					"description": "焊盘编号"
				}
			},
			"required": [
				"padNumber"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_PrimitiveLock",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_Rotation",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_SolderMaskAndPasteMaskExpansion",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"solderMaskAndPasteMaskExpansion": {
					"type": "string",
					"description": "阻焊/助焊扩展"
				}
			},
			"required": [
				"solderMaskAndPasteMaskExpansion"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_SpecialPad",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"specialPad": {
					"type": "string"
				}
			},
			"required": [
				"specialPad"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_X",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "位置 X"
				}
			},
			"required": [
				"x"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.setState_Y",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"y": {
					"type": "number",
					"description": "位置 Y"
				}
			},
			"required": [
				"y"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePad.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePad.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.convertToFill",
		"description": "转换到：填充图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.convertToPour",
		"description": "转换到：覆铜边框图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.convertToRegion",
		"description": "转换到：区域图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.getState_Polygon",
		"description": "获取属性状态：单多边形",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.setState_Net",
		"description": "设置属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.setState_Polygon",
		"description": "设置属性状态：单多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"polygon": {
					"type": "string",
					"description": "单多边形"
				}
			},
			"required": [
				"polygon"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePolyline.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.convertToFill",
		"description": "转换到：填充图元(默认是填充区域)",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.convertToPolyline",
		"description": "转换到：折线图元(默认是线条)",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.convertToRegion",
		"description": "转换到：区域图元(默认是禁止区域)",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_ComplexPolygon",
		"description": "获取属性状态：复杂多边形",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_PourFillMethod",
		"description": "获取属性状态：覆铜填充方法",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_PourName",
		"description": "获取属性状态：覆铜边框名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_PourPriority",
		"description": "获取属性状态：覆铜优先级",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_PreserveSilos",
		"description": "获取属性状态：是否保留孤岛",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_ComplexPolygon",
		"description": "设置属性状态：复杂多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"complexPolygon": {
					"type": "string",
					"description": "复杂多边形"
				}
			},
			"required": [
				"complexPolygon"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_Net",
		"description": "设置属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_PourFillMethod",
		"description": "设置属性状态：覆铜填充方法",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pourFillMethod": {
					"type": "string",
					"description": "覆铜填充方法"
				}
			},
			"required": [
				"pourFillMethod"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_PourName",
		"description": "设置属性状态：覆铜边框名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pourName": {
					"type": "string",
					"description": "覆铜边框名称"
				}
			},
			"required": [
				"pourName"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_PourPriority",
		"description": "设置属性状态：覆铜优先级",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pourPriority": {
					"type": "number",
					"description": "覆铜优先级"
				}
			},
			"required": [
				"pourPriority"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_PreserveSilos",
		"description": "设置属性状态：是否保留孤岛",
		"inputSchema": {
			"type": "object",
			"properties": {
				"preserveSilos": {
					"type": "boolean",
					"description": "是否保留孤岛"
				}
			},
			"required": [
				"preserveSilos"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitivePour.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePour.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePoured.getState_PourFills",
		"description": "获取属性状态：覆铜填充区域",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePoured.getState_PourPrimitiveId",
		"description": "获取属性状态：覆铜边框图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePoured.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitivePoured.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.convertToFill",
		"description": "转换到：填充图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.convertToPolyline",
		"description": "转换到：折线图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.convertToPour",
		"description": "转换到：覆铜边框图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.getState_ComplexPolygon",
		"description": "获取属性状态：复杂多边形",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.getState_RegionName",
		"description": "获取属性状态：区域名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.getState_RuleType",
		"description": "获取属性状态：区域规则类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.setState_ComplexPolygon",
		"description": "设置属性状态：复杂多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"complexPolygon": {
					"type": "string",
					"description": "复杂多边形"
				}
			},
			"required": [
				"complexPolygon"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.setState_Layer",
		"description": "设置属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.setState_RegionName",
		"description": "设置属性状态：区域名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"regionName": {
					"type": "string",
					"description": "区域名称"
				}
			},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.setState_RuleType",
		"description": "设置属性状态：区域规则类型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"ruleType": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "区域规则类型"
				}
			},
			"required": [
				"ruleType"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveRegion.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_AlignMode",
		"description": "获取属性状态：对齐模式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_Expansion",
		"description": "获取属性状态：反相扩展",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_FontFamily",
		"description": "获取属性状态：字体",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_FontSize",
		"description": "获取属性状态：字号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_Layer",
		"description": "获取属性状态：层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_Mirror",
		"description": "获取属性状态：是否镜像",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_Reverse",
		"description": "获取属性状态：是否反相",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_Text",
		"description": "获取属性状态：文本内容",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_X",
		"description": "获取属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.getState_Y",
		"description": "获取属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_AlignMode",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"alignMode": {
					"type": "string",
					"description": "对齐模式"
				}
			},
			"required": [
				"alignMode"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_Expansion",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"expansion": {
					"type": "number",
					"description": "反相扩展"
				}
			},
			"required": [
				"expansion"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_FontFamily",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fontFamily": {
					"type": "string",
					"description": "字体"
				}
			},
			"required": [
				"fontFamily"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_FontSize",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fontSize": {
					"type": "number",
					"description": "字号"
				}
			},
			"required": [
				"fontSize"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_Layer",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_LineWidth",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_Mirror",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"mirror": {
					"type": "boolean",
					"description": "是否镜像"
				}
			},
			"required": [
				"mirror"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_PrimitiveLock",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_Reverse",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"reverse": {
					"type": "boolean",
					"description": "是否反相"
				}
			},
			"required": [
				"reverse"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_Rotation",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_Text",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"text": {
					"type": "string",
					"description": "文本内容"
				}
			},
			"required": [
				"text"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_X",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				}
			},
			"required": [
				"x"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.setState_Y",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"y": {
					"type": "number",
					"description": "坐标 Y"
				}
			},
			"required": [
				"y"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveString.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveString.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getAdjacentPrimitives",
		"description": "获取相邻的图元对象",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_DesignRuleBlindViaName",
		"description": "获取属性状态：盲埋孔设计规则项名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_Diameter",
		"description": "获取属性状态：外径",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_HoleDiameter",
		"description": "获取属性状态：孔径",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_PrimitiveLock",
		"description": "获取属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_SolderMaskExpansion",
		"description": "获取属性状态：阻焊/助焊扩展",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_ViaType",
		"description": "获取属性状态：过孔类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_X",
		"description": "获取属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.getState_Y",
		"description": "获取属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_DesignRuleBlindViaName",
		"description": "设置属性状态：盲埋孔设计规则项名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"designRuleBlindViaName": {
					"type": "string",
					"description": "盲埋孔设计规则项名称"
				}
			},
			"required": [
				"designRuleBlindViaName"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_Diameter",
		"description": "设置属性状态：外径",
		"inputSchema": {
			"type": "object",
			"properties": {
				"diameter": {
					"type": "number",
					"description": "外径"
				}
			},
			"required": [
				"diameter"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_HoleDiameter",
		"description": "设置属性状态：孔径",
		"inputSchema": {
			"type": "object",
			"properties": {
				"holeDiameter": {
					"type": "number",
					"description": "孔径"
				}
			},
			"required": [
				"holeDiameter"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_Net",
		"description": "设置属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_PrimitiveLock",
		"description": "设置属性状态：是否锁定",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"primitiveLock"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_SolderMaskExpansion",
		"description": "设置属性状态：阻焊/助焊扩展",
		"inputSchema": {
			"type": "object",
			"properties": {
				"solderMaskExpansion": {
					"type": "string",
					"description": "阻焊/助焊扩展"
				}
			},
			"required": [
				"solderMaskExpansion"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_ViaType",
		"description": "设置属性状态：过孔类型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"viaType": {
					"type": "string",
					"description": "过孔类型"
				}
			},
			"required": [
				"viaType"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_X",
		"description": "设置属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				}
			},
			"required": [
				"x"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.setState_Y",
		"description": "设置属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"y": {
					"type": "number",
					"description": "坐标 Y"
				}
			},
			"required": [
				"y"
			]
		}
	},
	{
		"name": "ipcb_PrimitiveVia.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "ipcb_PrimitiveVia.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_Color",
		"description": "获取属性状态：颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_EndX",
		"description": "获取属性状态：终止点 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_EndY",
		"description": "获取属性状态：终止点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_FillColor",
		"description": "获取属性状态：填充颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_LineType",
		"description": "获取属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_ReferenceX",
		"description": "获取属性状态：参考点 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_ReferenceY",
		"description": "获取属性状态：参考点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_StartX",
		"description": "获取属性状态：起始点 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.getState_StartY",
		"description": "获取属性状态：起始点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_Color",
		"description": "设置属性状态：颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"color": {
					"type": "string",
					"description": "颜色"
				}
			},
			"required": [
				"color"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_EndX",
		"description": "设置属性状态：终止点 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"endX": {
					"type": "number",
					"description": "终止点 X"
				}
			},
			"required": [
				"endX"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_EndY",
		"description": "设置属性状态：终止点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"endY": {
					"type": "number",
					"description": "终止点 Y"
				}
			},
			"required": [
				"endY"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_FillColor",
		"description": "设置属性状态：填充颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fillColor": {
					"type": "string",
					"description": "填充颜色"
				}
			},
			"required": [
				"fillColor"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_LineType",
		"description": "设置属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineType": {
					"type": "string",
					"description": "线型"
				}
			},
			"required": [
				"lineType"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_ReferenceX",
		"description": "设置属性状态：参考点 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"referenceX": {
					"type": "number",
					"description": "参考点 X"
				}
			},
			"required": [
				"referenceX"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_ReferenceY",
		"description": "设置属性状态：参考点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"referenceY": {
					"type": "number",
					"description": "参考点 Y"
				}
			},
			"required": [
				"referenceY"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_StartX",
		"description": "设置属性状态：起始点 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"startX": {
					"type": "number",
					"description": "起始点 X"
				}
			},
			"required": [
				"startX"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.setState_StartY",
		"description": "设置属性状态：起始点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"startY": {
					"type": "number",
					"description": "起始点 Y"
				}
			},
			"required": [
				"startY"
			]
		}
	},
	{
		"name": "isch_PrimitiveArc.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveArc.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.getState_BusName",
		"description": "获取属性状态：总线名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.getState_Color",
		"description": "获取属性状态：总线颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.getState_Line",
		"description": "获取属性状态：多段线坐标组",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.getState_LineType",
		"description": "获取属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.setState_BusName",
		"description": "设置属性状态：总线名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"busName": {
					"type": "string",
					"description": "总线名称"
				}
			},
			"required": [
				"busName"
			]
		}
	},
	{
		"name": "isch_PrimitiveBus.setState_Color",
		"description": "设置属性状态：总线颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"color": {
					"type": "string",
					"description": "总线颜色"
				}
			},
			"required": [
				"color"
			]
		}
	},
	{
		"name": "isch_PrimitiveBus.setState_Line",
		"description": "设置属性状态：多段线坐标组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"line": {
					"type": "string",
					"description": "多段线坐标组"
				}
			},
			"required": [
				"line"
			]
		}
	},
	{
		"name": "isch_PrimitiveBus.setState_LineType",
		"description": "设置属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineType": {
					"type": "string",
					"description": "线型"
				}
			},
			"required": [
				"lineType"
			]
		}
	},
	{
		"name": "isch_PrimitiveBus.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "isch_PrimitiveBus.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveBus.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCbbSymbolComponent.getState_Cbb",
		"description": "获取属性状态：关联复用模块",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCbbSymbolComponent.getState_CbbSymbol",
		"description": "获取属性状态：关联复用模块符号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_CenterX",
		"description": "获取属性状态：圆心 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_CenterY",
		"description": "获取属性状态：圆心 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_Color",
		"description": "获取属性状态：颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_FillColor",
		"description": "获取属性状态：填充颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_FillStyle",
		"description": "获取属性状态：填充样式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_LineType",
		"description": "获取属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.getState_Radius",
		"description": "获取属性状态：半径",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.setState_CenterX",
		"description": "设置属性状态：圆心 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"centerX": {
					"type": "number",
					"description": "圆心 X"
				}
			},
			"required": [
				"centerX"
			]
		}
	},
	{
		"name": "isch_PrimitiveCircle.setState_CenterY",
		"description": "设置属性状态：圆心 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"centerY": {
					"type": "number",
					"description": "圆心 Y"
				}
			},
			"required": [
				"centerY"
			]
		}
	},
	{
		"name": "isch_PrimitiveCircle.setState_Color",
		"description": "设置属性状态：颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"color": {
					"type": "string",
					"description": "颜色"
				}
			},
			"required": [
				"color"
			]
		}
	},
	{
		"name": "isch_PrimitiveCircle.setState_FillColor",
		"description": "设置属性状态：填充颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fillColor": {
					"type": "string",
					"description": "填充颜色"
				}
			},
			"required": [
				"fillColor"
			]
		}
	},
	{
		"name": "isch_PrimitiveCircle.setState_FillStyle",
		"description": "设置属性状态：填充样式",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fillStyle": {
					"type": "string",
					"description": "填充样式"
				}
			},
			"required": [
				"fillStyle"
			]
		}
	},
	{
		"name": "isch_PrimitiveCircle.setState_LineType",
		"description": "设置属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineType": {
					"type": "string",
					"description": "线型"
				}
			},
			"required": [
				"lineType"
			]
		}
	},
	{
		"name": "isch_PrimitiveCircle.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "isch_PrimitiveCircle.setState_Radius",
		"description": "设置属性状态：半径",
		"inputSchema": {
			"type": "object",
			"properties": {
				"radius": {
					"type": "number",
					"description": "半径"
				}
			},
			"required": [
				"radius"
			]
		}
	},
	{
		"name": "isch_PrimitiveCircle.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveCircle.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_AddIntoBom",
		"description": "获取属性状态：是否加入 BOM",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_AddIntoPcb",
		"description": "获取属性状态：是否转到 PCB",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Component",
		"description": "获取属性状态：关联库器件",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_ComponentType",
		"description": "获取属性状态：器件类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Designator",
		"description": "获取属性状态：位号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Footprint",
		"description": "获取属性状态：关联库封装",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Manufacturer",
		"description": "获取属性状态：制造商",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_ManufacturerId",
		"description": "获取属性状态：制造商编号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Mirror",
		"description": "获取属性状态：是否镜像",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Name",
		"description": "获取属性状态：名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_OtherProperty",
		"description": "获取属性状态：其它参数",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_SubPartName",
		"description": "获取属性状态：子图块名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Supplier",
		"description": "获取属性状态：供应商",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_SupplierId",
		"description": "获取属性状态：供应商编号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Symbol",
		"description": "获取属性状态：关联库符号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_UniqueId",
		"description": "获取属性状态：唯一 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_X",
		"description": "获取属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.getState_Y",
		"description": "获取属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_AddIntoBom",
		"description": "设置属性状态：是否加入 BOM",
		"inputSchema": {
			"type": "object",
			"properties": {
				"addIntoBom": {
					"type": "boolean",
					"description": "是否加入 BOM"
				}
			},
			"required": [
				"addIntoBom"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_AddIntoPcb",
		"description": "设置属性状态：是否转到 PCB",
		"inputSchema": {
			"type": "object",
			"properties": {
				"addIntoPcb": {
					"type": "boolean",
					"description": "是否转到 PCB"
				}
			},
			"required": [
				"addIntoPcb"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_Designator",
		"description": "设置属性状态：位号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"designator": {
					"type": "string",
					"description": "位号"
				}
			},
			"required": [
				"designator"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_Manufacturer",
		"description": "设置属性状态：制造商",
		"inputSchema": {
			"type": "object",
			"properties": {
				"manufacturer": {
					"type": "string",
					"description": "制造商"
				}
			},
			"required": [
				"manufacturer"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_ManufacturerId",
		"description": "设置属性状态：制造商编号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"manufacturerId": {
					"type": "string",
					"description": "制造商编号"
				}
			},
			"required": [
				"manufacturerId"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_Mirror",
		"description": "设置属性状态：是否镜像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"mirror": {
					"type": "boolean",
					"description": "是否镜像"
				}
			},
			"required": [
				"mirror"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_Name",
		"description": "设置属性状态：名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"name": {
					"type": "string",
					"description": "名称"
				}
			},
			"required": [
				"name"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_Net",
		"description": "设置属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_OtherProperty",
		"description": "设置属性状态：其它参数",
		"inputSchema": {
			"type": "object",
			"properties": {
				"otherProperty": {
					"type": "number",
					"description": "其它参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_Rotation",
		"description": "设置属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_Supplier",
		"description": "设置属性状态：供应商",
		"inputSchema": {
			"type": "object",
			"properties": {
				"supplier": {
					"type": "string",
					"description": "供应商"
				}
			},
			"required": [
				"supplier"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_SupplierId",
		"description": "设置属性状态：供应商编号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"supplierId": {
					"type": "string",
					"description": "供应商编号"
				}
			},
			"required": [
				"supplierId"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_UniqueId",
		"description": "设置属性状态：唯一 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uniqueId": {
					"type": "string",
					"description": "唯一 ID"
				}
			},
			"required": [
				"uniqueId"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_X",
		"description": "设置属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				}
			},
			"required": [
				"x"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.setState_Y",
		"description": "设置属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"y": {
					"type": "number",
					"description": "坐标 Y"
				}
			},
			"required": [
				"y"
			]
		}
	},
	{
		"name": "isch_PrimitiveComponent.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveComponent.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.done",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_OtherProperty",
		"description": "获取属性状态：其它参数",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_PinColor",
		"description": "获取属性状态：引脚颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_PinLength",
		"description": "获取属性状态：引脚长度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_PinName",
		"description": "获取属性状态：引脚名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_PinNumber",
		"description": "获取属性状态：引脚编号",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_PinShape",
		"description": "获取属性状态：引脚形状",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_pinType",
		"description": "获取属性状态：引脚类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_X",
		"description": "获取属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.getState_Y",
		"description": "获取属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.reset",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.setState_OtherProperty",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"otherProperty": {
					"type": "number",
					"description": "其它参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.setState_PinColor",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pinColor": {
					"type": "string",
					"description": "引脚颜色"
				}
			},
			"required": [
				"pinColor"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.setState_PinLength",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pinLength": {
					"type": "number",
					"description": "引脚长度"
				}
			},
			"required": [
				"pinLength"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.setState_PinName",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pinName": {
					"type": "string",
					"description": "引脚名称"
				}
			},
			"required": [
				"pinName"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.setState_PinNumber",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pinNumber": {
					"type": "string",
					"description": "引脚编号"
				}
			},
			"required": [
				"pinNumber"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.setState_PinShape",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pinShape": {
					"type": "string",
					"description": "引脚形状"
				}
			},
			"required": [
				"pinShape"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.setState_PinType",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pinType": {
					"type": "number",
					"description": "引脚类型"
				}
			},
			"required": [
				"pinType"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.setState_Rotation",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.setState_X",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				}
			},
			"required": [
				"x"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.setState_Y",
		"description": "此 API 当前处于 BETA 预览状态，希望得到开发者的反馈。它的任何功能都可能在接下来的开发进程中被修改，请不要将它用于任何正式环境。",
		"inputSchema": {
			"type": "object",
			"properties": {
				"y": {
					"type": "number",
					"description": "坐标 Y"
				}
			},
			"required": [
				"y"
			]
		}
	},
	{
		"name": "isch_PrimitivePin.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePin.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.getState_Color",
		"description": "获取属性状态：颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.getState_FillColor",
		"description": "获取属性状态：填充颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.getState_Line",
		"description": "获取属性状态：坐标组",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.getState_LineType",
		"description": "获取属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.setState_Color",
		"description": "设置属性状态：颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"color": {
					"type": "string",
					"description": "颜色"
				}
			},
			"required": [
				"color"
			]
		}
	},
	{
		"name": "isch_PrimitivePolygon.setState_FillColor",
		"description": "设置属性状态：填充颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fillColor": {
					"type": "string",
					"description": "填充颜色"
				}
			},
			"required": [
				"fillColor"
			]
		}
	},
	{
		"name": "isch_PrimitivePolygon.setState_Line",
		"description": "设置属性状态：坐标组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"line": {
					"type": "array",
					"items": {
						"type": "number"
					},
					"description": "坐标组"
				}
			},
			"required": [
				"line"
			]
		}
	},
	{
		"name": "isch_PrimitivePolygon.setState_LineType",
		"description": "设置属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineType": {
					"type": "string",
					"description": "线型"
				}
			},
			"required": [
				"lineType"
			]
		}
	},
	{
		"name": "isch_PrimitivePolygon.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "isch_PrimitivePolygon.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitivePolygon.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_Color",
		"description": "获取属性状态：边框颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_CornerRadius",
		"description": "获取属性状态：圆角半径",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_FillColor",
		"description": "获取属性状态：填充颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_FillStyle",
		"description": "获取属性状态：填充样式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_Height",
		"description": "获取属性状态：高",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_LineType",
		"description": "获取属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_TopLeftX",
		"description": "获取属性状态：左上点 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_TopLeftY",
		"description": "获取属性状态：左上点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.getState_Width",
		"description": "获取属性状态：宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_Color",
		"description": "设置属性状态：边框颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"color": {
					"type": "string",
					"description": "边框颜色"
				}
			},
			"required": [
				"color"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_CornerRadius",
		"description": "设置属性状态：圆角半径",
		"inputSchema": {
			"type": "object",
			"properties": {
				"cornerRadius": {
					"type": "number",
					"description": "圆角半径"
				}
			},
			"required": [
				"cornerRadius"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_FillColor",
		"description": "设置属性状态：填充颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fillColor": {
					"type": "string",
					"description": "填充颜色"
				}
			},
			"required": [
				"fillColor"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_FillStyle",
		"description": "设置属性状态：填充样式",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fillStyle": {
					"type": "string",
					"description": "填充样式"
				}
			},
			"required": [
				"fillStyle"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_Height",
		"description": "设置属性状态：高",
		"inputSchema": {
			"type": "object",
			"properties": {
				"height": {
					"type": "number",
					"description": "高"
				}
			},
			"required": [
				"height"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_LineType",
		"description": "设置属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineType": {
					"type": "string",
					"description": "线型"
				}
			},
			"required": [
				"lineType"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_Rotation",
		"description": "设置属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_TopLeftX",
		"description": "设置属性状态：左上点 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topLeftX": {
					"type": "number",
					"description": "左上点 X"
				}
			},
			"required": [
				"topLeftX"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_TopLeftY",
		"description": "设置属性状态：左上点 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topLeftY": {
					"type": "number",
					"description": "左上点 Y"
				}
			},
			"required": [
				"topLeftY"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.setState_Width",
		"description": "设置属性状态：宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"width": {
					"type": "number",
					"description": "宽"
				}
			},
			"required": [
				"width"
			]
		}
	},
	{
		"name": "isch_PrimitiveRectangle.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveRectangle.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_AlignMode",
		"description": "获取属性状态：对齐模式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_Bold",
		"description": "获取属性状态：是否加粗",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_Content",
		"description": "获取属性状态：文本内容",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_FontName",
		"description": "获取属性状态：字体名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_FontSize",
		"description": "获取属性状态：字体大小",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_Italic",
		"description": "获取属性状态：是否斜体",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_Rotation",
		"description": "获取属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_TextColor",
		"description": "获取属性状态：文本颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_UnderLine",
		"description": "获取属性状态：是否加下划线",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_X",
		"description": "获取属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.getState_Y",
		"description": "获取属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.reset",
		"description": "将异步图元重置为当前画布状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.setState_AlignMode",
		"description": "设置属性状态：对齐模式",
		"inputSchema": {
			"type": "object",
			"properties": {
				"alignMode": {
					"type": "number",
					"description": "对齐模式"
				}
			},
			"required": [
				"alignMode"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_Bold",
		"description": "设置属性状态：是否加粗",
		"inputSchema": {
			"type": "object",
			"properties": {
				"bold": {
					"type": "boolean",
					"description": "是否加粗"
				}
			},
			"required": [
				"bold"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_Content",
		"description": "设置属性状态：文本内容",
		"inputSchema": {
			"type": "object",
			"properties": {
				"content": {
					"type": "string",
					"description": "文本内容"
				}
			},
			"required": [
				"content"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_FontName",
		"description": "设置属性状态：字体名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fontName": {
					"type": "string",
					"description": "字体名称"
				}
			},
			"required": [
				"fontName"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_FontSize",
		"description": "设置属性状态：字体大小",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fontSize": {
					"type": "number",
					"description": "字体大小"
				}
			},
			"required": [
				"fontSize"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_Italic",
		"description": "设置属性状态：是否斜体",
		"inputSchema": {
			"type": "object",
			"properties": {
				"italic": {
					"type": "boolean",
					"description": "是否斜体"
				}
			},
			"required": [
				"italic"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_Rotation",
		"description": "设置属性状态：旋转角度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				}
			},
			"required": [
				"rotation"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_TextColor",
		"description": "设置属性状态：文本颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"textColor": {
					"type": "string",
					"description": "文本颜色"
				}
			},
			"required": [
				"textColor"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_UnderLine",
		"description": "设置属性状态：是否加下划线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"underLine": {
					"type": "boolean",
					"description": "是否加下划线"
				}
			},
			"required": [
				"underLine"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_X",
		"description": "设置属性状态：坐标 X",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				}
			},
			"required": [
				"x"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.setState_Y",
		"description": "设置属性状态：坐标 Y",
		"inputSchema": {
			"type": "object",
			"properties": {
				"y": {
					"type": "number",
					"description": "坐标 Y"
				}
			},
			"required": [
				"y"
			]
		}
	},
	{
		"name": "isch_PrimitiveText.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveText.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.done",
		"description": "将对图元的更改应用到画布",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.getState_Color",
		"description": "获取属性状态：总线颜色",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.getState_Line",
		"description": "获取属性状态：多段线坐标组",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.getState_LineType",
		"description": "获取属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.getState_LineWidth",
		"description": "获取属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.getState_Net",
		"description": "获取属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.getState_PrimitiveId",
		"description": "获取属性状态：图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.getState_PrimitiveType",
		"description": "获取属性状态：图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.isAsync",
		"description": "查询图元是否为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.setState_Color",
		"description": "设置属性状态：导线颜色",
		"inputSchema": {
			"type": "object",
			"properties": {
				"color": {
					"type": "string",
					"description": "导线颜色"
				}
			},
			"required": [
				"color"
			]
		}
	},
	{
		"name": "isch_PrimitiveWire.setState_Line",
		"description": "设置属性状态：多段线坐标组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"line": {
					"type": "string",
					"description": "多段线坐标组"
				}
			},
			"required": [
				"line"
			]
		}
	},
	{
		"name": "isch_PrimitiveWire.setState_LineType",
		"description": "设置属性状态：线型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineType": {
					"type": "string",
					"description": "线型"
				}
			},
			"required": [
				"lineType"
			]
		}
	},
	{
		"name": "isch_PrimitiveWire.setState_LineWidth",
		"description": "设置属性状态：线宽",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				}
			},
			"required": [
				"lineWidth"
			]
		}
	},
	{
		"name": "isch_PrimitiveWire.setState_Net",
		"description": "设置属性状态：网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "isch_PrimitiveWire.toAsync",
		"description": "将图元转换为异步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "isch_PrimitiveWire.toSync",
		"description": "将图元转换为同步图元",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "lib_3DModel.copy",
		"description": "复制 3D 模型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"modelUuid": {
					"type": "string",
					"description": "3D 模型 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"targetLibraryUuid": {
					"type": "string",
					"description": "目标库 UUID"
				},
				"targetClassification": {
					"type": "string",
					"description": "目标库内的分类"
				},
				"newModelName": {
					"type": "string",
					"description": "新 3D 模型名称，如若目标库内存在重名 3D 模型将导致复制失败"
				}
			},
			"required": [
				"modelUuid",
				"libraryUuid",
				"targetLibraryUuid"
			]
		}
	},
	{
		"name": "lib_3DModel.create",
		"description": "创建 3D 模型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"modelFile": {
					"type": "string",
					"description": "3D 模型文件数据"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"unit": {
					"type": "string"
				}
			},
			"required": []
		}
	},
	{
		"name": "lib_3DModel.delete",
		"description": "删除 3D 模型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"modelUuid": {
					"type": "string",
					"description": "3D 模型 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"modelUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_3DModel.get",
		"description": "获取 3D 模型的所有属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"modelUuid": {
					"type": "string",
					"description": "3D 模型 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"modelUuid"
			]
		}
	},
	{
		"name": "lib_3DModel.modify",
		"description": "修改 3D 模型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"modelUuid": {
					"type": "string",
					"description": "3D 模型 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"modelName": {
					"type": "string",
					"description": "3D 模型名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"modelUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_3DModel.search",
		"description": "搜索 3D 模型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "搜索关键字"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"classification": {
					"type": "string",
					"description": "分类，默认为全部"
				},
				"itemsOfPage": {
					"type": "number",
					"description": "一页搜索结果的数量"
				},
				"page": {
					"type": "number",
					"description": "页数"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "lib_Cbb.copy",
		"description": "复制复用模块",
		"inputSchema": {
			"type": "object",
			"properties": {
				"cbbUuid": {
					"type": "string",
					"description": "复用模块 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"targetLibraryUuid": {
					"type": "string",
					"description": "目标库 UUID"
				},
				"targetClassification": {
					"type": "string",
					"description": "目标库内的分类"
				},
				"newCbbName": {
					"type": "string",
					"description": "新复用模块名称，如若目标库内存在重名复用模块将导致复制失败"
				}
			},
			"required": [
				"cbbUuid",
				"libraryUuid",
				"targetLibraryUuid"
			]
		}
	},
	{
		"name": "lib_Cbb.create",
		"description": "创建复用模块",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"cbbName": {
					"type": "string",
					"description": "复用模块名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"libraryUuid",
				"cbbName"
			]
		}
	},
	{
		"name": "lib_Cbb.delete",
		"description": "删除复用模块",
		"inputSchema": {
			"type": "object",
			"properties": {
				"cbbUuid": {
					"type": "string",
					"description": "复用模块 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"cbbUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Cbb.get",
		"description": "获取复用模块的所有属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"cbbUuid": {
					"type": "string",
					"description": "复用模块 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"cbbUuid"
			]
		}
	},
	{
		"name": "lib_Cbb.modify",
		"description": "修改复用模块",
		"inputSchema": {
			"type": "object",
			"properties": {
				"cbbUuid": {
					"type": "string",
					"description": "复用模块 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"cbbName": {
					"type": "string",
					"description": "复用模块名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"cbbUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Cbb.openProjectInEditor",
		"description": "在编辑器打开复用模块工程",
		"inputSchema": {
			"type": "object",
			"properties": {
				"cbbUuid": {
					"type": "string",
					"description": "复用模块 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"cbbUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Cbb.openSymbolInEditor",
		"description": "在编辑器打开复用模块符号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"cbbUuid": {
					"type": "string",
					"description": "复用模块 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID，不填写则默认在最后输入焦点的分屏内打开，可以使用 DMT_EditorControl 内的接口获取"
				}
			},
			"required": [
				"cbbUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Cbb.search",
		"description": "搜索复用模块",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "搜索关键字"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"classification": {
					"type": "string",
					"description": "分类，默认为全部"
				},
				"itemsOfPage": {
					"type": "number",
					"description": "一页搜索结果的数量"
				},
				"page": {
					"type": "number",
					"description": "页数"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "lib_Classification.createPrimary",
		"description": "创建一级分类",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID"
				},
				"libraryType": {
					"type": "string",
					"description": "库类型"
				},
				"primaryClassificationName": {
					"type": "string",
					"description": "一级分类名称"
				}
			},
			"required": [
				"libraryUuid",
				"libraryType",
				"primaryClassificationName"
			]
		}
	},
	{
		"name": "lib_Classification.createSecondary",
		"description": "创建二级分类",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID"
				},
				"libraryType": {
					"type": "string",
					"description": "库类型"
				},
				"primaryClassificationUuid": {
					"type": "string",
					"description": "一级分类 UUID"
				},
				"secondaryClassificationName": {
					"type": "string",
					"description": "二级分类名称"
				}
			},
			"required": [
				"libraryUuid",
				"libraryType",
				"primaryClassificationUuid",
				"secondaryClassificationName"
			]
		}
	},
	{
		"name": "lib_Classification.deleteByIndex",
		"description": "删除指定索引的分类",
		"inputSchema": {
			"type": "object",
			"properties": {
				"classificationIndex": {
					"type": "string",
					"description": "分类索引"
				}
			},
			"required": [
				"classificationIndex"
			]
		}
	},
	{
		"name": "lib_Classification.deleteByUuid",
		"description": "删除指定 UUID 的分类",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID"
				},
				"classificationUuid": {
					"type": "string"
				}
			},
			"required": [
				"libraryUuid",
				"classificationUuid"
			]
		}
	},
	{
		"name": "lib_Classification.getAllClassificationTree",
		"description": "获取所有分类信息组成的树",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID"
				},
				"libraryType": {
					"type": "string",
					"description": "库类型"
				}
			},
			"required": [
				"libraryUuid",
				"libraryType"
			]
		}
	},
	{
		"name": "lib_Classification.getIndexByName",
		"description": "获取指定名称的分类的分类索引",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID"
				},
				"libraryType": {
					"type": "string",
					"description": "库类型"
				},
				"primaryClassificationName": {
					"type": "string",
					"description": "一级分类名称"
				},
				"secondaryClassificationName": {
					"type": "string",
					"description": "二级分类名称"
				}
			},
			"required": [
				"libraryUuid",
				"libraryType",
				"primaryClassificationName"
			]
		}
	},
	{
		"name": "lib_Classification.getNameByIndex",
		"description": "获取指定索引的分类的名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"classificationIndex": {
					"type": "string",
					"description": "分类索引"
				}
			},
			"required": [
				"classificationIndex"
			]
		}
	},
	{
		"name": "lib_Classification.getNameByUuid",
		"description": "获取指定 UUID 的分类的名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID"
				},
				"libraryType": {
					"type": "string",
					"description": "库类型"
				},
				"primaryClassificationUuid": {
					"type": "string",
					"description": "一级分类 UUID"
				},
				"secondaryClassificationUuid": {
					"type": "string",
					"description": "二级分类 UUID，如若不指定，则只获取一级分类的信息"
				}
			},
			"required": [
				"libraryUuid",
				"libraryType",
				"primaryClassificationUuid"
			]
		}
	},
	{
		"name": "lib_Device.copy",
		"description": "复制器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"deviceUuid": {
					"type": "string",
					"description": "器件 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"targetLibraryUuid": {
					"type": "string",
					"description": "目标库 UUID"
				},
				"targetClassification": {
					"type": "string",
					"description": "目标库内的分类"
				},
				"newDeviceName": {
					"type": "string",
					"description": "新器件名称，如若目标库内存在重名器件将导致复制失败"
				}
			},
			"required": [
				"deviceUuid",
				"libraryUuid",
				"targetLibraryUuid"
			]
		}
	},
	{
		"name": "lib_Device.create",
		"description": "创建器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"deviceName": {
					"type": "string",
					"description": "器件名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"association": {
					"type": "string",
					"description": "关联符号、封装、图像，指定 symbolType 则创建新符号，无需新建符号则无需指定 symbolType，但请注意，如若不新建符号也不指定符号的关联信息将无法创建器件"
				},
				"description": {
					"type": "string",
					"description": "描述"
				},
				"property": {
					"type": "string",
					"description": "其它参数，仅 designator、addIntoBom、addIntoPcb 存在默认值"
				}
			},
			"required": []
		}
	},
	{
		"name": "lib_Device.delete",
		"description": "删除器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"deviceUuid": {
					"type": "string",
					"description": "器件 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"deviceUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Device.get",
		"description": "获取器件的所有属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"deviceUuid": {
					"type": "string",
					"description": "器件 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"deviceUuid"
			]
		}
	},
	{
		"name": "lib_Device.getByLcscIds",
		"description": "使用立创 C 编号批量获取器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lcscIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "立创 C 编号数组"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"allowMultiMatch": {
					"type": "boolean",
					"description": "是否允许单个立创 C 编号匹配多个结果"
				}
			},
			"required": [
				"lcscIds"
			]
		}
	},
	{
		"name": "lib_Device.getByLcscIds",
		"description": "使用立创 C 编号批量获取器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"lcscIds": {
					"type": "string",
					"description": "立创 C 编号"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"allowMultiMatch": {
					"type": "string",
					"description": "是否允许单个立创 C 编号匹配多个结果"
				}
			},
			"required": [
				"lcscIds"
			]
		}
	},
	{
		"name": "lib_Device.modify",
		"description": "修改器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"deviceUuid": {
					"type": "string",
					"description": "器件 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"deviceName": {
					"type": "string",
					"description": "器件名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"association": {
					"type": "string",
					"description": "关联符号、封装、图像"
				},
				"description": {
					"type": "string",
					"description": "描述"
				},
				"property": {
					"type": "number",
					"description": "其它参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "lib_Device.search",
		"description": "搜索器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "搜索关键字"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"classification": {
					"type": "string",
					"description": "分类，默认为全部"
				},
				"symbolType": {
					"type": "string",
					"description": "符号类型，默认为全部"
				},
				"itemsOfPage": {
					"type": "number",
					"description": "一页搜索结果的数量"
				},
				"page": {
					"type": "number",
					"description": "页数"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "lib_Footprint.copy",
		"description": "复制封装",
		"inputSchema": {
			"type": "object",
			"properties": {
				"footprintUuid": {
					"type": "string",
					"description": "封装 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"targetLibraryUuid": {
					"type": "string",
					"description": "目标库 UUID"
				},
				"targetClassification": {
					"type": "string",
					"description": "目标库内的分类"
				},
				"newFootprintName": {
					"type": "string",
					"description": "新封装名称，如若目标库内存在重名封装将导致复制失败"
				}
			},
			"required": [
				"footprintUuid",
				"libraryUuid",
				"targetLibraryUuid"
			]
		}
	},
	{
		"name": "lib_Footprint.create",
		"description": "创建封装",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"footprintName": {
					"type": "string",
					"description": "封装名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"libraryUuid",
				"footprintName"
			]
		}
	},
	{
		"name": "lib_Footprint.delete",
		"description": "删除封装",
		"inputSchema": {
			"type": "object",
			"properties": {
				"footprintUuid": {
					"type": "string",
					"description": "封装 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"footprintUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Footprint.get",
		"description": "获取封装的所有属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"footprintUuid": {
					"type": "string",
					"description": "封装 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"footprintUuid"
			]
		}
	},
	{
		"name": "lib_Footprint.modify",
		"description": "修改封装",
		"inputSchema": {
			"type": "object",
			"properties": {
				"footprintUuid": {
					"type": "string",
					"description": "封装 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"footprintName": {
					"type": "string",
					"description": "封装名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"footprintUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Footprint.openInEditor",
		"description": "在编辑器打开文档",
		"inputSchema": {
			"type": "object",
			"properties": {
				"footprintUuid": {
					"type": "string",
					"description": "封装 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID，不填写则默认在最后输入焦点的分屏内打开，可以使用 DMT_EditorControl 内的接口获取"
				}
			},
			"required": [
				"footprintUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Footprint.search",
		"description": "搜索封装",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "搜索关键字"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"classification": {
					"type": "string",
					"description": "分类，默认为全部"
				},
				"itemsOfPage": {
					"type": "number",
					"description": "一页搜索结果的数量"
				},
				"page": {
					"type": "number",
					"description": "页数"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "lib_Footprint.updateDocumentSource",
		"description": "更新封装的文档源码",
		"inputSchema": {
			"type": "object",
			"properties": {
				"footprintUuid": {
					"type": "string",
					"description": "封装 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"documentSource": {
					"type": "string",
					"description": "文档源码"
				}
			},
			"required": [
				"footprintUuid",
				"libraryUuid",
				"documentSource"
			]
		}
	},
	{
		"name": "lib_LibrariesList.getAllLibrariesList",
		"description": "获取所有库的列表",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "lib_LibrariesList.getFavoriteLibraryUuid",
		"description": "获取收藏库的 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "lib_LibrariesList.getPersonalLibraryUuid",
		"description": "获取个人库的 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "lib_LibrariesList.getProjectLibraryUuid",
		"description": "获取工程库的 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "lib_LibrariesList.getSystemLibraryUuid",
		"description": "获取系统库的 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "lib_PanelLibrary.copy",
		"description": "复制面板库",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelLibraryUuid": {
					"type": "string",
					"description": "面板库 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"targetLibraryUuid": {
					"type": "string",
					"description": "目标库 UUID"
				},
				"targetClassification": {
					"type": "string",
					"description": "目标库内的分类"
				},
				"newPanelLibraryName": {
					"type": "string",
					"description": "新面板库名称，如若目标库内存在重名面板库将导致复制失败"
				}
			},
			"required": [
				"panelLibraryUuid",
				"libraryUuid",
				"targetLibraryUuid"
			]
		}
	},
	{
		"name": "lib_PanelLibrary.create",
		"description": "创建面板库",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"panelLibraryName": {
					"type": "string",
					"description": "面板库名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"libraryUuid",
				"panelLibraryName"
			]
		}
	},
	{
		"name": "lib_PanelLibrary.delete",
		"description": "删除面板库",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelLibraryUuid": {
					"type": "string",
					"description": "面板库 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"panelLibraryUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_PanelLibrary.get",
		"description": "获取面板库的所有属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelLibraryUuid": {
					"type": "string",
					"description": "面板库 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"panelLibraryUuid"
			]
		}
	},
	{
		"name": "lib_PanelLibrary.modify",
		"description": "修改面板库",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelLibraryUuid": {
					"type": "string",
					"description": "面板库 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"panelLibraryName": {
					"type": "string",
					"description": "面板库名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"panelLibraryUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_PanelLibrary.openInEditor",
		"description": "在编辑器打开文档",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelLibraryUuid": {
					"type": "string",
					"description": "面板库 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID，不填写则默认在最后输入焦点的分屏内打开，可以使用 DMT_EditorControl 内的接口获取"
				}
			},
			"required": [
				"panelLibraryUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_PanelLibrary.search",
		"description": "搜索面板库",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "搜索关键字"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"classification": {
					"type": "string",
					"description": "分类，默认为全部"
				},
				"itemsOfPage": {
					"type": "number",
					"description": "一页搜索结果的数量"
				},
				"page": {
					"type": "number",
					"description": "页数"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "lib_Symbol.copy",
		"description": "复制符号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"symbolUuid": {
					"type": "string",
					"description": "符号 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"targetLibraryUuid": {
					"type": "string",
					"description": "目标库 UUID"
				},
				"targetClassification": {
					"type": "string",
					"description": "目标库内的分类"
				},
				"newSymbolName": {
					"type": "string",
					"description": "新符号名称，如若目标库内存在重名符号将导致复制失败"
				}
			},
			"required": [
				"symbolUuid",
				"libraryUuid",
				"targetLibraryUuid"
			]
		}
	},
	{
		"name": "lib_Symbol.create",
		"description": "创建符号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"symbolName": {
					"type": "string",
					"description": "符号名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"symbolType": {
					"type": "string",
					"description": "符号类型"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"libraryUuid",
				"symbolName"
			]
		}
	},
	{
		"name": "lib_Symbol.delete",
		"description": "删除符号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"symbolUuid": {
					"type": "string",
					"description": "符号 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"symbolUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Symbol.get",
		"description": "获取符号的所有属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"symbolUuid": {
					"type": "string",
					"description": "符号 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"symbolUuid"
			]
		}
	},
	{
		"name": "lib_Symbol.modify",
		"description": "修改符号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"symbolUuid": {
					"type": "string",
					"description": "符号 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"symbolName": {
					"type": "string",
					"description": "符号名称"
				},
				"classification": {
					"type": "string",
					"description": "分类"
				},
				"description": {
					"type": "string",
					"description": "描述"
				}
			},
			"required": [
				"symbolUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Symbol.openInEditor",
		"description": "在编辑器打开文档",
		"inputSchema": {
			"type": "object",
			"properties": {
				"symbolUuid": {
					"type": "string",
					"description": "符号 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"splitScreenId": {
					"type": "string",
					"description": "分屏 ID，不填写则默认在最后输入焦点的分屏内打开，可以使用 DMT_EditorControl 内的接口获取"
				}
			},
			"required": [
				"symbolUuid",
				"libraryUuid"
			]
		}
	},
	{
		"name": "lib_Symbol.search",
		"description": "搜索符号",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "搜索关键字"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，默认为系统库，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"classification": {
					"type": "string",
					"description": "分类，默认为全部"
				},
				"symbolType": {
					"type": "string",
					"description": "符号类型，默认为全部"
				},
				"itemsOfPage": {
					"type": "number",
					"description": "一页搜索结果的数量"
				},
				"page": {
					"type": "number",
					"description": "页数"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "lib_Symbol.updateDocumentSource",
		"description": "更新符号的文档源码",
		"inputSchema": {
			"type": "object",
			"properties": {
				"symbolUuid": {
					"type": "string",
					"description": "符号 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"documentSource": {
					"type": "string",
					"description": "文档源码"
				}
			},
			"required": [
				"symbolUuid",
				"libraryUuid",
				"documentSource"
			]
		}
	},
	{
		"name": "pcb_Document.convertCanvasOriginToDataOrigin",
		"description": "输入画布坐标返回该坐标对应的数据坐标",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number"
				},
				"y": {
					"type": "number"
				}
			},
			"required": [
				"x",
				"y"
			]
		}
	},
	{
		"name": "pcb_Document.convertDataOriginToCanvasOrigin",
		"description": "输入数据坐标返回该坐标对应的画布坐标",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "数据原点 X"
				},
				"y": {
					"type": "number",
					"description": "数据原点 Y"
				}
			},
			"required": [
				"x",
				"y"
			]
		}
	},
	{
		"name": "pcb_Document.getCalculatingRatlineStatus",
		"description": "获取当前飞线计算功能状态",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Document.getCanvasOrigin",
		"description": "获取画布原点相对于数据原点的偏移坐标",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Document.getPrimitiveAtPoint",
		"description": "获取坐标点的图元",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标点 X"
				},
				"y": {
					"type": "number",
					"description": "坐标点 Y"
				}
			},
			"required": [
				"x",
				"y"
			]
		}
	},
	{
		"name": "pcb_Document.getPrimitivesInRegion",
		"description": "获取区域内所有图元",
		"inputSchema": {
			"type": "object",
			"properties": {
				"left": {
					"type": "number",
					"description": "矩形框第一 X 坐标"
				},
				"right": {
					"type": "number",
					"description": "矩形框第二 X 坐标"
				},
				"top": {
					"type": "number",
					"description": "矩形框第一 Y 坐标"
				},
				"bottom": {
					"type": "number",
					"description": "矩形框第二 Y 坐标"
				},
				"leftToRight": {
					"type": "boolean",
					"description": "是否仅获取完全框选的图元，false 则触碰即获取"
				}
			},
			"required": [
				"left",
				"right",
				"top",
				"bottom"
			]
		}
	},
	{
		"name": "pcb_Document.importAutoLayoutJsonFile",
		"description": "导入自动布局文件（JSON）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"autoLayoutFile": {
					"type": "string",
					"description": "欲导入的 JSON 文件"
				}
			},
			"required": [
				"autoLayoutFile"
			]
		}
	},
	{
		"name": "pcb_Document.importAutoRouteJsonFile",
		"description": "导入自动布线文件（JSON）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"autoRouteFile": {
					"type": "string",
					"description": "欲导入的 JSON 文件"
				}
			},
			"required": [
				"autoRouteFile"
			]
		}
	},
	{
		"name": "pcb_Document.importChanges",
		"description": "从原理图导入变更",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uuid": {
					"type": "string",
					"description": "原理图 UUID，默认为关联在同一个 Board 下的原理图"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Document.navigateToCoordinates",
		"description": "定位到画布坐标",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				}
			},
			"required": [
				"x",
				"y"
			]
		}
	},
	{
		"name": "pcb_Document.navigateToRegion",
		"description": "定位到画布区域",
		"inputSchema": {
			"type": "object",
			"properties": {
				"left": {
					"type": "number",
					"description": "矩形框第一 X 坐标"
				},
				"right": {
					"type": "number",
					"description": "矩形框第二 X 坐标"
				},
				"top": {
					"type": "number",
					"description": "矩形框第一 Y 坐标"
				},
				"bottom": {
					"type": "number",
					"description": "矩形框第二 Y 坐标"
				}
			},
			"required": [
				"left",
				"right",
				"top",
				"bottom"
			]
		}
	},
	{
		"name": "pcb_Document.save",
		"description": "保存文档",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uuid": {
					"type": "string"
				}
			},
			"required": [
				"uuid"
			]
		}
	},
	{
		"name": "pcb_Document.setCanvasOrigin",
		"description": "设置画布原点相对于数据原点的偏移坐标",
		"inputSchema": {
			"type": "object",
			"properties": {
				"offsetX": {
					"type": "number",
					"description": "画布原点相对于数据原点的 X 坐标偏移"
				},
				"offsetY": {
					"type": "number",
					"description": "画布原点相对于数据原点的 Y 坐标偏移"
				}
			},
			"required": [
				"offsetX",
				"offsetY"
			]
		}
	},
	{
		"name": "pcb_Document.startCalculatingRatline",
		"description": "启动飞线计算功能",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Document.stopCalculatingRatline",
		"description": "停止飞线计算功能",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Document.zoomToBoardOutline",
		"description": "缩放到板框（适应板框）",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.addNetToEqualLengthNetGroup",
		"description": "将网络添加到等长网络组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"equalLengthNetGroupName": {
					"type": "string",
					"description": "等长网络组名称"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"equalLengthNetGroupName",
				"net"
			]
		}
	},
	{
		"name": "pcb_Drc.addNetToNetClass",
		"description": "将网络添加到网络类",
		"inputSchema": {
			"type": "object",
			"properties": {
				"netClassName": {
					"type": "string",
					"description": "网络类名称"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"netClassName",
				"net"
			]
		}
	},
	{
		"name": "pcb_Drc.addPadPairToPadPairGroup",
		"description": "将焊盘对添加到焊盘对组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"padPairGroupName": {
					"type": "string",
					"description": "焊盘对组名称"
				},
				"padPair": {
					"type": "string",
					"description": "焊盘对"
				}
			},
			"required": [
				"padPairGroupName",
				"padPair"
			]
		}
	},
	{
		"name": "pcb_Drc.check",
		"description": "检查 DRC",
		"inputSchema": {
			"type": "object",
			"properties": {
				"strict": {
					"type": "boolean",
					"description": "是否严格检查，当前 PCB 统一为严格检查模式"
				},
				"userInterface": {
					"type": "boolean",
					"description": "是否显示 UI（呼出底部 DRC 窗口）"
				},
				"includeVerboseError": {
					"type": "string",
					"description": "是否在返回值中包含详细错误信息，如若为 true，则返回值将始终为数组"
				}
			},
			"required": [
				"strict",
				"userInterface",
				"includeVerboseError"
			]
		}
	},
	{
		"name": "pcb_Drc.check",
		"description": "检查 DRC",
		"inputSchema": {
			"type": "object",
			"properties": {
				"strict": {
					"type": "boolean",
					"description": "是否严格检查，当前 PCB 统一为严格检查模式"
				},
				"userInterface": {
					"type": "boolean",
					"description": "是否显示 UI（呼出底部 DRC 窗口）"
				},
				"includeVerboseError": {
					"type": "string",
					"description": "是否在返回值中包含详细错误信息，如若为 true，则返回值将始终为数组"
				}
			},
			"required": [
				"strict",
				"userInterface",
				"includeVerboseError"
			]
		}
	},
	{
		"name": "pcb_Drc.createDifferentialPair",
		"description": "创建差分对",
		"inputSchema": {
			"type": "object",
			"properties": {
				"differentialPairName": {
					"type": "string",
					"description": "差分对名称"
				},
				"positiveNet": {
					"type": "string",
					"description": "正网络名称"
				},
				"negativeNet": {
					"type": "string",
					"description": "负网络名称"
				}
			},
			"required": [
				"differentialPairName",
				"positiveNet",
				"negativeNet"
			]
		}
	},
	{
		"name": "pcb_Drc.createEqualLengthNetGroup",
		"description": "创建等长网络组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"equalLengthNetGroupName": {
					"type": "string",
					"description": "等长网络组名称"
				},
				"nets": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "网络名称数组"
				},
				"color": {
					"type": "string",
					"description": "等长网络组颜色"
				}
			},
			"required": [
				"equalLengthNetGroupName",
				"nets",
				"color"
			]
		}
	},
	{
		"name": "pcb_Drc.createNetClass",
		"description": "创建网络类",
		"inputSchema": {
			"type": "object",
			"properties": {
				"netClassName": {
					"type": "string",
					"description": "网络类名称"
				},
				"nets": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "网络名称数组"
				},
				"color": {
					"type": "string",
					"description": "网络类颜色"
				}
			},
			"required": [
				"netClassName",
				"nets",
				"color"
			]
		}
	},
	{
		"name": "pcb_Drc.createPadPairGroup",
		"description": "创建焊盘对组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"padPairGroupName": {
					"type": "string",
					"description": "焊盘对组名称"
				},
				"padPairs": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "焊盘对数组"
				}
			},
			"required": [
				"padPairGroupName",
				"padPairs"
			]
		}
	},
	{
		"name": "pcb_Drc.deleteDifferentialPair",
		"description": "删除差分对",
		"inputSchema": {
			"type": "object",
			"properties": {
				"differentialPairName": {
					"type": "string",
					"description": "差分对名称"
				}
			},
			"required": [
				"differentialPairName"
			]
		}
	},
	{
		"name": "pcb_Drc.deleteEqualLengthNetGroup",
		"description": "删除等长网络组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"equalLengthNetGroupName": {
					"type": "string",
					"description": "等长网络组名称"
				}
			},
			"required": [
				"equalLengthNetGroupName"
			]
		}
	},
	{
		"name": "pcb_Drc.deleteNetClass",
		"description": "删除网络类",
		"inputSchema": {
			"type": "object",
			"properties": {
				"netClassName": {
					"type": "string",
					"description": "网络类名称"
				}
			},
			"required": [
				"netClassName"
			]
		}
	},
	{
		"name": "pcb_Drc.deletePadPairGroup",
		"description": "删除焊盘对组",
		"inputSchema": {
			"type": "object",
			"properties": {
				"padPairGroupName": {
					"type": "string",
					"description": "焊盘对组名称"
				}
			},
			"required": [
				"padPairGroupName"
			]
		}
	},
	{
		"name": "pcb_Drc.deleteRuleConfiguration",
		"description": "删除设计规则配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"configurationName": {
					"type": "string",
					"description": "配置名称"
				}
			},
			"required": [
				"configurationName"
			]
		}
	},
	{
		"name": "pcb_Drc.getAllDifferentialPairs",
		"description": "获取所有差分对的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getAllEqualLengthNetGroups",
		"description": "获取所有等长网络组的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getAllNetClasses",
		"description": "获取所有网络类的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getAllPadPairGroups",
		"description": "获取所有焊盘对组的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getAllRuleConfigurations",
		"description": "获取所有设计规则配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"includeSystem": {
					"type": "boolean",
					"description": "是否获取系统设计规则配置"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getCurrentRuleConfiguration",
		"description": "获取当前设计规则配置",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getCurrentRuleConfigurationName",
		"description": "获取当前设计规则配置名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getDefaultRuleConfigurationName",
		"description": "获取新建 PCB 默认设计规则配置的名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getNetByNetRules",
		"description": "获取网络-网络规则",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getNetRules",
		"description": "获取网络规则",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getPadPairGroupMinWireLength",
		"description": "获取焊盘对组最短导线长度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"padPairGroupName": {
					"type": "string",
					"description": "焊盘对组名称"
				}
			},
			"required": [
				"padPairGroupName"
			]
		}
	},
	{
		"name": "pcb_Drc.getRegionRules",
		"description": "获取区域规则",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.getRuleConfiguration",
		"description": "获取指定设计规则配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"configurationName": {
					"type": "string",
					"description": "配置名称"
				}
			},
			"required": [
				"configurationName"
			]
		}
	},
	{
		"name": "pcb_Drc.modifyDifferentialPairName",
		"description": "修改差分对的名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"originalDifferentialPairName": {
					"type": "string",
					"description": "原差分对名称"
				},
				"differentialPairName": {
					"type": "string",
					"description": "新差分对名称"
				}
			},
			"required": [
				"originalDifferentialPairName",
				"differentialPairName"
			]
		}
	},
	{
		"name": "pcb_Drc.modifyDifferentialPairNegativeNet",
		"description": "修改差分对负网络",
		"inputSchema": {
			"type": "object",
			"properties": {
				"differentialPairName": {
					"type": "string",
					"description": "差分对名称"
				},
				"negativeNet": {
					"type": "string",
					"description": "负网络名称"
				}
			},
			"required": [
				"differentialPairName",
				"negativeNet"
			]
		}
	},
	{
		"name": "pcb_Drc.modifyDifferentialPairPositiveNet",
		"description": "修改差分对正网络",
		"inputSchema": {
			"type": "object",
			"properties": {
				"differentialPairName": {
					"type": "string",
					"description": "差分对名称"
				},
				"positiveNet": {
					"type": "string",
					"description": "正网络名称"
				}
			},
			"required": [
				"differentialPairName",
				"positiveNet"
			]
		}
	},
	{
		"name": "pcb_Drc.modifyEqualLengthNetGroupName",
		"description": "修改等长网络组的名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"originalEqualLengthNetGroupName": {
					"type": "string",
					"description": "原等长网络组名称"
				},
				"equalLengthNetGroupName": {
					"type": "string",
					"description": "新等长网络组名称"
				}
			},
			"required": [
				"originalEqualLengthNetGroupName",
				"equalLengthNetGroupName"
			]
		}
	},
	{
		"name": "pcb_Drc.modifyNetClassName",
		"description": "修改网络类的名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"originalNetClassName": {
					"type": "string",
					"description": "原网络类名称"
				},
				"netClassName": {
					"type": "string",
					"description": "新网络类名称"
				}
			},
			"required": [
				"originalNetClassName",
				"netClassName"
			]
		}
	},
	{
		"name": "pcb_Drc.modifyPadPairGroupName",
		"description": "修改焊盘对组的名称",
		"inputSchema": {
			"type": "object",
			"properties": {
				"originalPadPairGroupName": {
					"type": "string",
					"description": "原焊盘对组名称"
				},
				"padPairGroupName": {
					"type": "string",
					"description": "新焊盘对组名称"
				}
			},
			"required": [
				"originalPadPairGroupName",
				"padPairGroupName"
			]
		}
	},
	{
		"name": "pcb_Drc.overwriteNetByNetRules",
		"description": "覆写网络-网络规则",
		"inputSchema": {
			"type": "object",
			"properties": {
				"netByNetRules": {
					"type": "string",
					"description": "网络-网络规则"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.overwriteNetRules",
		"description": "覆写网络规则",
		"inputSchema": {
			"type": "object",
			"properties": {
				"netRules": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "网络规则"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.overwriteRegionRules",
		"description": "覆写区域规则",
		"inputSchema": {
			"type": "object",
			"properties": {
				"regionRules": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "区域规则"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.removeNetFromEqualLengthNetGroup",
		"description": "从等长网络组中移除网络",
		"inputSchema": {
			"type": "object",
			"properties": {
				"equalLengthNetGroupName": {
					"type": "string",
					"description": "等长网络组名称"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"equalLengthNetGroupName",
				"net"
			]
		}
	},
	{
		"name": "pcb_Drc.removeNetFromNetClass",
		"description": "从网络类中移除网络",
		"inputSchema": {
			"type": "object",
			"properties": {
				"netClassName": {
					"type": "string",
					"description": "网络类名称"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"netClassName",
				"net"
			]
		}
	},
	{
		"name": "pcb_Drc.removePadPairFromPadPairGroup",
		"description": "从焊盘对组中移除焊盘对",
		"inputSchema": {
			"type": "object",
			"properties": {
				"padPairGroupName": {
					"type": "string",
					"description": "焊盘对组名称"
				},
				"padPair": {
					"type": "string",
					"description": "焊盘对"
				}
			},
			"required": [
				"padPairGroupName",
				"padPair"
			]
		}
	},
	{
		"name": "pcb_Drc.renameRuleConfiguration",
		"description": "重命名设计规则配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"originalConfigurationName": {
					"type": "string",
					"description": "原设计规则配置名称"
				},
				"configurationName": {
					"type": "string",
					"description": "新设计规则配置名称"
				}
			},
			"required": [
				"originalConfigurationName",
				"configurationName"
			]
		}
	},
	{
		"name": "pcb_Drc.saveRuleConfiguration",
		"description": "保存设计规则配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"ruleConfiguration": {
					"type": "string",
					"description": "设计规则配置"
				},
				"configurationName": {
					"type": "string",
					"description": "配置名称"
				},
				"allowOverwrite": {
					"type": "boolean",
					"description": "是否允许覆写同名设计规则配置，false 则将在遇到同名设计规则配置时返回 false，请注意可能的数据丢失风险"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Drc.setAsDefaultRuleConfiguration",
		"description": "设置为新建 PCB 默认设计规则配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"configurationName": {
					"type": "string",
					"description": "配置名称"
				}
			},
			"required": [
				"configurationName"
			]
		}
	},
	{
		"name": "pcb_Event.addMouseEventListener",
		"description": "新增鼠标事件监听",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "事件 ID，用以防止重复注册事件"
				},
				"eventType": {
					"type": "string",
					"description": "事件类型"
				},
				"callFn": {
					"type": "string",
					"description": "事件触发时的回调函数"
				},
				"onlyOnce": {
					"type": "boolean",
					"description": "是否仅监听一次"
				}
			},
			"required": [
				"id",
				"eventType",
				"callFn"
			]
		}
	},
	{
		"name": "pcb_Event.isEventListenerAlreadyExist",
		"description": "查询事件监听是否存在",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "事件 ID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "pcb_Event.removeEventListener",
		"description": "移除事件监听",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "事件 ID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "pcb_Layer.addCustomLayer",
		"description": "新增自定义层",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Layer.getAllLayers",
		"description": "获取所有图层的详细属性",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Layer.lockLayer",
		"description": "锁定层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层，如若不指定任何层则默认为所有层"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Layer.modifyLayer",
		"description": "修改图层属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "number",
					"description": "层"
				},
				"property": {
					"type": "string",
					"description": "属性"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Layer.removeLayer",
		"description": "移除层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "pcb_Layer.selectLayer",
		"description": "选中图层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "number",
					"description": "层"
				}
			},
			"required": [
				"layer"
			]
		}
	},
	{
		"name": "pcb_Layer.setInactiveLayerDisplayMode",
		"description": "设置非激活层展示模式",
		"inputSchema": {
			"type": "object",
			"properties": {
				"displayMode": {
					"type": "string",
					"description": "展示模式"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Layer.setInactiveLayerTransparency",
		"description": "设置非激活层透明度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"transparency": {
					"type": "number",
					"description": "透明度，范围 0-100"
				}
			},
			"required": [
				"transparency"
			]
		}
	},
	{
		"name": "pcb_Layer.setLayerColorConfiguration",
		"description": "设置层颜色配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"colorConfiguration": {
					"type": "string",
					"description": "颜色配置"
				}
			},
			"required": [
				"colorConfiguration"
			]
		}
	},
	{
		"name": "pcb_Layer.setLayerInvisible",
		"description": "将层设置为不可见",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层，如若不指定任何层则默认为所有层"
				},
				"setOtherLayerVisible": {
					"type": "boolean",
					"description": "是否将其它层设置为可见"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Layer.setLayerVisible",
		"description": "将层设置为可见",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层，如若不指定任何层则默认为所有层"
				},
				"setOtherLayerInvisible": {
					"type": "boolean",
					"description": "是否将其它层设置为不可见"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Layer.setPcbType",
		"description": "设置 PCB 类型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"pcbType": {
					"type": "string",
					"description": "PCB 类型"
				}
			},
			"required": [
				"pcbType"
			]
		}
	},
	{
		"name": "pcb_Layer.setTheNumberOfCopperLayers",
		"description": "设置铜箔层数",
		"inputSchema": {
			"type": "object",
			"properties": {
				"numberOfLayers": {
					"type": "string",
					"description": "层数"
				}
			},
			"required": [
				"numberOfLayers"
			]
		}
	},
	{
		"name": "pcb_Layer.unlockLayer",
		"description": "取消锁定层",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层，如若不指定任何层则默认为所有层"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.deleteBomTemplate",
		"description": "删除 BOM 模板",
		"inputSchema": {
			"type": "object",
			"properties": {
				"template": {
					"type": "string",
					"description": "BOM 模板名称"
				}
			},
			"required": [
				"template"
			]
		}
	},
	{
		"name": "pcb_ManufactureData.get3DFile",
		"description": "获取 3D 模型文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"fileType": {
					"type": "string",
					"description": "文件类型"
				},
				"element": {
					"type": "string",
					"description": "导出对象"
				},
				"modelMode": {
					"type": "string",
					"description": "导出模式，Outfit = 装配体，Parts = 零件"
				},
				"autoGenerateModels": {
					"type": "boolean",
					"description": "是否为未绑定 3D 模型的元件自动生成 3D 模型（根据元件的“高度”属性）"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.get3DShellFile",
		"description": "获取 3D 外壳文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"fileType": {
					"type": "string",
					"description": "文件类型"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getAltiumDesignerFile",
		"description": "获取 Altium Designer 文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getAutoLayoutJsonFile",
		"description": "获取自动布局文件（JSON）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getAutoRouteJsonFile",
		"description": "获取自动布线文件（JSON）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getBomFile",
		"description": "获取 BOM 文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"fileType": {
					"type": "string",
					"description": "文件类型"
				},
				"template": {
					"type": "string",
					"description": "模板名称"
				},
				"filterOptions": {
					"type": "string",
					"description": "过滤规则，仅应包含需要启用的规则，property 为规则名称，includeValue 为匹配的值"
				},
				"statistics": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "统计，包含所有需要启用的统计项的名称"
				},
				"property": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "属性，包含所有需要启用的属性的名称"
				},
				"columns": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "列的属性及排序，title、sort、group、orderWeight 不传入则取默认值，null 代表 **无** 或 **空**"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getBomTemplateFile",
		"description": "获取 BOM 模板文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"template": {
					"type": "string",
					"description": "BOM 模板名称"
				}
			},
			"required": [
				"template"
			]
		}
	},
	{
		"name": "pcb_ManufactureData.getBomTemplates",
		"description": "获取 BOM 模板列表",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getDsnFile",
		"description": "获取自动布线文件（DSN）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getDxfFile",
		"description": "获取 DXF 文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"layers": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "导出层"
				},
				"objects": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "导出对象"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getFlyingProbeTestFile",
		"description": "获取飞针测试文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getGerberFile",
		"description": "获取 PCB 制版文件（Gerber）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"colorSilkscreen": {
					"type": "boolean",
					"description": "是否生成彩色丝印制造文件（嘉立创专用文件）"
				},
				"unit": {
					"type": "string",
					"description": "单位"
				},
				"digitalFormat": {
					"type": "number",
					"description": "数字格式"
				},
				"other": {
					"type": "boolean",
					"description": "其它"
				},
				"layers": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "导出层，默认则按照嘉立创生产需求导出"
				},
				"objects": {
					"type": "string",
					"description": "导出对象，默认则按照嘉立创生产需求导出"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getIpcD356AFile",
		"description": "获取 IPC-D-356A 文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getNetlistFile",
		"description": "获取网表文件（Netlist）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"netlistType": {
					"type": "string",
					"description": "网表类型"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getOpenDatabaseDoublePlusFile",
		"description": "获取 ODB++ 文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"unit": {
					"type": "string",
					"description": "单位"
				},
				"otherData": {
					"type": "boolean",
					"description": "其它"
				},
				"layers": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "导出层，默认则按照嘉立创生产需求导出"
				},
				"objects": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "导出对象，默认则按照嘉立创生产需求导出"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getPadsFile",
		"description": "获取 PADS 文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getPcbInfoFile",
		"description": "获取 PCB 信息文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getPdfFile",
		"description": "获取 PDF 文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"outputMethod": {
					"type": "string",
					"description": "输出方式"
				},
				"contentConfig": {
					"type": "boolean",
					"description": "内容配置"
				},
				"watermark": {
					"type": "string",
					"description": "水印"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getPickAndPlaceFile",
		"description": "获取坐标文件（PickAndPlace）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"fileType": {
					"type": "string",
					"description": "文件类型"
				},
				"unit": {
					"type": "string",
					"description": "单位"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.getTestPointFile",
		"description": "获取测试点报告文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"fileType": {
					"type": "string",
					"description": "文件类型"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.place3DShellOrder",
		"description": "3D 外壳下单",
		"inputSchema": {
			"type": "object",
			"properties": {
				"interactive": {
					"type": "boolean",
					"description": "是否启用交互式检查如若启用，则会存在弹窗等待用户进行交互，且无法使用 ignoreWarning 参数忽略警告， 即 ignoreWarning 参数将被忽略；如若禁用，则在调用后不会有任何 EDA 内部弹窗，程序执行静默检查， 如若达成下单条件，将返回 true 并在新标签页打开下单页面"
				},
				"ignoreWarning": {
					"type": "boolean",
					"description": "在非交互式检查时忽略警告如果设置为 true，将会忽略所有检查警告项并尽可能生成下单资料；如果设置为 false，存在任意警告将中断执行并返回 false 的结果"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.placeComponentsOrder",
		"description": "元件下单",
		"inputSchema": {
			"type": "object",
			"properties": {
				"interactive": {
					"type": "boolean",
					"description": "是否启用交互式检查如若启用，则会存在弹窗等待用户进行交互，且无法使用 ignoreWarning 参数忽略警告， 即 ignoreWarning 参数将被忽略；如若禁用，则在调用后不会有任何 EDA 内部弹窗，程序执行静默检查， 如若达成下单条件，将返回 true 并在新标签页打开下单页面"
				},
				"ignoreWarning": {
					"type": "boolean",
					"description": "在非交互式检查时忽略警告如果设置为 true，将会忽略所有检查警告项并尽可能生成下单资料；如果设置为 false，存在任意警告将中断执行并返回 false 的结果"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.placePcbOrder",
		"description": "PCB 下单",
		"inputSchema": {
			"type": "object",
			"properties": {
				"interactive": {
					"type": "boolean",
					"description": "是否启用交互式检查如若启用，则会存在弹窗等待用户进行交互，且无法使用 ignoreWarning 参数忽略警告， 即 ignoreWarning 参数将被忽略；如若禁用，则在调用后不会有任何 EDA 内部弹窗，程序执行静默检查， 如若达成下单条件，将返回 true 并在新标签页打开下单页面"
				},
				"ignoreWarning": {
					"type": "boolean",
					"description": "在非交互式检查时忽略警告如果设置为 true，将会忽略所有检查警告项并尽可能生成下单资料；如果设置为 false，存在任意警告将中断执行并返回 false 的结果"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.placeSmtComponentsOrder",
		"description": "SMT 元件下单",
		"inputSchema": {
			"type": "object",
			"properties": {
				"interactive": {
					"type": "boolean",
					"description": "是否启用交互式检查如若启用，则会存在弹窗等待用户进行交互，且无法使用 ignoreWarning 参数忽略警告， 即 ignoreWarning 参数将被忽略；如若禁用，则在调用后不会有任何 EDA 内部弹窗，程序执行静默检查， 如若达成下单条件，将返回 true 并在新标签页打开下单页面"
				},
				"ignoreWarning": {
					"type": "boolean",
					"description": "在非交互式检查时忽略警告如果设置为 true，将会忽略所有检查警告项并尽可能生成下单资料；如果设置为 false，存在任意警告将中断执行并返回 false 的结果"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_ManufactureData.uploadBomTemplateFile",
		"description": "上传 BOM 模板文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"templateFile": {
					"type": "string",
					"description": "BOM 模板文件"
				},
				"template": {
					"type": "string",
					"description": "BOM 模板名称，如若为 undefined 则自动从 templateFile 中取值"
				}
			},
			"required": [
				"templateFile"
			]
		}
	},
	{
		"name": "pcb_MathPolygon.calculateBBoxHeight",
		"description": "参数",
		"inputSchema": {
			"type": "object",
			"properties": {
				"complexPolygon": {
					"type": "string"
				}
			},
			"required": [
				"complexPolygon"
			]
		}
	},
	{
		"name": "pcb_MathPolygon.calculateBBoxWidth",
		"description": "参数",
		"inputSchema": {
			"type": "object",
			"properties": {
				"complexPolygon": {
					"type": "string"
				}
			},
			"required": [
				"complexPolygon"
			]
		}
	},
	{
		"name": "pcb_MathPolygon.convertImageToComplexPolygon",
		"description": "将图像转换为复杂多边形对象",
		"inputSchema": {
			"type": "object",
			"properties": {
				"imageBlob": {
					"type": "string",
					"description": "图像 Blob 文件，可以使用 方法从文件系统读取文件"
				},
				"imageWidth": {
					"type": "number",
					"description": "图像宽度"
				},
				"imageHeight": {
					"type": "number",
					"description": "图像高度"
				},
				"tolerance": {
					"type": "number",
					"description": "容差，取值范围 0-1"
				},
				"simplification": {
					"type": "number",
					"description": "简化，取值范围 0-1"
				},
				"smoothing": {
					"type": "number",
					"description": "平滑，取值范围 0-1.33"
				},
				"despeckling": {
					"type": "number",
					"description": "去斑，取值范围 0-5"
				},
				"whiteAsBackgroundColor": {
					"type": "boolean",
					"description": "是否白色作为背景色"
				},
				"inversion": {
					"type": "boolean",
					"description": "是否反相"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_MathPolygon.createComplexPolygon",
		"description": "创建复杂多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"complexPolygon": {
					"type": "string",
					"description": "复杂多边形数据"
				}
			},
			"required": [
				"complexPolygon"
			]
		}
	},
	{
		"name": "pcb_MathPolygon.createPolygon",
		"description": "创建单多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"polygon": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "单多边形数据"
				}
			},
			"required": [
				"polygon"
			]
		}
	},
	{
		"name": "pcb_MathPolygon.splitPolygon",
		"description": "拆分单多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"complexPolygons": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "复杂多边形"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Net.getAllNetName",
		"description": "获取所有网络的网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Net.getAllNetsName",
		"description": "获取所有网络的网络名称",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_Net.getAllPrimitivesByNet",
		"description": "获取关联指定网络的所有图元",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"primitiveTypes": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "图元类型数组，如若指定图元类型不存在网络属性，返回的数据将恒为空"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "pcb_Net.getNetLength",
		"description": "获取指定网络的长度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "pcb_Net.getNetlist",
		"description": "获取网表",
		"inputSchema": {
			"type": "object",
			"properties": {
				"type": {
					"type": "string",
					"description": "网表格式"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_Net.highlightNet",
		"description": "高亮网络",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "pcb_Net.selectNet",
		"description": "选中网络",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "pcb_Net.setNetlist",
		"description": "更新网表",
		"inputSchema": {
			"type": "object",
			"properties": {
				"type": {
					"type": "string",
					"description": "网表格式"
				},
				"netlist": {
					"type": "string",
					"description": "网表数据"
				}
			},
			"required": [
				"type",
				"netlist"
			]
		}
	},
	{
		"name": "pcb_Net.unhighlightNet",
		"description": "取消高亮网络",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": [
				"net"
			]
		}
	},
	{
		"name": "pcb_Primitive.getPrimitivesBBox",
		"description": "获取图元的 BBox",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "图元 ID 数组或图元对象数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveArc.create",
		"description": "创建圆弧线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"startX": {
					"type": "number",
					"description": "起始位置 X"
				},
				"startY": {
					"type": "number",
					"description": "起始位置 Y"
				},
				"endX": {
					"type": "number",
					"description": "终止位置 X"
				},
				"endY": {
					"type": "number",
					"description": "终止位置 Y"
				},
				"arcAngle": {
					"type": "number",
					"description": "圆弧角度"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				},
				"interactiveMode": {
					"type": "number",
					"description": "交互模式"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveArc.delete",
		"description": "删除圆弧线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "圆弧线的图元 ID 或圆弧线图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveArc.get",
		"description": "获取圆弧线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "圆弧线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveArc.get",
		"description": "获取圆弧线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "圆弧线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveArc.getAll",
		"description": "获取所有圆弧线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveArc.getAllPrimitiveId",
		"description": "获取所有圆弧线的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveArc.modify",
		"description": "修改圆弧线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveComponent.create",
		"description": "创建器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveComponent.delete",
		"description": "删除器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "器件的图元 ID 或器件图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveComponent.get",
		"description": "获取器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveComponent.get",
		"description": "获取器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveComponent.getAll",
		"description": "获取所有器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveComponent.getAllPinsByPrimitiveId",
		"description": "获取器件关联的所有焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "器件图元 ID"
				}
			},
			"required": [
				"primitiveId"
			]
		}
	},
	{
		"name": "pcb_PrimitiveComponent.getAllPrimitiveId",
		"description": "获取所有器件的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveComponent.modify",
		"description": "修改器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveDimension.create",
		"description": "创建尺寸标注",
		"inputSchema": {
			"type": "object",
			"properties": {
				"dimensionType": {
					"type": "string",
					"description": "尺寸标注类型"
				},
				"coordinateSet": {
					"type": "string",
					"description": "尺寸标注坐标集"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"unit": {
					"type": "string",
					"description": "单位"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				},
				"precision": {
					"type": "number",
					"description": "精度，取值范围 0-4"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveDimension.delete",
		"description": "删除尺寸标注",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "尺寸标注的图元 ID 或尺寸标注图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveDimension.get",
		"description": "获取尺寸标注",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "尺寸标注的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveDimension.get",
		"description": "获取尺寸标注",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "尺寸标注的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveDimension.getAll",
		"description": "获取所有尺寸标注",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveDimension.getAllPrimitiveId",
		"description": "获取所有尺寸标注的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveDimension.modify",
		"description": "修改尺寸标注",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveFill.create",
		"description": "创建填充",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"complexPolygon": {
					"type": "string",
					"description": "复杂多边形对象"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"fillMode": {
					"type": "string",
					"description": "填充模式"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"layer",
				"complexPolygon"
			]
		}
	},
	{
		"name": "pcb_PrimitiveFill.delete",
		"description": "删除填充",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "填充的图元 ID 或填充图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveFill.get",
		"description": "获取填充",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "填充的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveFill.get",
		"description": "获取填充",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "填充的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveFill.getAll",
		"description": "获取所有填充",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveFill.getAllPrimitiveId",
		"description": "获取所有填充的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveFill.modify",
		"description": "修改填充",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveImage.create",
		"description": "创建图像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "BBox 左上点坐标 X"
				},
				"y": {
					"type": "number",
					"description": "BBox 左上点坐标 Y"
				},
				"complexPolygon": {
					"type": "string",
					"description": "图像源数据（复杂多边形），可以使用 PCB_MathPolygon.convertImageToComplexPolygon() 方法将图像文件转换为复杂多边形数据"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"width": {
					"type": "number",
					"description": "宽"
				},
				"height": {
					"type": "number",
					"description": "高"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				},
				"horizonMirror": {
					"type": "boolean",
					"description": "是否水平镜像"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveImage.delete",
		"description": "删除图像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "图像的图元 ID 或图像图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveImage.get",
		"description": "获取图像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "图像的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveImage.get",
		"description": "获取图像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "图像的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveImage.getAll",
		"description": "获取所有图像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveImage.getAllPrimitiveId",
		"description": "获取所有图像的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveImage.modify",
		"description": "修改图像",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "number",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveLine.create",
		"description": "创建直线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"startX": {
					"type": "number",
					"description": "起始位置 X"
				},
				"startY": {
					"type": "number",
					"description": "起始位置 Y"
				},
				"endX": {
					"type": "number",
					"description": "终止位置 X"
				},
				"endY": {
					"type": "number",
					"description": "终止位置 Y"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"net",
				"layer",
				"startX",
				"startY",
				"endX",
				"endY"
			]
		}
	},
	{
		"name": "pcb_PrimitiveLine.delete",
		"description": "删除直线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "直线的图元 ID 或直线图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveLine.get",
		"description": "获取直线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "直线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveLine.get",
		"description": "获取直线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "直线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveLine.getAll",
		"description": "获取所有直线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveLine.getAllPrimitiveId",
		"description": "获取所有直线的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveLine.modify",
		"description": "修改直线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveObject.create",
		"description": "创建二进制内嵌对象",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "object",
					"description": "层"
				},
				"topLeftX": {
					"type": "number",
					"description": "左上点 X"
				},
				"topLeftY": {
					"type": "number",
					"description": "左上点 Y"
				},
				"binaryData": {
					"type": "string",
					"description": "二进制数据"
				},
				"width": {
					"type": "number",
					"description": "宽"
				},
				"height": {
					"type": "number",
					"description": "高"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				},
				"mirror": {
					"type": "boolean",
					"description": "是否水平镜像"
				},
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveObject.delete",
		"description": "删除二进制内嵌对象",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "二进制内嵌对象的图元 ID 或二进制内嵌对象图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveObject.get",
		"description": "获取二进制内嵌对象",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "二进制内嵌对象的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveObject.get",
		"description": "获取二进制内嵌对象",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "二进制内嵌对象的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveObject.getAll",
		"description": "获取所有二进制内嵌对象",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "object",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveObject.getAllPrimitiveId",
		"description": "获取所有二进制内嵌对象的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "object",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveObject.modify",
		"description": "修改二进制内嵌对象",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "object",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePad.create",
		"description": "创建焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"padNumber": {
					"type": "string",
					"description": "焊盘编号"
				},
				"x": {
					"type": "number",
					"description": "位置 X"
				},
				"y": {
					"type": "number",
					"description": "位置 Y"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				},
				"pad": {
					"type": "string",
					"description": "焊盘外形"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"hole": {
					"type": "string",
					"description": "孔，null 标识无孔"
				},
				"holeOffsetX": {
					"type": "number",
					"description": "孔偏移 X"
				},
				"holeOffsetY": {
					"type": "number",
					"description": "孔偏移 Y"
				},
				"holeRotation": {
					"type": "number",
					"description": "孔相对于焊盘的旋转角度"
				},
				"metallization": {
					"type": "boolean",
					"description": "是否金属化孔壁"
				},
				"padType": {
					"type": "string",
					"description": "焊盘类型"
				},
				"specialPad": {
					"type": "string",
					"description": "特殊焊盘外形"
				},
				"solderMaskAndPasteMaskExpansion": {
					"type": "string",
					"description": "阻焊/助焊扩展，null 表示遵循规则"
				},
				"heatWelding": {
					"type": "string",
					"description": "热焊优化参数"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePad.delete",
		"description": "删除焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "焊盘的图元 ID 或焊盘图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePad.get",
		"description": "获取焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "焊盘的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePad.get",
		"description": "获取焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "焊盘的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePad.getAll",
		"description": "获取所有焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				},
				"padType": {
					"type": "string"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePad.getAllPrimitiveId",
		"description": "获取所有焊盘的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				},
				"padType": {
					"type": "string"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePad.modify",
		"description": "修改焊盘",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePolyline.create",
		"description": "创建折线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"polygon": {
					"type": "string",
					"description": "单多边形对象"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": [
				"net",
				"layer",
				"polygon"
			]
		}
	},
	{
		"name": "pcb_PrimitivePolyline.delete",
		"description": "删除折线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "折线的图元 ID 或折线图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePolyline.get",
		"description": "获取折线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "折线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePolyline.get",
		"description": "获取折线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "折线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePolyline.getAll",
		"description": "获取所有折线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePolyline.getAllPrimitiveId",
		"description": "获取所有折线的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePolyline.modify",
		"description": "修改折线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePour.create",
		"description": "创建覆铜边框",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"complexPolygon": {
					"type": "string",
					"description": "复杂多边形对象"
				},
				"pourFillMethod": {
					"type": "string",
					"description": "覆铜填充方法"
				},
				"preserveSilos": {
					"type": "boolean",
					"description": "是否保留孤岛"
				},
				"pourName": {
					"type": "string",
					"description": "覆铜名称"
				},
				"pourPriority": {
					"type": "number",
					"description": "覆铜优先级"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePour.delete",
		"description": "删除覆铜边框",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "覆铜边框的图元 ID 或覆铜边框图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePour.get",
		"description": "获取覆铜边框",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "覆铜边框的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePour.get",
		"description": "获取覆铜边框",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "覆铜边框的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitivePour.getAll",
		"description": "获取所有覆铜边框图元",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePour.getAllPrimitiveId",
		"description": "获取所有覆铜边框的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"layer": {
					"type": "string",
					"description": "层"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitivePour.modify",
		"description": "修改覆铜边框",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveRegion.create",
		"description": "创建区域",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"complexPolygon": {
					"type": "string",
					"description": "复杂多边形对象"
				},
				"ruleType": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "区域规则类型"
				},
				"regionName": {
					"type": "string",
					"description": "区域名称"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveRegion.delete",
		"description": "删除区域",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "区域的图元 ID 或区域图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveRegion.get",
		"description": "获取区域",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "区域的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveRegion.get",
		"description": "获取区域",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "区域的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveRegion.getAll",
		"description": "获取所有区域",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"ruleType": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "区域规则类型，只会匹配所有规则类型均一致的图元"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveRegion.getAllPrimitiveId",
		"description": "获取所有区域的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"layer": {
					"type": "string",
					"description": "层"
				},
				"ruleType": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "区域规则类型，只会匹配所有规则类型均一致的图元"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveRegion.modify",
		"description": "修改区域",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveVia.create",
		"description": "创建过孔",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				},
				"holeDiameter": {
					"type": "number",
					"description": "孔径"
				},
				"diameter": {
					"type": "number",
					"description": "外径"
				},
				"viaType": {
					"type": "string",
					"description": "过孔类型"
				},
				"designRuleBlindViaName": {
					"type": "string",
					"description": "盲埋孔设计规则项名称，定义过孔的开始层与结束层，null 表示非盲埋孔"
				},
				"solderMaskExpansion": {
					"type": "string",
					"description": "阻焊/助焊扩展，null 表示跟随规则"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveVia.delete",
		"description": "删除过孔",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "过孔的图元 ID 或过孔图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveVia.get",
		"description": "获取过孔",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "过孔的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveVia.get",
		"description": "获取过孔",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "过孔的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_PrimitiveVia.getAll",
		"description": "获取所有过孔",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveVia.getAllPrimitiveId",
		"description": "获取所有过孔图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"primitiveLock": {
					"type": "boolean",
					"description": "是否锁定"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_PrimitiveVia.modify",
		"description": "修改过孔",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_SelectControl.clearSelected",
		"description": "清除选中",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_SelectControl.doCrossProbeSelect",
		"description": "进行交叉选择",
		"inputSchema": {
			"type": "object",
			"properties": {
				"components": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "器件位号"
				},
				"pins": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "器件位号_引脚编号，格式为 ['U1_1', 'U1_2']"
				},
				"nets": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "网络名称"
				},
				"highlight": {
					"type": "boolean",
					"description": "是否高亮"
				},
				"select": {
					"type": "boolean",
					"description": "操作是否成功"
				}
			},
			"required": []
		}
	},
	{
		"name": "pcb_SelectControl.doSelectPrimitives",
		"description": "使用图元 ID 选中图元",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "图元 ID"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "pcb_SelectControl.getAllSelectedPrimitives",
		"description": "查询所有已选中图元的图元对象",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_SelectControl.getAllSelectedPrimitives_PrimitiveId",
		"description": "查询所有已选中图元的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_SelectControl.getCurrentMousePosition",
		"description": "获取当前鼠标在画布上的位置",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pcb_SelectControl.getSelectedPrimitives",
		"description": "查询选中图元的所有参数",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "pnl_Document.save",
		"description": "保存文档",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_Document.importChanges",
		"description": "从 PCB 导入变更",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_Document.save",
		"description": "保存文档",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_Drc.check",
		"description": "检查 DRC",
		"inputSchema": {
			"type": "object",
			"properties": {
				"strict": {
					"type": "boolean",
					"description": "是否严格检查，严格检查时存在 Warning 将返回 false，否则返回 true"
				},
				"userInterface": {
					"type": "boolean",
					"description": "是否显示 UI（呼出底部 DRC 窗口）"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_Event.addMouseEventListener",
		"description": "新增鼠标事件监听",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "事件 ID，用以防止重复注册事件"
				},
				"eventType": {
					"type": "string",
					"description": "事件类型"
				},
				"callFn": {
					"type": "string",
					"description": "事件触发时的回调函数"
				},
				"onlyOnce": {
					"type": "boolean",
					"description": "是否仅监听一次"
				}
			},
			"required": [
				"id",
				"eventType",
				"callFn"
			]
		}
	},
	{
		"name": "sch_Event.isEventListenerAlreadyExist",
		"description": "查询事件监听是否存在",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "事件 ID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "sch_Event.removeEventListener",
		"description": "移除事件监听",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "事件 ID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "sch_ManufactureData.getBomFile",
		"description": "获取 BOM 文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"fileType": {
					"type": "string",
					"description": "文件类型"
				},
				"template": {
					"type": "string",
					"description": "模板名称"
				},
				"filterOptions": {
					"type": "string",
					"description": "过滤规则，仅应包含需要启用的规则，property 为规则名称，includeValue 为匹配的值"
				},
				"statistics": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "统计，包含所有需要启用的统计项的名称"
				},
				"property": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "属性，包含所有需要启用的属性的名称"
				},
				"columns": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "列的属性及排序，title、sort、group、orderWeight 不传入则取默认值，null 代表 **无** 或 **空**"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_ManufactureData.getNetlistFile",
		"description": "获取网表文件（Netlist）",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"netlistType": {
					"type": "string",
					"description": "网表类型"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_ManufactureData.placeComponentsOrder",
		"description": "元件下单",
		"inputSchema": {
			"type": "object",
			"properties": {
				"interactive": {
					"type": "boolean",
					"description": "是否启用交互式检查如若启用，则会存在弹窗等待用户进行交互，且无法使用 ignoreWarning 参数忽略警告， 即 ignoreWarning 参数将被忽略；如若禁用，则在调用后不会有任何 EDA 内部弹窗，程序执行静默检查， 如若达成下单条件，将返回 true 并在新标签页打开下单页面"
				},
				"ignoreWarning": {
					"type": "boolean",
					"description": "在非交互式检查时忽略警告如果设置为 true，将会忽略所有检查警告项并尽可能生成下单资料；如果设置为 false，存在任意警告将中断执行并返回 false 的结果"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_ManufactureData.placeSmtComponentsOrder",
		"description": "SMT 元件下单",
		"inputSchema": {
			"type": "object",
			"properties": {
				"interactive": {
					"type": "boolean",
					"description": "是否启用交互式检查如若启用，则会存在弹窗等待用户进行交互，且无法使用 ignoreWarning 参数忽略警告， 即 ignoreWarning 参数将被忽略；如若禁用，则在调用后不会有任何 EDA 内部弹窗，程序执行静默检查， 如若达成下单条件，将返回 true 并在新标签页打开下单页面"
				},
				"ignoreWarning": {
					"type": "boolean",
					"description": "在非交互式检查时忽略警告如果设置为 true，将会忽略所有检查警告项并尽可能生成下单资料；如果设置为 false，存在任意警告将中断执行并返回 false 的结果"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_Netlist.getNetlist",
		"description": "获取网表",
		"inputSchema": {
			"type": "object",
			"properties": {
				"type": {
					"type": "string",
					"description": "网表格式"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_Netlist.setNetlist",
		"description": "更新网表",
		"inputSchema": {
			"type": "object",
			"properties": {
				"type": {
					"type": "string",
					"description": "网表格式"
				},
				"netlist": {
					"type": "string",
					"description": "网表数据"
				}
			},
			"required": [
				"type",
				"netlist"
			]
		}
	},
	{
		"name": "sch_Primitive.getPrimitiveByPrimitiveId",
		"description": "获取指定 ID 的图元的所有属性",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "图元 ID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "sch_Primitive.getPrimitivesBBox",
		"description": "获取图元的 BBox",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "图元 ID 数组或图元对象数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_Primitive.getPrimitiveTypeByPrimitiveId",
		"description": "获取指定 ID 的图元的图元类型",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "图元 ID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "sch_PrimitiveArc.create",
		"description": "创建圆弧",
		"inputSchema": {
			"type": "object",
			"properties": {
				"startX": {
					"type": "number",
					"description": "起始点 X"
				},
				"startY": {
					"type": "number",
					"description": "起始点 Y"
				},
				"referenceX": {
					"type": "number",
					"description": "参考点 X"
				},
				"referenceY": {
					"type": "number",
					"description": "参考点 Y"
				},
				"endX": {
					"type": "number",
					"description": "终止点 X"
				},
				"endY": {
					"type": "number",
					"description": "终止点 Y"
				},
				"color": {
					"type": "string",
					"description": "颜色，null 表示默认"
				},
				"fillColor": {
					"type": "string",
					"description": "填充颜色，none 表示无填充，null 表示默认"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽，范围 1-10，null 表示默认"
				},
				"lineType": {
					"type": "string",
					"description": "线型，null 表示默认"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveArc.delete",
		"description": "删除圆弧",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "圆弧的图元 ID 或圆弧图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveArc.get",
		"description": "获取圆弧",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "圆弧的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveArc.get",
		"description": "获取圆弧",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "圆弧的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveArc.getAll",
		"description": "获取所有圆弧",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveArc.getAllPrimitiveId",
		"description": "获取所有圆弧的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveArc.modify",
		"description": "修改圆弧",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveBus.create",
		"description": "创建总线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"busName": {
					"type": "string",
					"description": "总线名称"
				},
				"line": {
					"type": "string",
					"description": "多段线坐标组，每段都是连续的一组 [x1, y1, x2, y2, x3, y3] 所描述的线，如若多段线彼此无任何连接则创建将会失败"
				},
				"color": {
					"type": "string",
					"description": "总线颜色，null 表示默认"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽，范围 1-10，null 表示默认"
				},
				"lineType": {
					"type": "string",
					"description": "线型，null 表示默认"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveBus.delete",
		"description": "删除总线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "总线的图元 ID 或总线图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveBus.get",
		"description": "获取总线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "总线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveBus.get",
		"description": "获取总线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "总线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveBus.getAll",
		"description": "获取所有总线",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveBus.getAllPrimitiveId",
		"description": "获取所有总线的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveBus.modify",
		"description": "修改总线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "总线的图元 ID 或总线图元对象"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveCircle.create",
		"description": "创建圆",
		"inputSchema": {
			"type": "object",
			"properties": {
				"centerX": {
					"type": "number",
					"description": "圆心 X"
				},
				"centerY": {
					"type": "number",
					"description": "圆心 Y"
				},
				"radius": {
					"type": "number",
					"description": "半径"
				},
				"color": {
					"type": "string",
					"description": "颜色，null 表示默认"
				},
				"fillColor": {
					"type": "string",
					"description": "填充颜色，none 表示无填充，null 表示默认"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽，范围 1-10，null 表示默认"
				},
				"lineType": {
					"type": "string",
					"description": "线型，null 表示默认"
				},
				"fillStyle": {
					"type": "string",
					"description": "填充样式，null 表示默认"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveCircle.delete",
		"description": "删除圆",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "圆的图元 ID 或圆图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveCircle.get",
		"description": "获取圆",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "圆的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveCircle.get",
		"description": "获取圆",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "圆的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveCircle.getAll",
		"description": "获取所有圆",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveCircle.getAllPrimitiveId",
		"description": "获取所有圆的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveCircle.modify",
		"description": "修改圆",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.create",
		"description": "创建器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				},
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				},
				"subPartName": {
					"type": "string",
					"description": "子图块名称"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				},
				"mirror": {
					"type": "boolean",
					"description": "是否镜像"
				},
				"addIntoBom": {
					"type": "boolean",
					"description": "是否加入 BOM"
				},
				"addIntoPcb": {
					"type": "boolean",
					"description": "是否转到 PCB"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.createNetFlag",
		"description": "创建网络标识",
		"inputSchema": {
			"type": "object",
			"properties": {
				"identification": {
					"type": "string",
					"description": "标识类型"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				},
				"mirror": {
					"type": "boolean",
					"description": "是否镜像"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.createNetPort",
		"description": "创建网络端口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"direction": {
					"type": "string",
					"description": "端口方向"
				},
				"net": {
					"type": "string",
					"description": "网络名称"
				},
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				},
				"mirror": {
					"type": "boolean",
					"description": "是否镜像"
				}
			},
			"required": [
				"direction",
				"net",
				"x",
				"y"
			]
		}
	},
	{
		"name": "sch_PrimitiveComponent.createShortCircuitFlag",
		"description": "创建短接标识",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度"
				},
				"mirror": {
					"type": "boolean",
					"description": "是否镜像"
				}
			},
			"required": [
				"x",
				"y"
			]
		}
	},
	{
		"name": "sch_PrimitiveComponent.delete",
		"description": "删除器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "器件的图元 ID 或器件图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveComponent.get",
		"description": "获取器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveComponent.get",
		"description": "获取器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "器件的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveComponent.getAll",
		"description": "获取所有器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"componentType": {
					"type": "string",
					"description": "器件类型"
				},
				"allSchematicPages": {
					"type": "boolean",
					"description": "是否获取所有原理图图页的器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.getAllPinsByPrimitiveId",
		"description": "获取器件关联的所有引脚",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "器件图元 ID"
				}
			},
			"required": [
				"primitiveId"
			]
		}
	},
	{
		"name": "sch_PrimitiveComponent.getAllPrimitiveId",
		"description": "获取所有器件的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"componentType": {
					"type": "string",
					"description": "器件类型"
				},
				"allSchematicPages": {
					"type": "boolean",
					"description": "是否获取所有原理图图页的器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.getAllPropertyNames",
		"description": "获取所有器件的所有属性名称集合",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.modify",
		"description": "修改器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "object",
					"description": "需要修改的参数{x?:number,y?:number,rotation?:number,mirror?:boolean,addIntoBom?:boolean,addIntoPcb?:boolean,designator?:string|null,name?:string|null,uniqueId?:string|null,manufacturer?:string|null,manufacturerId?:string|null,supplier?:string|null,supplierId?:string|null,otherProperty?:{[key:string]:string|number|boolean,},}"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.placeComponentWithMouse",
		"description": "使用鼠标放置器件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				},
				"subPartName": {
					"type": "string"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.setNetFlagComponentUuid_AnalogGround",
		"description": "设置在扩展 API 中 AnalogGround 网络标识关联的器件 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.setNetFlagComponentUuid_Ground",
		"description": "设置在扩展 API 中 Ground 网络标识关联的器件 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.setNetFlagComponentUuid_Power",
		"description": "设置在扩展 API 中 Power 网络标识关联的器件 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.setNetFlagComponentUuid_ProtectGround",
		"description": "设置在扩展 API 中 ProtectGround 网络标识关联的器件 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.setNetPortComponentUuid_BI",
		"description": "设置在扩展 API 中 BI 网络端口关联的器件 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.setNetPortComponentUuid_IN",
		"description": "设置在扩展 API 中 IN 网络端口关联的器件 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveComponent.setNetPortComponentUuid_OUT",
		"description": "设置在扩展 API 中 OUT 网络端口关联的器件 UUID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"component": {
					"type": "string",
					"description": "关联库器件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitivePin.create",
		"description": "创建引脚",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				},
				"pinNumber": {
					"type": "string",
					"description": "引脚编号"
				},
				"pinName": {
					"type": "string",
					"description": "引脚名称"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度， 0 90 180 270"
				},
				"pinLength": {
					"type": "number",
					"description": "引脚长度"
				},
				"pinColor": {
					"type": "string",
					"description": "引脚颜色，null 表示默认"
				},
				"pinShape": {
					"type": "string",
					"description": "引脚形状"
				},
				"pinType": {
					"type": "number",
					"description": "引脚类型"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitivePin.delete",
		"description": "删除引脚",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "引脚的图元 ID 或引脚图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitivePin.get",
		"description": "获取引脚",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "引脚的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitivePin.get",
		"description": "获取引脚",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "引脚的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitivePin.getAll",
		"description": "获取所有引脚",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitivePin.getAllPrimitiveId",
		"description": "获取所有引脚的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitivePin.modify",
		"description": "修改引脚",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitivePolygon.create",
		"description": "创建多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"line": {
					"type": "array",
					"items": {
						"type": "number"
					},
					"description": "坐标组，连续的一组 [x1, y1, x2, y2, x3, y3] 所描述的线"
				},
				"color": {
					"type": "string",
					"description": "颜色，null 表示默认"
				},
				"fillColor": {
					"type": "string",
					"description": "填充颜色，none 表示无填充，null 表示默认"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽，范围 1-10，null 表示默认"
				},
				"lineType": {
					"type": "string",
					"description": "线型，null 表示默认"
				}
			},
			"required": [
				"line"
			]
		}
	},
	{
		"name": "sch_PrimitivePolygon.delete",
		"description": "删除多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "多边形的图元 ID 或多边形图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitivePolygon.get",
		"description": "获取多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "多边形的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitivePolygon.get",
		"description": "获取多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "多边形的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitivePolygon.getAll",
		"description": "获取所有多边形",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitivePolygon.getAllPrimitiveId",
		"description": "获取所有多边形的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitivePolygon.modify",
		"description": "修改多边形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveRectangle.create",
		"description": "创建矩形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topLeftX": {
					"type": "number",
					"description": "左上点 X"
				},
				"topLeftY": {
					"type": "number",
					"description": "左上点 Y"
				},
				"width": {
					"type": "number",
					"description": "宽"
				},
				"height": {
					"type": "number",
					"description": "高"
				},
				"cornerRadius": {
					"type": "number",
					"description": "圆角半径"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度，绕左上点旋转， 0 90 180 270"
				},
				"color": {
					"type": "string",
					"description": "颜色，null 表示默认"
				},
				"fillColor": {
					"type": "string",
					"description": "填充颜色，none 表示无填充，null 表示默认"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽，范围 1-10，null 表示默认"
				},
				"lineType": {
					"type": "string",
					"description": "线型，null 表示默认"
				},
				"fillStyle": {
					"type": "string",
					"description": "填充样式，null 表示默认"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveRectangle.delete",
		"description": "删除矩形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "矩形的图元 ID 或矩形图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveRectangle.get",
		"description": "获取矩形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "矩形的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveRectangle.get",
		"description": "获取矩形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "矩形的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveRectangle.getAll",
		"description": "获取所有矩形",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveRectangle.getAllPrimitiveId",
		"description": "获取所有矩形的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveRectangle.modify",
		"description": "修改矩形",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveText.create",
		"description": "创建文本",
		"inputSchema": {
			"type": "object",
			"properties": {
				"x": {
					"type": "number",
					"description": "坐标 X"
				},
				"y": {
					"type": "number",
					"description": "坐标 Y"
				},
				"content": {
					"type": "string",
					"description": "文本内容"
				},
				"rotation": {
					"type": "number",
					"description": "旋转角度， 0 90 180 270"
				},
				"textColor": {
					"type": "string",
					"description": "文本颜色，null 表示默认"
				},
				"fontName": {
					"type": "string",
					"description": "字体名称，null 表示默认"
				},
				"fontSize": {
					"type": "number",
					"description": "字体大小，null 表示默认"
				},
				"bold": {
					"type": "boolean",
					"description": "是否加粗"
				},
				"italic": {
					"type": "boolean",
					"description": "是否斜体"
				},
				"underLine": {
					"type": "boolean",
					"description": "是否加下划线"
				},
				"alignMode": {
					"type": "number",
					"description": "对齐模式，0 左顶，1 中顶，2 右顶，3 左中，4 中中，5 右中，6 左底，7 中底，8 右底"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveText.delete",
		"description": "删除文本",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "文本的图元 ID 或文本图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveText.get",
		"description": "获取文本",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "文本的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveText.get",
		"description": "获取文本",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "文本的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveText.getAll",
		"description": "获取所有文本",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveText.getAllPrimitiveId",
		"description": "获取所有文本的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveText.modify",
		"description": "修改文本",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "图元 ID"
				},
				"property": {
					"type": "string",
					"description": "修改参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveWire.create",
		"description": "创建导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"line": {
					"type": "string",
					"description": "多段线坐标组，每段都是连续的一组 [x1, y1, x2, y2, x3, y3] 所描述的线，如若多段线彼此无任何连接则创建将会失败"
				},
				"net": {
					"type": "string",
					"description": "网络名称，如若未指定，则遵循： 1. 没有坐标落在任何图元上，则默认为空网络； 2. 有一个坐标点在某个网络的图元上，则跟随该图元的网络； 3. 有多个坐标点在多个不同网络的图元上，则创建失败如若已指定，则遵循： 1. 有一个或多个坐标点在其他网络的图元上，且其他图元并未显式（通常指的是包含网络标签或网络端口）指定网络，则其他图元跟随指定的网络； 2. 如若其他图元指定了网络，则创建失败"
				},
				"color": {
					"type": "string",
					"description": "导线颜色，null 表示默认"
				},
				"lineWidth": {
					"type": "number",
					"description": "线宽，范围 1-10，null 表示默认"
				},
				"lineType": {
					"type": "string",
					"description": "线型，null 表示默认"
				}
			},
			"required": [
				"line"
			]
		}
	},
	{
		"name": "sch_PrimitiveWire.delete",
		"description": "删除导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "导线的图元 ID 或导线图元对象"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveWire.get",
		"description": "获取导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "导线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveWire.get",
		"description": "获取导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "导线的图元 ID，可以为字符串或字符串数组，如若为数组，则返回的也是数组"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_PrimitiveWire.getAll",
		"description": "获取所有导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveWire.getAllPrimitiveId",
		"description": "获取所有导线的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {
				"net": {
					"type": "string",
					"description": "网络名称"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_PrimitiveWire.modify",
		"description": "修改导线",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveId": {
					"type": "string",
					"description": "导线的图元 ID 或导线图元对象"
				},
				"property": {
					"type": "object",
					"description": "修改参数:{line?:Array<number>|Array<Array<number>>,net?:string,color?:string|null,lineWidth?:number|null,lineType?:ESCH_PrimitiveLineType|null,}"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_SelectControl.clearSelected",
		"description": "清除选中",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_SelectControl.doCrossProbeSelect",
		"description": "进行交叉选择",
		"inputSchema": {
			"type": "object",
			"properties": {
				"components": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "器件位号"
				},
				"pins": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "器件位号_引脚编号，格式为 ['U1_1', 'U1_2']"
				},
				"nets": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "网络名称"
				},
				"highlight": {
					"type": "boolean",
					"description": "是否高亮"
				},
				"select": {
					"type": "boolean",
					"description": "是否选中"
				}
			},
			"required": []
		}
	},
	{
		"name": "sch_SelectControl.doSelectPrimitives",
		"description": "使用图元 ID 选中图元",
		"inputSchema": {
			"type": "object",
			"properties": {
				"primitiveIds": {
					"type": "string",
					"description": "图元 ID"
				}
			},
			"required": [
				"primitiveIds"
			]
		}
	},
	{
		"name": "sch_SelectControl.getAllSelectedPrimitives",
		"description": "查询所有已选中图元的图元对象",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_SelectControl.getAllSelectedPrimitives_PrimitiveId",
		"description": "查询所有已选中图元的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_SelectControl.getCurrentMousePosition",
		"description": "获取当前鼠标在画布上的位置",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_SelectControl.getSelectedPrimitives",
		"description": "查询选中图元的所有参数",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sch_SelectControl.getSelectedPrimitives_PrimitiveId",
		"description": "查询选中图元的图元 ID",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_ClientUrl.request",
		"description": "发起即时请求",
		"inputSchema": {
			"type": "object",
			"properties": {
				"url": {
					"type": "string",
					"description": "请求地址"
				},
				"method": {
					"type": "string",
					"description": "请求方法"
				},
				"data": {
					"type": "string",
					"description": "请求发送的数据，可以是直接数据或 URLSearchParams 对象，如果 method 为 HEAD 或 GET，本参数将被忽略"
				},
				"options": {
					"type": "string",
					"description": "请求参数"
				},
				"succeedCallFn": {
					"type": "string",
					"description": "请求成功后回调的函数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Dialog.showConfirmationMessage",
		"description": "弹出确认窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"content": {
					"type": "string",
					"description": "消息文本，支持使用 \\n 换行"
				},
				"title": {
					"type": "string",
					"description": "弹出窗口标题"
				},
				"mainButtonTitle": {
					"type": "string",
					"description": "主要按钮标题"
				},
				"buttonTitle": {
					"type": "string",
					"description": "主要按钮标题"
				},
				"callbackFn": {
					"type": "boolean",
					"description": "回调函数"
				}
			},
			"required": [
				"content"
			]
		}
	},
	{
		"name": "sys_Dialog.showInformationMessage",
		"description": "弹出消息窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"content": {
					"type": "string",
					"description": "消息文本，支持使用 \\n 换行"
				},
				"title": {
					"type": "string",
					"description": "弹出窗口标题"
				},
				"buttonTitle": {
					"type": "string",
					"description": "按钮标题，为空则不显示按钮"
				}
			},
			"required": [
				"content"
			]
		}
	},
	{
		"name": "sys_Dialog.showInputDialog",
		"description": "弹出输入窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"beforeContent": {
					"type": "string",
					"description": "输入框上方文字"
				},
				"afterContent": {
					"type": "string",
					"description": "输入框下方文字"
				},
				"title": {
					"type": "string",
					"description": "弹出窗口标题"
				},
				"type": {
					"type": "string",
					"description": "输入框类型"
				},
				"value": {
					"type": "string",
					"description": "输入框默认值"
				},
				"otherProperty": {
					"type": "string",
					"description": "其它参数，可参考 The HTML Input element"
				},
				"callbackFn": {
					"type": "string",
					"description": "回调函数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Dialog.showSelectDialog",
		"description": "弹出多选窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"options": {
					"type": "string",
					"description": "选项列表，可以为字符串数组或对象数组，在未指定 defaultOption 时，默认值为列表的第一项；如若为字符串数组，则选项的值和选项的展示内容将保持一致；如若为对象数组，则 value 表示选项的值，displayContent 表示选项的展示内容"
				},
				"beforeContent": {
					"type": "string",
					"description": "选择框上方文字"
				},
				"afterContent": {
					"type": "string",
					"description": "选择框下方文字"
				},
				"title": {
					"type": "string",
					"description": "选择框标题"
				},
				"defaultOption": {
					"type": "string",
					"description": "默认选项，以选项的值作为匹配参数，如若 multiple 参数为 true，则此处需要传入字符串数组"
				},
				"multiple": {
					"type": "string",
					"description": "是否支持多选，默认为单选框"
				},
				"callbackFn": {
					"type": "string",
					"description": "回调函数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Dialog.showSelectDialog",
		"description": "弹出多选窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"options": {
					"type": "string",
					"description": "选项列表，可以为字符串数组或对象数组，在未指定 defaultOption 时，默认值为列表的第一项；如若为字符串数组，则选项的值和选项的展示内容将保持一致；如若为对象数组，则 value 表示选项的值，displayContent 表示选项的展示内容"
				},
				"beforeContent": {
					"type": "string",
					"description": "多选框上方文字"
				},
				"afterContent": {
					"type": "string",
					"description": "多选框下方文字"
				},
				"title": {
					"type": "string",
					"description": "多选框标题"
				},
				"defaultOption": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "默认选项数组，以选项的值作为匹配参数"
				},
				"multiple": {
					"type": "string",
					"description": "是否支持多选"
				},
				"callbackFn": {
					"type": "string",
					"description": "回调函数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Environment.getEditorCompliedDate",
		"description": "获取编辑器编译日期",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.getEditorCurrentVersion",
		"description": "获取编辑器当前版本",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.getUserInfo",
		"description": "获取用户信息",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.isClient",
		"description": "是否处于客户端环境",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.isEasyEDAProEdition",
		"description": "是否为 EasyEDA Pro 版本",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.isHalfOfflineMode",
		"description": "是否为半离线模式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.isJLCEDAProEdition",
		"description": "是否为 嘉立创EDA 专业版本",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.isOfflineMode",
		"description": "是否为全离线模式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.isOnlineMode",
		"description": "是否为在线模式",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.isProPrivateEdition",
		"description": "是否为私有化部署版本",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.isWeb",
		"description": "是否处于浏览器环境",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Environment.setKeepProjectHasOnlyOneBoard",
		"description": "设置环境：保持工程仅拥有一个板子",
		"inputSchema": {
			"type": "object",
			"properties": {
				"status": {
					"type": "boolean",
					"description": "环境变量状态"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_FileManager.getCbbFileByCbbUuid",
		"description": "使用复用模块 UUID 获取复用模块文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"cbbUuid": {
					"type": "string",
					"description": "复用模块 UUID"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				},
				"cbbName": {
					"type": "string"
				},
				"password": {
					"type": "string",
					"description": "加密密码"
				}
			},
			"required": [
				"cbbUuid"
			]
		}
	},
	{
		"name": "sys_FileManager.getDeviceFileByDeviceUuid",
		"description": "使用器件 UUID 获取器件文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"deviceUuid": {
					"type": "string",
					"description": "器件 UUID 或器件 UUID 列表"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取，如若不传入，则为系统库"
				}
			},
			"required": [
				"deviceUuid"
			]
		}
	},
	{
		"name": "sys_FileManager.getDocumentFile",
		"description": "获取文档文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"password": {
					"type": "string",
					"description": "加密密码"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_FileManager.getDocumentFootprintSources",
		"description": "获取文档封装源码",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_FileManager.getDocumentSource",
		"description": "获取文档源码",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_FileManager.getFootprintFileByFootprintUuid",
		"description": "使用封装 UUID 获取封装文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"footprintUuid": {
					"type": "string",
					"description": "封装 UUID 或封装 UUID 列表"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"footprintUuid"
			]
		}
	},
	{
		"name": "sys_FileManager.getPanelLibraryFileByPanelLibraryUuid",
		"description": "使用面板库 UUID 获取面板库文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"panelLibraryUuid": {
					"type": "string",
					"description": "面板库 UUID 或面板库 UUID 列表"
				},
				"libraryUuid": {
					"type": "string",
					"description": "库 UUID，可以使用 LIB_LibrariesList 内的接口获取"
				}
			},
			"required": [
				"panelLibraryUuid"
			]
		}
	},
	{
		"name": "sys_FileManager.getProjectFile",
		"description": "获取工程文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"password": {
					"type": "string",
					"description": "加密密码"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_FileManager.getProjectFileByProjectUuid",
		"description": "使用工程 UUID 获取工程文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"projectUuid": {
					"type": "string",
					"description": "工程 UUID"
				},
				"fileName": {
					"type": "string",
					"description": "文件名"
				},
				"password": {
					"type": "string",
					"description": "加密密码"
				}
			},
			"required": [
				"projectUuid"
			]
		}
	},
	{
		"name": "sys_FileManager.importProjectByProjectFile",
		"description": "使用工程文件导入工程",
		"inputSchema": {
			"type": "object",
			"properties": {
				"projectFile": {
					"type": "string",
					"description": "工程文件"
				},
				"fileType": {
					"type": "string",
					"description": "文件类型"
				},
				"props": {
					"type": "object",
					"description": "导入参数，参考 EDA 前端 **导入** 窗口内的配置项"
				},
				"saveTo": {
					"type": "string",
					"description": "保存到工程参数"
				},
				"librariesImportSetting": {
					"type": "boolean"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_FileManager.importProjectByProjectFile",
		"description": "使用工程文件导入工程",
		"inputSchema": {
			"type": "object",
			"properties": {
				"projectFile": {
					"type": "string",
					"description": "工程文件"
				},
				"fileType": {
					"type": "string",
					"description": "文件类型"
				},
				"props": {
					"type": "object",
					"description": "导入参数，参考 EDA 前端 **导入** 窗口内的配置项"
				},
				"saveTo": {
					"type": "string",
					"description": "保存到工程参数"
				},
				"librariesImportSetting": {
					"type": "boolean"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_FileManager.setDocumentSource",
		"description": "修改文档源码",
		"inputSchema": {
			"type": "object",
			"properties": {
				"source": {
					"type": "string",
					"description": "文档源码"
				}
			},
			"required": [
				"source"
			]
		}
	},
	{
		"name": "sys_FileSystem.deleteFileInFileSystem",
		"description": "删除文件系统内的文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uri": {
					"type": "string",
					"description": "文件资源定位符如若结尾为斜杠 /（Windows 为反斜杠 \\），则识别为文件夹；如若结尾非斜杠，则识别为完整文件名，此时 fileName 参数将被忽略"
				},
				"force": {
					"type": "boolean",
					"description": "强制删除文件夹（当欲删除的是文件夹且文件夹内有文件时，是否强制删除该文件夹）"
				}
			},
			"required": [
				"uri"
			]
		}
	},
	{
		"name": "sys_FileSystem.getDocumentsPath",
		"description": "获取文档目录路径",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_FileSystem.getEdaPath",
		"description": "获取 EDA 文档目录路径",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_FileSystem.getExtensionFile",
		"description": "获取扩展内的文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uri": {
					"type": "string",
					"description": "文件路径"
				}
			},
			"required": [
				"uri"
			]
		}
	},
	{
		"name": "sys_FileSystem.getLibrariesPaths",
		"description": "获取库目录路径",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_FileSystem.getProjectsPaths",
		"description": "获取工程目录路径",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_FileSystem.listFilesOfFileSystem",
		"description": "查看文件系统路径下的文件列表",
		"inputSchema": {
			"type": "object",
			"properties": {
				"folderPath": {
					"type": "string",
					"description": "目录路径"
				},
				"recursive": {
					"type": "boolean",
					"description": "是否递归获取所有子文件"
				}
			},
			"required": [
				"folderPath"
			]
		}
	},
	{
		"name": "sys_FileSystem.openReadFileDialog",
		"description": "打开读入文件窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"filenameExtensions": {
					"type": "string",
					"description": "文件扩展名"
				},
				"multiFiles": {
					"type": "string",
					"description": "是否允许读取多文件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_FileSystem.openReadFileDialog",
		"description": "打开读入文件窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"filenameExtensions": {
					"type": "string",
					"description": "文件扩展名"
				},
				"multiFiles": {
					"type": "string",
					"description": "是否允许读取多文件"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_FileSystem.readFileFromFileSystem",
		"description": "从文件系统读取文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uri": {
					"type": "string",
					"description": "文件资源定位符，需要包含完整的文件名称的绝对路径"
				}
			},
			"required": [
				"uri"
			]
		}
	},
	{
		"name": "sys_FileSystem.saveFile",
		"description": "保存文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fileData": {
					"type": "string",
					"description": "文件数据"
				},
				"fileName": {
					"type": "string",
					"description": "文件名称"
				}
			},
			"required": [
				"fileData"
			]
		}
	},
	{
		"name": "sys_FileSystem.saveFileToFileSystem",
		"description": "向文件系统写入文件",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uri": {
					"type": "string",
					"description": "文件资源定位符如若结尾为斜杠 /（Windows 为反斜杠 \\），则识别为文件夹；如若结尾非斜杠，则识别为完整文件名，此时 fileName 参数将被忽略"
				},
				"fileData": {
					"type": "string",
					"description": "文件数据"
				},
				"fileName": {
					"type": "string",
					"description": "文件名称"
				},
				"force": {
					"type": "boolean",
					"description": "强制写入（文件存在则覆盖文件）"
				}
			},
			"required": [
				"uri",
				"fileData"
			]
		}
	},
	{
		"name": "sys_FontManager.addFont",
		"description": "添加字体到字体列表",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fontName": {
					"type": "string",
					"description": "字体名称"
				}
			},
			"required": [
				"fontName"
			]
		}
	},
	{
		"name": "sys_FontManager.deleteFont",
		"description": "删除字体列表内的指定字体",
		"inputSchema": {
			"type": "object",
			"properties": {
				"fontName": {
					"type": "string",
					"description": "字体名称"
				}
			},
			"required": [
				"fontName"
			]
		}
	},
	{
		"name": "sys_FontManager.getFontsList",
		"description": "获取当前已经配置的字体列表",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_HeaderMenu.insertHeaderMenus",
		"description": "导入顶部菜单数据",
		"inputSchema": {
			"type": "object",
			"properties": {
				"headerMenus": {
					"type": "string",
					"description": "顶部菜单数据"
				}
			},
			"required": [
				"headerMenus"
			]
		}
	},
	{
		"name": "sys_HeaderMenu.removeHeaderMenus",
		"description": "移除顶部菜单数据",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_HeaderMenu.replaceHeaderMenus",
		"description": "替换顶部菜单数据",
		"inputSchema": {
			"type": "object",
			"properties": {
				"headerMenus": {
					"type": "string",
					"description": "顶部菜单数据"
				}
			},
			"required": [
				"headerMenus"
			]
		}
	},
	{
		"name": "sys_I18n.getAllSupportedLanguages",
		"description": "查询所有支持的语言",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_I18n.getCurrentLanguage",
		"description": "获取当前语言环境",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_I18n.importMultilingual",
		"description": "导入多语言",
		"inputSchema": {
			"type": "object",
			"properties": {
				"language": {
					"type": "string",
					"description": "语言"
				},
				"source": {
					"type": "string",
					"description": "欲导入的多语言数据对象"
				}
			},
			"required": [
				"language",
				"source"
			]
		}
	},
	{
		"name": "sys_I18n.importMultilingualLanguage",
		"description": "导入多语言：指定命名空间和语言",
		"inputSchema": {
			"type": "object",
			"properties": {
				"namespace": {
					"type": "string",
					"description": "命名空间"
				},
				"language": {
					"type": "string",
					"description": "语言"
				},
				"source": {
					"type": "string",
					"description": "欲导入的多语言数据对象"
				}
			},
			"required": [
				"namespace",
				"language",
				"source"
			]
		}
	},
	{
		"name": "sys_I18n.importMultilingualNamespace",
		"description": "导入多语言：指定命名空间",
		"inputSchema": {
			"type": "object",
			"properties": {
				"namespace": {
					"type": "string",
					"description": "命名空间"
				},
				"source": {
					"type": "string",
					"description": "欲导入的多语言数据对象"
				}
			},
			"required": [
				"namespace",
				"source"
			]
		}
	},
	{
		"name": "sys_I18n.isLanguageSupported",
		"description": "检查语言是否受支持",
		"inputSchema": {
			"type": "object",
			"properties": {
				"language": {
					"type": "string",
					"description": "语言"
				}
			},
			"required": [
				"language"
			]
		}
	},
	{
		"name": "sys_I18n.text",
		"description": "输出语言文本",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tag": {
					"type": "string",
					"description": "文本标签，对应多语言文件键值对中的键"
				},
				"namespace": {
					"type": "string",
					"description": "文本命名空间，在扩展运行环境内默认为扩展的 UUID，否则为系统默认命名空间"
				},
				"language": {
					"type": "string",
					"description": "语言，undefined 为 EDA 当前的显示语言"
				},
				"args": {
					"type": "array",
					"items": {
						"type": "string"
					},
					"description": "语言文本中替换占位符的参数"
				}
			},
			"required": [
				"tag"
			]
		}
	},
	{
		"name": "sys_IFrame.closeIFrame",
		"description": "关闭内联框架窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "内联框架窗口 ID，如若传入 undefined，将关闭由本扩展打开的所有内联框架窗口"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_IFrame.hideIFrame",
		"description": "隐藏内联框架窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "内联框架窗口 ID"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_IFrame.openIFrame",
		"description": "打开内联框架窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"htmlFileName": {
					"type": "string",
					"description": "需要加载的 HTML 文件在扩展包内的路径，从扩展根目录起始，例如 /iframe/index.html"
				},
				"width": {
					"type": "number",
					"description": "内联框架窗口的宽度"
				},
				"height": {
					"type": "number",
					"description": "内联框架窗口的高度"
				},
				"id": {
					"type": "string",
					"description": "内联框架窗口 ID，用于关闭内联框架窗口"
				},
				"props": {
					"type": "string",
					"description": "其它参数"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_IFrame.showIFrame",
		"description": "显示内联框架窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "内联框架窗口 ID"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_LoadingAndProgressBar.destroyLoading",
		"description": "销毁无进度加载覆盖",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_LoadingAndProgressBar.destroyProgressBar",
		"description": "销毁进度条",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_LoadingAndProgressBar.showLoading",
		"description": "显示无进度加载覆盖",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_LoadingAndProgressBar.showProgressBar",
		"description": "显示进度条或设置进度条进度",
		"inputSchema": {
			"type": "object",
			"properties": {
				"progress": {
					"type": "number",
					"description": "进度值，取值范围 0-100"
				},
				"title": {
					"type": "string",
					"description": "进度条标题"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Log.add",
		"description": "添加日志条目",
		"inputSchema": {
			"type": "object",
			"properties": {
				"message": {
					"type": "string",
					"description": "日志内容"
				},
				"type": {
					"type": "string",
					"description": "日志类型"
				}
			},
			"required": [
				"message"
			]
		}
	},
	{
		"name": "sys_Log.clear",
		"description": "清空日志",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Log.export",
		"description": "导出日志",
		"inputSchema": {
			"type": "object",
			"properties": {
				"types": {
					"type": "string",
					"description": "日志类型"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Log.find",
		"description": "查找条目",
		"inputSchema": {
			"type": "object",
			"properties": {
				"message": {
					"type": "string",
					"description": "查找内容"
				},
				"types": {
					"type": "string",
					"description": "日志类型数组，可以在指定的日志类型内查找"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Log.sort",
		"description": "筛选并获取日志条目",
		"inputSchema": {
			"type": "object",
			"properties": {
				"types": {
					"type": "string",
					"description": "日志类型数组，可以同时指定多种日志类型，如若不指定则为全部类型"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Message.removeFollowMouseTip",
		"description": "移除跟随鼠标的提示",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tip": {
					"type": "string",
					"description": "提示内容，如若传入，则仅当当前提示为指定内容时才移除"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Message.showFollowMouseTip",
		"description": "展示跟随鼠标的提示",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tip": {
					"type": "string",
					"description": "提示内容"
				},
				"msTimeout": {
					"type": "number",
					"description": "展示时间，以毫秒（ms）为单位，如若不传入则持续展示，直到调用 removeFollowMouseTip 或被其它提示覆盖"
				}
			},
			"required": [
				"tip"
			]
		}
	},
	{
		"name": "sys_Message.showToastMessage",
		"description": "显示吐司消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"message": {
					"type": "string",
					"description": "消息内容"
				},
				"messageType": {
					"type": "string",
					"description": "消息类型"
				},
				"timer": {
					"type": "number",
					"description": "自动关闭倒计时秒数，0 为不自动关闭"
				},
				"bottomPanel": {
					"type": "string",
					"description": "展开底部信息面板"
				},
				"buttonTitle": {
					"type": "string",
					"description": "回调按钮标题"
				},
				"buttonCallbackFn": {
					"type": "string",
					"description": "回调函数内容，字符串形式，会被自动解析并执行"
				}
			},
			"required": [
				"message"
			]
		}
	},
	{
		"name": "sys_MessageBox.showConfirmationMessage",
		"description": "显示确认框",
		"inputSchema": {
			"type": "object",
			"properties": {
				"content": {
					"type": "string",
					"description": "消息文本，支持使用 \\n 换行"
				},
				"title": {
					"type": "string",
					"description": "确认框标题"
				},
				"mainButtonTitle": {
					"type": "string",
					"description": "主要按钮标题"
				},
				"buttonTitle": {
					"type": "string",
					"description": "主要按钮标题"
				},
				"callbackFn": {
					"type": "boolean",
					"description": "回调函数，如需调用扩展内的函数，请在函数名前加上扩展的唯一 ID，以西文句号 . 分隔"
				}
			},
			"required": [
				"content"
			]
		}
	},
	{
		"name": "sys_MessageBox.showInformationMessage",
		"description": "显示消息框",
		"inputSchema": {
			"type": "object",
			"properties": {
				"content": {
					"type": "string",
					"description": "消息文本，支持使用 \\n 换行"
				},
				"title": {
					"type": "string",
					"description": "消息框标题"
				},
				"buttonTitle": {
					"type": "string",
					"description": "按钮标题，为空则不显示按钮"
				}
			},
			"required": [
				"content"
			]
		}
	},
	{
		"name": "sys_MessageBus.createPrivateMessageBus",
		"description": "创建私有消息总线",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_MessageBus.publish",
		"description": "私有消息总线：发布消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"message": {
					"type": "string",
					"description": "消息"
				}
			},
			"required": [
				"topic",
				"message"
			]
		}
	},
	{
		"name": "sys_MessageBus.publishPublic",
		"description": "公共消息总线：发布消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"message": {
					"type": "string",
					"description": "消息"
				}
			},
			"required": [
				"topic",
				"message"
			]
		}
	},
	{
		"name": "sys_MessageBus.pull",
		"description": "私有消息总线：拉消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"callbackFn": {
					"type": "string",
					"description": "拉到消息后的回调"
				}
			},
			"required": [
				"topic",
				"callbackFn"
			]
		}
	},
	{
		"name": "sys_MessageBus.pullAsync",
		"description": "私有消息总线：拉消息 Promise 版本",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				}
			},
			"required": [
				"topic"
			]
		}
	},
	{
		"name": "sys_MessageBus.pullAsyncPublic",
		"description": "公共消息总线：拉消息 Promise 版本",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				}
			},
			"required": [
				"topic"
			]
		}
	},
	{
		"name": "sys_MessageBus.pullPublic",
		"description": "公共消息总线：拉消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"callbackFn": {
					"type": "string",
					"description": "拉到消息后的回调"
				}
			},
			"required": [
				"topic",
				"callbackFn"
			]
		}
	},
	{
		"name": "sys_MessageBus.push",
		"description": "私有消息总线：推消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"message": {
					"type": "string",
					"description": "消息"
				}
			},
			"required": [
				"topic",
				"message"
			]
		}
	},
	{
		"name": "sys_MessageBus.pushPublic",
		"description": "公共消息总线：推消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"message": {
					"type": "string",
					"description": "消息"
				}
			},
			"required": [
				"topic",
				"message"
			]
		}
	},
	{
		"name": "sys_MessageBus.removePrivateMessageBus",
		"description": "移除私有消息总线",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_MessageBus.rpcCall",
		"description": "私有消息总线：调用 RPC 服务",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"message": {
					"type": "string",
					"description": "消息"
				},
				"timeout": {
					"type": "number",
					"description": "超时"
				}
			},
			"required": [
				"topic"
			]
		}
	},
	{
		"name": "sys_MessageBus.rpcCallPublic",
		"description": "公共消息总线：调用 RPC 服务",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"message": {
					"type": "string",
					"description": "消息"
				},
				"timeout": {
					"type": "number",
					"description": "超时"
				}
			},
			"required": [
				"topic"
			]
		}
	},
	{
		"name": "sys_MessageBus.rpcService",
		"description": "私有消息总线：注册 RPC 服务",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"callbackFn": {
					"type": "string",
					"description": "接收到消息后的回调"
				}
			},
			"required": [
				"topic",
				"callbackFn"
			]
		}
	},
	{
		"name": "sys_MessageBus.rpcServicePublic",
		"description": "公共消息总线：注册 RPC 服务",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"callbackFn": {
					"type": "string",
					"description": "接收到消息后的回调"
				}
			},
			"required": [
				"topic",
				"callbackFn"
			]
		}
	},
	{
		"name": "sys_MessageBus.subscribe",
		"description": "私有消息总线：订阅消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"callbackFn": {
					"type": "string",
					"description": "接收到消息后的回调"
				}
			},
			"required": [
				"topic",
				"callbackFn"
			]
		}
	},
	{
		"name": "sys_MessageBus.subscribeOnce",
		"description": "私有消息总线：订阅单次消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"callbackFn": {
					"type": "string",
					"description": "接收到消息后的回调"
				}
			},
			"required": [
				"topic",
				"callbackFn"
			]
		}
	},
	{
		"name": "sys_MessageBus.subscribeOncePublic",
		"description": "公共消息总线：订阅单次消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"callbackFn": {
					"type": "string",
					"description": "接收到消息后的回调"
				}
			},
			"required": [
				"topic",
				"callbackFn"
			]
		}
	},
	{
		"name": "sys_MessageBus.subscribePublic",
		"description": "公共消息总线：订阅消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"topic": {
					"type": "string",
					"description": "主题"
				},
				"callbackFn": {
					"type": "string",
					"description": "接收到消息后的回调"
				}
			},
			"required": [
				"topic",
				"callbackFn"
			]
		}
	},
	{
		"name": "sys_PanelControl.closeBottomPanel",
		"description": "关闭底部面板",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.closeLeftPanel",
		"description": "关闭左侧面板",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.closeRightPanel",
		"description": "关闭右侧面板",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.isBottomPanelLocked",
		"description": "查询底部面板是否已锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.isLeftPanelLocked",
		"description": "查询左侧面板是否已锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.isRightPanelLocked",
		"description": "查询右侧面板是否已锁定",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.openBottomPanel",
		"description": "打开底部面板",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tab": {
					"type": "string",
					"description": "标签页，如若不指定则不切换标签页"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.openLeftPanel",
		"description": "打开左侧面板",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tab": {
					"type": "string",
					"description": "标签页，如若不指定则不切换标签页"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.openRightPanel",
		"description": "打开右侧面板",
		"inputSchema": {
			"type": "object",
			"properties": {
				"tab": {
					"type": "string",
					"description": "标签页，如若不指定则不切换标签页"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.toggleBottomPanelLockState",
		"description": "切换底部面板锁定状态",
		"inputSchema": {
			"type": "object",
			"properties": {
				"state": {
					"type": "boolean",
					"description": "是否锁定，如若不指定则反置当前状态"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.toggleLeftPanelLockState",
		"description": "切换左侧面板锁定状态",
		"inputSchema": {
			"type": "object",
			"properties": {
				"state": {
					"type": "boolean",
					"description": "是否锁定，如若不指定则反置当前状态"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_PanelControl.toggleRightPanelLockState",
		"description": "切换右侧面板锁定状态",
		"inputSchema": {
			"type": "object",
			"properties": {
				"state": {
					"type": "boolean",
					"description": "是否锁定，如若不指定则反置当前状态"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Setting.restoreDefault",
		"description": "全局恢复默认设置",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_ShortcutKey.getShortcutKeys",
		"description": "查询快捷键列表",
		"inputSchema": {
			"type": "object",
			"properties": {
				"includeSystem": {
					"type": "boolean",
					"description": "是否包含系统快捷键"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_ShortcutKey.registerShortcutKey",
		"description": "注册快捷键",
		"inputSchema": {
			"type": "object",
			"properties": {
				"shortcutKey": {
					"type": "string",
					"description": "快捷键，数组中包含多个元素则解析为组合快捷键，将按规则排序后存入缓存"
				},
				"title": {
					"type": "string",
					"description": "快捷键标题，快捷键的友好名称"
				},
				"callbackFn": {
					"type": "string",
					"description": "回调函数"
				},
				"documentType": {
					"type": "array",
					"items": {
						"type": "string"
					}
				},
				"scene": {
					"type": "array",
					"items": {
						"type": "string"
					}
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_ShortcutKey.unregisterShortcutKey",
		"description": "反注册快捷键",
		"inputSchema": {
			"type": "object",
			"properties": {
				"shortcutKey": {
					"type": "string",
					"description": "快捷键，不区分传入的排列顺序，将自动排序并查询匹配的快捷键"
				}
			},
			"required": [
				"shortcutKey"
			]
		}
	},
	{
		"name": "sys_Storage.clearExtensionAllUserConfigs",
		"description": "清除扩展所有用户配置",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Storage.deleteExtensionUserConfig",
		"description": "删除扩展用户配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "配置项"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "sys_Storage.getExtensionAllUserConfigs",
		"description": "获取扩展所有用户配置",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Storage.getExtensionUserConfig",
		"description": "获取扩展用户配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "配置项"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "sys_Storage.setExtensionAllUserConfigs",
		"description": "设置扩展所有用户配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"configs": {
					"type": "string",
					"description": "扩展所有用户配置"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Storage.setExtensionUserConfig",
		"description": "设置扩展用户配置",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "配置项"
				},
				"value": {
					"type": "string",
					"description": "值"
				}
			},
			"required": [
				"key",
				"value"
			]
		}
	},
	{
		"name": "sys_Timer.clearIntervalTimer",
		"description": "清除指定循环定时器",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "定时器 ID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "sys_Timer.clearTimeoutTimer",
		"description": "清除指定单次定时器",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "定时器 ID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "sys_Timer.setIntervalTimer",
		"description": "设置循环定时器",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "定时器 ID，用于定位&删除定时器"
				},
				"timeout": {
					"type": "number",
					"description": "定时时间，单位 ms"
				},
				"callFn": {
					"type": "string",
					"description": "定时调用函数"
				},
				"args": {
					"type": "string",
					"description": "传给定时调用函数的参数"
				}
			},
			"required": [
				"id",
				"timeout",
				"callFn"
			]
		}
	},
	{
		"name": "sys_Timer.setTimeoutTimer",
		"description": "设置单次定时器",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "定时器 ID"
				},
				"timeout": {
					"type": "number",
					"description": "定时时间，单位 ms"
				},
				"callFn": {
					"type": "string",
					"description": "定时调用函数"
				},
				"args": {
					"type": "string",
					"description": "传给定时调用函数的参数"
				}
			},
			"required": [
				"id",
				"timeout",
				"callFn"
			]
		}
	},
	{
		"name": "sys_ToastMessage.showMessage",
		"description": "显示吐司消息",
		"inputSchema": {
			"type": "object",
			"properties": {
				"message": {
					"type": "string",
					"description": "消息内容"
				},
				"messageType": {
					"type": "string",
					"description": "消息类型"
				},
				"timer": {
					"type": "number",
					"description": "自动关闭倒计时秒数，0 为不自动关闭"
				},
				"bottomPanel": {
					"type": "string",
					"description": "展开底部信息面板"
				},
				"buttonTitle": {
					"type": "string",
					"description": "回调按钮标题"
				},
				"buttonCallbackFn": {
					"type": "string",
					"description": "回调函数内容，字符串形式，会被自动解析并执行"
				}
			},
			"required": [
				"message"
			]
		}
	},
	{
		"name": "sys_Tool.netlistComparison",
		"description": "网表对比",
		"inputSchema": {
			"type": "object",
			"properties": {
				"netlist1": {
					"type": "string",
					"description": "网表 1，可以为当前工程内的 PCB 和原理图的 UUID、网表的文件数据"
				},
				"netlist2": {
					"type": "string",
					"description": "网表 2，可以为当前工程内的 PCB 和原理图的 UUID、网表的文件数据"
				}
			},
			"required": [
				"netlist1",
				"netlist2"
			]
		}
	},
	{
		"name": "sys_Unit.getSystemDataUnit",
		"description": "获取 API 系统数据单位跨度",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Unit.inchToMil",
		"description": "单位转换：英寸到密尔",
		"inputSchema": {
			"type": "object",
			"properties": {
				"inch": {
					"type": "number",
					"description": "输入英寸数"
				},
				"numberOfDecimals": {
					"type": "number",
					"description": "保留小数位数，默认为 4"
				}
			},
			"required": [
				"inch"
			]
		}
	},
	{
		"name": "sys_Unit.inchToMm",
		"description": "单位转换：英寸到毫米",
		"inputSchema": {
			"type": "object",
			"properties": {
				"inch": {
					"type": "number",
					"description": "输入英寸数"
				},
				"numberOfDecimals": {
					"type": "number",
					"description": "保留小数位数，默认为 4"
				}
			},
			"required": [
				"inch"
			]
		}
	},
	{
		"name": "sys_Unit.milToInch",
		"description": "单位转换：密尔到英寸",
		"inputSchema": {
			"type": "object",
			"properties": {
				"mil": {
					"type": "number",
					"description": "输入密尔数"
				},
				"numberOfDecimals": {
					"type": "number",
					"description": "保留小数位数，默认为 4"
				}
			},
			"required": [
				"mil"
			]
		}
	},
	{
		"name": "sys_Unit.milToMm",
		"description": "单位转换：密尔到毫米",
		"inputSchema": {
			"type": "object",
			"properties": {
				"mil": {
					"type": "number",
					"description": "输入密尔数"
				},
				"numberOfDecimals": {
					"type": "number",
					"description": "保留小数位数，默认为 4"
				}
			},
			"required": [
				"mil"
			]
		}
	},
	{
		"name": "sys_Unit.mmToInch",
		"description": "单位转换：毫米到英寸",
		"inputSchema": {
			"type": "object",
			"properties": {
				"mm": {
					"type": "number",
					"description": "输入毫米数"
				},
				"numberOfDecimals": {
					"type": "number",
					"description": "保留小数位数，默认为 4"
				}
			},
			"required": [
				"mm"
			]
		}
	},
	{
		"name": "sys_Unit.mmToMil",
		"description": "单位转换：毫米到密尔",
		"inputSchema": {
			"type": "object",
			"properties": {
				"mm": {
					"type": "number",
					"description": "输入毫米数"
				},
				"numberOfDecimals": {
					"type": "number",
					"description": "保留小数位数，默认为 4"
				}
			},
			"required": [
				"mm"
			]
		}
	},
	{
		"name": "sys_WebSocket.close",
		"description": "关闭 WebSocket 连接",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "自定义的 WebSocket ID"
				},
				"code": {
					"type": "number",
					"description": "数字状态码，对应 WebSocket.CloseEvent 内允许的状态码"
				},
				"reason": {
					"type": "string",
					"description": "一个人类可读的字符串，解释连接关闭的原因"
				},
				"extensionUuid": {
					"type": "string",
					"description": "扩展 UUID，一般不需要指定，仅当需要操作其它扩展建立的 WebSocket 连接时才需要指定为其它扩展的 UUID"
				}
			},
			"required": [
				"id"
			]
		}
	},
	{
		"name": "sys_WebSocket.register",
		"description": "注册 WebSocket 连接",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "自定义 WebSocket ID"
				},
				"serviceUri": {
					"type": "string",
					"description": "WebSocket 服务地址"
				},
				"receiveMessageCallFn": {
					"type": "string",
					"description": "接收到消息时的回调函数"
				},
				"connectedCallFn": {
					"type": "string",
					"description": "连接建立时的回调函数"
				},
				"protocols": {
					"type": "string",
					"description": "子协议"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_WebSocket.send",
		"description": "向 WebSocket 服务器发送数据",
		"inputSchema": {
			"type": "object",
			"properties": {
				"id": {
					"type": "string",
					"description": "自定义的 WebSocket ID"
				},
				"data": {
					"type": "string",
					"description": "发送的数据"
				},
				"extensionUuid": {
					"type": "string",
					"description": "扩展 UUID，一般不需要指定，仅当需要操作其它扩展建立的 WebSocket 连接时才需要指定为其它扩展的 UUID"
				}
			},
			"required": [
				"id",
				"data"
			]
		}
	},
	{
		"name": "sys_Window.addEventListener",
		"description": "新增事件监听",
		"inputSchema": {
			"type": "object",
			"properties": {
				"type": {
					"type": "string",
					"description": "事件类型，当前支持 blur focus"
				},
				"listener": {
					"type": "string",
					"description": "事件监听回调"
				},
				"options": {
					"type": "boolean",
					"description": "参数"
				}
			},
			"required": [
				"type",
				"listener"
			]
		}
	},
	{
		"name": "sys_Window.getCurrentTheme",
		"description": "获取当前主题",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Window.getUrlAnchor",
		"description": "获取 URL 锚点",
		"inputSchema": {
			"type": "object",
			"properties": {},
			"required": []
		}
	},
	{
		"name": "sys_Window.getUrlParam",
		"description": "获取 URL 参数",
		"inputSchema": {
			"type": "object",
			"properties": {
				"key": {
					"type": "string",
					"description": "参数名"
				}
			},
			"required": [
				"key"
			]
		}
	},
	{
		"name": "sys_Window.open",
		"description": "打开资源窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"url": {
					"type": "string",
					"description": "欲加载资源的 URL 或路径"
				},
				"target": {
					"type": "string",
					"description": "上下文目标"
				}
			},
			"required": [
				"url"
			]
		}
	},
	{
		"name": "sys_Window.openUI",
		"description": "打开 UI 窗口",
		"inputSchema": {
			"type": "object",
			"properties": {
				"uiName": {
					"type": "string",
					"description": "UI 名称"
				},
				"args": {
					"type": "string",
					"description": "参数对象"
				}
			},
			"required": []
		}
	},
	{
		"name": "sys_Window.removeEventListener",
		"description": "移除事件监听",
		"inputSchema": {
			"type": "object",
			"properties": {
				"removableObject": {
					"type": "object",
					"description": "窗口事件监听可移除对象"
				}
			},
			"required": [
				"removableObject"
			]
		}
	}
];
// 规范源码1
window.standardCode1 = `
{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","client":"a63817916fe6def8","uuid":"d26e8b320e4345889d812298d4e33f9f","updateTime":1764584744375,"version":"1764584744375"}|
{"type":"CANVAS","ticket":1,"id":"CANVAS"}||{"originX":0,"originY":0}|
{"type":"COMPONENT","ticket":2,"id":"e1"}||{"partId":"pid8a0e77bacb214e","x":0,"y":0,"rotation":0,"isMirror":false,"attrs":{},"zIndex":1,"locked":false}|
{"type":"ATTR","ticket":3,"id":"e20"}||{"x":2506,"y":116,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"d52e3e1d99d84656931d236274ea4a51","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1","zIndex":64,"locked":false}|
{"type":"ATTR","ticket":4,"id":"e35"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Footprint","fillColor":null,"parentId":"e1","zIndex":78,"locked":false}|
{"type":"ATTR","ticket":5,"id":"e36"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Description","fillColor":null,"parentId":"e1","zIndex":79,"locked":false}|
{"type":"ATTR","ticket":6,"id":"e3"}||{"x":998,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"嘉立创EDA","keyVisible":null,"valueVisible":null,"key":"Company","fillColor":null,"parentId":"e1","zIndex":65,"locked":false}|
{"type":"ATTR","ticket":7,"id":"e4"}||{"x":558,"y":-120,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"LCKFB-YZH","keyVisible":null,"valueVisible":null,"key":"Drawed","fillColor":null,"parentId":"e1","zIndex":66,"locked":false}|
{"type":"ATTR","ticket":8,"id":"e5"}||{"x":558,"y":-100,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"","keyVisible":null,"valueVisible":null,"key":"Reviewed","fillColor":null,"parentId":"e1","zIndex":67,"locked":false}|
{"type":"ATTR","ticket":9,"id":"e6"}||{"x":718,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"V1.0","keyVisible":null,"valueVisible":null,"key":"Version","fillColor":null,"parentId":"e1","zIndex":68,"locked":false}|
{"type":"ATTR","ticket":10,"id":"e7"}||{"x":800,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"A4","keyVisible":null,"valueVisible":null,"key":"Page Size","fillColor":null,"parentId":"e1","zIndex":69,"locked":false}|
{"type":"ATTR","ticket":11,"id":"e8"}||{"x":920,"y":-100,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"立创·庐山派K230-CanMV开发板","keyVisible":null,"valueVisible":null,"key":"@Project Name","fillColor":null,"parentId":"e1","zIndex":70,"locked":false}|
{"type":"ATTR","ticket":12,"id":"e9"}||{"x":1102,"y":-61,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"17","keyVisible":null,"valueVisible":null,"key":"@Page Count","fillColor":null,"parentId":"e1","zIndex":71,"locked":false}|
{"type":"ATTR","ticket":13,"id":"e10"}||{"x":1010,"y":-180,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"2024-11-28","keyVisible":null,"valueVisible":null,"key":"@Update Date","fillColor":null,"parentId":"e1","zIndex":72,"locked":false}|
{"type":"ATTR","ticket":14,"id":"e11"}||{"x":1010,"y":-160,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"2024-11-28","keyVisible":null,"valueVisible":null,"key":"@Create Date","fillColor":null,"parentId":"e1","zIndex":73,"locked":false}|
{"type":"ATTR","ticket":15,"id":"e12"}||{"x":730,"y":-170,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"主板原理图","keyVisible":null,"valueVisible":null,"key":"@Schematic Name","fillColor":null,"parentId":"e1","zIndex":74,"locked":false}|
{"type":"ATTR","ticket":16,"id":"e13"}||{"x":1010,"y":-140,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"","keyVisible":null,"valueVisible":null,"key":"Part Number","fillColor":null,"parentId":"e1","zIndex":75,"locked":false}|
{"type":"ATTR","ticket":17,"id":"e14"}||{"x":985,"y":-61,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"13","keyVisible":null,"valueVisible":null,"key":"@Page No","fillColor":null,"parentId":"e1","zIndex":76,"locked":false}|
{"type":"ATTR","ticket":18,"id":"e15"}||{"x":730,"y":-140,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"WIFI","keyVisible":null,"valueVisible":null,"key":"@Page Name","fillColor":null,"parentId":"e1","zIndex":77,"locked":false}|
{"type":"ATTR","ticket":19,"id":"e19"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9408a6ff71ee48cb92ba5b2b8f815907","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1","zIndex":80,"locked":false}|
{"type":"ATTR","ticket":20,"id":"e5192"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"立创·庐山派K230-CanMV开发板","keyVisible":false,"valueVisible":false,"key":"@Board Name","fillColor":null,"parentId":"e1","zIndex":81,"locked":false}|
{"type":"ATTR","ticket":21,"id":"e5193"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"15:18:32","keyVisible":false,"valueVisible":false,"key":"@Create Time","fillColor":null,"parentId":"e1","zIndex":82,"locked":false}|
{"type":"ATTR","ticket":22,"id":"e5194"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"15:19:33","keyVisible":false,"valueVisible":false,"key":"@Update Time","fillColor":null,"parentId":"e1","zIndex":83,"locked":false}|
{"type":"COMPONENT","ticket":23,"id":"e48"}||{"partId":"0.1","x":315,"y":-440,"rotation":0,"isMirror":false,"attrs":{},"zIndex":210,"locked":false}|
{"type":"ATTR","ticket":24,"id":"e10073"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e48","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":25,"id":"e10089"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/26MHz","keyVisible":null,"valueVisible":null,"key":"Value","fillColor":null,"parentId":"e48","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":26,"id":"e1639"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"e1465fdf3705499e9ff61448f2ab3d67","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e48","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":27,"id":"e1641"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"39bf5a9b6b384d75b67d80c5eafd645d","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e48","zIndex":19,"locked":false}|
{"type":"ATTR","ticket":28,"id":"e1642"}||{"x":295,"y":-455,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"Y3","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e48","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":29,"id":"e1643"}||{"x":315,"y":-455,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/26M","keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e48","zIndex":20,"locked":false}|
{"type":"ATTR","ticket":30,"id":"e1644"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"abca150462fc4b678c75517af440fcd7","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e48","zIndex":21,"locked":false}|
{"type":"ATTR","ticket":31,"id":"e1645"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e48","zIndex":22,"locked":false}|
{"type":"ATTR","ticket":32,"id":"e1646"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e48","zIndex":23,"locked":false}|
{"type":"ATTR","ticket":33,"id":"e1647"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e48","zIndex":24,"locked":false}|
{"type":"ATTR","ticket":34,"id":"e5216"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e48","zIndex":25,"locked":false}|
{"type":"COMPONENT","ticket":35,"id":"e73"}||{"partId":"0.1","x":580,"y":-305,"rotation":0,"isMirror":false,"attrs":{},"zIndex":378,"locked":false}|
{"type":"ATTR","ticket":36,"id":"e4300"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e73","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":37,"id":"e4303"}||{"x":585,"y":-305,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R69","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e73","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":38,"id":"e4304"}||{"x":585,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e73","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":39,"id":"e4305"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"53120881d2374527b60cdb1d6b494af4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e73","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":40,"id":"e4306"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e73","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":41,"id":"e4307"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e73","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":42,"id":"e4308"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e73","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":43,"id":"e5215"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e73","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":44,"id":"e92"}||{"partId":"0.1","x":405,"y":-305,"rotation":0,"isMirror":false,"attrs":{},"zIndex":338,"locked":false}|
{"type":"ATTR","ticket":45,"id":"e4156"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e92","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":46,"id":"e4159"}||{"x":410,"y":-305,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R64","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e92","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":47,"id":"e4160"}||{"x":410,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e92","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":48,"id":"e4161"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"53120881d2374527b60cdb1d6b494af4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e92","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":49,"id":"e4162"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e92","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":50,"id":"e4163"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e92","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":51,"id":"e4164"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e92","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":52,"id":"e5211"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e92","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":53,"id":"e111"}||{"partId":"0.1","x":370,"y":-305,"rotation":0,"isMirror":false,"attrs":{},"zIndex":328,"locked":false}|
{"type":"ATTR","ticket":54,"id":"e4120"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e111","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":55,"id":"e4123"}||{"x":375,"y":-305,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R63","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e111","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":56,"id":"e4124"}||{"x":375,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e111","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":57,"id":"e4125"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"53120881d2374527b60cdb1d6b494af4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e111","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":58,"id":"e4126"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e111","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":59,"id":"e4127"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e111","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":60,"id":"e4128"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e111","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":61,"id":"e5210"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e111","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":62,"id":"e130"}||{"partId":"pid8a0e77bacb214e","x":370,"y":-330,"rotation":0,"isMirror":false,"attrs":{},"zIndex":188,"locked":false}|
{"type":"ATTR","ticket":63,"id":"e133"}||{"x":370,"y":-300,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e130","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":64,"id":"e134"}||{"x":370,"y":-340,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VDD_3V3","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e130","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":65,"id":"e135"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e130","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":66,"id":"e136"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e130","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":67,"id":"e140"}||{"partId":"0.1","x":440,"y":-305,"rotation":0,"isMirror":false,"attrs":{},"zIndex":74,"locked":false}|
{"type":"ATTR","ticket":68,"id":"e145"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":false,"valueVisible":false,"key":"Footprint","fillColor":null,"parentId":"e140","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":69,"id":"e146"}||{"x":445,"y":-305,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R65","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e140","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":70,"id":"e147"}||{"x":445,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC","keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e140","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":71,"id":"e148"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9852f1f604174096a76a49e818b33d39","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e140","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":72,"id":"e149"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e140","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":73,"id":"e150"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e140","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":74,"id":"e151"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e140","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":75,"id":"e159"}||{"partId":"0.1","x":450,"y":-420,"rotation":0,"isMirror":false,"attrs":{},"zIndex":128,"locked":false}|
{"type":"ATTR","ticket":76,"id":"e2001"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e159","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":77,"id":"e164"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e159","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":78,"id":"e165"}||{"x":455,"y":-425,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C177","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e159","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":79,"id":"e166"}||{"x":455,"y":-405,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e159","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":80,"id":"e167"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"8de1c5bb94eb420d97c34378e6a7c76d","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e159","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":81,"id":"e168"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e159","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":82,"id":"e169"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e159","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":83,"id":"e170"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e159","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":84,"id":"e5199"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e159","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":85,"id":"e178"}||{"partId":"0.1","x":545,"y":-305,"rotation":0,"isMirror":false,"attrs":{},"zIndex":368,"locked":false}|
{"type":"ATTR","ticket":86,"id":"e4264"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e178","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":87,"id":"e4267"}||{"x":550,"y":-305,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R68","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e178","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":88,"id":"e4268"}||{"x":550,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e178","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":89,"id":"e4269"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"53120881d2374527b60cdb1d6b494af4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e178","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":90,"id":"e4270"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e178","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":91,"id":"e4271"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e178","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":92,"id":"e4272"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e178","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":93,"id":"e5214"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e178","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":94,"id":"e197"}||{"partId":"0.1","x":510,"y":-305,"rotation":0,"isMirror":false,"attrs":{},"zIndex":358,"locked":false}|
{"type":"ATTR","ticket":95,"id":"e4228"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e197","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":96,"id":"e4231"}||{"x":515,"y":-305,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R67","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e197","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":97,"id":"e4232"}||{"x":515,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e197","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":98,"id":"e4233"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"53120881d2374527b60cdb1d6b494af4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e197","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":99,"id":"e4234"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e197","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":100,"id":"e4235"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e197","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":101,"id":"e4236"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e197","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":102,"id":"e5213"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e197","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":103,"id":"e216"}||{"partId":"0.1","x":475,"y":-305,"rotation":0,"isMirror":false,"attrs":{},"zIndex":348,"locked":false}|
{"type":"ATTR","ticket":104,"id":"e4192"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e216","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":105,"id":"e4195"}||{"x":480,"y":-305,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R66","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e216","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":106,"id":"e4196"}||{"x":480,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e216","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":107,"id":"e4197"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"53120881d2374527b60cdb1d6b494af4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e216","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":108,"id":"e4198"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e216","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":109,"id":"e4199"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e216","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":110,"id":"e4200"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e216","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":111,"id":"e5212"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e216","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":112,"id":"e235"}||{"partId":"pid8a0e77bacb214e","x":555,"y":-499.9999999999999,"rotation":270,"isMirror":false,"attrs":{},"zIndex":120,"locked":false}|
{"type":"ATTR","ticket":113,"id":"e242"}||{"x":525,"y":-499.9999999999999,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e235","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":114,"id":"e243"}||{"x":530,"y":-499.9999999999999,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e235","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":115,"id":"e244"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e235","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":116,"id":"e248"}||{"partId":"pid8a0e77bacb214e","x":555,"y":-519.9999999999999,"rotation":270,"isMirror":false,"attrs":{},"zIndex":124,"locked":false}|
{"type":"ATTR","ticket":117,"id":"e255"}||{"x":525,"y":-519.9999999999999,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e248","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":118,"id":"e256"}||{"x":530,"y":-519.9999999999999,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e248","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":119,"id":"e257"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e248","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":120,"id":"e261"}||{"partId":"pid8a0e77bacb214e","x":410,"y":-400,"rotation":0,"isMirror":false,"attrs":{},"zIndex":139,"locked":false}|
{"type":"ATTR","ticket":121,"id":"e268"}||{"x":410,"y":-370,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e261","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":122,"id":"e269"}||{"x":410,"y":-375,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e261","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":123,"id":"e270"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e261","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":124,"id":"e274"}||{"partId":"0.1","x":410,"y":-420,"rotation":0,"isMirror":false,"attrs":{},"zIndex":283,"locked":false}|
{"type":"ATTR","ticket":125,"id":"e2909"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e274","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":126,"id":"e2911"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e274","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":127,"id":"e2912"}||{"x":415,"y":-425,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C176","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e274","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":128,"id":"e2913"}||{"x":415,"y":-405,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e274","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":129,"id":"e2914"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"89bebc94f7474409bdbb81625b4be491","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e274","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":130,"id":"e2915"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e274","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":131,"id":"e2916"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e274","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":132,"id":"e2917"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e274","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":133,"id":"e5203"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e274","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":134,"id":"e293"}||{"partId":"pid8a0e77bacb214e","x":410,"y":-440,"rotation":0,"isMirror":false,"attrs":{},"zIndex":143,"locked":false}|
{"type":"ATTR","ticket":135,"id":"e296"}||{"x":410,"y":-410,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e293","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":136,"id":"e297"}||{"x":410,"y":-450,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VDD_3V3","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e293","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":137,"id":"e298"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e293","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":138,"id":"e299"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e293","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":139,"id":"e303"}||{"partId":"pid8a0e77bacb214e","x":360,"y":-510,"rotation":0,"isMirror":false,"attrs":{},"zIndex":83,"locked":false}|
{"type":"ATTR","ticket":140,"id":"e310"}||{"x":360,"y":-480,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e303","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":141,"id":"e311"}||{"x":360,"y":-485,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e303","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":142,"id":"e312"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e303","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":143,"id":"e316"}||{"partId":"0.1","x":360,"y":-540,"rotation":90,"isMirror":false,"attrs":{},"zIndex":461,"locked":false}|
{"type":"ATTR","ticket":144,"id":"e7731"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a09a1a8312214e0c94e87c2b72ea7b4d","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e316","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":145,"id":"e7732"}||{"x":365,"y":-550,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"L7","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e316","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":146,"id":"e7733"}||{"x":365,"y":-540,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e316","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":147,"id":"e7735"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"d54ecfa399c147c19f7821f84360166d","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e316","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":148,"id":"e7736"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e316","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":149,"id":"e7737"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e316","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":150,"id":"e7738"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e316","zIndex":19,"locked":false}|
{"type":"ATTR","ticket":151,"id":"e7740"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e316","zIndex":20,"locked":false}|
{"type":"COMPONENT","ticket":152,"id":"e338"}||{"partId":"0.1","x":315,"y":-575,"rotation":90,"isMirror":false,"attrs":{},"zIndex":389,"locked":false}|
{"type":"ATTR","ticket":153,"id":"e7376"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"±800ppm/℃","keyVisible":false,"valueVisible":false,"key":"Temperature Coefficient","fillColor":null,"parentId":"e338","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":154,"id":"e7379"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e338","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":155,"id":"e7381"}||{"x":280,"y":-575,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R61","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e338","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":156,"id":"e7382"}||{"x":335,"y":-575,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e338","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":157,"id":"e7383"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"7fa3c863d977457c873497e6832c56d6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e338","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":158,"id":"e7384"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e338","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":159,"id":"e7385"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e338","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":160,"id":"e7386"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e338","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":161,"id":"e7388"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e338","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":162,"id":"e357"}||{"partId":"0.1","x":410,"y":-575,"rotation":90,"isMirror":false,"attrs":{},"zIndex":400,"locked":false}|
{"type":"ATTR","ticket":163,"id":"e7413"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"±800ppm/℃","keyVisible":false,"valueVisible":false,"key":"Temperature Coefficient","fillColor":null,"parentId":"e357","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":164,"id":"e7416"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e357","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":165,"id":"e7418"}||{"x":375,"y":-575,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R62","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e357","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":166,"id":"e7419"}||{"x":420,"y":-575,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e357","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":167,"id":"e7420"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"7fa3c863d977457c873497e6832c56d6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e357","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":168,"id":"e7421"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e357","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":169,"id":"e7422"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e357","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":170,"id":"e7423"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e357","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":171,"id":"e7425"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e357","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":172,"id":"e376"}||{"partId":"CA-C03.1","x":160,"y":-605,"rotation":0,"isMirror":false,"attrs":{},"zIndex":198,"locked":false}|
{"type":"ATTR","ticket":173,"id":"e393"}||{"x":175,"y":-625,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"ANT1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e376","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":174,"id":"e394"}||{"x":175,"y":-617,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e376","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":175,"id":"e395"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"135d34eb160b44e1bfa684060ffe1f15","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e376","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":176,"id":"e396"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e376","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":177,"id":"e397"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e376","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":178,"id":"e398"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e376","zIndex":15,"locked":false}|
{"type":"COMPONENT","ticket":179,"id":"e406"}||{"partId":"GND.1","x":860,"y":-500,"rotation":0,"isMirror":false,"attrs":{},"zIndex":158,"locked":false}|
{"type":"ATTR","ticket":180,"id":"e409"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":6.75,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"72cea2a793ed4fb9847eb3f2ae2cb441","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e406","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":181,"id":"e410"}||{"x":882,"y":-495,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":"88f4d66a9671405393ece7cc30c85e50","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e406","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":182,"id":"e411"}||{"x":882,"y":-495,"rotation":null,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e406","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":183,"id":"e412"}||{"x":882,"y":-495,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e406","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":184,"id":"e416"}||{"partId":"GND.1","x":860,"y":-520,"rotation":0,"isMirror":false,"attrs":{},"zIndex":153,"locked":false}|
{"type":"ATTR","ticket":185,"id":"e419"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":6.75,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"72cea2a793ed4fb9847eb3f2ae2cb441","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e416","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":186,"id":"e420"}||{"x":882,"y":-515,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":"88f4d66a9671405393ece7cc30c85e50","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e416","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":187,"id":"e421"}||{"x":882,"y":-515,"rotation":null,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e416","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":188,"id":"e422"}||{"x":882,"y":-515,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e416","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":189,"id":"e426"}||{"partId":"GND.1","x":730,"y":-600,"rotation":90,"isMirror":false,"attrs":{},"zIndex":148,"locked":false}|
{"type":"ATTR","ticket":190,"id":"e429"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":6.75,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"72cea2a793ed4fb9847eb3f2ae2cb441","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e426","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":191,"id":"e430"}||{"x":730,"y":-622,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"CENTER_BOTTOM","value":"88f4d66a9671405393ece7cc30c85e50","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e426","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":192,"id":"e431"}||{"x":730,"y":-622,"rotation":null,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"CENTER_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e426","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":193,"id":"e432"}||{"x":730,"y":-622,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"CENTER_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e426","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":194,"id":"e436"}||{"partId":"0.1","x":680,"y":-470,"rotation":0,"isMirror":false,"attrs":{},"zIndex":87,"locked":false}|
{"type":"ATTR","ticket":195,"id":"e442"}||{"x":560,"y":-340,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"TL8821/TL8189","keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e436","zIndex":51,"locked":false}|
{"type":"ATTR","ticket":196,"id":"e443"}||{"x":580,"y":-600,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"U19","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e436","zIndex":49,"locked":false}|
{"type":"ATTR","ticket":197,"id":"e444"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"6c0c44698160427cb62c444d46898ea6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e436","zIndex":52,"locked":false}|
{"type":"ATTR","ticket":198,"id":"e445"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e436","zIndex":53,"locked":false}|
{"type":"ATTR","ticket":199,"id":"e446"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e436","zIndex":54,"locked":false}|
{"type":"ATTR","ticket":200,"id":"e447"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e436","zIndex":55,"locked":false}|
{"type":"ATTR","ticket":201,"id":"e4442"}||{"x":670,"y":-485,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"RTL8189FTV","keyVisible":false,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e436","zIndex":56,"locked":false}|
{"type":"COMPONENT","ticket":202,"id":"e581"}||{"partId":"0.1","x":750,"y":-255,"rotation":0,"isMirror":false,"attrs":{},"zIndex":294,"locked":false}|
{"type":"ATTR","ticket":203,"id":"e2942"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e581","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":204,"id":"e2944"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e581","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":205,"id":"e2945"}||{"x":755,"y":-260,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C178","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e581","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":206,"id":"e2946"}||{"x":755,"y":-240,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e581","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":207,"id":"e2947"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"89bebc94f7474409bdbb81625b4be491","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e581","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":208,"id":"e2948"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e581","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":209,"id":"e2949"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e581","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":210,"id":"e2950"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e581","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":211,"id":"e5204"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e581","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":212,"id":"e600"}||{"partId":"GND.1","x":750,"y":-230,"rotation":270,"isMirror":false,"attrs":{},"zIndex":163,"locked":false}|
{"type":"ATTR","ticket":213,"id":"e603"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":6.75,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"72cea2a793ed4fb9847eb3f2ae2cb441","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e600","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":214,"id":"e604"}||{"x":750,"y":-198,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"CENTER_BOTTOM","value":"88f4d66a9671405393ece7cc30c85e50","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e600","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":215,"id":"e605"}||{"x":750,"y":-198,"rotation":null,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"CENTER_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e600","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":216,"id":"e606"}||{"x":750,"y":-198,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"CENTER_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e600","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":217,"id":"e610"}||{"partId":"0.1","x":850,"y":-255,"rotation":0,"isMirror":false,"attrs":{},"zIndex":271,"locked":false}|
{"type":"ATTR","ticket":218,"id":"e10895"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e610","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":219,"id":"e2876"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e610","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":220,"id":"e2878"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e610","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":221,"id":"e2879"}||{"x":855,"y":-260,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C180","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e610","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":222,"id":"e2880"}||{"x":855,"y":-240,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/4.7uF","keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e610","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":223,"id":"e2881"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"89bebc94f7474409bdbb81625b4be491","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e610","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":224,"id":"e2882"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e610","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":225,"id":"e2883"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e610","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":226,"id":"e2884"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e610","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":227,"id":"e5201"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e610","zIndex":18,"locked":false}|
{"type":"COMPONENT","ticket":228,"id":"e629"}||{"partId":"pid8a0e77bacb214e","x":750,"y":-329.9999999999999,"rotation":270,"isMirror":false,"attrs":{},"zIndex":193,"locked":false}|
{"type":"ATTR","ticket":229,"id":"e632"}||{"x":720,"y":-329.9999999999999,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e629","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":230,"id":"e633"}||{"x":785,"y":-325,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VDD_3V3","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e629","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":231,"id":"e634"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e629","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":232,"id":"e635"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e629","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":233,"id":"e639"}||{"partId":"0.1","x":810,"y":-300,"rotation":0,"isMirror":false,"attrs":{},"zIndex":317,"locked":false}|
{"type":"ATTR","ticket":234,"id":"e10983"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e639","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":235,"id":"e4083"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a09a1a8312214e0c94e87c2b72ea7b4d","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e639","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":236,"id":"e4089"}||{"x":775,"y":-300,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"L8","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e639","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":237,"id":"e4090"}||{"x":800,"y":-290,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/4.7uH","keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e639","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":238,"id":"e4091"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"e20d3a864d464e8d9534c65841a5745f","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e639","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":239,"id":"e4092"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e639","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":240,"id":"e4093"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e639","zIndex":19,"locked":false}|
{"type":"ATTR","ticket":241,"id":"e4094"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e639","zIndex":20,"locked":false}|
{"type":"ATTR","ticket":242,"id":"e5206"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e639","zIndex":21,"locked":false}|
{"type":"COMPONENT","ticket":243,"id":"e661"}||{"partId":"0.1","x":790,"y":-255,"rotation":0,"isMirror":false,"attrs":{},"zIndex":173,"locked":false}|
{"type":"ATTR","ticket":244,"id":"e2062"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e661","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":245,"id":"e666"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e661","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":246,"id":"e667"}||{"x":795,"y":-260,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C179","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e661","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":247,"id":"e668"}||{"x":795,"y":-240,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e661","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":248,"id":"e669"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"8de1c5bb94eb420d97c34378e6a7c76d","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e661","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":249,"id":"e670"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e661","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":250,"id":"e671"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e661","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":251,"id":"e672"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e661","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":252,"id":"e5200"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e661","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":253,"id":"e680"}||{"partId":"0.1","x":905,"y":-255,"rotation":0,"isMirror":false,"attrs":{},"zIndex":305,"locked":false}|
{"type":"ATTR","ticket":254,"id":"e10961"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e680","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":255,"id":"e2975"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e680","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":256,"id":"e2977"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e680","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":257,"id":"e2978"}||{"x":910,"y":-260,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C181","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e680","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":258,"id":"e2979"}||{"x":910,"y":-240,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/100nF","keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e680","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":259,"id":"e2980"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"8de1c5bb94eb420d97c34378e6a7c76d","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e680","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":260,"id":"e2981"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e680","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":261,"id":"e2982"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e680","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":262,"id":"e2983"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e680","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":263,"id":"e5202"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e680","zIndex":18,"locked":false}|
{"type":"COMPONENT","ticket":264,"id":"e699"}||{"partId":"GND.1","x":850,"y":-230,"rotation":270,"isMirror":false,"attrs":{},"zIndex":168,"locked":false}|
{"type":"ATTR","ticket":265,"id":"e702"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":6.75,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"72cea2a793ed4fb9847eb3f2ae2cb441","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e699","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":266,"id":"e703"}||{"x":850,"y":-198,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"CENTER_BOTTOM","value":"88f4d66a9671405393ece7cc30c85e50","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e699","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":267,"id":"e704"}||{"x":850,"y":-198,"rotation":null,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"align":"CENTER_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e699","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":268,"id":"e705"}||{"x":850,"y":-198,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"CENTER_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e699","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":269,"id":"e709"}||{"partId":"0.1","x":195,"y":-410,"rotation":90,"isMirror":false,"attrs":{},"zIndex":245,"locked":false}|
{"type":"ATTR","ticket":270,"id":"e10141"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e709","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":271,"id":"e10156"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/12pF","keyVisible":null,"valueVisible":null,"key":"Value","fillColor":null,"parentId":"e709","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":272,"id":"e2810"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e709","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":273,"id":"e2812"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e709","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":274,"id":"e2813"}||{"x":170,"y":-410,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C175","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e709","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":275,"id":"e2814"}||{"x":200,"y":-410,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/12pF","keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e709","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":276,"id":"e2815"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"2e4f58490f6747e2a8a3497b8a8c9bd5","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e709","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":277,"id":"e2816"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e709","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":278,"id":"e2817"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e709","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":279,"id":"e2818"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e709","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":280,"id":"e5197"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e709","zIndex":19,"locked":false}|
{"type":"COMPONENT","ticket":281,"id":"e728"}||{"partId":"0.1","x":195,"y":-465,"rotation":90,"isMirror":false,"attrs":{},"zIndex":258,"locked":false}|
{"type":"ATTR","ticket":282,"id":"e10163"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e728","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":283,"id":"e10178"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/12pF","keyVisible":null,"valueVisible":null,"key":"Value","fillColor":null,"parentId":"e728","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":284,"id":"e2843"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e728","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":285,"id":"e2845"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e728","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":286,"id":"e2846"}||{"x":170,"y":-465,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C174","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e728","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":287,"id":"e2847"}||{"x":200,"y":-465,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/12pF","keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e728","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":288,"id":"e2848"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"2e4f58490f6747e2a8a3497b8a8c9bd5","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e728","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":289,"id":"e2849"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e728","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":290,"id":"e2850"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e728","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":291,"id":"e2851"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e728","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":292,"id":"e5198"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e728","zIndex":19,"locked":false}|
{"type":"COMPONENT","ticket":293,"id":"e747"}||{"partId":"pid8a0e77bacb214e","x":160,"y":-465,"rotation":270,"isMirror":false,"attrs":{},"zIndex":184,"locked":false}|
{"type":"ATTR","ticket":294,"id":"e754"}||{"x":130,"y":-465,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e747","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":295,"id":"e755"}||{"x":135,"y":-465,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e747","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":296,"id":"e756"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e747","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":297,"id":"e1678"}||{"partId":"CC0402JRNPO9BN100.1","x":360,"y":-625,"rotation":0,"isMirror":false,"attrs":{},"zIndex":450,"locked":false}|
{"type":"ATTR","ticket":298,"id":"e8421"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"1b69028463d846bfb68f41ac51a40dd3","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1678","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":299,"id":"e7656"}||{"x":365,"y":-610,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e1678","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":300,"id":"e7657"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"d17e535bb95e40f6a1f34513a9d56838","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1678","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":301,"id":"e7658"}||{"x":335,"y":-625,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C173","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1678","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":302,"id":"e7659"}||{"x":365,"y":-625,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1678","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":303,"id":"e7660"}||{"x":360,"y":-625,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"7f1a7664eecc4d3cb1f55bc18fa4728a","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1678","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":304,"id":"e7662"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1678","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":305,"id":"e7663"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1678","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":306,"id":"e7664"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1678","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":307,"id":"e1712"}||{"partId":"CC0402JRNPO9BN100.1","x":315,"y":-650,"rotation":90,"isMirror":false,"attrs":{},"zIndex":424,"locked":false}|
{"type":"ATTR","ticket":308,"id":"e8377"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"1b69028463d846bfb68f41ac51a40dd3","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1712","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":309,"id":"e7570"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"d17e535bb95e40f6a1f34513a9d56838","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1712","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":310,"id":"e7588"}||{"x":325,"y":-655,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C171","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1712","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":311,"id":"e7589"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e1712","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":312,"id":"e7590"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC","keyVisible":null,"valueVisible":null,"key":"Value","fillColor":null,"parentId":"e1712","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":313,"id":"e7591"}||{"x":325,"y":-645,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1712","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":314,"id":"e7592"}||{"x":315,"y":-650,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"7f1a7664eecc4d3cb1f55bc18fa4728a","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1712","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":315,"id":"e7594"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1712","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":316,"id":"e7595"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1712","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":317,"id":"e7596"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1712","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":318,"id":"e7597"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1712","zIndex":19,"locked":false}|
{"type":"COMPONENT","ticket":319,"id":"e1746"}||{"partId":"CC0402JRNPO9BN100.1","x":395,"y":-650,"rotation":90,"isMirror":false,"attrs":{},"zIndex":437,"locked":false}|
{"type":"ATTR","ticket":320,"id":"e8399"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"1b69028463d846bfb68f41ac51a40dd3","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1746","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":321,"id":"e7604"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"d17e535bb95e40f6a1f34513a9d56838","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1746","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":322,"id":"e7622"}||{"x":405,"y":-655,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C172","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1746","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":323,"id":"e7623"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e1746","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":324,"id":"e7624"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC","keyVisible":null,"valueVisible":null,"key":"Value","fillColor":null,"parentId":"e1746","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":325,"id":"e7625"}||{"x":405,"y":-645,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1746","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":326,"id":"e7626"}||{"x":395,"y":-650,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"7f1a7664eecc4d3cb1f55bc18fa4728a","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1746","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":327,"id":"e7628"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1746","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":328,"id":"e7629"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1746","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":329,"id":"e7630"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1746","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":330,"id":"e7631"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1746","zIndex":19,"locked":false}|
{"type":"COMPONENT","ticket":331,"id":"e1780"}||{"partId":"pid8a0e77bacb214e","x":314.99999999999994,"y":-675,"rotation":180,"isMirror":false,"attrs":{},"zIndex":237,"locked":false}|
{"type":"ATTR","ticket":332,"id":"e1786"}||{"x":314.99999999999994,"y":-705,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1780","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":333,"id":"e1787"}||{"x":314.99999999999994,"y":-700,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e1780","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":334,"id":"e1788"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1780","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":335,"id":"e1792"}||{"partId":"pid8a0e77bacb214e","x":394.99999999999994,"y":-675,"rotation":180,"isMirror":false,"attrs":{},"zIndex":241,"locked":false}|
{"type":"ATTR","ticket":336,"id":"e1798"}||{"x":394.99999999999994,"y":-705,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1792","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":337,"id":"e1799"}||{"x":394.99999999999994,"y":-700,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e1792","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":338,"id":"e1800"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1792","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":339,"id":"e1804"}||{"partId":"BWIPX-1-001E.1","x":255.00000000000003,"y":-630,"rotation":180,"isMirror":false,"attrs":{},"zIndex":227,"locked":false}|
{"type":"ATTR","ticket":340,"id":"e1831"}||{"x":230,"y":-645,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"RF1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1804","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":341,"id":"e1832"}||{"x":230,"y":-605,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1804","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":342,"id":"e1833"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"c9a1a24f92ae46b9976f540716b30d7a","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1804","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":343,"id":"e1835"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1804","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":344,"id":"e1836"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1804","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":345,"id":"e1837"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1804","zIndex":14,"locked":false}|
{"type":"COMPONENT","ticket":346,"id":"e1853"}||{"partId":"0.1","x":410,"y":-625,"rotation":90,"isMirror":false,"attrs":{},"zIndex":411,"locked":false}|
{"type":"ATTR","ticket":347,"id":"e7433"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC","keyVisible":null,"valueVisible":null,"key":"Supplier Part","fillColor":null,"parentId":"e1853","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":348,"id":"e7449"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"±800ppm/℃","keyVisible":false,"valueVisible":false,"key":"Temperature Coefficient","fillColor":null,"parentId":"e1853","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":349,"id":"e7452"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1853","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":350,"id":"e7454"}||{"x":405,"y":-630,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R60","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1853","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":351,"id":"e7455"}||{"x":425,"y":-630,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1853","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":352,"id":"e7456"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"7fa3c863d977457c873497e6832c56d6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1853","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":353,"id":"e7457"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1853","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":354,"id":"e7458"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1853","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":355,"id":"e7459"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1853","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":356,"id":"e7461"}||{"x":405,"y":-610,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"NC/0Ω","keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e1853","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":357,"id":"e7462"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1853","zIndex":19,"locked":false}|
{"type":"WIRE","ticket":358,"id":"e760"}||{"zIndex":69,"locked":false}|
{"type":"LINE","ticket":359,"id":"a6edab400d9e2459"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":160,"startY":-465,"endX":180,"endY":-465,"lineGroup":"e760"}|
{"type":"LINE","ticket":360,"id":"e680cafa55860812"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":160,"startY":-465,"endX":160,"endY":-410,"lineGroup":"e760"}|
{"type":"LINE","ticket":361,"id":"a78f73c28262e254"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":160,"startY":-410,"endX":180,"endY":-410,"lineGroup":"e760"}|
{"type":"LINE","ticket":362,"id":"ab00c8cab4bb8f80"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":160,"startY":-395,"endX":160,"endY":-410,"lineGroup":"e760"}|
{"type":"LINE","ticket":363,"id":"e88e6473ebd64902"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":270,"startY":-395,"endX":160,"endY":-395,"lineGroup":"e760"}|
{"type":"LINE","ticket":364,"id":"35bf24a71f975ba8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":270,"startY":-395,"endX":370,"endY":-395,"lineGroup":"e760"}|
{"type":"LINE","ticket":365,"id":"564ead86ae38f062"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":370,"startY":-395,"endX":370,"endY":-450,"lineGroup":"e760"}|
{"type":"LINE","ticket":366,"id":"f770cfb787034099"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":345,"startY":-450,"endX":370,"endY":-450,"lineGroup":"e760"}|
{"type":"LINE","ticket":367,"id":"dab15e94e0c9d3ef"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":270,"startY":-395,"endX":270,"endY":-430,"lineGroup":"e760"}|
{"type":"LINE","ticket":368,"id":"c2d60481824b28c7"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":270,"startY":-430,"endX":285,"endY":-430,"lineGroup":"e760"}|
{"type":"WIRE","ticket":369,"id":"e761"}||{"zIndex":67,"locked":false}|
{"type":"LINE","ticket":370,"id":"1c200141e027e8af"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":345,"startY":-430,"endX":360,"endY":-430,"lineGroup":"e761"}|
{"type":"LINE","ticket":371,"id":"75fb941ec24e91ec"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":360,"startY":-410,"endX":360,"endY":-430,"lineGroup":"e761"}|
{"type":"LINE","ticket":372,"id":"94277b3b4a47e47a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":210,"startY":-410,"endX":360,"endY":-410,"lineGroup":"e761"}|
{"type":"WIRE","ticket":373,"id":"e763"}||{"zIndex":65,"locked":false}|
{"type":"LINE","ticket":374,"id":"d13609606656bf88"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":270,"startY":-450,"endX":285,"endY":-450,"lineGroup":"e763"}|
{"type":"LINE","ticket":375,"id":"eb8793bc79425633"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":270,"startY":-450,"endX":270,"endY":-465,"lineGroup":"e763"}|
{"type":"LINE","ticket":376,"id":"1e5d361c5511603d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":210,"startY":-465,"endX":270,"endY":-465,"lineGroup":"e763"}|
{"type":"WIRE","ticket":377,"id":"e765"}||{"zIndex":46,"locked":false}|
{"type":"LINE","ticket":378,"id":"a63686e21008030a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":450,"startY":-400,"endX":450,"endY":-405,"lineGroup":"e765"}|
{"type":"LINE","ticket":379,"id":"6aaabcbff62148e0"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":410,"startY":-400,"endX":450,"endY":-400,"lineGroup":"e765"}|
{"type":"LINE","ticket":380,"id":"2d45af3c89a382a6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":410,"startY":-400,"endX":410,"endY":-405,"lineGroup":"e765"}|
{"type":"WIRE","ticket":381,"id":"e766"}||{"zIndex":44,"locked":false}|
{"type":"LINE","ticket":382,"id":"f9d2443a28dfe0bf"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":450,"startY":-440,"endX":450,"endY":-435,"lineGroup":"e766"}|
{"type":"LINE","ticket":383,"id":"85ae4821c2efa3d0"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":450,"startY":-440,"endX":410,"endY":-440,"lineGroup":"e766"}|
{"type":"LINE","ticket":384,"id":"045bd092bbeb76e6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":410,"startY":-440,"endX":410,"endY":-435,"lineGroup":"e766"}|
{"type":"LINE","ticket":385,"id":"4df77cdfd1cb5644"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":570,"startY":-440,"endX":450,"endY":-440,"lineGroup":"e766"}|
{"type":"WIRE","ticket":386,"id":"e767"}||{"zIndex":40,"locked":false}|
{"type":"LINE","ticket":387,"id":"f988b231520652e1"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":485,"startY":-430,"endX":570,"endY":-430,"lineGroup":"e767"}|
{"type":"WIRE","ticket":388,"id":"e769"}||{"zIndex":42,"locked":false}|
{"type":"LINE","ticket":389,"id":"9075832df6930989"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":485,"startY":-420,"endX":570,"endY":-420,"lineGroup":"e769"}|
{"type":"WIRE","ticket":390,"id":"e771"}||{"zIndex":36,"locked":false}|
{"type":"LINE","ticket":391,"id":"3d2bb7bc5ee8729f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":555,"startY":-500,"endX":570,"endY":-500,"lineGroup":"e771"}|
{"type":"WIRE","ticket":392,"id":"e772"}||{"zIndex":55,"locked":false}|
{"type":"LINE","ticket":393,"id":"16f22b92febbf198"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":860,"startY":-500,"endX":830,"endY":-500,"lineGroup":"e772"}|
{"type":"WIRE","ticket":394,"id":"e773"}||{"zIndex":59,"locked":false}|
{"type":"LINE","ticket":395,"id":"1adc201527604c3f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":750,"startY":-285,"endX":750,"endY":-270,"lineGroup":"e773"}|
{"type":"LINE","ticket":396,"id":"2d93e60343419c4e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":790,"startY":-285,"endX":750,"endY":-285,"lineGroup":"e773"}|
{"type":"LINE","ticket":397,"id":"77c418792e7f26dc"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":790,"startY":-285,"endX":790,"endY":-270,"lineGroup":"e773"}|
{"type":"LINE","ticket":398,"id":"d88032fc9e1def92"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":750,"startY":-330,"endX":750,"endY":-285,"lineGroup":"e773"}|
{"type":"LINE","ticket":399,"id":"65c1bdf6db444e2b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":750,"startY":-330,"endX":750,"endY":-340,"lineGroup":"e773"}|
{"type":"WIRE","ticket":400,"id":"e774"}||{"zIndex":64,"locked":false}|
{"type":"LINE","ticket":401,"id":"4860e1ba2233c216"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":850,"startY":-300,"endX":850,"endY":-420,"lineGroup":"e774"}|
{"type":"LINE","ticket":402,"id":"afbfeb87fab37b91"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":850,"startY":-270,"endX":850,"endY":-300,"lineGroup":"e774"}|
{"type":"LINE","ticket":403,"id":"305a06f77cb12629"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":905,"startY":-300,"endX":850,"endY":-300,"lineGroup":"e774"}|
{"type":"LINE","ticket":404,"id":"98ff8747627bfb47"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":905,"startY":-300,"endX":905,"endY":-270,"lineGroup":"e774"}|
{"type":"LINE","ticket":405,"id":"e35efbe7b8dbb4c6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":840,"startY":-300,"endX":850,"endY":-300,"lineGroup":"e774"}|
{"type":"LINE","ticket":406,"id":"ad3973c8d158057a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":830,"startY":-420,"endX":850,"endY":-420,"lineGroup":"e774"}|
{"type":"WIRE","ticket":407,"id":"e775"}||{"zIndex":72,"locked":false}|
{"type":"LINE","ticket":408,"id":"51983a4a6a0fe866"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":405,"startY":-320,"endX":405,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":409,"id":"fccac6dd15222e02"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":370,"startY":-330,"endX":405,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":410,"id":"0289d35aedd7638c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":370,"startY":-330,"endX":370,"endY":-320,"lineGroup":"e775"}|
{"type":"LINE","ticket":411,"id":"85b674fe30c395b5"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":405,"startY":-330,"endX":440,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":412,"id":"79778664e89c804d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":440,"startY":-320,"endX":440,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":413,"id":"f9f4bbd539bcbabd"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":440,"startY":-330,"endX":475,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":414,"id":"82e760d0c296c5ee"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":475,"startY":-320,"endX":475,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":415,"id":"981d2523883d70a5"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":475,"startY":-330,"endX":510,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":416,"id":"964c4863ff987617"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":510,"startY":-320,"endX":510,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":417,"id":"c4d104ef8c5bbe84"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":510,"startY":-330,"endX":545,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":418,"id":"4e2d317376c226cb"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":545,"startY":-330,"endX":545,"endY":-320,"lineGroup":"e775"}|
{"type":"LINE","ticket":419,"id":"b801a948963fccd1"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":545,"startY":-330,"endX":580,"endY":-330,"lineGroup":"e775"}|
{"type":"LINE","ticket":420,"id":"7c0e1451006cf3b8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":580,"startY":-330,"endX":580,"endY":-320,"lineGroup":"e775"}|
{"type":"WIRE","ticket":421,"id":"e776"}||{"zIndex":22,"locked":false}|
{"type":"LINE","ticket":422,"id":"4aab1c7802b9eb36"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":670,"startY":-250,"endX":670,"endY":-340,"lineGroup":"e776"}|
{"type":"LINE","ticket":423,"id":"beb429684cc28fd6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":545,"startY":-250,"endX":545,"endY":-290,"lineGroup":"e776"}|
{"type":"LINE","ticket":424,"id":"ba7960a45af14e1d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":545,"startY":-250,"endX":670,"endY":-250,"lineGroup":"e776"}|
{"type":"WIRE","ticket":425,"id":"e778"}||{"zIndex":34,"locked":false}|
{"type":"LINE","ticket":426,"id":"e5b5501b958962f7"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":650,"startY":-260,"endX":650,"endY":-340,"lineGroup":"e778"}|
{"type":"LINE","ticket":427,"id":"3966b4257132f9c6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":580,"startY":-260,"endX":650,"endY":-260,"lineGroup":"e778"}|
{"type":"LINE","ticket":428,"id":"c85947e616081946"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":580,"startY":-290,"endX":580,"endY":-260,"lineGroup":"e778"}|
{"type":"WIRE","ticket":429,"id":"e780"}||{"zIndex":24,"locked":false}|
{"type":"LINE","ticket":430,"id":"0374b7a03e973aa2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":680,"startY":-240,"endX":680,"endY":-340,"lineGroup":"e780"}|
{"type":"LINE","ticket":431,"id":"d5383f3d884c4881"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":510,"startY":-240,"endX":510,"endY":-290,"lineGroup":"e780"}|
{"type":"LINE","ticket":432,"id":"41ed7ab8a2d05fe4"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":510,"startY":-240,"endX":680,"endY":-240,"lineGroup":"e780"}|
{"type":"WIRE","ticket":433,"id":"e782"}||{"zIndex":26,"locked":false}|
{"type":"LINE","ticket":434,"id":"fb0872e94d218d50"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":690,"startY":-230,"endX":690,"endY":-340,"lineGroup":"e782"}|
{"type":"LINE","ticket":435,"id":"5064dff86f2c539e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":475,"startY":-230,"endX":475,"endY":-290,"lineGroup":"e782"}|
{"type":"LINE","ticket":436,"id":"18b973dfc367c1d8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":475,"startY":-230,"endX":690,"endY":-230,"lineGroup":"e782"}|
{"type":"WIRE","ticket":437,"id":"e784"}||{"zIndex":28,"locked":false}|
{"type":"LINE","ticket":438,"id":"6ffdcffa8dec52d9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":700,"startY":-220,"endX":700,"endY":-340,"lineGroup":"e784"}|
{"type":"LINE","ticket":439,"id":"ce8f882947822308"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":440,"startY":-220,"endX":440,"endY":-290,"lineGroup":"e784"}|
{"type":"LINE","ticket":440,"id":"c0c00460353bd757"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":440,"startY":-220,"endX":700,"endY":-220,"lineGroup":"e784"}|
{"type":"WIRE","ticket":441,"id":"e786"}||{"zIndex":30,"locked":false}|
{"type":"LINE","ticket":442,"id":"d645b5bd7b76e6a6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":710,"startY":-210,"endX":710,"endY":-340,"lineGroup":"e786"}|
{"type":"LINE","ticket":443,"id":"7305ab2da1233c1f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":405,"startY":-210,"endX":405,"endY":-290,"lineGroup":"e786"}|
{"type":"LINE","ticket":444,"id":"26d7ea26e5430132"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":405,"startY":-210,"endX":710,"endY":-210,"lineGroup":"e786"}|
{"type":"WIRE","ticket":445,"id":"e788"}||{"zIndex":32,"locked":false}|
{"type":"LINE","ticket":446,"id":"96f4c9b7b0ecd987"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":720,"startY":-200,"endX":720,"endY":-340,"lineGroup":"e788"}|
{"type":"LINE","ticket":447,"id":"712617799c989cdd"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":370,"startY":-200,"endX":370,"endY":-290,"lineGroup":"e788"}|
{"type":"LINE","ticket":448,"id":"9ae6184e9402fc63"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":370,"startY":-200,"endX":720,"endY":-200,"lineGroup":"e788"}|
{"type":"WIRE","ticket":449,"id":"e790"}||{"zIndex":57,"locked":false}|
{"type":"LINE","ticket":450,"id":"61d6827d344ce877"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":750,"startY":-240,"endX":750,"endY":-230,"lineGroup":"e790"}|
{"type":"LINE","ticket":451,"id":"1d17450bd91640e5"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":750,"startY":-230,"endX":790,"endY":-230,"lineGroup":"e790"}|
{"type":"LINE","ticket":452,"id":"0137235674b5dddd"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":790,"startY":-230,"endX":790,"endY":-240,"lineGroup":"e790"}|
{"type":"LINE","ticket":453,"id":"42cee4d3700b75a8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":730,"startY":-230,"endX":750,"endY":-230,"lineGroup":"e790"}|
{"type":"LINE","ticket":454,"id":"308dab7e6864fc13"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":730,"startY":-340,"endX":730,"endY":-230,"lineGroup":"e790"}|
{"type":"WIRE","ticket":455,"id":"e791"}||{"zIndex":63,"locked":false}|
{"type":"LINE","ticket":456,"id":"64623e649b01b3a9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":740,"startY":-300,"endX":740,"endY":-340,"lineGroup":"e791"}|
{"type":"LINE","ticket":457,"id":"97a9911c68c02ed2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":780,"startY":-300,"endX":740,"endY":-300,"lineGroup":"e791"}|
{"type":"WIRE","ticket":458,"id":"e792"}||{"zIndex":61,"locked":false}|
{"type":"LINE","ticket":459,"id":"14ceb71ad2f29261"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":850,"startY":-240,"endX":850,"endY":-230,"lineGroup":"e792"}|
{"type":"LINE","ticket":460,"id":"033bff0d9b272149"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":905,"startY":-230,"endX":850,"endY":-230,"lineGroup":"e792"}|
{"type":"LINE","ticket":461,"id":"1f165ed41021614f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":905,"startY":-240,"endX":905,"endY":-230,"lineGroup":"e792"}|
{"type":"WIRE","ticket":462,"id":"e793"}||{"zIndex":53,"locked":false}|
{"type":"LINE","ticket":463,"id":"91021a3dae132ef1"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":860,"startY":-520,"endX":830,"endY":-520,"lineGroup":"e793"}|
{"type":"WIRE","ticket":464,"id":"e796"}||{"zIndex":38,"locked":false}|
{"type":"LINE","ticket":465,"id":"cc9d9fb0936074fd"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":570,"startY":-520,"endX":555,"endY":-520,"lineGroup":"e796"}|
{"type":"WIRE","ticket":466,"id":"e797"}||{"zIndex":51,"locked":false}|
{"type":"LINE","ticket":467,"id":"a211517948af7bdb"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":730,"startY":-600,"endX":730,"endY":-600,"lineGroup":"e797"}|
{"type":"WIRE","ticket":468,"id":"e798"}||{"zIndex":209,"locked":false}|
{"type":"LINE","ticket":469,"id":"5d2317457d9f9f1f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":360,"startY":-575,"endX":360,"endY":-570,"lineGroup":"e798"}|
{"type":"LINE","ticket":470,"id":"0bee434c0a52059b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":360,"startY":-575,"endX":330,"endY":-575,"lineGroup":"e798"}|
{"type":"LINE","ticket":471,"id":"5fe6fd7adfc8d170"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":360,"startY":-575,"endX":395,"endY":-575,"lineGroup":"e798"}|
{"type":"WIRE","ticket":472,"id":"e799"}||{"zIndex":48,"locked":false}|
{"type":"LINE","ticket":473,"id":"3e85c30f665a1175"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":445,"startY":-510,"endX":570,"endY":-510,"lineGroup":"e799"}|
{"type":"LINE","ticket":474,"id":"e946b6630b3e74e3"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":445,"startY":-510,"endX":445,"endY":-575,"lineGroup":"e799"}|
{"type":"LINE","ticket":475,"id":"c9e23a972358d66b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":445,"startY":-575,"endX":425,"endY":-575,"lineGroup":"e799"}|
{"type":"LINE","ticket":476,"id":"96e48d03870b68c0"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":445,"startY":-625,"endX":445,"endY":-575,"lineGroup":"e799"}|
{"type":"LINE","ticket":477,"id":"c5a201012112565f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":425,"startY":-625,"endX":445,"endY":-625,"lineGroup":"e799"}|
{"type":"WIRE","ticket":478,"id":"e801"}||{"zIndex":207,"locked":false}|
{"type":"LINE","ticket":479,"id":"5f1169c130dd2649"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":360,"startY":-510,"endX":360,"endY":-510,"lineGroup":"e801"}|
{"type":"WIRE","ticket":480,"id":"e802"}||{"zIndex":71,"locked":false}|
{"type":"LINE","ticket":481,"id":"7034157b22e4dd65"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":160,"startY":-575,"endX":300,"endY":-575,"lineGroup":"e802"}|
{"type":"LINE","ticket":482,"id":"73bf344aa1ee7a08"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":160,"startY":-585,"endX":160,"endY":-575,"lineGroup":"e802"}|
{"type":"WIRE","ticket":483,"id":"e1847"}||{"zIndex":236,"locked":false}|
{"type":"LINE","ticket":484,"id":"67f783583291ca6b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":395,"startY":-625,"endX":395,"endY":-635,"lineGroup":"e1847"}|
{"type":"LINE","ticket":485,"id":"5113b69d5d3b6920"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":375,"startY":-625,"endX":395,"endY":-625,"lineGroup":"e1847"}|
{"type":"WIRE","ticket":486,"id":"e1848"}||{"zIndex":235,"locked":false}|
{"type":"LINE","ticket":487,"id":"4a4b0cba95996862"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":290,"startY":-625,"endX":315,"endY":-625,"lineGroup":"e1848"}|
{"type":"LINE","ticket":488,"id":"1e13272f35c6d67b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":315,"startY":-625,"endX":345,"endY":-625,"lineGroup":"e1848"}|
{"type":"LINE","ticket":489,"id":"3643aed343ba85e4"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":5,"startX":315,"startY":-635,"endX":315,"endY":-625,"lineGroup":"e1848"}|
{"type":"WIRE","ticket":490,"id":"e1849"}||{"zIndex":225,"locked":false}|
{"type":"LINE","ticket":491,"id":"1afa5ce8b987a2dc"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":315,"startY":-675,"endX":315,"endY":-670,"lineGroup":"e1849"}|
{"type":"LINE","ticket":492,"id":"eb8f4fb6189a2039"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":315,"startY":-670,"endX":315,"endY":-665,"lineGroup":"e1849"}|
{"type":"LINE","ticket":493,"id":"6d239a6795572fd8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":315,"startY":-670,"endX":290,"endY":-670,"lineGroup":"e1849"}|
{"type":"LINE","ticket":494,"id":"b8efd5f7e417f372"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":290,"startY":-670,"endX":290,"endY":-635,"lineGroup":"e1849"}|
{"type":"LINE","ticket":495,"id":"4e75d2dabd70742e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":290,"startY":-670,"endX":220,"endY":-670,"lineGroup":"e1849"}|
{"type":"LINE","ticket":496,"id":"e6d50a96c55ed99f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":220,"startY":-670,"endX":220,"endY":-630,"lineGroup":"e1849"}|
{"type":"WIRE","ticket":497,"id":"e1850"}||{"zIndex":223,"locked":false}|
{"type":"LINE","ticket":498,"id":"f68be526f4bf19d8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":395,"startY":-675,"endX":395,"endY":-665,"lineGroup":"e1850"}|
{"type":"ATTR","ticket":499,"id":"e762"}||{"x":285,"y":-410,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"26MHZ_XOUT","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e761","zIndex":68,"locked":false}|
{"type":"ATTR","ticket":500,"id":"e764"}||{"x":255,"y":-465,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"26MHZ_XIN","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e763","zIndex":66,"locked":false}|
{"type":"ATTR","ticket":501,"id":"e768"}||{"x":495,"y":-430,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"26MHZ_XIN","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e767","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":502,"id":"e770"}||{"x":495,"y":-420,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"26MHZ_XOUT","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e769","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":503,"id":"e777"}||{"x":590,"y":-250,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"WIFI_D2","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e776","zIndex":23,"locked":false}|
{"type":"ATTR","ticket":504,"id":"e779"}||{"x":590,"y":-260,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"WIFI_REGON","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e778","zIndex":35,"locked":false}|
{"type":"ATTR","ticket":505,"id":"e781"}||{"x":590,"y":-240,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"WIFI_D3","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e780","zIndex":25,"locked":false}|
{"type":"ATTR","ticket":506,"id":"e783"}||{"x":590,"y":-230,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"WIFI_CMD","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e782","zIndex":27,"locked":false}|
{"type":"ATTR","ticket":507,"id":"e785"}||{"x":590,"y":-220,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"WIFI_CLK","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e784","zIndex":29,"locked":false}|
{"type":"ATTR","ticket":508,"id":"e787"}||{"x":590,"y":-210,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"WIFI_D0","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e786","zIndex":31,"locked":false}|
{"type":"ATTR","ticket":509,"id":"e789"}||{"x":590,"y":-200,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"WIFI_D1","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e788","zIndex":33,"locked":false}|
{"type":"ATTR","ticket":510,"id":"e803"}||{"x":475,"y":-325,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e775","zIndex":20,"locked":false}|
{"type":"ATTR","ticket":511,"id":"e804"}||{"x":270,"y":-430,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e760","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":512,"id":"e805"}||{"x":877.5,"y":-230,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e792","zIndex":62,"locked":false}|
{"type":"ATTR","ticket":513,"id":"e806"}||{"x":770,"y":-285,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e773","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":514,"id":"e807"}||{"x":730,"y":-285,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e790","zIndex":58,"locked":false}|
{"type":"ATTR","ticket":515,"id":"e808"}||{"x":845,"y":-500,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e772","zIndex":56,"locked":false}|
{"type":"ATTR","ticket":516,"id":"e809"}||{"x":845,"y":-520,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e793","zIndex":54,"locked":false}|
{"type":"ATTR","ticket":517,"id":"e810"}||{"x":430,"y":-400,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e765","zIndex":47,"locked":false}|
{"type":"ATTR","ticket":518,"id":"e811"}||{"x":490,"y":-440,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e766","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":519,"id":"e812"}||{"x":562.5,"y":-520,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e796","zIndex":39,"locked":false}|
{"type":"ATTR","ticket":520,"id":"e813"}||{"x":562.5,"y":-500,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e771","zIndex":37,"locked":false}|
{"type":"ATTR","ticket":521,"id":"e814"}||{"x":730,"y":-600,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e797","zIndex":52,"locked":false}|
{"type":"ATTR","ticket":522,"id":"e815"}||{"x":360,"y":-510,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e801","zIndex":208,"locked":false}|
{"type":"ATTR","ticket":523,"id":"e1851"}||{"x":267.5,"y":-670,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e1849","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":524,"id":"e1852"}||{"x":395,"y":-670,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e1850","zIndex":224,"locked":false}|
{"type":"ATTR","ticket":525,"id":"e1882"}||{"x":455,"y":-510,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"RF_INOUT","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e799","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":526,"id":"e1883"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e799","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":527,"id":"e9877"}||{"parentId":"e436-ie16","key":"NO_CONNECT","x":570,"y":-490,"value":"yes","zIndex":96,"locked":false}|
{"type":"ATTR","ticket":528,"id":"e9878"}||{"parentId":"e436-ie20","key":"NO_CONNECT","x":570,"y":-480,"value":"yes","zIndex":97,"locked":false}|
{"type":"ATTR","ticket":529,"id":"e9879"}||{"parentId":"e436-ie24","key":"NO_CONNECT","x":570,"y":-470,"value":"yes","zIndex":98,"locked":false}|
{"type":"ATTR","ticket":530,"id":"e9880"}||{"parentId":"e436-ie28","key":"NO_CONNECT","x":570,"y":-460,"value":"yes","zIndex":99,"locked":false}|
{"type":"ATTR","ticket":531,"id":"e9881"}||{"parentId":"e436-ie32","key":"NO_CONNECT","x":570,"y":-450,"value":"yes","zIndex":100,"locked":false}|
{"type":"ATTR","ticket":532,"id":"e9882"}||{"parentId":"e436-ie128","key":"NO_CONNECT","x":830,"y":-510,"value":"yes","zIndex":109,"locked":false}|
{"type":"ATTR","ticket":533,"id":"e9883"}||{"parentId":"e436-ie120","key":"NO_CONNECT","x":830,"y":-490,"value":"yes","zIndex":108,"locked":false}|
{"type":"ATTR","ticket":534,"id":"e9884"}||{"parentId":"e436-ie116","key":"NO_CONNECT","x":830,"y":-480,"value":"yes","zIndex":107,"locked":false}|
{"type":"ATTR","ticket":535,"id":"e9885"}||{"parentId":"e436-ie112","key":"NO_CONNECT","x":830,"y":-470,"value":"yes","zIndex":106,"locked":false}|
{"type":"ATTR","ticket":536,"id":"e9886"}||{"parentId":"e436-ie108","key":"NO_CONNECT","x":830,"y":-460,"value":"yes","zIndex":105,"locked":false}|
{"type":"ATTR","ticket":537,"id":"e9887"}||{"parentId":"e436-ie104","key":"NO_CONNECT","x":830,"y":-450,"value":"yes","zIndex":104,"locked":false}|
{"type":"ATTR","ticket":538,"id":"e9888"}||{"parentId":"e436-ie100","key":"NO_CONNECT","x":830,"y":-440,"value":"yes","zIndex":103,"locked":false}|
{"type":"ATTR","ticket":539,"id":"e9889"}||{"parentId":"e436-ie96","key":"NO_CONNECT","x":830,"y":-430,"value":"yes","zIndex":102,"locked":false}|
{"type":"ATTR","ticket":540,"id":"e9890"}||{"parentId":"e436-ie176","key":"NO_CONNECT","x":650,"y":-600,"value":"yes","zIndex":119,"locked":false}|
{"type":"ATTR","ticket":541,"id":"e9891"}||{"parentId":"e436-ie172","key":"NO_CONNECT","x":660,"y":-600,"value":"yes","zIndex":118,"locked":false}|
{"type":"ATTR","ticket":542,"id":"e9892"}||{"parentId":"e436-ie168","key":"NO_CONNECT","x":670,"y":-600,"value":"yes","zIndex":117,"locked":false}|
{"type":"ATTR","ticket":543,"id":"e9893"}||{"parentId":"e436-ie164","key":"NO_CONNECT","x":680,"y":-600,"value":"yes","zIndex":116,"locked":false}|
{"type":"ATTR","ticket":544,"id":"e9894"}||{"parentId":"e436-ie160","key":"NO_CONNECT","x":690,"y":-600,"value":"yes","zIndex":115,"locked":false}|
{"type":"ATTR","ticket":545,"id":"e9895"}||{"parentId":"e436-ie156","key":"NO_CONNECT","x":700,"y":-600,"value":"yes","zIndex":114,"locked":false}|
{"type":"ATTR","ticket":546,"id":"e9896"}||{"parentId":"e436-ie152","key":"NO_CONNECT","x":710,"y":-600,"value":"yes","zIndex":113,"locked":false}|
{"type":"ATTR","ticket":547,"id":"e9897"}||{"parentId":"e436-ie148","key":"NO_CONNECT","x":720,"y":-600,"value":"yes","zIndex":112,"locked":false}|
{"type":"ATTR","ticket":548,"id":"e9898"}||{"parentId":"e436-ie140","key":"NO_CONNECT","x":740,"y":-600,"value":"yes","zIndex":111,"locked":false}|
{"type":"ATTR","ticket":549,"id":"e9899"}||{"parentId":"e436-ie136","key":"NO_CONNECT","x":750,"y":-600,"value":"yes","zIndex":110,"locked":false}|
{"type":"ATTR","ticket":550,"id":"e9900"}||{"parentId":"e436-ie52","key":"NO_CONNECT","x":660,"y":-340,"value":"yes","zIndex":101,"locked":false}|
{"type":"ATTR","ticket":551,"id":"e9901"}||{"parentId":"e376-e7","key":"NO_CONNECT","x":160,"y":-625,"value":"yes","zIndex":206,"locked":false}|
{"type":"TEXT","ticket":552,"id":"e5930"}||{"x":455,"y":-605,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"50欧阻抗匹配","fillColor":null,"zIndex":388,"locked":false}|
{"type":"ATTR","ticket":553,"id":"30814f2823e49500"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge265","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e48","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":554,"id":"bc8880c820a9f579"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge269","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e140","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":555,"id":"3f8a7f4358702915"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge266","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e73","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":556,"id":"336eecc25317379e"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge267","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e92","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":557,"id":"3306ac99f0963a99"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge268","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e111","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":558,"id":"c0b4456ab6eaaed3"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge271","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e178","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":559,"id":"93ab15da51421cb0"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge272","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e197","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":560,"id":"55b5fb19191c8753"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge273","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e216","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":561,"id":"cf24014270048964"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge276","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e338","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":562,"id":"e2d602bb08d85c03"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge277","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e357","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":563,"id":"dc770eeae307d8d8"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge291","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1853","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":564,"id":"6d61210d1aeb51c5"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge270","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e159","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":565,"id":"881a567daf80ca7a"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge274","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e274","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":566,"id":"e376322d9d96ac8e"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge280","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e581","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":567,"id":"0f5177cbe0b6daa0"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge281","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e610","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":568,"id":"023966103d6996fe"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge283","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e661","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":569,"id":"2afeb31ec8c506a8"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge284","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e680","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":570,"id":"adcba78ad1114283"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge285","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e709","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":571,"id":"2692ea1aec69eb39"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge286","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e728","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":572,"id":"b13e00906699a2c5"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge275","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e316","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":573,"id":"f2fafc6208bf9b34"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge282","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e639","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":574,"id":"c5381a8bd6f5557f"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge278","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e376","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":575,"id":"652e0ea43e880c42"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge279","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e436","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":576,"id":"0b7b5ae60b59159f"}||{"x":360,"y":-625,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge287","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1678","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":577,"id":"52f3ada9f633917d"}||{"x":315,"y":-650,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge288","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1712","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":578,"id":"3e76aa061c4065fb"}||{"x":395,"y":-650,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge289","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1746","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":579,"id":"93f5ca15005947d9"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge290","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1804","zIndex":0,"locked":false}
`
// 规范源码2
window.standardCode2 = `
{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","client":"49c183919c9ed1b1","uuid":"95a20f7ce04649a38d8f4d76714e9aa6","updateTime":1764584867846,"version":"1764584867846"}|
{"type":"CANVAS","ticket":1,"id":"CANVAS"}||{"originX":0,"originY":0}|
{"type":"COMPONENT","ticket":2,"id":"e1"}||{"partId":"pid8a0e77bacb214e","x":0,"y":0,"rotation":0,"isMirror":false,"attrs":{},"zIndex":1,"locked":false}|
{"type":"ATTR","ticket":3,"id":"e20"}||{"x":2506,"y":116,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"d52e3e1d99d84656931d236274ea4a51","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1","zIndex":64,"locked":false}|
{"type":"ATTR","ticket":4,"id":"e35"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Footprint","fillColor":null,"parentId":"e1","zIndex":78,"locked":false}|
{"type":"ATTR","ticket":5,"id":"e36"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Description","fillColor":null,"parentId":"e1","zIndex":79,"locked":false}|
{"type":"ATTR","ticket":6,"id":"e3"}||{"x":998,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"嘉立创EDA","keyVisible":null,"valueVisible":null,"key":"Company","fillColor":null,"parentId":"e1","zIndex":65,"locked":false}|
{"type":"ATTR","ticket":7,"id":"e4"}||{"x":558,"y":-120,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"LCKFB-YZH","keyVisible":null,"valueVisible":null,"key":"Drawed","fillColor":null,"parentId":"e1","zIndex":66,"locked":false}|
{"type":"ATTR","ticket":8,"id":"e5"}||{"x":558,"y":-100,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"","keyVisible":null,"valueVisible":null,"key":"Reviewed","fillColor":null,"parentId":"e1","zIndex":67,"locked":false}|
{"type":"ATTR","ticket":9,"id":"e6"}||{"x":718,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"V1.0","keyVisible":null,"valueVisible":null,"key":"Version","fillColor":null,"parentId":"e1","zIndex":68,"locked":false}|
{"type":"ATTR","ticket":10,"id":"e7"}||{"x":800,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"A4","keyVisible":null,"valueVisible":null,"key":"Page Size","fillColor":null,"parentId":"e1","zIndex":69,"locked":false}|
{"type":"ATTR","ticket":11,"id":"e8"}||{"x":920,"y":-100,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"立创·庐山派K230-CanMV开发板","keyVisible":null,"valueVisible":null,"key":"@Project Name","fillColor":null,"parentId":"e1","zIndex":70,"locked":false}|
{"type":"ATTR","ticket":12,"id":"e9"}||{"x":1102,"y":-61,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"17","keyVisible":null,"valueVisible":null,"key":"@Page Count","fillColor":null,"parentId":"e1","zIndex":71,"locked":false}|
{"type":"ATTR","ticket":13,"id":"e10"}||{"x":1010,"y":-180,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"2024-11-28","keyVisible":null,"valueVisible":null,"key":"@Update Date","fillColor":null,"parentId":"e1","zIndex":72,"locked":false}|
{"type":"ATTR","ticket":14,"id":"e11"}||{"x":1010,"y":-160,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"2024-11-28","keyVisible":null,"valueVisible":null,"key":"@Create Date","fillColor":null,"parentId":"e1","zIndex":73,"locked":false}|
{"type":"ATTR","ticket":15,"id":"e12"}||{"x":730,"y":-170,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"主板原理图","keyVisible":null,"valueVisible":null,"key":"@Schematic Name","fillColor":null,"parentId":"e1","zIndex":74,"locked":false}|
{"type":"ATTR","ticket":16,"id":"e13"}||{"x":1010,"y":-140,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"","keyVisible":null,"valueVisible":null,"key":"Part Number","fillColor":null,"parentId":"e1","zIndex":75,"locked":false}|
{"type":"ATTR","ticket":17,"id":"e14"}||{"x":985,"y":-61,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"16","keyVisible":null,"valueVisible":null,"key":"@Page No","fillColor":null,"parentId":"e1","zIndex":76,"locked":false}|
{"type":"ATTR","ticket":18,"id":"e15"}||{"x":730,"y":-140,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"USB TYPE-A HOST AND BEEP","keyVisible":null,"valueVisible":null,"key":"@Page Name","fillColor":null,"parentId":"e1","zIndex":77,"locked":false}|
{"type":"ATTR","ticket":19,"id":"e19"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9408a6ff71ee48cb92ba5b2b8f815907","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1","zIndex":80,"locked":false}|
{"type":"ATTR","ticket":20,"id":"e4909"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"立创·庐山派K230-CanMV开发板","keyVisible":false,"valueVisible":false,"key":"@Board Name","fillColor":null,"parentId":"e1","zIndex":81,"locked":false}|
{"type":"ATTR","ticket":21,"id":"e4910"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"15:18:33","keyVisible":false,"valueVisible":false,"key":"@Create Time","fillColor":null,"parentId":"e1","zIndex":82,"locked":false}|
{"type":"ATTR","ticket":22,"id":"e4911"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"15:19:33","keyVisible":false,"valueVisible":false,"key":"@Update Time","fillColor":null,"parentId":"e1","zIndex":83,"locked":false}|
{"type":"COMPONENT","ticket":23,"id":"e38"}||{"partId":"AF 10.0 HC6.3.1","x":465,"y":-340,"rotation":0,"isMirror":false,"attrs":{},"zIndex":89,"locked":false}|
{"type":"ATTR","ticket":24,"id":"e63"}||{"x":435,"y":-370,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"USB1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e38","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":25,"id":"e64"}||{"x":435,"y":-310,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e38","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":26,"id":"e65"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"8c03f8f686524e54b03b5aefc3aa44bb","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e38","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":27,"id":"e67"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e38","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":28,"id":"e68"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e38","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":29,"id":"e69"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e38","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":30,"id":"e88"}||{"partId":"pid8a0e77bacb214e","x":515,"y":-295,"rotation":0,"isMirror":false,"attrs":{},"zIndex":122,"locked":false}|
{"type":"ATTR","ticket":31,"id":"e94"}||{"x":515,"y":-265,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e88","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":32,"id":"e95"}||{"x":515,"y":-270,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e88","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":33,"id":"e96"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e88","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":34,"id":"e100"}||{"partId":"pid8a0e77bacb214e","x":400,"y":-290,"rotation":0,"isMirror":false,"attrs":{},"zIndex":118,"locked":false}|
{"type":"ATTR","ticket":35,"id":"e106"}||{"x":400,"y":-260,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e100","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":36,"id":"e107"}||{"x":400,"y":-265,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e100","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":37,"id":"e108"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e100","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":38,"id":"e112"}||{"partId":"pid8a0e77bacb214e","x":370,"y":-270,"rotation":0,"isMirror":false,"attrs":{},"zIndex":114,"locked":false}|
{"type":"ATTR","ticket":39,"id":"e118"}||{"x":370,"y":-240,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e112","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":40,"id":"e119"}||{"x":370,"y":-245,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e112","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":41,"id":"e120"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e112","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":42,"id":"e124"}||{"partId":"KLXES15AAA1.1","x":330,"y":-300,"rotation":90,"isMirror":false,"attrs":{},"zIndex":73,"locked":false}|
{"type":"ATTR","ticket":43,"id":"e142"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"3f58d00549894c6faa970990528fdbf7","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e124","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":44,"id":"e144"}||{"x":340,"y":-305,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"D16","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e124","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":45,"id":"e145"}||{"x":340,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e124","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":46,"id":"e146"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"b85f1000be96423f8e2f90678fd85acc","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e124","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":47,"id":"e148"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e124","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":48,"id":"e149"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e124","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":49,"id":"e150"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e124","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":50,"id":"e4382"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e124","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":51,"id":"e157"}||{"partId":"pid8a0e77bacb214e","x":330,"y":-270,"rotation":0,"isMirror":false,"attrs":{},"zIndex":110,"locked":false}|
{"type":"ATTR","ticket":52,"id":"e163"}||{"x":330,"y":-240,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e157","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":53,"id":"e164"}||{"x":330,"y":-245,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e157","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":54,"id":"e165"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e157","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":55,"id":"e169"}||{"partId":"ERJ2GE0R00X.1","x":250,"y":-310,"rotation":0,"isMirror":false,"attrs":{},"zIndex":23,"locked":false}|
{"type":"ATTR","ticket":56,"id":"e190"}||{"x":265,"y":-290,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Footprint","fillColor":null,"parentId":"e169","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":57,"id":"e192"}||{"x":265,"y":-310,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R94","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e169","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":58,"id":"e193"}||{"x":265,"y":-300,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e169","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":59,"id":"e194"}||{"x":250,"y":-310,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"f9b7bdba7bcb47ec835bb783cb60280c","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e169","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":60,"id":"e196"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e169","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":61,"id":"e197"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e169","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":62,"id":"e198"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e169","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":63,"id":"e205"}||{"partId":"KLXES15AAA1.1","x":370,"y":-300,"rotation":90,"isMirror":false,"attrs":{},"zIndex":63,"locked":false}|
{"type":"ATTR","ticket":64,"id":"e223"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"3f58d00549894c6faa970990528fdbf7","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e205","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":65,"id":"e225"}||{"x":380,"y":-305,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"D17","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e205","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":66,"id":"e226"}||{"x":380,"y":-295,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e205","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":67,"id":"e227"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"b85f1000be96423f8e2f90678fd85acc","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e205","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":68,"id":"e229"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e205","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":69,"id":"e230"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e205","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":70,"id":"e231"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e205","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":71,"id":"e4381"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e205","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":72,"id":"e238"}||{"partId":"pid8a0e77bacb214e","x":395,"y":-370,"rotation":0,"isMirror":false,"attrs":{},"zIndex":101,"locked":false}|
{"type":"ATTR","ticket":73,"id":"e241"}||{"x":395,"y":-340,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e238","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":74,"id":"e242"}||{"x":395,"y":-380,"rotation":0,"color":"#9900FF","fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VCC5V0_USB_HOST","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":"#9900FF","parentId":"e238","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":75,"id":"e243"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e238","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":76,"id":"e244"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VCC5V0_USB_HOST","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e238","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":77,"id":"e248"}||{"partId":"ERJ2GEJ2R2X.1","x":170,"y":-380,"rotation":0,"isMirror":false,"attrs":{},"zIndex":41,"locked":false}|
{"type":"ATTR","ticket":78,"id":"e270"}||{"x":185,"y":-360,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Footprint","fillColor":null,"parentId":"e248","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":79,"id":"e272"}||{"x":185,"y":-380,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R91","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e248","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":80,"id":"e273"}||{"x":185,"y":-370,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e248","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":81,"id":"e274"}||{"x":170,"y":-380,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"f98a9369a55d4c9dbaf7fa5f69301338","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e248","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":82,"id":"e276"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e248","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":83,"id":"e277"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e248","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":84,"id":"e278"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e248","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":85,"id":"e285"}||{"partId":"ERJ2GEJ2R2X.1","x":175,"y":-310,"rotation":0,"isMirror":false,"attrs":{},"zIndex":50,"locked":false}|
{"type":"ATTR","ticket":86,"id":"e307"}||{"x":190,"y":-290,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Footprint","fillColor":null,"parentId":"e285","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":87,"id":"e309"}||{"x":190,"y":-310,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R93","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e285","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":88,"id":"e310"}||{"x":190,"y":-300,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e285","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":89,"id":"e311"}||{"x":175,"y":-310,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"f98a9369a55d4c9dbaf7fa5f69301338","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e285","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":90,"id":"e313"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e285","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":91,"id":"e314"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e285","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":92,"id":"e315"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e285","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":93,"id":"e322"}||{"partId":"ERJ2GE0R00X.1","x":245,"y":-380,"rotation":0,"isMirror":false,"attrs":{},"zIndex":32,"locked":false}|
{"type":"ATTR","ticket":94,"id":"e343"}||{"x":260,"y":-360,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Footprint","fillColor":null,"parentId":"e322","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":95,"id":"e345"}||{"x":260,"y":-380,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R92","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e322","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":96,"id":"e346"}||{"x":260,"y":-370,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e322","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":97,"id":"e347"}||{"x":245,"y":-380,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"f9b7bdba7bcb47ec835bb783cb60280c","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e322","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":98,"id":"e349"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e322","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":99,"id":"e350"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e322","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":100,"id":"e351"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e322","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":101,"id":"e415"}||{"partId":"CL10A106MA8NRNC.1","x":435,"y":-619.9999999999999,"rotation":270,"isMirror":false,"attrs":{},"zIndex":145,"locked":false}|
{"type":"ATTR","ticket":102,"id":"e8420"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"c040b486e22a48ba9b8ce15a6eb8c210","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e415","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":103,"id":"e423"}||{"x":445,"y":-600,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e415","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":104,"id":"e435"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"839342cbb19f4fe9b493df68d3809a70","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e415","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":105,"id":"e436"}||{"x":445,"y":-620,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"C193","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e415","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":106,"id":"e437"}||{"x":445,"y":-610,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e415","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":107,"id":"e438"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"6ef72cbf280f4abea259cdf12c062b19","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e415","zIndex":19,"locked":false}|
{"type":"ATTR","ticket":108,"id":"e439"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e415","zIndex":20,"locked":false}|
{"type":"ATTR","ticket":109,"id":"e440"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e415","zIndex":21,"locked":false}|
{"type":"ATTR","ticket":110,"id":"e441"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e415","zIndex":22,"locked":false}|
{"type":"COMPONENT","ticket":111,"id":"e459"}||{"partId":"pid8a0e77bacb214e","x":385,"y":-710,"rotation":180,"isMirror":false,"attrs":{},"zIndex":135,"locked":false}|
{"type":"ATTR","ticket":112,"id":"e466"}||{"x":385,"y":-740,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e459","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":113,"id":"e467"}||{"x":385,"y":-735,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e459","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":114,"id":"e468"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e459","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":115,"id":"e473"}||{"partId":"pid8a0e77bacb214e","x":435,"y":-590,"rotation":0,"isMirror":false,"attrs":{},"zIndex":156,"locked":false}|
{"type":"ATTR","ticket":116,"id":"e480"}||{"x":435,"y":-560,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e473","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":117,"id":"e481"}||{"x":435,"y":-565,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e473","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":118,"id":"e482"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e473","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":119,"id":"e487"}||{"partId":"pid8a0e77bacb214e","x":114.99999999999999,"y":-595.0000000000002,"rotation":180,"isMirror":false,"attrs":{},"zIndex":181,"locked":false}|
{"type":"ATTR","ticket":120,"id":"e490"}||{"x":114.99999999999999,"y":-625.0000000000002,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e487","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":121,"id":"e491"}||{"x":114.99999999999999,"y":-585.0000000000002,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_TOP","value":"PRE_VDD_5V","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e487","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":122,"id":"e492"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e487","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":123,"id":"e493"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"PRE_VDD_5V","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e487","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":124,"id":"e498"}||{"partId":"CL10A106MA8NRNC.1","x":200,"y":-620,"rotation":270,"isMirror":false,"attrs":{},"zIndex":163,"locked":false}|
{"type":"ATTR","ticket":125,"id":"e8450"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"c040b486e22a48ba9b8ce15a6eb8c210","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e498","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":126,"id":"e506"}||{"x":170,"y":-600,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e498","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":127,"id":"e518"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"839342cbb19f4fe9b493df68d3809a70","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e498","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":128,"id":"e519"}||{"x":170,"y":-620,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"C192","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e498","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":129,"id":"e520"}||{"x":170,"y":-610,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e498","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":130,"id":"e521"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"6ef72cbf280f4abea259cdf12c062b19","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e498","zIndex":19,"locked":false}|
{"type":"ATTR","ticket":131,"id":"e522"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e498","zIndex":20,"locked":false}|
{"type":"ATTR","ticket":132,"id":"e523"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e498","zIndex":21,"locked":false}|
{"type":"ATTR","ticket":133,"id":"e524"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e498","zIndex":22,"locked":false}|
{"type":"COMPONENT","ticket":134,"id":"e532"}||{"partId":"pid8a0e77bacb214e","x":200,"y":-595,"rotation":0,"isMirror":false,"attrs":{},"zIndex":174,"locked":false}|
{"type":"ATTR","ticket":135,"id":"e539"}||{"x":200,"y":-565,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e532","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":136,"id":"e540"}||{"x":200,"y":-570,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e532","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":137,"id":"e541"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e532","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":138,"id":"e546"}||{"partId":"MT9700.1","x":289.99999999999994,"y":-649.9999999999998,"rotation":180,"isMirror":false,"attrs":{},"zIndex":126,"locked":false}|
{"type":"ATTR","ticket":139,"id":"e563"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"f59494644aa04c2596565c6be6ea493e","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e546","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":140,"id":"e564"}||{"x":260,"y":-670,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"U21","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e546","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":141,"id":"e565"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"316b2ee223d740b5a15bf7ff67692da7","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e546","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":142,"id":"e566"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e546","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":143,"id":"e567"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e546","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":144,"id":"e568"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e546","zIndex":14,"locked":false}|
{"type":"COMPONENT","ticket":145,"id":"e597"}||{"partId":"pid8a0e77bacb214e","x":545,"y":-640,"rotation":0,"isMirror":false,"attrs":{},"zIndex":187,"locked":false}|
{"type":"ATTR","ticket":146,"id":"e600"}||{"x":545,"y":-610,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e597","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":147,"id":"e601"}||{"x":545,"y":-650,"rotation":0,"color":"#9900FF","fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VCC5V0_USB_HOST","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":"#9900FF","parentId":"e597","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":148,"id":"e602"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e597","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":149,"id":"e603"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VCC5V0_USB_HOST","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e597","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":150,"id":"e609"}||{"partId":"0402WGF1132TCE.1","x":350,"y":-680,"rotation":90,"isMirror":false,"attrs":{},"zIndex":192,"locked":false}|
{"type":"ATTR","ticket":151,"id":"e610"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"01cd1ec0c605490a92db98d73fc3f752","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e609","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":152,"id":"e611"}||{"x":355,"y":-685,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"R87","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e609","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":153,"id":"e617"}||{"x":355,"y":-675,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e609","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":154,"id":"e620"}||{"x":355,"y":-665,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e609","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":155,"id":"e635"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"edc70a9ce9824ca1bbfabcad0d467bab","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e609","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":156,"id":"e636"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e609","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":157,"id":"e637"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e609","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":158,"id":"e638"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e609","zIndex":19,"locked":false}|
{"type":"COMPONENT","ticket":159,"id":"e684"}||{"partId":"0.1","x":135,"y":-660.0000000000002,"rotation":90,"isMirror":false,"attrs":{},"zIndex":202,"locked":false}|
{"type":"ATTR","ticket":160,"id":"e3638"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e684","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":161,"id":"e689"}||{"x":125,"y":-665.0000000000002,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R88","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e684","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":162,"id":"e690"}||{"x":125,"y":-645.0000000000002,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e684","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":163,"id":"e692"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"53120881d2374527b60cdb1d6b494af4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e684","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":164,"id":"e693"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e684","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":165,"id":"e694"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e684","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":166,"id":"e695"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e684","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":167,"id":"e4383"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e684","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":168,"id":"e722"}||{"partId":"B5819WS_C22624.1","x":915,"y":-559.9999999999999,"rotation":270,"isMirror":false,"attrs":{},"zIndex":239,"locked":false}|
{"type":"ATTR","ticket":169,"id":"e741"}||{"x":875,"y":-545,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e722","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":170,"id":"e742"}||{"x":895,"y":-555,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"D15","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e722","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":171,"id":"e743"}||{"x":925,"y":-570,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e722","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":172,"id":"e744"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"636e26d4f0d14fed9ae9a32f9073d2fe","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e722","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":173,"id":"e746"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e722","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":174,"id":"e747"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e722","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":175,"id":"e748"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e722","zIndex":14,"locked":false}|
{"type":"COMPONENT","ticket":176,"id":"e755"}||{"partId":"pid8a0e77bacb214e","x":835,"y":-560,"rotation":0,"isMirror":false,"attrs":{},"zIndex":248,"locked":false}|
{"type":"ATTR","ticket":177,"id":"e762"}||{"x":835,"y":-530,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e755","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":178,"id":"e763"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e755","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":179,"id":"e767"}||{"partId":"CL10A106KP8NNNC.1","x":875,"y":-585,"rotation":0,"isMirror":false,"attrs":{},"zIndex":308,"locked":false}|
{"type":"ATTR","ticket":180,"id":"e9260"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"19964f6c96ed433f8e48d82730de34f4","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e767","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":181,"id":"e9277"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e767","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":182,"id":"e9278"}||{"x":850,"y":-565,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e767","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":183,"id":"e9279"}||{"x":850,"y":-585,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C194","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e767","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":184,"id":"e9280"}||{"x":850,"y":-575,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e767","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":185,"id":"e9281"}||{"x":865,"y":-555,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e767","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":186,"id":"e9282"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"ebeec43c8fab4348a79f1d17a4c7bd8b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e767","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":187,"id":"e9284"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e767","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":188,"id":"e9285"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e767","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":189,"id":"e9286"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e767","zIndex":18,"locked":false}|
{"type":"COMPONENT","ticket":190,"id":"e845"}||{"partId":"SI2302.1","x":905,"y":-520,"rotation":0,"isMirror":false,"attrs":{},"zIndex":217,"locked":false}|
{"type":"ATTR","ticket":191,"id":"e863"}||{"x":930,"y":-530,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Supplier Footprint","fillColor":null,"parentId":"e845","zIndex":48,"locked":false}|
{"type":"ATTR","ticket":192,"id":"e864"}||{"x":930,"y":-530,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e845","zIndex":49,"locked":false}|
{"type":"ATTR","ticket":193,"id":"e865"}||{"x":925,"y":-515,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"Q1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e845","zIndex":47,"locked":false}|
{"type":"ATTR","ticket":194,"id":"e866"}||{"x":917,"y":-503,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Manufacturer Part","fillColor":null,"parentId":"e845","zIndex":50,"locked":false}|
{"type":"ATTR","ticket":195,"id":"e867"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"LEFT_BOTTOM","value":"1.2V@50A","keyVisible":null,"valueVisible":null,"key":"Gate Threshold Voltage (Vgs(th)@Id)","fillColor":null,"parentId":"e845","zIndex":51,"locked":false}|
{"type":"ATTR","ticket":196,"id":"e868"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"LEFT_BOTTOM","value":"类型:N沟道;漏源电压(Vdss):20V;连续漏极电流(Id):2.1A;功率(Pd):400mW;导通电阻(RDS(on)@Vgs,Id):72mΩ@4.5V,3.6A;阈值电压(Vgs(th)@Id):1.2V@50A;","keyVisible":null,"valueVisible":null,"key":"Description","fillColor":null,"parentId":"e845","zIndex":52,"locked":false}|
{"type":"ATTR","ticket":197,"id":"e869"}||{"x":905,"y":-520,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"CENTER_MIDDLE","value":"61a9fca24035492d811d296a45344700","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e845","zIndex":53,"locked":false}|
{"type":"ATTR","ticket":198,"id":"e870"}||{"x":930,"y":-530,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"LEFT_BOTTOM","value":"","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e845","zIndex":54,"locked":false}|
{"type":"ATTR","ticket":199,"id":"e872"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e845","zIndex":55,"locked":false}|
{"type":"ATTR","ticket":200,"id":"e873"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e845","zIndex":56,"locked":false}|
{"type":"ATTR","ticket":201,"id":"e874"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e845","zIndex":57,"locked":false}|
{"type":"COMPONENT","ticket":202,"id":"e930"}||{"partId":"pid8a0e77bacb214e","x":915,"y":-470,"rotation":0,"isMirror":false,"attrs":{},"zIndex":230,"locked":false}|
{"type":"ATTR","ticket":203,"id":"e932"}||{"x":915,"y":-440,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"RIGHT_TOP","value":"49cfd4408bbd44ab88c7cb17238e86d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e930","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":204,"id":"e933"}||{"x":925,"y":-465,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e930","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":205,"id":"e934"}||{"x":915,"y":-470,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"CENTER_MIDDLE","value":"adac646bc2e4415e86b908dd1933a792","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e930","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":206,"id":"e935"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"LEFT_BOTTOM","value":"GND","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e930","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":207,"id":"e986"}||{"partId":"0402WGF5100TCE.1","x":835,"y":-520,"rotation":0,"isMirror":false,"attrs":{},"zIndex":260,"locked":false}|
{"type":"ATTR","ticket":208,"id":"e987"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"ba2c201cbaa144deabbcb129df1d7821","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e986","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":209,"id":"e988"}||{"x":825,"y":-525,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"R89","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e986","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":210,"id":"e994"}||{"x":825,"y":-505,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e986","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":211,"id":"e997"}||{"x":825,"y":-495,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e986","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":212,"id":"e1012"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"52131924d72b490ba12e32e3c854aa6c","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e986","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":213,"id":"e1013"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e986","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":214,"id":"e1014"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e986","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":215,"id":"e1015"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e986","zIndex":19,"locked":false}|
{"type":"COMPONENT","ticket":216,"id":"e1060"}||{"partId":"0.1","x":869.9999999999999,"y":-500,"rotation":180,"isMirror":false,"attrs":{},"zIndex":270,"locked":false}|
{"type":"ATTR","ticket":217,"id":"e3751"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1060","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":218,"id":"e1065"}||{"x":880,"y":-500,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R90","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1060","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":219,"id":"e1066"}||{"x":880,"y":-490,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1060","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":220,"id":"e1068"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"53120881d2374527b60cdb1d6b494af4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1060","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":221,"id":"e1069"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1060","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":222,"id":"e1070"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1060","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":223,"id":"e1071"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1060","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":224,"id":"e4384"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1060","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":225,"id":"e1103"}||{"partId":"MLT-8530.1","x":970,"y":-545,"rotation":0,"isMirror":false,"attrs":{},"zIndex":289,"locked":false}|
{"type":"ATTR","ticket":226,"id":"e7056"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"Extended Part","keyVisible":false,"valueVisible":false,"key":"JLCPCB Part Class","fillColor":null,"parentId":"e1103","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":227,"id":"e7071"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"驱动方式:无源(外部驱动);构造类型:电磁式;频率:4kHz;","keyVisible":null,"valueVisible":null,"key":"Description","fillColor":null,"parentId":"e1103","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":228,"id":"e7072"}||{"x":990,"y":-560,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"BUZZER1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1103","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":229,"id":"e7073"}||{"x":990,"y":-540,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"2.5V~4.5V","keyVisible":false,"valueVisible":true,"key":"Operating Voltage","fillColor":null,"parentId":"e1103","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":230,"id":"e7074"}||{"x":990,"y":-550,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"4kHz","keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e1103","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":231,"id":"e7075"}||{"x":990,"y":-530,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"80dB@5V,10cm","keyVisible":false,"valueVisible":true,"key":"Sound Pressure Level (SPL)","fillColor":null,"parentId":"e1103","zIndex":19,"locked":false}|
{"type":"ATTR","ticket":232,"id":"e7076"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"f81b7256b1984e22babaf5d02ecc3c00","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1103","zIndex":20,"locked":false}|
{"type":"ATTR","ticket":233,"id":"e7077"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1103","zIndex":21,"locked":false}|
{"type":"ATTR","ticket":234,"id":"e7078"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1103","zIndex":22,"locked":false}|
{"type":"ATTR","ticket":235,"id":"e7079"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1103","zIndex":23,"locked":false}|
{"type":"COMPONENT","ticket":236,"id":"e2308"}||{"partId":"pid8a0e77bacb214e","x":915,"y":-640,"rotation":0,"isMirror":false,"attrs":{},"zIndex":280,"locked":false}|
{"type":"ATTR","ticket":237,"id":"e2311"}||{"x":915,"y":-610,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e2308","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":238,"id":"e2312"}||{"x":915,"y":-655,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VDD_3V3","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e2308","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":239,"id":"e2313"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e2308","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":240,"id":"e2314"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e2308","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":241,"id":"e8142"}||{"partId":"pid8a0e77bacb214e","x":970,"y":-515,"rotation":0,"isMirror":false,"attrs":{},"zIndex":301,"locked":false}|
{"type":"ATTR","ticket":242,"id":"e8143"}||{"x":970,"y":-485,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e8142","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":243,"id":"e8144"}||{"x":970,"y":-490,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e8142","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":244,"id":"e8151"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e8142","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":245,"id":"e10876"}||{"partId":"CC0402KRX7R7BB104.1","x":874.9999999999999,"y":-625.0000000000001,"rotation":180,"isMirror":false,"attrs":{},"zIndex":320,"locked":false}|
{"type":"ATTR","ticket":246,"id":"e10895"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e10876","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":247,"id":"e10896"}||{"x":865,"y":-635,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C195","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e10876","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":248,"id":"e10897"}||{"x":865,"y":-605,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e10876","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":249,"id":"e10898"}||{"x":865,"y":-595,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e10876","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":250,"id":"e10899"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"c0685c18624f451ca4486f816357f7b5","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10876","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":251,"id":"e10900"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e10876","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":252,"id":"e10901"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e10876","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":253,"id":"e10902"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e10876","zIndex":17,"locked":false}|
{"type":"TEXT","ticket":254,"id":"e37"}||{"x":200,"y":-405,"rotation":0,"color":"#9933CC","fontFamily":null,"fontSize":30,"fontWeight":true,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"USB2.0  HOST","fillColor":"#9933CC","zIndex":22,"locked":false}|
{"type":"TEXT","ticket":255,"id":"e377"}||{"x":270,"y":-685,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":"LEFT_BOTTOM","value":"Iset:600mA","fillColor":null,"zIndex":142,"locked":false}|
{"type":"TEXT","ticket":256,"id":"e721"}||{"x":900,"y":-430,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":"LEFT_BOTTOM","value":"蜂鸣器","fillColor":null,"zIndex":216,"locked":false}|
{"type":"TEXT","ticket":257,"id":"e4912"}||{"x":690,"y":-520,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"PWM1","fillColor":null,"zIndex":285,"locked":false}|
{"type":"WIRE","ticket":258,"id":"e358"}||{"zIndex":106,"locked":false}|
{"type":"LINE","ticket":259,"id":"1a536f51c8373cf3"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":395,"startY":-360,"endX":395,"endY":-370,"lineGroup":"e358"}|
{"type":"LINE","ticket":260,"id":"edaed6139d5f4cd0"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":425,"startY":-360,"endX":395,"endY":-360,"lineGroup":"e358"}|
{"type":"WIRE","ticket":261,"id":"e359"}||{"zIndex":87,"locked":false}|
{"type":"LINE","ticket":262,"id":"948b1673eb0fa688"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":400,"startY":-330,"endX":400,"endY":-290,"lineGroup":"e359"}|
{"type":"LINE","ticket":263,"id":"2df53e7eacf3df31"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":425,"startY":-330,"endX":400,"endY":-330,"lineGroup":"e359"}|
{"type":"WIRE","ticket":264,"id":"e360"}||{"zIndex":100,"locked":false}|
{"type":"LINE","ticket":265,"id":"5ca509c04ecefe6c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":310,"startY":-340,"endX":310,"endY":-310,"lineGroup":"e360"}|
{"type":"LINE","ticket":266,"id":"02cc17eed2166e83"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":370,"startY":-340,"endX":310,"endY":-340,"lineGroup":"e360"}|
{"type":"LINE","ticket":267,"id":"3dc620a75bcbde7a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":370,"startY":-340,"endX":370,"endY":-315,"lineGroup":"e360"}|
{"type":"LINE","ticket":268,"id":"354f1cf2bd2a347d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":425,"startY":-340,"endX":370,"endY":-340,"lineGroup":"e360"}|
{"type":"LINE","ticket":269,"id":"baf8ba87d39d8397"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":310,"startY":-310,"endX":270,"endY":-310,"lineGroup":"e360"}|
{"type":"WIRE","ticket":270,"id":"e361"}||{"zIndex":99,"locked":false}|
{"type":"LINE","ticket":271,"id":"a70a35180f8b58eb"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":310,"startY":-350,"endX":310,"endY":-380,"lineGroup":"e361"}|
{"type":"LINE","ticket":272,"id":"a3dae11d714990d8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":330,"startY":-350,"endX":310,"endY":-350,"lineGroup":"e361"}|
{"type":"LINE","ticket":273,"id":"2ff69aca9669ed6b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":330,"startY":-350,"endX":330,"endY":-315,"lineGroup":"e361"}|
{"type":"LINE","ticket":274,"id":"6c0f3522179b98e9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":425,"startY":-350,"endX":330,"endY":-350,"lineGroup":"e361"}|
{"type":"LINE","ticket":275,"id":"913df481fb5d271c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":265,"startY":-380,"endX":310,"endY":-380,"lineGroup":"e361"}|
{"type":"WIRE","ticket":276,"id":"e362"}||{"zIndex":97,"locked":false}|
{"type":"LINE","ticket":277,"id":"6ff35192c40d5d70"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":515,"startY":-330,"endX":515,"endY":-360,"lineGroup":"e362"}|
{"type":"LINE","ticket":278,"id":"2436cdfbc5d06137"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":505,"startY":-360,"endX":515,"endY":-360,"lineGroup":"e362"}|
{"type":"LINE","ticket":279,"id":"c227eed5764d49f8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":515,"startY":-295,"endX":515,"endY":-330,"lineGroup":"e362"}|
{"type":"LINE","ticket":280,"id":"bd6c3cb9a3b9585e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":515,"startY":-330,"endX":505,"endY":-330,"lineGroup":"e362"}|
{"type":"WIRE","ticket":281,"id":"e363"}||{"zIndex":83,"locked":false}|
{"type":"LINE","ticket":282,"id":"7219a1e0e36e83ec"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":330,"startY":-285,"endX":330,"endY":-270,"lineGroup":"e363"}|
{"type":"WIRE","ticket":283,"id":"e364"}||{"zIndex":85,"locked":false}|
{"type":"LINE","ticket":284,"id":"074b2842b246b494"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":370,"startY":-285,"endX":370,"endY":-270,"lineGroup":"e364"}|
{"type":"WIRE","ticket":285,"id":"e365"}||{"zIndex":109,"locked":false}|
{"type":"LINE","ticket":286,"id":"f81e8b21df001418"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":230,"startY":-310,"endX":195,"endY":-310,"lineGroup":"e365"}|
{"type":"WIRE","ticket":287,"id":"e366"}||{"zIndex":59,"locked":false}|
{"type":"LINE","ticket":288,"id":"5b47f6b2337a7bd2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":85,"startY":-380,"endX":150,"endY":-380,"lineGroup":"e366"}|
{"type":"WIRE","ticket":289,"id":"e368"}||{"zIndex":108,"locked":false}|
{"type":"LINE","ticket":290,"id":"c62d71c0a0983c5b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":190,"startY":-380,"endX":225,"endY":-380,"lineGroup":"e368"}|
{"type":"WIRE","ticket":291,"id":"e369"}||{"zIndex":61,"locked":false}|
{"type":"LINE","ticket":292,"id":"62bbe4df94e765b3"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":85,"startY":-310,"endX":155,"endY":-310,"lineGroup":"e369"}|
{"type":"WIRE","ticket":293,"id":"e585"}||{"zIndex":140,"locked":false}|
{"type":"LINE","ticket":294,"id":"a65607a2a7add392"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":350,"startY":-700,"endX":385,"endY":-700,"lineGroup":"e585"}|
{"type":"LINE","ticket":295,"id":"100193b68bbb0476"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":385,"startY":-710,"endX":385,"endY":-700,"lineGroup":"e585"}|
{"type":"LINE","ticket":296,"id":"ef8725d0f1815d8c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":385,"startY":-700,"endX":385,"endY":-650,"lineGroup":"e585"}|
{"type":"LINE","ticket":297,"id":"d0c82a62bdc1d51a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":385,"startY":-650,"endX":340,"endY":-650,"lineGroup":"e585"}|
{"type":"WIRE","ticket":298,"id":"e586"}||{"zIndex":161,"locked":false}|
{"type":"LINE","ticket":299,"id":"3539780509d05eda"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":435,"startY":-590,"endX":435,"endY":-600,"lineGroup":"e586"}|
{"type":"WIRE","ticket":300,"id":"e587"}||{"zIndex":134,"locked":false}|
{"type":"LINE","ticket":301,"id":"7b2e4f30a9cfe6fa"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":350,"startY":-660,"endX":340,"endY":-660,"lineGroup":"e587"}|
{"type":"WIRE","ticket":302,"id":"e588"}||{"zIndex":143,"locked":false}|
{"type":"LINE","ticket":303,"id":"e33501f4cdc4b22e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":435,"startY":-640,"endX":340,"endY":-640,"lineGroup":"e588"}|
{"type":"LINE","ticket":304,"id":"7983dc33c7d57957"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":435,"startY":-640,"endX":545,"endY":-639.9999999999999,"lineGroup":"e588"}|
{"type":"WIRE","ticket":305,"id":"e589"}||{"zIndex":179,"locked":false}|
{"type":"LINE","ticket":306,"id":"4f79da6a946e1c28"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":200,"startY":-595,"endX":200,"endY":-600,"lineGroup":"e589"}|
{"type":"WIRE","ticket":307,"id":"e711"}||{"zIndex":212,"locked":false}|
{"type":"LINE","ticket":308,"id":"e3a015b7e7725afe"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":240,"startY":-659.9999999999998,"endX":150,"endY":-660.0000000000002,"lineGroup":"e711"}|
{"type":"WIRE","ticket":309,"id":"e718"}||{"zIndex":214,"locked":false}|
{"type":"LINE","ticket":310,"id":"40f02b91a6899d59"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":115,"startY":-640,"endX":115,"endY":-595.0000000000002,"lineGroup":"e718"}|
{"type":"LINE","ticket":311,"id":"5692e0fc484a3bdb"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":115,"startY":-660,"endX":120,"endY":-660,"lineGroup":"e718"}|
{"type":"LINE","ticket":312,"id":"c6c1ca0cde73380a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":115,"startY":-640,"endX":200,"endY":-640,"lineGroup":"e718"}|
{"type":"LINE","ticket":313,"id":"9f7eb8eb18946641"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":200,"startY":-639.9999999999998,"endX":240,"endY":-639.9999999999998,"lineGroup":"e718"}|
{"type":"LINE","ticket":314,"id":"9e469a1218276805"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":115,"startY":-640,"endX":115,"endY":-660,"lineGroup":"e718"}|
{"type":"WIRE","ticket":315,"id":"e976"}||{"zIndex":251,"locked":false}|
{"type":"LINE","ticket":316,"id":"8b2b4fd2e2f78d51"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":835,"startY":-585,"endX":835,"endY":-560,"lineGroup":"e976"}|
{"type":"LINE","ticket":317,"id":"040d2522e6c1f2be"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":855,"startY":-585,"endX":835,"endY":-585,"lineGroup":"e976"}|
{"type":"LINE","ticket":318,"id":"1b168b6c58bf7e1e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":835,"startY":-585,"endX":835,"endY":-625,"lineGroup":"e976"}|
{"type":"LINE","ticket":319,"id":"43747842e1558c57"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":835,"startY":-625,"endX":855,"endY":-625,"lineGroup":"e976"}|
{"type":"WIRE","ticket":320,"id":"e977"}||{"zIndex":254,"locked":false}|
{"type":"LINE","ticket":321,"id":"ee49509a110a4118"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":855,"startY":-520,"endX":870,"endY":-520,"lineGroup":"e977"}|
{"type":"LINE","ticket":322,"id":"a9cb9f46aad67f6d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":870,"startY":-515,"endX":870,"endY":-520,"lineGroup":"e977"}|
{"type":"LINE","ticket":323,"id":"5d706286725a4f23"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":895,"startY":-520,"endX":870,"endY":-520,"lineGroup":"e977"}|
{"type":"WIRE","ticket":324,"id":"e979"}||{"zIndex":238,"locked":false}|
{"type":"LINE","ticket":325,"id":"9b15c473ec015f03"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":955,"startY":-540,"endX":915,"endY":-540,"lineGroup":"e979"}|
{"type":"WIRE","ticket":326,"id":"e980"}||{"zIndex":257,"locked":false}|
{"type":"LINE","ticket":327,"id":"d41be0503e0fbdbb"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":940,"startY":-550,"endX":955,"endY":-550,"lineGroup":"e980"}|
{"type":"LINE","ticket":328,"id":"4e5d52c806ade12c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":940,"startY":-585,"endX":940,"endY":-550,"lineGroup":"e980"}|
{"type":"LINE","ticket":329,"id":"c56109963435c813"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":940,"startY":-585,"endX":915,"endY":-585,"lineGroup":"e980"}|
{"type":"LINE","ticket":330,"id":"3009de98a0aa2717"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":915,"startY":-585,"endX":915,"endY":-580,"lineGroup":"e980"}|
{"type":"LINE","ticket":331,"id":"aa962e48e1447a7a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":915,"startY":-585,"endX":895,"endY":-585,"lineGroup":"e980"}|
{"type":"LINE","ticket":332,"id":"77346c7be60a6fa2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":915,"startY":-585,"endX":915,"endY":-625,"lineGroup":"e980"}|
{"type":"LINE","ticket":333,"id":"d724843f524a14f9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":895,"startY":-625,"endX":915,"endY":-625,"lineGroup":"e980"}|
{"type":"LINE","ticket":334,"id":"2d1a7c3122270b6e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":915,"startY":-640,"endX":915,"endY":-625,"lineGroup":"e980"}|
{"type":"WIRE","ticket":335,"id":"e981"}||{"zIndex":235,"locked":false}|
{"type":"LINE","ticket":336,"id":"94b02c64f4a64261"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":915,"startY":-500,"endX":915,"endY":-480,"lineGroup":"e981"}|
{"type":"LINE","ticket":337,"id":"265f401f71ceca2a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":915,"startY":-480,"endX":915,"endY":-470,"lineGroup":"e981"}|
{"type":"LINE","ticket":338,"id":"3231785bdeeb3048"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":870,"startY":-480,"endX":870,"endY":-485,"lineGroup":"e981"}|
{"type":"LINE","ticket":339,"id":"1e0c065efa390527"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":915,"startY":-480,"endX":870,"endY":-480,"lineGroup":"e981"}|
{"type":"WIRE","ticket":340,"id":"e4913"}||{"zIndex":286,"locked":false}|
{"type":"LINE","ticket":341,"id":"8acd106666ec46c2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":815,"startY":-520,"endX":730,"endY":-520,"lineGroup":"e4913"}|
{"type":"WIRE","ticket":342,"id":"e8156"}||{"zIndex":306,"locked":false}|
{"type":"LINE","ticket":343,"id":"02859b1b3a79068e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":970,"startY":-515,"endX":970,"endY":-515,"lineGroup":"e8156"}|
{"type":"ATTR","ticket":344,"id":"e367"}||{"x":85,"y":-380,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"USB1_N","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e366","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":345,"id":"e370"}||{"x":85,"y":-310,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"USB1_P","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e369","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":346,"id":"e371"}||{"x":410,"y":-360,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"VCC5V0_USB_HOST","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e358","zIndex":107,"locked":false}|
{"type":"ATTR","ticket":347,"id":"e372"}||{"x":510,"y":-330,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e362","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":348,"id":"e373"}||{"x":400,"y":-310,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e359","zIndex":88,"locked":false}|
{"type":"ATTR","ticket":349,"id":"e374"}||{"x":370,"y":-277.5,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e364","zIndex":86,"locked":false}|
{"type":"ATTR","ticket":350,"id":"e375"}||{"x":330,"y":-277.5,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e363","zIndex":84,"locked":false}|
{"type":"ATTR","ticket":351,"id":"e592"}||{"x":200,"y":-597.5,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e589","zIndex":180,"locked":false}|
{"type":"ATTR","ticket":352,"id":"e593"}||{"x":435,"y":-600,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e586","zIndex":162,"locked":false}|
{"type":"ATTR","ticket":353,"id":"e594"}||{"x":382.5,"y":-640,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"VCC5V0_USB_HOST","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e588","zIndex":144,"locked":false}|
{"type":"ATTR","ticket":354,"id":"e595"}||{"x":357.5,"y":-700,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e585","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":355,"id":"e719"}||{"x":162.5,"y":-640,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"PRE_VDD_5V","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e718","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":356,"id":"e1087"}||{"x":875,"y":-520,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e977","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":357,"id":"e1088"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e977","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":358,"id":"e1101"}||{"x":900,"y":-480,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e981","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":359,"id":"e1102"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e981","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":360,"id":"e4947"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e4913","zIndex":2,"locked":false}|
{"type":"ATTR","ticket":361,"id":"e6529"}||{"x":175,"y":-660,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"GPIO10","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e711","zIndex":213,"locked":false}|
{"type":"ATTR","ticket":362,"id":"e8158"}||{"x":970.0000000000001,"y":-515,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e8156","zIndex":307,"locked":false}|
{"type":"ATTR","ticket":363,"id":"e9821"}||{"x":730,"y":-520,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"BANK3_GPIO43","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e4913","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":364,"id":"e10922"}||{"x":915,"y":-585,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e980","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":365,"id":"e10923"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e980","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":366,"id":"e10933"}||{"x":835,"y":-572.5,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e976","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":367,"id":"e10934"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e976","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":368,"id":"672800d6e52eed7b"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge339","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e38","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":369,"id":"8444a6bf21f9a79a"}||{"x":370,"y":-720,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"RIGHT_TOP","value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e459","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":370,"id":"9d9cced5c01f2b7d"}||{"x":450,"y":-580,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"LEFT_BOTTOM","value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e473","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":371,"id":"7a385a86f1bcad79"}||{"x":215,"y":-585,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"LEFT_BOTTOM","value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e532","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":372,"id":"a999310962fa52a7"}||{"x":985,"y":-505,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e8142","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":373,"id":"0a1713f1b500efeb"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge340","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e124","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":374,"id":"1112f31d55cce9c7"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge342","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e205","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":375,"id":"8824f7eb17f1bcf9"}||{"x":250,"y":-310,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge341","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e169","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":376,"id":"101c192f12cc79ee"}||{"x":245,"y":-380,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge345","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e322","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":377,"id":"f69e7aac14607c2b"}||{"x":105,"y":-595.0000000000002,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":"RIGHT_TOP","value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e487","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":378,"id":"7e2a9f368e8c841a"}||{"x":170,"y":-380,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge343","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e248","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":379,"id":"1390fe90786b0e1e"}||{"x":175,"y":-310,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge344","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e285","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":380,"id":"ff9f69d6165f0873"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge346","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e415","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":381,"id":"a74ca67648de8f64"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge347","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e498","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":382,"id":"6d61ba2509d48f12"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge348","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e546","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":383,"id":"160cf1a8db9d72f6"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge349","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e609","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":384,"id":"ef52bf6706ab0fdd"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge350","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e684","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":385,"id":"e219410d176e6ab2"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge355","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1060","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":386,"id":"9afb03231ba874c6"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge351","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e722","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":387,"id":"f347006e06282020"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge352","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e767","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":388,"id":"3085cada5c5d3413"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"align":"LEFT_BOTTOM","value":"gge353","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e845","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":389,"id":"90320e4df6ee0cbc"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge354","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e986","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":390,"id":"1da4d2d8314dbc18"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge356","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1103","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":391,"id":"c5e7db87945f00d9"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge335_1","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e10876","zIndex":0,"locked":false}
`
// 规范源码3
window.standardCode3 = `
{"type":"DOCHEAD"}||{"docType":"SCH_PAGE","client":"d9deb8d2c03c65e8","uuid":"a3466e3c2e044764b370fb3764dae889","updateTime":1764584897013,"version":"1764584897013"}|
{"type":"CANVAS","ticket":1,"id":"CANVAS"}||{"originX":0,"originY":0}|
{"type":"COMPONENT","ticket":2,"id":"e1"}||{"partId":"pid8a0e77bacb214e","x":0,"y":0,"rotation":0,"isMirror":false,"attrs":{},"zIndex":1,"locked":false}|
{"type":"ATTR","ticket":3,"id":"e20"}||{"x":2506,"y":116,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"d52e3e1d99d84656931d236274ea4a51","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1","zIndex":64,"locked":false}|
{"type":"ATTR","ticket":4,"id":"e35"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Footprint","fillColor":null,"parentId":"e1","zIndex":78,"locked":false}|
{"type":"ATTR","ticket":5,"id":"e36"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Description","fillColor":null,"parentId":"e1","zIndex":79,"locked":false}|
{"type":"ATTR","ticket":6,"id":"e3"}||{"x":998,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"嘉立创EDA","keyVisible":null,"valueVisible":null,"key":"Company","fillColor":null,"parentId":"e1","zIndex":65,"locked":false}|
{"type":"ATTR","ticket":7,"id":"e4"}||{"x":558,"y":-120,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"LCKFB-YZH","keyVisible":null,"valueVisible":null,"key":"Drawed","fillColor":null,"parentId":"e1","zIndex":66,"locked":false}|
{"type":"ATTR","ticket":8,"id":"e5"}||{"x":558,"y":-100,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"","keyVisible":null,"valueVisible":null,"key":"Reviewed","fillColor":null,"parentId":"e1","zIndex":67,"locked":false}|
{"type":"ATTR","ticket":9,"id":"e6"}||{"x":718,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"V1.0","keyVisible":null,"valueVisible":null,"key":"Version","fillColor":null,"parentId":"e1","zIndex":68,"locked":false}|
{"type":"ATTR","ticket":10,"id":"e7"}||{"x":800,"y":-30,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"A4","keyVisible":null,"valueVisible":null,"key":"Page Size","fillColor":null,"parentId":"e1","zIndex":69,"locked":false}|
{"type":"ATTR","ticket":11,"id":"e8"}||{"x":920,"y":-100,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"立创·庐山派K230-CanMV开发板","keyVisible":null,"valueVisible":null,"key":"@Project Name","fillColor":null,"parentId":"e1","zIndex":70,"locked":false}|
{"type":"ATTR","ticket":12,"id":"e9"}||{"x":1102,"y":-61,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"17","keyVisible":null,"valueVisible":null,"key":"@Page Count","fillColor":null,"parentId":"e1","zIndex":71,"locked":false}|
{"type":"ATTR","ticket":13,"id":"e10"}||{"x":1010,"y":-180,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"2024-11-28","keyVisible":null,"valueVisible":null,"key":"@Update Date","fillColor":null,"parentId":"e1","zIndex":72,"locked":false}|
{"type":"ATTR","ticket":14,"id":"e11"}||{"x":1010,"y":-160,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"2024-11-28","keyVisible":null,"valueVisible":null,"key":"@Create Date","fillColor":null,"parentId":"e1","zIndex":73,"locked":false}|
{"type":"ATTR","ticket":15,"id":"e12"}||{"x":730,"y":-170,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"主板原理图","keyVisible":null,"valueVisible":null,"key":"@Schematic Name","fillColor":null,"parentId":"e1","zIndex":74,"locked":false}|
{"type":"ATTR","ticket":16,"id":"e13"}||{"x":1010,"y":-140,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_MIDDLE","value":"","keyVisible":null,"valueVisible":null,"key":"Part Number","fillColor":null,"parentId":"e1","zIndex":75,"locked":false}|
{"type":"ATTR","ticket":17,"id":"e14"}||{"x":985,"y":-61,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"14","keyVisible":null,"valueVisible":null,"key":"@Page No","fillColor":null,"parentId":"e1","zIndex":76,"locked":false}|
{"type":"ATTR","ticket":18,"id":"e15"}||{"x":730,"y":-140,"rotation":0,"color":null,"fontFamily":null,"fontSize":15,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":"DBG AUDIO KEY LED","keyVisible":null,"valueVisible":null,"key":"@Page Name","fillColor":null,"parentId":"e1","zIndex":77,"locked":false}|
{"type":"ATTR","ticket":19,"id":"e19"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9408a6ff71ee48cb92ba5b2b8f815907","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1","zIndex":80,"locked":false}|
{"type":"ATTR","ticket":20,"id":"e8778"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"立创·庐山派K230-CanMV开发板","keyVisible":false,"valueVisible":false,"key":"@Board Name","fillColor":null,"parentId":"e1","zIndex":81,"locked":false}|
{"type":"ATTR","ticket":21,"id":"e8779"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"15:18:32","keyVisible":false,"valueVisible":false,"key":"@Create Time","fillColor":null,"parentId":"e1","zIndex":82,"locked":false}|
{"type":"ATTR","ticket":22,"id":"e8780"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"15:19:33","keyVisible":false,"valueVisible":false,"key":"@Update Time","fillColor":null,"parentId":"e1","zIndex":83,"locked":false}|
{"type":"COMPONENT","ticket":23,"id":"e838"}||{"partId":"pid8a0e77bacb214e","x":465,"y":-725,"rotation":0,"isMirror":false,"attrs":{},"zIndex":22,"locked":false}|
{"type":"ATTR","ticket":24,"id":"e845"}||{"x":465,"y":-695,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e838","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":25,"id":"e846"}||{"x":465,"y":-700,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e838","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":26,"id":"e847"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e838","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":27,"id":"e997"}||{"partId":"0.1","x":180,"y":-160,"rotation":90,"isMirror":false,"attrs":{},"zIndex":347,"locked":false}|
{"type":"ATTR","ticket":28,"id":"e7826"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e997","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":29,"id":"e7827"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"电阻类型:厚膜电阻;阻值:2kΩ;精度:±1%;功率:62.5mW;最大工作电压:50V;温度系数:±100ppm/℃;","keyVisible":null,"valueVisible":null,"key":"Description","fillColor":null,"parentId":"e997","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":30,"id":"e7828"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e997","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":31,"id":"e7829"}||{"x":140,"y":-160,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R80","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e997","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":32,"id":"e7830"}||{"x":195,"y":-160,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e997","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":33,"id":"e7831"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"0931fca71a2649df94cedf8937ee9af5","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e997","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":34,"id":"e7832"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e997","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":35,"id":"e7833"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e997","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":36,"id":"e7834"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e997","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":37,"id":"e8793"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e997","zIndex":18,"locked":false}|
{"type":"COMPONENT","ticket":38,"id":"e1016"}||{"partId":"GND.1","x":154.99999999999997,"y":-210.00000000000003,"rotation":180,"isMirror":false,"attrs":{},"zIndex":39,"locked":false}|
{"type":"ATTR","ticket":39,"id":"e1019"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"e531ef8169014c029b372f1c28d7bf44","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1016","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":40,"id":"e1020"}||{"x":133,"y":-205,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"RIGHT_BOTTOM","value":"f8db7ce4d1954db38f2a4d50e5bf43b0","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1016","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":41,"id":"e1021"}||{"x":133,"y":-205,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"RIGHT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1016","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":42,"id":"e1022"}||{"x":133,"y":-205,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"RIGHT_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e1016","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":43,"id":"e1026"}||{"partId":"0.1","x":185,"y":-230,"rotation":90,"isMirror":false,"attrs":{},"zIndex":306,"locked":false}|
{"type":"ATTR","ticket":44,"id":"e16243"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"a4e5e99e3f764b488798bd49fee4d1af","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1026","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":45,"id":"e7618"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1026","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":46,"id":"e7621"}||{"x":150,"y":-230,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C186","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1026","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":47,"id":"e7622"}||{"x":195,"y":-230,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1026","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":48,"id":"e7623"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"90e0501e333744019caaa144f90fe619","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1026","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":49,"id":"e7624"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1026","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":50,"id":"e7625"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1026","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":51,"id":"e7626"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1026","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":52,"id":"e1064"}||{"partId":"0.1","x":185,"y":-250,"rotation":90,"isMirror":false,"attrs":{},"zIndex":296,"locked":false}|
{"type":"ATTR","ticket":53,"id":"e16221"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"a4e5e99e3f764b488798bd49fee4d1af","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1064","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":54,"id":"e7585"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1064","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":55,"id":"e7588"}||{"x":150,"y":-250,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C185","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1064","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":56,"id":"e7589"}||{"x":195,"y":-250,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1064","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":57,"id":"e7590"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"90e0501e333744019caaa144f90fe619","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1064","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":58,"id":"e7591"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1064","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":59,"id":"e7592"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1064","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":60,"id":"e7593"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1064","zIndex":16,"locked":false}|
{"type":"COMPONENT","ticket":61,"id":"e1083"}||{"partId":"0.1","x":255,"y":-110,"rotation":0,"isMirror":false,"attrs":{},"zIndex":359,"locked":false}|
{"type":"ATTR","ticket":62,"id":"e7862"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"98a3a46ae3ab40ea98bbb2621d0c430a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1083","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":63,"id":"e7863"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"电阻类型:厚膜电阻;阻值:2kΩ;精度:±1%;功率:62.5mW;最大工作电压:50V;温度系数:±100ppm/℃;","keyVisible":null,"valueVisible":null,"key":"Description","fillColor":null,"parentId":"e1083","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":64,"id":"e7864"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1083","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":65,"id":"e7865"}||{"x":260,"y":-110,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R81","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1083","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":66,"id":"e7866"}||{"x":260,"y":-100,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1083","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":67,"id":"e7867"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"0931fca71a2649df94cedf8937ee9af5","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1083","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":68,"id":"e7868"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1083","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":69,"id":"e7869"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1083","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":70,"id":"e7870"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1083","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":71,"id":"e8794"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1083","zIndex":18,"locked":false}|
{"type":"COMPONENT","ticket":72,"id":"e1102"}||{"partId":"0.1","x":220,"y":-110,"rotation":0,"isMirror":false,"attrs":{},"zIndex":316,"locked":false}|
{"type":"ATTR","ticket":73,"id":"e7651"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1102","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":74,"id":"e7653"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1102","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":75,"id":"e7654"}||{"x":225,"y":-115,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C188","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1102","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":76,"id":"e7655"}||{"x":225,"y":-95,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1102","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":77,"id":"e7656"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"d11c89d4f5d64d3f9d05523b671d6692","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1102","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":78,"id":"e7657"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1102","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":79,"id":"e7658"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1102","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":80,"id":"e7659"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1102","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":81,"id":"e8783"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1102","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":82,"id":"e1121"}||{"partId":"pid8a0e77bacb214e","x":295,"y":-85,"rotation":0,"isMirror":false,"attrs":{},"zIndex":35,"locked":false}|
{"type":"ATTR","ticket":83,"id":"e1128"}||{"x":295,"y":-55,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1121","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":84,"id":"e1129"}||{"x":295,"y":-60,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e1121","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":85,"id":"e1130"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1121","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":86,"id":"e1134"}||{"partId":"0.1","x":180,"y":-135,"rotation":90,"isMirror":false,"attrs":{},"zIndex":272,"locked":false}|
{"type":"ATTR","ticket":87,"id":"e6775"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1134","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":88,"id":"e6777"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1134","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":89,"id":"e6778"}||{"x":150,"y":-135,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C187","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1134","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":90,"id":"e6779"}||{"x":190,"y":-135,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1134","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":91,"id":"e6780"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"89bebc94f7474409bdbb81625b4be491","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1134","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":92,"id":"e6781"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1134","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":93,"id":"e6782"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1134","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":94,"id":"e6783"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1134","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":95,"id":"e8786"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1134","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":96,"id":"e1153"}||{"partId":"0.1","x":180,"y":-85,"rotation":90,"isMirror":false,"attrs":{},"zIndex":283,"locked":false}|
{"type":"ATTR","ticket":97,"id":"e6808"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a86b9e79eb1f404b9573c2054702d5d6","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1153","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":98,"id":"e6810"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"fed7d21508764a6180397088acf07d91","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1153","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":99,"id":"e6811"}||{"x":150,"y":-85,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"C189","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1153","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":100,"id":"e6812"}||{"x":190,"y":-85,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1153","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":101,"id":"e6813"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"89bebc94f7474409bdbb81625b4be491","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1153","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":102,"id":"e6814"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1153","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":103,"id":"e6815"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1153","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":104,"id":"e6816"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1153","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":105,"id":"e8787"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1153","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":106,"id":"e1172"}||{"partId":"0.1","x":350,"y":-240,"rotation":0,"isMirror":false,"attrs":{},"zIndex":458,"locked":false}|
{"type":"ATTR","ticket":107,"id":"e14642"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"Extended Part","keyVisible":false,"valueVisible":false,"key":"JLCPCB Part Class","fillColor":null,"parentId":"e1172","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":108,"id":"e14655"}||{"x":300,"y":-280,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"AUDIO1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1172","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":109,"id":"e14656"}||{"x":350,"y":-240,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1172","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":110,"id":"e14657"}||{"x":350,"y":-240,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":"AUDIO_JACK_PJ-3220-Y","keyVisible":false,"valueVisible":false,"key":"Origin Footprint","fillColor":null,"parentId":"e1172","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":111,"id":"e14659"}||{"x":300,"y":-190,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":"f180bfbc0afe4a1284d75ca77bb86608","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1172","zIndex":18,"locked":false}|
{"type":"ATTR","ticket":112,"id":"e14660"}||{"x":300,"y":-190,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"99cb2fe11324461da5b96769d67fb0ba","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1172","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":113,"id":"e14661"}||{"x":300,"y":-190,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1172","zIndex":19,"locked":false}|
{"type":"ATTR","ticket":114,"id":"e14662"}||{"x":350,"y":-240,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Description","fillColor":null,"parentId":"e1172","zIndex":20,"locked":false}|
{"type":"ATTR","ticket":115,"id":"e14663"}||{"x":350,"y":-240,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":"Audio_PJ-3220","keyVisible":false,"valueVisible":false,"key":"Design Item ID","fillColor":null,"parentId":"e1172","zIndex":21,"locked":false}|
{"type":"ATTR","ticket":116,"id":"e14664"}||{"x":350,"y":-240,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":"ZX_MyLib","keyVisible":false,"valueVisible":false,"key":"Library Name","fillColor":null,"parentId":"e1172","zIndex":22,"locked":false}|
{"type":"ATTR","ticket":117,"id":"e14665"}||{"x":288,"y":-290,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":"C692442","keyVisible":false,"valueVisible":false,"key":"LC_CODE","fillColor":null,"parentId":"e1172","zIndex":23,"locked":false}|
{"type":"ATTR","ticket":118,"id":"e14666"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1172","zIndex":24,"locked":false}|
{"type":"ATTR","ticket":119,"id":"e14667"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1172","zIndex":25,"locked":false}|
{"type":"ATTR","ticket":120,"id":"e14668"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1172","zIndex":26,"locked":false}|
{"type":"ATTR","ticket":121,"id":"e14669"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1172","zIndex":27,"locked":false}|
{"type":"COMPONENT","ticket":122,"id":"e1201"}||{"partId":"B4012AP422-003.1","x":325,"y":-120,"rotation":270,"isMirror":false,"attrs":{},"zIndex":475,"locked":false}|
{"type":"ATTR","ticket":123,"id":"e15703"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"924a193ab417461588c6900c4b466406","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1201","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":124,"id":"e15709"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"Extended Part","keyVisible":false,"valueVisible":false,"key":"JLCPCB Part Class","fillColor":null,"parentId":"e1201","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":125,"id":"e15719"}||{"x":315,"y":-140,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"MIC1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1201","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":126,"id":"e15720"}||{"x":305,"y":-90,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1201","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":127,"id":"e15721"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"450969b2276c45fe88f8c8e8ba3dead4","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1201","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":128,"id":"e15722"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1201","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":129,"id":"e15723"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1201","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":130,"id":"e15724"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1201","zIndex":14,"locked":false}|
{"type":"COMPONENT","ticket":131,"id":"e1324"}||{"partId":"GH125-S04DCA-00.1","x":1040,"y":-700,"rotation":90,"isMirror":false,"attrs":{},"zIndex":102,"locked":false}|
{"type":"ATTR","ticket":132,"id":"e1351"}||{"x":1065,"y":-725,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"CN2","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1324","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":133,"id":"e1352"}||{"x":1065,"y":-715,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1324","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":134,"id":"e1353"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"2a2b3cadd2044b4bbab5b492066d1dbd","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1324","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":135,"id":"e1354"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1324","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":136,"id":"e1355"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1324","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":137,"id":"e1356"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1324","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":138,"id":"e1376"}||{"partId":"pid8a0e77bacb214e","x":985,"y":-745,"rotation":0,"isMirror":false,"attrs":{},"zIndex":110,"locked":false}|
{"type":"ATTR","ticket":139,"id":"e1379"}||{"x":985,"y":-715,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1376","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":140,"id":"e1380"}||{"x":985,"y":-755,"rotation":0,"color":"#9900FF","fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"PIN5V_OUT_IN+","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":"#9900FF","parentId":"e1376","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":141,"id":"e1381"}||{"x":985,"y":-745,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":"CENTER_MIDDLE","value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1376","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":142,"id":"e1382"}||{"x":985,"y":-745,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"PIN5V_OUT_IN+","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e1376","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":143,"id":"e1386"}||{"partId":"pid8a0e77bacb214e","x":1045,"y":-620,"rotation":0,"isMirror":false,"attrs":{},"zIndex":119,"locked":false}|
{"type":"ATTR","ticket":144,"id":"e1392"}||{"x":1045,"y":-590,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1386","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":145,"id":"e1393"}||{"x":1045,"y":-595,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e1386","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":146,"id":"e1394"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1386","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":147,"id":"e1398"}||{"partId":"0402WGF1000TCE.1","x":875,"y":-735,"rotation":0,"isMirror":false,"attrs":{},"zIndex":74,"locked":false}|
{"type":"ATTR","ticket":148,"id":"e3810"}||{"x":830,"y":-715,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"LCSC Part Name","fillColor":null,"parentId":"e1398","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":149,"id":"e1413"}||{"x":890,"y":-725,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e1398","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":150,"id":"e1415"}||{"x":890,"y":-735,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R70","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1398","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":151,"id":"e1416"}||{"x":865,"y":-720,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e1398","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":152,"id":"e1417"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"ebf4e2a41a3e4d03a45817f4046b300b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1398","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":153,"id":"e1419"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1398","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":154,"id":"e1420"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1398","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":155,"id":"e1421"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1398","zIndex":14,"locked":false}|
{"type":"COMPONENT","ticket":156,"id":"e1428"}||{"partId":"0402WGF1000TCE.1","x":875,"y":-695,"rotation":0,"isMirror":false,"attrs":{},"zIndex":84,"locked":false}|
{"type":"ATTR","ticket":157,"id":"e3828"}||{"x":830,"y":-675,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"LCSC Part Name","fillColor":null,"parentId":"e1428","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":158,"id":"e1443"}||{"x":890,"y":-685,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e1428","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":159,"id":"e1445"}||{"x":890,"y":-695,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R71","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1428","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":160,"id":"e1446"}||{"x":865,"y":-680,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e1428","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":161,"id":"e1447"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"ebf4e2a41a3e4d03a45817f4046b300b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1428","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":162,"id":"e1449"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1428","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":163,"id":"e1450"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1428","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":164,"id":"e1451"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1428","zIndex":14,"locked":false}|
{"type":"COMPONENT","ticket":165,"id":"e1458"}||{"partId":"KLXES15AAA1.1","x":930.0000000000001,"y":-660,"rotation":90,"isMirror":false,"attrs":{},"zIndex":64,"locked":false}|
{"type":"ATTR","ticket":166,"id":"e1476"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"3f58d00549894c6faa970990528fdbf7","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1458","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":167,"id":"e1478"}||{"x":940,"y":-655,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"D5","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1458","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":168,"id":"e1479"}||{"x":940,"y":-655,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e1458","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":169,"id":"e1480"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"b85f1000be96423f8e2f90678fd85acc","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1458","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":170,"id":"e1482"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1458","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":171,"id":"e1483"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1458","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":172,"id":"e1484"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1458","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":173,"id":"e8789"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1458","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":174,"id":"e1491"}||{"partId":"KLXES15AAA1.1","x":965.0000000000001,"y":-660,"rotation":90,"isMirror":false,"attrs":{},"zIndex":54,"locked":false}|
{"type":"ATTR","ticket":175,"id":"e1509"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"3f58d00549894c6faa970990528fdbf7","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1491","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":176,"id":"e1511"}||{"x":975,"y":-655,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"D6","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1491","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":177,"id":"e1512"}||{"x":975,"y":-655,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e1491","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":178,"id":"e1513"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"b85f1000be96423f8e2f90678fd85acc","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1491","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":179,"id":"e1515"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1491","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":180,"id":"e1516"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1491","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":181,"id":"e1517"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1491","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":182,"id":"e8788"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1491","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":183,"id":"e1536"}||{"partId":"GH125-S04DCA-00.1","x":1040,"y":-485,"rotation":90,"isMirror":false,"attrs":{},"zIndex":171,"locked":false}|
{"type":"ATTR","ticket":184,"id":"e1563"}||{"x":1065,"y":-510,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"CN3","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1536","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":185,"id":"e1564"}||{"x":1065,"y":-500,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e1536","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":186,"id":"e1565"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"2a2b3cadd2044b4bbab5b492066d1dbd","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1536","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":187,"id":"e1566"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1536","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":188,"id":"e1567"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1536","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":189,"id":"e1568"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1536","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":190,"id":"e1588"}||{"partId":"pid8a0e77bacb214e","x":985,"y":-530,"rotation":0,"isMirror":false,"attrs":{},"zIndex":179,"locked":false}|
{"type":"ATTR","ticket":191,"id":"e1591"}||{"x":985,"y":-500,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1588","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":192,"id":"e1592"}||{"x":985,"y":-540,"rotation":0,"color":"#9900FF","fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"PIN5V_OUT_IN+","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":"#9900FF","parentId":"e1588","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":193,"id":"e1593"}||{"x":985,"y":-530,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":"CENTER_MIDDLE","value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1588","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":194,"id":"e1594"}||{"x":985,"y":-530,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"PIN5V_OUT_IN+","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e1588","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":195,"id":"e1598"}||{"partId":"pid8a0e77bacb214e","x":1045,"y":-405,"rotation":0,"isMirror":false,"attrs":{},"zIndex":188,"locked":false}|
{"type":"ATTR","ticket":196,"id":"e1604"}||{"x":1045,"y":-375,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e1598","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":197,"id":"e1605"}||{"x":1045,"y":-380,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e1598","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":198,"id":"e1606"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1598","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":199,"id":"e1610"}||{"partId":"0402WGF1000TCE.1","x":875,"y":-520,"rotation":0,"isMirror":false,"attrs":{},"zIndex":143,"locked":false}|
{"type":"ATTR","ticket":200,"id":"e3928"}||{"x":830,"y":-500,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"LCSC Part Name","fillColor":null,"parentId":"e1610","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":201,"id":"e1625"}||{"x":890,"y":-510,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e1610","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":202,"id":"e1627"}||{"x":890,"y":-520,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R76","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1610","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":203,"id":"e1628"}||{"x":865,"y":-505,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e1610","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":204,"id":"e1629"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"ebf4e2a41a3e4d03a45817f4046b300b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1610","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":205,"id":"e1631"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1610","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":206,"id":"e1632"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1610","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":207,"id":"e1633"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1610","zIndex":14,"locked":false}|
{"type":"COMPONENT","ticket":208,"id":"e1640"}||{"partId":"0402WGF1000TCE.1","x":875,"y":-480,"rotation":0,"isMirror":false,"attrs":{},"zIndex":153,"locked":false}|
{"type":"ATTR","ticket":209,"id":"e3946"}||{"x":830,"y":-460,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"LCSC Part Name","fillColor":null,"parentId":"e1640","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":210,"id":"e1655"}||{"x":890,"y":-470,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e1640","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":211,"id":"e1657"}||{"x":890,"y":-480,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R77","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1640","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":212,"id":"e1658"}||{"x":865,"y":-465,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e1640","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":213,"id":"e1659"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"ebf4e2a41a3e4d03a45817f4046b300b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1640","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":214,"id":"e1661"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1640","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":215,"id":"e1662"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1640","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":216,"id":"e1663"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1640","zIndex":14,"locked":false}|
{"type":"COMPONENT","ticket":217,"id":"e1670"}||{"partId":"KLXES15AAA1.1","x":930,"y":-445,"rotation":90,"isMirror":false,"attrs":{},"zIndex":133,"locked":false}|
{"type":"ATTR","ticket":218,"id":"e1688"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"3f58d00549894c6faa970990528fdbf7","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1670","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":219,"id":"e1690"}||{"x":940,"y":-440,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"D7","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1670","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":220,"id":"e1691"}||{"x":940,"y":-440,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e1670","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":221,"id":"e1692"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"b85f1000be96423f8e2f90678fd85acc","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1670","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":222,"id":"e1694"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1670","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":223,"id":"e1695"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1670","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":224,"id":"e1696"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1670","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":225,"id":"e8791"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1670","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":226,"id":"e1703"}||{"partId":"KLXES15AAA1.1","x":965,"y":-445,"rotation":90,"isMirror":false,"attrs":{},"zIndex":123,"locked":false}|
{"type":"ATTR","ticket":227,"id":"e1721"}||{"x":null,"y":null,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"3f58d00549894c6faa970990528fdbf7","keyVisible":null,"valueVisible":null,"key":"Footprint","fillColor":null,"parentId":"e1703","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":228,"id":"e1723"}||{"x":975,"y":-440,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"D8","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e1703","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":229,"id":"e1724"}||{"x":975,"y":-440,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e1703","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":230,"id":"e1725"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"b85f1000be96423f8e2f90678fd85acc","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e1703","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":231,"id":"e1727"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e1703","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":232,"id":"e1728"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e1703","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":233,"id":"e1729"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e1703","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":234,"id":"e8790"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"false","keyVisible":false,"valueVisible":false,"key":"Check","fillColor":null,"parentId":"e1703","zIndex":17,"locked":false}|
{"type":"COMPONENT","ticket":235,"id":"e4708"}||{"partId":"pid8a0e77bacb214e","x":605,"y":-725,"rotation":0,"isMirror":false,"attrs":{},"zIndex":197,"locked":false}|
{"type":"ATTR","ticket":236,"id":"e4715"}||{"x":605,"y":-695,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e4708","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":237,"id":"e4716"}||{"x":605,"y":-700,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e4708","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":238,"id":"e4717"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e4708","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":239,"id":"e4727"}||{"partId":"TSA016A2518C.1","x":530,"y":-635,"rotation":0,"isMirror":false,"attrs":{},"zIndex":205,"locked":false}|
{"type":"ATTR","ticket":240,"id":"e4728"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"6dc2724c0d46456aa4b7fb8ff9eb18ca","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e4727","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":241,"id":"e4729"}||{"x":510,"y":-660,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"SW2","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e4727","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":242,"id":"e4757"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"c549588823a64025be993c27c7d0a0fc","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e4727","zIndex":22,"locked":false}|
{"type":"ATTR","ticket":243,"id":"e4758"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e4727","zIndex":23,"locked":false}|
{"type":"ATTR","ticket":244,"id":"e4759"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e4727","zIndex":24,"locked":false}|
{"type":"ATTR","ticket":245,"id":"e4760"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e4727","zIndex":25,"locked":false}|
{"type":"COMPONENT","ticket":246,"id":"e4829"}||{"partId":"pid8a0e77bacb214e","x":455,"y":-615,"rotation":0,"isMirror":false,"attrs":{},"zIndex":217,"locked":false}|
{"type":"ATTR","ticket":247,"id":"e4836"}||{"x":455,"y":-585,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e4829","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":248,"id":"e4837"}||{"x":455,"y":-580,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e4829","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":249,"id":"e4838"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e4829","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":250,"id":"e4860"}||{"partId":"pid8a0e77bacb214e","x":600,"y":-615,"rotation":0,"isMirror":false,"attrs":{},"zIndex":223,"locked":false}|
{"type":"ATTR","ticket":251,"id":"e4867"}||{"x":600,"y":-585,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e4860","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":252,"id":"e4868"}||{"x":600,"y":-580,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e4860","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":253,"id":"e4869"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e4860","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":254,"id":"e5018"}||{"partId":"RC0402FR-075K1L.1","x":470,"y":-495,"rotation":0,"isMirror":false,"attrs":{},"zIndex":230,"locked":false}|
{"type":"ATTR","ticket":255,"id":"e5041"}||{"x":460,"y":-500,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R78","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e5018","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":256,"id":"e5042"}||{"x":460,"y":-520,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e5018","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":257,"id":"e5043"}||{"x":460,"y":-510,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e5018","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":258,"id":"e5044"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"5b592f86a8d14fcc9724fac3d39f8584","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e5018","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":259,"id":"e5045"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e5018","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":260,"id":"e5046"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e5018","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":261,"id":"e5047"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e5018","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":262,"id":"e5055"}||{"partId":"pid8a0e77bacb214e","x":440,"y":-495,"rotation":90,"isMirror":false,"attrs":{},"zIndex":239,"locked":false}|
{"type":"ATTR","ticket":263,"id":"e5058"}||{"x":470,"y":-495,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e5055","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":264,"id":"e5059"}||{"x":405,"y":-490,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VDD_3V3","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e5055","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":265,"id":"e5060"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e5055","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":266,"id":"e5061"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e5055","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":267,"id":"e5069"}||{"partId":"pid8a0e77bacb214e","x":480,"y":-475.00000000000006,"rotation":0,"isMirror":false,"attrs":{},"zIndex":247,"locked":false}|
{"type":"ATTR","ticket":268,"id":"e5076"}||{"x":480,"y":-445.00000000000006,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e5069","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":269,"id":"e5077"}||{"x":480,"y":-440.00000000000006,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e5069","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":270,"id":"e5078"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e5069","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":271,"id":"e5138"}||{"partId":"pid8a0e77bacb214e","x":590,"y":-475,"rotation":0,"isMirror":false,"attrs":{},"zIndex":251,"locked":false}|
{"type":"ATTR","ticket":272,"id":"e5145"}||{"x":590,"y":-445.00000000000006,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e5138","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":273,"id":"e5146"}||{"x":590,"y":-440.00000000000006,"rotation":90,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e5138","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":274,"id":"e5147"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e5138","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":275,"id":"e5281"}||{"partId":"pid8a0e77bacb214e","x":70,"y":-480,"rotation":0,"isMirror":false,"attrs":{},"zIndex":265,"locked":false}|
{"type":"ATTR","ticket":276,"id":"e5288"}||{"x":70,"y":-450,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"29fd31323efa4fa4a789bc9d0feed021","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e5281","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":277,"id":"e5289"}||{"x":70,"y":-450,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_MIDDLE","value":null,"keyVisible":null,"valueVisible":true,"key":"Global Net Name","fillColor":null,"parentId":"e5281","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":278,"id":"e5290"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"9030df22d9844356aec5aa16e7ab3cc6","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e5281","zIndex":9,"locked":false}|
{"type":"COMPONENT","ticket":279,"id":"e5294"}||{"partId":"pid8a0e77bacb214e","x":70,"y":-585,"rotation":0,"isMirror":false,"attrs":{},"zIndex":260,"locked":false}|
{"type":"ATTR","ticket":280,"id":"e5297"}||{"x":70,"y":-555,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e5294","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":281,"id":"e5298"}||{"x":70,"y":-600,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VDD_3V3","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e5294","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":282,"id":"e5299"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e5294","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":283,"id":"e5300"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e5294","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":284,"id":"e7715"}||{"partId":"FC-F1005HRK-620H5.1","x":70,"y":-505,"rotation":90,"isMirror":false,"attrs":{},"zIndex":327,"locked":false}|
{"type":"ATTR","ticket":285,"id":"e7733"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":6.75,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"c2dd96831cc3403cbf3d997fbc7a1685","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e7715","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":286,"id":"e7734"}||{"x":85,"y":-500.0000000000001,"rotation":0,"color":null,"fontFamily":null,"fontSize":6.75,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"LED2","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e7715","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":287,"id":"e7735"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"11a7d0e24e1a4e2bbead71b4aaa2b5aa","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e7715","zIndex":19,"locked":false}|
{"type":"ATTR","ticket":288,"id":"e7736"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e7715","zIndex":20,"locked":false}|
{"type":"ATTR","ticket":289,"id":"e7737"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e7715","zIndex":21,"locked":false}|
{"type":"ATTR","ticket":290,"id":"e7738"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e7715","zIndex":22,"locked":false}|
{"type":"COMPONENT","ticket":291,"id":"e7746"}||{"partId":"0402WGF2001TCE.1","x":70,"y":-555,"rotation":90,"isMirror":false,"attrs":{},"zIndex":335,"locked":false}|
{"type":"ATTR","ticket":292,"id":"e7768"}||{"x":80,"y":-545,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Supplier Footprint","fillColor":null,"parentId":"e7746","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":293,"id":"e7770"}||{"x":80,"y":-555,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R73","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e7746","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":294,"id":"e7771"}||{"x":80,"y":-535,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Value","fillColor":null,"parentId":"e7746","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":295,"id":"e7772"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"0931fca71a2649df94cedf8937ee9af5","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e7746","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":296,"id":"e7773"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e7746","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":297,"id":"e7774"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e7746","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":298,"id":"e7775"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e7746","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":299,"id":"e10566"}||{"partId":"0402WGF1602TCE.1","x":260,"y":-520,"rotation":90,"isMirror":false,"attrs":{},"zIndex":399,"locked":false}|
{"type":"ATTR","ticket":300,"id":"e10587"}||{"x":270,"y":-505,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Footprint","fillColor":null,"parentId":"e10566","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":301,"id":"e10589"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"791e5ed327b446d9892bb81acb74cf6a","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e10566","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":302,"id":"e10590"}||{"x":270,"y":-525,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R75","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e10566","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":303,"id":"e10591"}||{"x":270,"y":-515,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e10566","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":304,"id":"e10592"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"6cb71e75562d4a1f956ec8843eae70f9","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10566","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":305,"id":"e10593"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e10566","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":306,"id":"e10594"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e10566","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":307,"id":"e10595"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e10566","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":308,"id":"e10603"}||{"partId":"0402WGF4701TCE.1","x":240,"y":-520,"rotation":90,"isMirror":false,"attrs":{},"zIndex":409,"locked":false}|
{"type":"ATTR","ticket":309,"id":"e10625"}||{"x":205,"y":-505,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Footprint","fillColor":null,"parentId":"e10603","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":310,"id":"e10626"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"a13115c1791e43fcb6a3017d31809a8b","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e10603","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":311,"id":"e10627"}||{"x":205,"y":-525,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R74","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e10603","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":312,"id":"e10628"}||{"x":205,"y":-515,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e10603","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":313,"id":"e10629"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"78718833cc95470e9bcb2b44c19b5b21","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10603","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":314,"id":"e10630"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e10603","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":315,"id":"e10631"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e10603","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":316,"id":"e10632"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e10603","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":317,"id":"e10640"}||{"partId":"E6C0606RGBC3UDA.1","x":250,"y":-580,"rotation":90,"isMirror":false,"attrs":{},"zIndex":371,"locked":false}|
{"type":"ATTR","ticket":318,"id":"e10658"}||{"x":285,"y":-595,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"LED1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e10640","zIndex":32,"locked":false}|
{"type":"ATTR","ticket":319,"id":"e10660"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"af10d6b06bfb48ef8a53ddd97213fa3d","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10640","zIndex":33,"locked":false}|
{"type":"ATTR","ticket":320,"id":"e10662"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e10640","zIndex":34,"locked":false}|
{"type":"ATTR","ticket":321,"id":"e10663"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e10640","zIndex":35,"locked":false}|
{"type":"ATTR","ticket":322,"id":"e10664"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e10640","zIndex":36,"locked":false}|
{"type":"COMPONENT","ticket":323,"id":"e10677"}||{"partId":"0402WGF2001TCE.1","x":260,"y":-640,"rotation":90,"isMirror":false,"attrs":{},"zIndex":389,"locked":false}|
{"type":"ATTR","ticket":324,"id":"e10698"}||{"x":265,"y":-625,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Footprint","fillColor":null,"parentId":"e10677","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":325,"id":"e10700"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"8696185c92e045259280e9fcd44a54d8","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e10677","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":326,"id":"e10701"}||{"x":265,"y":-645,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":null,"value":"R72","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e10677","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":327,"id":"e10702"}||{"x":265,"y":-635,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e10677","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":328,"id":"e10703"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"b52289ccaf514be6a52de48101fcab7e","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10677","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":329,"id":"e10704"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e10677","zIndex":11,"locked":false}|
{"type":"ATTR","ticket":330,"id":"e10705"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e10677","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":331,"id":"e10706"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e10677","zIndex":13,"locked":false}|
{"type":"COMPONENT","ticket":332,"id":"e10736"}||{"partId":"pid8a0e77bacb214e","x":235,"y":-650,"rotation":90,"isMirror":false,"attrs":{},"zIndex":420,"locked":false}|
{"type":"ATTR","ticket":333,"id":"e10739"}||{"x":265,"y":-650,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"5f3e63e348904baba35f0d03c364fd7f","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e10736","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":334,"id":"e10740"}||{"x":200,"y":-645,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"CENTER_BOTTOM","value":"VDD_3V3","keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e10736","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":335,"id":"e10741"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"87f06b751a124a76927a8502c132589b","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10736","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":336,"id":"e10742"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e10736","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":337,"id":"e10761"}||{"partId":"pid8a0e77bacb214e","x":110,"y":-735,"rotation":0,"isMirror":false,"attrs":{},"zIndex":425,"locked":false}|
{"type":"ATTR","ticket":338,"id":"e10762"}||{"x":110,"y":-705,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"ac2701c1e46c4b4aba9cc1c289ab9240","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e10761","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":339,"id":"e10765"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"57d58c874cbf43d48ab53219745c931d","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10761","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":340,"id":"e10766"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e10761","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":341,"id":"e10767"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e10761","zIndex":6,"locked":false}|
{"type":"COMPONENT","ticket":342,"id":"e10799"}||{"partId":"pid8a0e77bacb214e","x":110,"y":-760,"rotation":0,"isMirror":false,"attrs":{},"zIndex":435,"locked":false}|
{"type":"ATTR","ticket":343,"id":"e10800"}||{"x":110,"y":-730,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"ac2701c1e46c4b4aba9cc1c289ab9240","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e10799","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":344,"id":"e10803"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"57d58c874cbf43d48ab53219745c931d","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10799","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":345,"id":"e10804"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e10799","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":346,"id":"e10805"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e10799","zIndex":6,"locked":false}|
{"type":"COMPONENT","ticket":347,"id":"e10815"}||{"partId":"pid8a0e77bacb214e","x":110,"y":-710,"rotation":0,"isMirror":false,"attrs":{},"zIndex":442,"locked":false}|
{"type":"ATTR","ticket":348,"id":"e10816"}||{"x":110,"y":-680,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":false,"align":"LEFT_BOTTOM","value":"ac2701c1e46c4b4aba9cc1c289ab9240","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e10815","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":349,"id":"e10819"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"57d58c874cbf43d48ab53219745c931d","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e10815","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":350,"id":"e10820"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Name","fillColor":null,"parentId":"e10815","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":351,"id":"e10821"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e10815","zIndex":6,"locked":false}|
{"type":"COMPONENT","ticket":352,"id":"e18408"}||{"partId":"GND.1","x":154.99999999999997,"y":-270,"rotation":180,"isMirror":false,"attrs":{},"zIndex":485,"locked":false}|
{"type":"ATTR","ticket":353,"id":"e18411"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"e531ef8169014c029b372f1c28d7bf44","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e18408","zIndex":8,"locked":false}|
{"type":"ATTR","ticket":354,"id":"e18412"}||{"x":133,"y":-265,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"RIGHT_BOTTOM","value":"f8db7ce4d1954db38f2a4d50e5bf43b0","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e18408","zIndex":9,"locked":false}|
{"type":"ATTR","ticket":355,"id":"e18413"}||{"x":133,"y":-265,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"RIGHT_BOTTOM","value":null,"keyVisible":null,"valueVisible":true,"key":"Name","fillColor":null,"parentId":"e18408","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":356,"id":"e18414"}||{"x":133,"y":-265,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"RIGHT_BOTTOM","value":null,"keyVisible":null,"valueVisible":null,"key":"Global Net Name","fillColor":null,"parentId":"e18408","zIndex":7,"locked":false}|
{"type":"COMPONENT","ticket":357,"id":"e19243"}||{"partId":"TS36CA-0.6 250GF 031.1","x":530,"y":-480,"rotation":0,"isMirror":false,"attrs":{},"zIndex":492,"locked":false}|
{"type":"ATTR","ticket":358,"id":"e19244"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"74114bd8eeb64a2ca0ed67efe83ff3dc","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e19243","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":359,"id":"e19245"}||{"x":520,"y":-500,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"SW4","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e19243","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":360,"id":"e19272"}||{"x":520,"y":-465,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e19243","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":361,"id":"e19274"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"de9d7579afa3479694bbd08c6700ab89","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e19243","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":362,"id":"e19275"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e19243","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":363,"id":"e19276"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e19243","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":364,"id":"e19277"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e19243","zIndex":18,"locked":false}|
{"type":"COMPONENT","ticket":365,"id":"e19378"}||{"partId":"TS36CA-0.6 250GF 031.1","x":535,"y":-755,"rotation":0,"isMirror":false,"attrs":{},"zIndex":507,"locked":false}|
{"type":"ATTR","ticket":366,"id":"e19379"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"74114bd8eeb64a2ca0ed67efe83ff3dc","keyVisible":null,"valueVisible":null,"key":"Symbol","fillColor":null,"parentId":"e19378","zIndex":12,"locked":false}|
{"type":"ATTR","ticket":367,"id":"e19380"}||{"x":525,"y":-775,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"strikeout":false,"align":"LEFT_BOTTOM","value":"SW1","keyVisible":null,"valueVisible":true,"key":"Designator","fillColor":null,"parentId":"e19378","zIndex":13,"locked":false}|
{"type":"ATTR","ticket":368,"id":"e19407"}||{"x":525,"y":-740,"rotation":null,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":null,"keyVisible":null,"valueVisible":null,"key":"Name","fillColor":null,"parentId":"e19378","zIndex":14,"locked":false}|
{"type":"ATTR","ticket":369,"id":"e19409"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":"10","fontWeight":null,"italic":null,"underline":null,"align":null,"value":"de9d7579afa3479694bbd08c6700ab89","keyVisible":false,"valueVisible":false,"key":"Device","fillColor":null,"parentId":"e19378","zIndex":15,"locked":false}|
{"type":"ATTR","ticket":370,"id":"e19410"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Reuse Block","fillColor":null,"parentId":"e19378","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":371,"id":"e19411"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Group ID","fillColor":null,"parentId":"e19378","zIndex":17,"locked":false}|
{"type":"ATTR","ticket":372,"id":"e19412"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"","keyVisible":false,"valueVisible":false,"key":"Channel ID","fillColor":null,"parentId":"e19378","zIndex":18,"locked":false}|
{"type":"WIRE","ticket":373,"id":"e1298"}||{"zIndex":44,"locked":false}|
{"type":"LINE","ticket":374,"id":"2e33db35c7e7b741"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":170,"startY":-230,"endX":70,"endY":-230,"lineGroup":"e1298"}|
{"type":"WIRE","ticket":375,"id":"e1302"}||{"zIndex":48,"locked":false}|
{"type":"LINE","ticket":376,"id":"299bb27525706ed2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":170,"startY":-250,"endX":70,"endY":-250,"lineGroup":"e1302"}|
{"type":"WIRE","ticket":377,"id":"e1304"}||{"zIndex":28,"locked":false}|
{"type":"LINE","ticket":378,"id":"1508bcc9c568ef5d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":80,"startY":-160,"endX":165,"endY":-160,"lineGroup":"e1304"}|
{"type":"WIRE","ticket":379,"id":"e1306"}||{"zIndex":32,"locked":false}|
{"type":"LINE","ticket":380,"id":"a9dd547192ce64f8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":80,"startY":-135,"endX":165,"endY":-135,"lineGroup":"e1306"}|
{"type":"WIRE","ticket":381,"id":"e1308"}||{"zIndex":52,"locked":false}|
{"type":"LINE","ticket":382,"id":"dbcfe2e401060342"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":290,"startY":-250,"endX":200,"endY":-250,"lineGroup":"e1308"}|
{"type":"WIRE","ticket":383,"id":"e1309"}||{"zIndex":50,"locked":false}|
{"type":"LINE","ticket":384,"id":"6c336f62d96f0d4b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":290,"startY":-230,"endX":200,"endY":-230,"lineGroup":"e1309"}|
{"type":"WIRE","ticket":385,"id":"e1311"}||{"zIndex":34,"locked":false}|
{"type":"LINE","ticket":386,"id":"9ed1b4d28ebece28"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":255,"startY":-135,"endX":255,"endY":-125,"lineGroup":"e1311"}|
{"type":"LINE","ticket":387,"id":"195bcd275c41ca88"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":220,"startY":-135,"endX":220,"endY":-125,"lineGroup":"e1311"}|
{"type":"LINE","ticket":388,"id":"69306690cc93d6d3"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":295,"startY":-135,"endX":295,"endY":-160,"lineGroup":"e1311"}|
{"type":"LINE","ticket":389,"id":"1b8016495283130c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":195,"startY":-160,"endX":295,"endY":-160,"lineGroup":"e1311"}|
{"type":"LINE","ticket":390,"id":"9805f54c950f43ba"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":295,"startY":-130,"endX":295,"endY":-135,"lineGroup":"e1311"}|
{"type":"LINE","ticket":391,"id":"e2047735189a05c1"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":220,"startY":-135,"endX":195,"endY":-135,"lineGroup":"e1311"}|
{"type":"LINE","ticket":392,"id":"91946b43523ffa8a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":255,"startY":-135,"endX":220,"endY":-135,"lineGroup":"e1311"}|
{"type":"LINE","ticket":393,"id":"cb1c7325bb3026c0"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":295,"startY":-135,"endX":255,"endY":-135,"lineGroup":"e1311"}|
{"type":"WIRE","ticket":394,"id":"e1312"}||{"zIndex":46,"locked":false}|
{"type":"LINE","ticket":395,"id":"58e118f41a74c3cb"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":290,"startY":-210,"endX":155,"endY":-210,"lineGroup":"e1312"}|
{"type":"WIRE","ticket":396,"id":"e1313"}||{"zIndex":26,"locked":false}|
{"type":"LINE","ticket":397,"id":"4f81c9ad21b48f27"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":195,"startY":-85,"endX":220,"endY":-85,"lineGroup":"e1313"}|
{"type":"LINE","ticket":398,"id":"7fa1a23037bb21d9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":220,"startY":-85,"endX":255,"endY":-85,"lineGroup":"e1313"}|
{"type":"LINE","ticket":399,"id":"d911ad77632aafa3"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":255,"startY":-85,"endX":295,"endY":-85,"lineGroup":"e1313"}|
{"type":"LINE","ticket":400,"id":"79022702bb139101"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":295,"startY":-85,"endX":295,"endY":-110,"lineGroup":"e1313"}|
{"type":"LINE","ticket":401,"id":"b8ddca2d0222fbd4"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":255,"startY":-85,"endX":255,"endY":-95,"lineGroup":"e1313"}|
{"type":"LINE","ticket":402,"id":"3b625746393bf21d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":220,"startY":-85,"endX":220,"endY":-95,"lineGroup":"e1313"}|
{"type":"WIRE","ticket":403,"id":"e1314"}||{"zIndex":30,"locked":false}|
{"type":"LINE","ticket":404,"id":"fc493acdbcfe2627"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":80,"startY":-85,"endX":165,"endY":-85,"lineGroup":"e1314"}|
{"type":"WIRE","ticket":405,"id":"e1524"}||{"zIndex":96,"locked":false}|
{"type":"LINE","ticket":406,"id":"7a3670ea23981fd2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-675,"endX":965,"endY":-695,"lineGroup":"e1524"}|
{"type":"LINE","ticket":407,"id":"5c2e158582906210"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-695,"endX":1020,"endY":-695,"lineGroup":"e1524"}|
{"type":"LINE","ticket":408,"id":"d3b3000954fa1baf"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-695,"endX":895,"endY":-695,"lineGroup":"e1524"}|
{"type":"WIRE","ticket":409,"id":"e1526"}||{"zIndex":117,"locked":false}|
{"type":"LINE","ticket":410,"id":"2fe7e13a04091ff9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":985,"startY":-685,"endX":1020,"endY":-685,"lineGroup":"e1526"}|
{"type":"LINE","ticket":411,"id":"88c3c5dc1a84626c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":985,"startY":-745,"endX":985,"endY":-685,"lineGroup":"e1526"}|
{"type":"WIRE","ticket":412,"id":"e1527"}||{"zIndex":115,"locked":false}|
{"type":"LINE","ticket":413,"id":"c3f0c79febf06fea"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-620,"endX":1045,"endY":-635,"lineGroup":"e1527"}|
{"type":"LINE","ticket":414,"id":"8d9b08183efac6cb"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1085,"startY":-635,"endX":1045,"endY":-635,"lineGroup":"e1527"}|
{"type":"LINE","ticket":415,"id":"f237de8b7cbe298c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1085,"startY":-760,"endX":1085,"endY":-635,"lineGroup":"e1527"}|
{"type":"LINE","ticket":416,"id":"a81f0fd3361d327a"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1085,"startY":-760,"endX":1045,"endY":-760,"lineGroup":"e1527"}|
{"type":"LINE","ticket":417,"id":"c6cc9eec814cef4f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-760,"endX":1045,"endY":-745,"lineGroup":"e1527"}|
{"type":"LINE","ticket":418,"id":"e624c26b194bdaa2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-760,"endX":1020,"endY":-760,"lineGroup":"e1527"}|
{"type":"LINE","ticket":419,"id":"14d4117eefeff85d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1020,"startY":-760,"endX":1020,"endY":-715,"lineGroup":"e1527"}|
{"type":"LINE","ticket":420,"id":"a87f8a7df007c43f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-655,"endX":1045,"endY":-635,"lineGroup":"e1527"}|
{"type":"LINE","ticket":421,"id":"6b581e11391f18bd"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-635,"endX":965,"endY":-635,"lineGroup":"e1527"}|
{"type":"LINE","ticket":422,"id":"a7ca0eb5a3387a7e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-635,"endX":930,"endY":-635,"lineGroup":"e1527"}|
{"type":"LINE","ticket":423,"id":"406eb24bf69215d5"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":930,"startY":-645,"endX":930,"endY":-635,"lineGroup":"e1527"}|
{"type":"LINE","ticket":424,"id":"00cd68b239ceaa93"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-645,"endX":965,"endY":-635,"lineGroup":"e1527"}|
{"type":"WIRE","ticket":425,"id":"e1528"}||{"zIndex":98,"locked":false}|
{"type":"LINE","ticket":426,"id":"6cd64705386d664d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":855,"startY":-735,"endX":745,"endY":-735,"lineGroup":"e1528"}|
{"type":"WIRE","ticket":427,"id":"e1530"}||{"zIndex":100,"locked":false}|
{"type":"LINE","ticket":428,"id":"9f433b0360ce8435"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":855,"startY":-695,"endX":745,"endY":-695,"lineGroup":"e1530"}|
{"type":"WIRE","ticket":429,"id":"e1532"}||{"zIndex":94,"locked":false}|
{"type":"LINE","ticket":430,"id":"4a8ace8086c5de04"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":930,"startY":-675,"endX":930,"endY":-705,"lineGroup":"e1532"}|
{"type":"LINE","ticket":431,"id":"f2206dfb248d603f"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":930,"startY":-705,"endX":1020,"endY":-705,"lineGroup":"e1532"}|
{"type":"LINE","ticket":432,"id":"24561b8309ff9e9e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":895,"startY":-735,"endX":930,"endY":-735,"lineGroup":"e1532"}|
{"type":"LINE","ticket":433,"id":"d1d26a625d8e7bfd"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":930,"startY":-705,"endX":930,"endY":-735,"lineGroup":"e1532"}|
{"type":"WIRE","ticket":434,"id":"e1736"}||{"zIndex":165,"locked":false}|
{"type":"LINE","ticket":435,"id":"6d05ed5cde785276"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-460,"endX":965,"endY":-480,"lineGroup":"e1736"}|
{"type":"LINE","ticket":436,"id":"a298f3f6faa51b3e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-480,"endX":1020,"endY":-480,"lineGroup":"e1736"}|
{"type":"LINE","ticket":437,"id":"75bdb93b68be7028"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-480,"endX":895,"endY":-480,"lineGroup":"e1736"}|
{"type":"WIRE","ticket":438,"id":"e1738"}||{"zIndex":186,"locked":false}|
{"type":"LINE","ticket":439,"id":"c0b8317fabad5ab6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":985,"startY":-470,"endX":1020,"endY":-470,"lineGroup":"e1738"}|
{"type":"LINE","ticket":440,"id":"56c714afbfc470ff"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":985,"startY":-530,"endX":985,"endY":-470,"lineGroup":"e1738"}|
{"type":"WIRE","ticket":441,"id":"e1739"}||{"zIndex":184,"locked":false}|
{"type":"LINE","ticket":442,"id":"c5e54835940295e5"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-405,"endX":1045,"endY":-420,"lineGroup":"e1739"}|
{"type":"LINE","ticket":443,"id":"6064d93c69905ffa"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1085,"startY":-420,"endX":1045,"endY":-420,"lineGroup":"e1739"}|
{"type":"LINE","ticket":444,"id":"fc016d921e6e13d2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1085,"startY":-545,"endX":1085,"endY":-420,"lineGroup":"e1739"}|
{"type":"LINE","ticket":445,"id":"e709fed75bcef108"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1085,"startY":-545,"endX":1045,"endY":-545,"lineGroup":"e1739"}|
{"type":"LINE","ticket":446,"id":"685c7d11c4f19294"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-545,"endX":1045,"endY":-530,"lineGroup":"e1739"}|
{"type":"LINE","ticket":447,"id":"6730c4eaed6d3a4b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-545,"endX":1020,"endY":-545,"lineGroup":"e1739"}|
{"type":"LINE","ticket":448,"id":"0a625ab9a9c07df7"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1020,"startY":-545,"endX":1020,"endY":-500,"lineGroup":"e1739"}|
{"type":"LINE","ticket":449,"id":"0f30995c884fa199"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-440,"endX":1045,"endY":-420,"lineGroup":"e1739"}|
{"type":"LINE","ticket":450,"id":"7c7cb079fc5c4fd4"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":1045,"startY":-420,"endX":965,"endY":-420,"lineGroup":"e1739"}|
{"type":"LINE","ticket":451,"id":"20e09d2b519711cb"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-420,"endX":930,"endY":-420,"lineGroup":"e1739"}|
{"type":"LINE","ticket":452,"id":"0082146b47be6577"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":930,"startY":-430,"endX":930,"endY":-420,"lineGroup":"e1739"}|
{"type":"LINE","ticket":453,"id":"691f21534e5eac19"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":965,"startY":-430,"endX":965,"endY":-420,"lineGroup":"e1739"}|
{"type":"WIRE","ticket":454,"id":"e1740"}||{"zIndex":167,"locked":false}|
{"type":"LINE","ticket":455,"id":"bfca9b28c0bd6dca"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":855,"startY":-520,"endX":745,"endY":-520,"lineGroup":"e1740"}|
{"type":"WIRE","ticket":456,"id":"e1742"}||{"zIndex":169,"locked":false}|
{"type":"LINE","ticket":457,"id":"e08712b113b853e5"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":855,"startY":-480,"endX":745,"endY":-480,"lineGroup":"e1742"}|
{"type":"WIRE","ticket":458,"id":"e1744"}||{"zIndex":163,"locked":false}|
{"type":"LINE","ticket":459,"id":"8fa49f4742d5dbc3"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":930,"startY":-460,"endX":930,"endY":-490,"lineGroup":"e1744"}|
{"type":"LINE","ticket":460,"id":"6f7c7f3741d21b3b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":930,"startY":-490,"endX":1020,"endY":-490,"lineGroup":"e1744"}|
{"type":"LINE","ticket":461,"id":"5aca3902d83f9ee9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":895,"startY":-520,"endX":930,"endY":-520,"lineGroup":"e1744"}|
{"type":"LINE","ticket":462,"id":"c4de80838d5315e1"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":930,"startY":-490,"endX":930,"endY":-520,"lineGroup":"e1744"}|
{"type":"WIRE","ticket":463,"id":"e4702"}||{"zIndex":194,"locked":false}|
{"type":"LINE","ticket":464,"id":"5c2b161393042315"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":465,"startY":-765,"endX":515,"endY":-765,"lineGroup":"e4702"}|
{"type":"WIRE","ticket":465,"id":"e4721"}||{"zIndex":201,"locked":false}|
{"type":"LINE","ticket":466,"id":"50726cc16256f2bf"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":605,"startY":-725,"endX":605,"endY":-765,"lineGroup":"e4721"}|
{"type":"LINE","ticket":467,"id":"4f7ccf64da09cb90"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":605,"startY":-765,"endX":565,"endY":-765,"lineGroup":"e4721"}|
{"type":"LINE","ticket":468,"id":"c22efafbf242f0e0"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":565,"startY":-765,"endX":565,"endY":-755,"lineGroup":"e4721"}|
{"type":"LINE","ticket":469,"id":"40f787f1e21ace95"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":565,"startY":-755,"endX":555,"endY":-755,"lineGroup":"e4721"}|
{"type":"LINE","ticket":470,"id":"9bf60992c89b9342"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":555,"startY":-765,"endX":565,"endY":-765,"lineGroup":"e4721"}|
{"type":"WIRE","ticket":471,"id":"e4822"}||{"zIndex":213,"locked":false}|
{"type":"LINE","ticket":472,"id":"a52f6dfca9a1115d"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":490,"startY":-655,"endX":455,"endY":-655,"lineGroup":"e4822"}|
{"type":"WIRE","ticket":473,"id":"e4826"}||{"zIndex":215,"locked":false}|
{"type":"LINE","ticket":474,"id":"0b3dd47e912374d2"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":570,"startY":-655,"endX":600,"endY":-655,"lineGroup":"e4826"}|
{"type":"WIRE","ticket":475,"id":"e4842"}||{"zIndex":221,"locked":false}|
{"type":"LINE","ticket":476,"id":"74000a7fb482a7c7"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":490,"startY":-615,"endX":455,"endY":-615,"lineGroup":"e4842"}|
{"type":"WIRE","ticket":477,"id":"e4873"}||{"zIndex":227,"locked":false}|
{"type":"LINE","ticket":478,"id":"d3f54e54c2bf7ab9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":570,"startY":-615,"endX":600,"endY":-615,"lineGroup":"e4873"}|
{"type":"WIRE","ticket":479,"id":"e5065"}||{"zIndex":244,"locked":false}|
{"type":"LINE","ticket":480,"id":"081711e2369f9450"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":450,"startY":-495,"endX":440,"endY":-495,"lineGroup":"e5065"}|
{"type":"WIRE","ticket":481,"id":"e5163"}||{"zIndex":255,"locked":false}|
{"type":"LINE","ticket":482,"id":"73dc5ff54ddbd1fe"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":510,"startY":-495,"endX":510,"endY":-490,"lineGroup":"e5163"}|
{"type":"LINE","ticket":483,"id":"f5520b59b1dc346b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":490,"startY":-495,"endX":510,"endY":-495,"lineGroup":"e5163"}|
{"type":"WIRE","ticket":484,"id":"e5325"}||{"zIndex":258,"locked":false}|
{"type":"LINE","ticket":485,"id":"71f4359452a779c4"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":70,"startY":-585,"endX":70,"endY":-574.9999999999999,"lineGroup":"e5325"}|
{"type":"WIRE","ticket":486,"id":"e7783"}||{"zIndex":344,"locked":false}|
{"type":"LINE","ticket":487,"id":"dd5eaab8196b17ce"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":70,"startY":-525,"endX":70,"endY":-534.9999999999999,"lineGroup":"e7783"}|
{"type":"WIRE","ticket":488,"id":"e7785"}||{"zIndex":345,"locked":false}|
{"type":"LINE","ticket":489,"id":"4ec8dc0d893eb058"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":70,"startY":-485,"endX":70,"endY":-480,"lineGroup":"e7785"}|
{"type":"WIRE","ticket":490,"id":"e10724"}||{"zIndex":388,"locked":false}|
{"type":"LINE","ticket":491,"id":"f15a76f247d425fc"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":240,"startY":-540,"endX":240,"endY":-540,"lineGroup":"e10724"}|
{"type":"WIRE","ticket":492,"id":"e10725"}||{"zIndex":385,"locked":false}|
{"type":"LINE","ticket":493,"id":"eb309ee7455561b1"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":260,"startY":-540,"endX":260,"endY":-540,"lineGroup":"e10725"}|
{"type":"WIRE","ticket":494,"id":"e10726"}||{"zIndex":386,"locked":false}|
{"type":"LINE","ticket":495,"id":"8f10ff2999cdb976"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":240,"startY":-500,"endX":240,"endY":-450,"lineGroup":"e10726"}|
{"type":"WIRE","ticket":496,"id":"e10728"}||{"zIndex":383,"locked":false}|
{"type":"LINE","ticket":497,"id":"8b2c81705ccf4326"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":260,"startY":-500,"endX":260,"endY":-450,"lineGroup":"e10728"}|
{"type":"WIRE","ticket":498,"id":"e10730"}||{"zIndex":380,"locked":false}|
{"type":"LINE","ticket":499,"id":"5443ddf191935648"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":260,"startY":-620,"endX":260,"endY":-620,"lineGroup":"e10730"}|
{"type":"WIRE","ticket":500,"id":"e10731"}||{"zIndex":378,"locked":false}|
{"type":"LINE","ticket":501,"id":"0a9af05f66447824"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":240,"startY":-620,"endX":240,"endY":-650,"lineGroup":"e10731"}|
{"type":"LINE","ticket":502,"id":"f84d712b786c06b6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":235,"startY":-650,"endX":240,"endY":-650,"lineGroup":"e10731"}|
{"type":"WIRE","ticket":503,"id":"e10732"}||{"zIndex":381,"locked":false}|
{"type":"LINE","ticket":504,"id":"6df2f00a85538c0c"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":260,"startY":-705,"endX":260,"endY":-660,"lineGroup":"e10732"}|
{"type":"WIRE","ticket":505,"id":"e10774"}||{"zIndex":430,"locked":false}|
{"type":"LINE","ticket":506,"id":"dbf6460343be7d86"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":120,"startY":-735,"endX":130,"endY":-735,"lineGroup":"e10774"}|
{"type":"WIRE","ticket":507,"id":"e10793"}||{"zIndex":432,"locked":false}|
{"type":"LINE","ticket":508,"id":"22326630a082c007"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":35,"startY":-735,"endX":100,"endY":-735,"lineGroup":"e10793"}|
{"type":"WIRE","ticket":509,"id":"e10812"}||{"zIndex":440,"locked":false}|
{"type":"LINE","ticket":510,"id":"2a051391012659f1"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":120,"startY":-760,"endX":130,"endY":-760,"lineGroup":"e10812"}|
{"type":"WIRE","ticket":511,"id":"e10828"}||{"zIndex":447,"locked":false}|
{"type":"LINE","ticket":512,"id":"b75b0c0f11d9e0ef"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":120,"startY":-710,"endX":130,"endY":-710,"lineGroup":"e10828"}|
{"type":"WIRE","ticket":513,"id":"e10846"}||{"zIndex":449,"locked":false}|
{"type":"LINE","ticket":514,"id":"95ef718ed4999363"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":35,"startY":-760,"endX":100,"endY":-760,"lineGroup":"e10846"}|
{"type":"WIRE","ticket":515,"id":"e10851"}||{"zIndex":452,"locked":false}|
{"type":"LINE","ticket":516,"id":"c05031c06e659ee9"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":100,"startY":-710,"endX":35,"endY":-710,"lineGroup":"e10851"}|
{"type":"WIRE","ticket":517,"id":"e10856"}||{"zIndex":455,"locked":false}|
{"type":"LINE","ticket":518,"id":"6a3a75243cc602bd"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":550,"startY":-494.99999999999994,"endX":550,"endY":-490,"lineGroup":"e10856"}|
{"type":"LINE","ticket":519,"id":"cebc41dd0fd5b1f4"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":590,"startY":-494.99999999999994,"endX":550,"endY":-494.99999999999994,"lineGroup":"e10856"}|
{"type":"WIRE","ticket":520,"id":"e18418"}||{"zIndex":490,"locked":false}|
{"type":"LINE","ticket":521,"id":"22ab50fa6c3e49f6"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":290,"startY":-270,"endX":155,"endY":-270,"lineGroup":"e18418"}|
{"type":"WIRE","ticket":522,"id":"e19341"}||{"zIndex":501,"locked":false}|
{"type":"LINE","ticket":523,"id":"bfbd0af00f638af8"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":550,"startY":-475,"endX":550,"endY":-480,"lineGroup":"e19341"}|
{"type":"LINE","ticket":524,"id":"8a4af4a5076a0fe7"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":590,"startY":-475,"endX":550,"endY":-475,"lineGroup":"e19341"}|
{"type":"WIRE","ticket":525,"id":"e19360"}||{"zIndex":504,"locked":false}|
{"type":"LINE","ticket":526,"id":"f6c43d90e269a50b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":510,"startY":-474.99999999999994,"endX":510,"endY":-480,"lineGroup":"e19360"}|
{"type":"LINE","ticket":527,"id":"82df4d83b08ea9a3"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":480,"startY":-475,"endX":510,"endY":-474.99999999999994,"lineGroup":"e19360"}|
{"type":"WIRE","ticket":528,"id":"e19435"}||{"zIndex":516,"locked":false}|
{"type":"LINE","ticket":529,"id":"d473a519c273f72b"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":465,"startY":-755,"endX":515,"endY":-755,"lineGroup":"e19435"}|
{"type":"LINE","ticket":530,"id":"0b9e01d28294a99e"}||{"fillColor":null,"fillStyle":null,"strokeColor":null,"strokeStyle":null,"strokeWidth":null,"startX":465,"startY":-725,"endX":465,"endY":-755,"lineGroup":"e19435"}|
{"type":"ATTR","ticket":531,"id":"e1299"}||{"x":80,"y":-230,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"HP_OUTL","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1298","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":532,"id":"e1303"}||{"x":80,"y":-250,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"HP_OUTR","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1302","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":533,"id":"e1305"}||{"x":90,"y":-160,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"MIC_BIAS","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1304","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":534,"id":"e1307"}||{"x":90,"y":-135,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"MIC_PR","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1306","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":535,"id":"e1315"}||{"x":90,"y":-85,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"MIC_NR","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1314","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":536,"id":"e1321"}||{"x":222.5,"y":-210,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e1312","zIndex":47,"locked":false}|
{"type":"ATTR","ticket":537,"id":"e1323"}||{"x":255,"y":-95,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e1313","zIndex":10,"locked":false}|
{"type":"ATTR","ticket":538,"id":"e1534"}||{"x":985,"y":-715,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"PIN5V_OUT_IN+","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e1526","zIndex":118,"locked":false}|
{"type":"ATTR","ticket":539,"id":"e1535"}||{"x":1020,"y":-715,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e1527","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":540,"id":"e1746"}||{"x":985,"y":-500,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"PIN5V_OUT_IN+","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e1738","zIndex":187,"locked":false}|
{"type":"ATTR","ticket":541,"id":"e1747"}||{"x":1020,"y":-500,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e1739","zIndex":16,"locked":false}|
{"type":"ATTR","ticket":542,"id":"e1761"}||{"x":745,"y":-695,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"UART0_RXD","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1530","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":543,"id":"e1762"}||{"x":745,"y":-735,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"UART0_TXD","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1528","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":544,"id":"e1763"}||{"x":745,"y":-520,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"UART3_TXD","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1740","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":545,"id":"e1764"}||{"x":745,"y":-480,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"UART3_RXD","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1742","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":546,"id":"e4824"}||{"x":455,"y":-655,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"BOOT0","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e4822","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":547,"id":"e4828"}||{"x":580,"y":-655,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"BOOT0","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e4826","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":548,"id":"e4844"}||{"x":455,"y":-615,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e4842","zIndex":222,"locked":false}|
{"type":"ATTR","ticket":549,"id":"e4875"}||{"x":600,"y":-615,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e4873","zIndex":228,"locked":false}|
{"type":"ATTR","ticket":550,"id":"e5067"}||{"x":440,"y":-495,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e5065","zIndex":245,"locked":false}|
{"type":"ATTR","ticket":551,"id":"e5327"}||{"x":70,"y":-584.9999999999999,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e5325","zIndex":259,"locked":false}|
{"type":"ATTR","ticket":552,"id":"e7787"}||{"x":70,"y":-480,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e7785","zIndex":346,"locked":false}|
{"type":"ATTR","ticket":553,"id":"e10727"}||{"x":240,"y":-450,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"RGB_LED_B","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10726","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":554,"id":"e10729"}||{"x":260,"y":-450,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"RGB_LED_G","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10728","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":555,"id":"e10733"}||{"x":260,"y":-670,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"RGB_LED_R","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10732","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":556,"id":"e10734"}||{"x":240,"y":-635,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":"RIGHT_TOP","value":"VDD_3V3","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e10731","zIndex":379,"locked":false}|
{"type":"ATTR","ticket":557,"id":"e10794"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e10793","zIndex":2,"locked":false}|
{"type":"ATTR","ticket":558,"id":"e10795"}||{"x":35,"y":-735,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":"LEFT_BOTTOM","value":"RGB_LED_G","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10793","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":559,"id":"e10814"}||{"x":130,"y":-760,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"BANK5_GPIO62","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10812","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":560,"id":"e10830"}||{"x":130,"y":-710,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"BANK5_GPIO63","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10828","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":561,"id":"e10847"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e10846","zIndex":2,"locked":false}|
{"type":"ATTR","ticket":562,"id":"e10848"}||{"x":35,"y":-760,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":"LEFT_BOTTOM","value":"RGB_LED_R","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10846","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":563,"id":"e10852"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e10851","zIndex":2,"locked":false}|
{"type":"ATTR","ticket":564,"id":"e10853"}||{"x":35,"y":-710,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":"LEFT_BOTTOM","value":"RGB_LED_B","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10851","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":565,"id":"e10860"}||{"x":130,"y":-735,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":false,"italic":false,"underline":false,"strikeout":null,"align":"LEFT_BOTTOM","value":"BANK1_GPIO20","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10774","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":566,"id":"e18420"}||{"x":155,"y":-270,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e18418","zIndex":491,"locked":false}|
{"type":"ATTR","ticket":567,"id":"e19234"}||{"x":935,"y":-480,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"UART3_RXDA","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1736","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":568,"id":"e19236"}||{"x":935,"y":-490,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"UART3_TXDA","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1744","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":569,"id":"e19239"}||{"x":935,"y":-705,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"UART0_TXDA","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1532","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":570,"id":"e19241"}||{"x":935,"y":-695,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"UART0_RXDA","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1524","zIndex":5,"locked":false}|
{"type":"ATTR","ticket":571,"id":"e19346"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e19341","zIndex":502,"locked":false}|
{"type":"ATTR","ticket":572,"id":"e19347"}||{"x":570,"y":-475,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e19341","zIndex":503,"locked":false}|
{"type":"ATTR","ticket":573,"id":"e19355"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e10856","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":574,"id":"e19356"}||{"x":590,"y":-494.99999999999994,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"BANK4_GPIO53","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e10856","zIndex":4,"locked":false}|
{"type":"ATTR","ticket":575,"id":"e19365"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e19360","zIndex":505,"locked":false}|
{"type":"ATTR","ticket":576,"id":"e19366"}||{"x":495,"y":-475,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e19360","zIndex":506,"locked":false}|
{"type":"ATTR","ticket":577,"id":"e19375"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e5163","zIndex":256,"locked":false}|
{"type":"ATTR","ticket":578,"id":"e19376"}||{"x":500,"y":-495,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e5163","zIndex":257,"locked":false}|
{"type":"ATTR","ticket":579,"id":"e19431"}||{"x":465,"y":-765,"rotation":0,"color":null,"fontFamily":null,"fontSize":10,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"RSTN","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e4702","zIndex":3,"locked":false}|
{"type":"ATTR","ticket":580,"id":"e19432"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e4702","zIndex":2,"locked":false}|
{"type":"ATTR","ticket":581,"id":"e19464"}||{"x":605,"y":-725,"rotation":90,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e4721","zIndex":7,"locked":false}|
{"type":"ATTR","ticket":582,"id":"e19465"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e4721","zIndex":6,"locked":false}|
{"type":"ATTR","ticket":583,"id":"e19475"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"[]","keyVisible":false,"valueVisible":false,"key":"Relevance","fillColor":null,"parentId":"e19435","zIndex":517,"locked":false}|
{"type":"ATTR","ticket":584,"id":"e19476"}||{"x":490,"y":-725,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"GND","keyVisible":false,"valueVisible":false,"key":"NET","fillColor":null,"parentId":"e19435","zIndex":518,"locked":false}|
{"type":"ATTR","ticket":585,"id":"e19482"}||{"x":225,"y":-230,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"HP_OUTL_A","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1309","zIndex":51,"locked":false}|
{"type":"ATTR","ticket":586,"id":"e19484"}||{"x":225,"y":-250,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"HP_OUTR_A","keyVisible":false,"valueVisible":true,"key":"NET","fillColor":null,"parentId":"e1308","zIndex":53,"locked":false}|
{"type":"TEXT","ticket":587,"id":"e1765"}||{"x":790,"y":-595,"rotation":0,"color":null,"fontFamily":null,"fontSize":30,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"小核-linux占用","fillColor":null,"zIndex":192,"locked":false}|
{"type":"TEXT","ticket":588,"id":"e1767"}||{"x":755,"y":-390,"rotation":0,"color":null,"fontFamily":null,"fontSize":30,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"大核-RT-Smart占用","fillColor":null,"zIndex":193,"locked":false}|
{"type":"TEXT","ticket":589,"id":"e4724"}||{"x":495,"y":-695,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"复位按钮","fillColor":null,"zIndex":204,"locked":false}|
{"type":"TEXT","ticket":590,"id":"e4876"}||{"x":480,"y":-590,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"BOOT0按钮","fillColor":null,"zIndex":229,"locked":false}|
{"type":"TEXT","ticket":591,"id":"e5068"}||{"x":495,"y":-440,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"用户按钮","fillColor":null,"zIndex":246,"locked":false}|
{"type":"TEXT","ticket":592,"id":"e5258"}||{"x":55,"y":-420,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"电源指示灯","fillColor":null,"zIndex":269,"locked":false}|
{"type":"TEXT","ticket":593,"id":"e5328"}||{"x":220,"y":-420,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"用户指示灯","fillColor":null,"zIndex":270,"locked":false}|
{"type":"TEXT","ticket":594,"id":"e5995"}||{"x":745,"y":-560,"rotation":0,"color":null,"fontFamily":null,"fontSize":20,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"只支持3.3V，不得接入5V","fillColor":null,"zIndex":271,"locked":false}|
{"type":"TEXT","ticket":595,"id":"e7581"}||{"x":75,"y":-15,"rotation":0,"color":null,"fontFamily":null,"fontSize":30,"fontWeight":null,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"layout时考虑换一个接口","fillColor":null,"zIndex":295,"locked":false}|
{"type":"TEXT","ticket":596,"id":"e10565"}||{"x":245,"y":-730,"rotation":0,"color":"#9933CC","fontFamily":null,"fontSize":30,"fontWeight":true,"italic":null,"underline":null,"strikeout":null,"align":null,"value":"RGB","fillColor":"#9933CC","zIndex":419,"locked":false}|
{"type":"RECT","ticket":597,"id":"e7580"}||{"radiusX":0,"radiusY":0,"dotX1":45,"dotX2":385,"dotY1":-380,"dotY2":-10,"strokeColor":null,"strokeStyle":null,"fillColor":null,"strokeWidth":null,"fillStyle":null,"rotation":0,"zIndex":294,"locked":false}|
{"type":"ATTR","ticket":598,"id":"cadc7badd36c309b"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge292","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e997","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":599,"id":"5e34c594559402a4"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge296","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1083","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":600,"id":"6e4f9fb5e09d9452"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge293","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1026","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":601,"id":"06a37d0e2b34759b"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge295","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1064","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":602,"id":"4d7d89fc27f2ff96"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge297","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1102","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":603,"id":"e15eeeca953f1740"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge298","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1134","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":604,"id":"8fdc3b9de574f3a0"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge299","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1153","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":605,"id":"0970f94457d2e463"}||{"x":300,"y":-190,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":false,"italic":false,"underline":false,"align":"LEFT_BOTTOM","value":"gge300","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1172","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":606,"id":"c55bae7f75834e5d"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge301","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1201","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":607,"id":"17fdf2cc27faa07c"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge305","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1324","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":608,"id":"b89200c4c9d7593d"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge310","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1536","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":609,"id":"b3047d504d100ae9"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge306","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1398","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":610,"id":"04060b9d21071f3d"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge307","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1428","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":611,"id":"8b3f9f09027856f1"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge311","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1610","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":612,"id":"7603e93b20c10fcd"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge312","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1640","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":613,"id":"cacc6bcca0f9f985"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge308","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1458","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":614,"id":"c34027c470ad2c72"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge309","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1491","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":615,"id":"0b545fa7153ac7ea"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge313","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1670","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":616,"id":"dad13e2c698c39a3"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge314","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e1703","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":617,"id":"7e34b7a738b67314"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge318","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e4727","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":618,"id":"6105b2ec09ea12f5"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge320","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e5018","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":619,"id":"a577a7911ac835cf"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge368","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e7715","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":620,"id":"ebda47ed9203f5b4"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge369","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e7746","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":621,"id":"38fccd17c78fb352"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge402","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e10677","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":622,"id":"177bdfdff432b961"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge399","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e10566","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":623,"id":"990dbf8d92010f41"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge400","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e10603","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":624,"id":"858b0e8784976935"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge401","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e10640","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":625,"id":"412998cf690fbb74"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge416","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e19243","zIndex":0,"locked":false}|
{"type":"ATTR","ticket":626,"id":"853a9d0925ee9472"}||{"x":null,"y":null,"rotation":0,"color":null,"fontFamily":null,"fontSize":null,"fontWeight":null,"italic":null,"underline":null,"align":null,"value":"gge417","keyVisible":false,"valueVisible":false,"key":"Unique ID","fillColor":null,"parentId":"e19378","zIndex":0,"locked":false}
`
