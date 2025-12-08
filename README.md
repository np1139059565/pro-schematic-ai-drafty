[简体中文](#) 

# pro-schematic-ai

基于嘉立创EDA专业版扩展API开发的原理图设计AI助手扩展包

<a href="https://github.com/np1139059565/pro-schematic-ai" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/stars/np1139059565/pro-schematic-ai" alt="GitHub Repo Stars" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://github.com/np1139059565/pro-schematic-ai/issues" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/issues/np1139059565/pro-schematic-ai" alt="GitHub Issues" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://github.com/np1139059565/pro-schematic-ai" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/repo-size/np1139059565/pro-schematic-ai" alt="GitHub Repo Size" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://choosealicense.com/licenses/apache-2.0/" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/license/np1139059565/pro-schematic-ai" alt="GitHub License" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://www.npmjs.com/package/@jlceda/pro-api-types" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/npm/v/%40jlceda%2Fpro-api-types?label=pro-api-types" alt="NPM Version" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>&nbsp;<a href="https://www.npmjs.com/package/@jlceda/pro-api-types" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/npm/d18m/%40jlceda%2Fpro-api-types" alt="NPM Downloads" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>

> [!NOTE]
>
> 详细开发文档请访问：[https://prodocs.lceda.cn/cn/api/guide/](https://prodocs.lceda.cn/cn/api/guide/)

## 功能特性

- 原理图 AI 对话：支持自然语言问答与上下文管理
- 自动读取/分析：可读取原理图信息，辅助设计优化
- 代码自动执行：集成火山引擎 ARK API，为设计场景生成并执行代码,注意:需要配置自己的AI KEY
- 安全确认：写操作需显式确认，避免误修改

## AI Key 配置

- 需在扩展界面的“配置”中填写 ARK API Key 与 Model，未配置将无法使用 AI 对话/代码执行能力

## 兼容性

- 依赖嘉立创EDA专业版 `>= 2.3.0`（与 extension.json `engines.eda` 保持一致）

## 安装

### 扩展广场安装
1. 打开嘉立创EDA专业版
2. 高级 → 扩展管理器
3. 搜索 “AI 助手” 并安装

### 本地导入安装
1. 下载构建产物（`./build/dist/` 下的扩展包）
2. 高级 → 扩展管理器 → 导入
3. 选择扩展包文件完成安装

## 使用入口

- Home / Sch / PCB 菜单：`AI 助手` → `原理图设计助手` 打开对话
- 关于：`AI 助手` → `About...`

## 开发与构建

1. 克隆仓库

    ```shell
    git clone --depth=1 https://github.com/np1139059565/pro-schematic-ai.git
    ```

2. 安装依赖

    ```shell
    npm install
    ```

3. 编译扩展包

    ```shell
    npm run build
    ```

4. 在嘉立创EDA中导入 `./build/dist/` 的扩展包进行调试

## 更新日志

- 详见 `CHANGELOG.md`

## 反馈与支持

- Issues: https://github.com/np1139059565/pro-schematic-ai/issues
- 使用前请备份设计文件；建议先在测试工程验证

## 贡献指南

我们欢迎所有形式的贡献！无论是报告问题、提出功能建议，还是提交代码改进，都是对项目的宝贵支持。

### 如何参与贡献

1. **Fork 本仓库**：点击 GitHub 页面右上角的 Fork 按钮，将仓库复制到你的账户
2. **创建分支**：从 `main` 分支创建一个新的功能分支
   ```shell
   git checkout -b feature/your-feature-name
   ```
3. **进行开发**：在本地进行代码修改和测试
4. **提交更改**：提交你的更改并推送到你的 Fork
   ```shell
   git commit -m "feat: 添加新功能描述"
   git push origin feature/your-feature-name
   ```
5. **创建 Pull Request**：在 GitHub 上创建 Pull Request，详细描述你的更改内容

### 贡献类型

- 🐛 **Bug 修复**：修复代码中的错误
- ✨ **新功能**：添加新的功能特性
- 📝 **文档改进**：改进项目文档
- 🎨 **代码优化**：优化代码结构或性能
- 🔧 **工具改进**：改进开发工具或构建流程

### 代码规范

- 遵循项目现有的代码风格
- 确保代码通过 ESLint 和 Prettier 检查
- 添加必要的注释和文档
- 提交前运行 `npm run fix` 确保代码格式正确

### 问题反馈

如果发现 Bug 或有功能建议，请在 [Issues](https://github.com/np1139059565/pro-schematic-ai/issues) 页面提交。

感谢你的贡献！🎉

## 开源许可

<a href="https://choosealicense.com/licenses/apache-2.0/" style="vertical-align: inherit;" target="_blank"><img src="https://img.shields.io/github/license/np1139059565/pro-schematic-ai" alt="GitHub License" class="not-medium-zoom-image" style="display: inline; vertical-align: inherit;" /></a>

本扩展包使用 [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/) 开源许可协议。
