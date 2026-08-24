// 出厂默认 1.0 原生 API 数据;数据库激活后由 data-store.js 覆盖 window.edaApi(本文件仅作兜底)
window.edaApi= [
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
					"description":"需要修改的参数{x?:number,y?:number,rotation?:number,mirror?:boolean,addIntoBom?:boolean,addIntoPcb?:boolean,designator?:string|null,name?:string|null,uniqueId?:string|null,manufacturer?:string|null,manufacturerId?:string|null,supplier?:string|null,supplierId?:string|null,otherProperty?:{[key:string]:string|number|boolean,},}"
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