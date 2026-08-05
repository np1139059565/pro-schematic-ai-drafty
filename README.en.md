[简体中文](./README.md) | [English](./README.en.md)

# AI巧绘 — Schematic Design Assistant

> For detailed developer documentation, visit: [https://prodocs.lceda.cn/cn/api/guide/](https://prodocs.lceda.cn/cn/api/guide/)


## Feature Overview

AI巧绘 is an intelligent tool designed specifically for schematic designers, featuring the following core capabilities:

1. **AI Chat**: Supports natural language Q&A with context management for quick answers to schematic design questions
2. **Tool Calling**: AI can invoke EDA APIs to read schematic information, such as querying selected components and reading schematic structures
3. **Code Execution**: Integrated with Volcano Engine ARK API to generate and execute code for design scenarios; AI-generated code blocks support inline editing before execution
4. **Knowledge Graph**: D3 force-directed graph visualizing tool call chains and component relationships, with search-to-center and node highlighting
5. **Drawer Panel**: Six-tab drawer on the right (Graph / Prompts / Tools / EDA Functions / Resources / Logs) for one-click browsing
6. **Safety Confirmation**: Code execution requires user confirmation before running; an auto-execute toggle is available for streamlined workflows

### Private Server System Features

The private server mode provides an independent Token billing and user management system with the following advanced features:

- **Dual-Mode Package Coexistence**: Pure Token packages (no time limit, cumulative purchases) and time-limited packages (day/week/month/quarter/year) can coexist
- **Token Deduction Priority**: Prioritize consuming time-limited package tokens, then pure Token package quota after exhaustion
- **Multi-Mode Login**: UUID mode based on URL uinfo parameter + manual mode based on username+password (graceful degradation when URL has no uinfo)
- **Secure Hash Transmission**: User passwords and admin keys are SHA-256 hashed on the frontend before transmission, eliminating plaintext transmission
- **Avatar Dropdown Menu**: User page top-right corner provides "Change Password" and "Logout" entries
- **Multi-Model Management**: Supports dynamic multi-model configuration and intelligent fallback switching

See `ai_schematic_private/README.md` for details

## Getting Started

### 1. Install the Extension

#### Install from Extension Marketplace
1. Open EasyEDA Pro
2. Navigate to **Advanced → Extension Manager**
3. Search for "AI巧绘" and install

#### Install from Local File
1. Download the build output (extension package under `./build/dist/`)
2. Go to **Advanced → Extension Manager → Import**
3. Select the extension package file to complete installation

![Import AI巧绘 Extension](images/import.gif)

### 2. Configure API Key

1. Enable the extension in Extension Manager, and make sure **External Interaction** is turned on
2. Open the AI巧绘 chat interface (via menu `AI巧绘` → `原理图设计助手`)
3. Click the **Settings** button in the top-right corner of the chat interface
4. Fill in the following information in the settings dialog:
   - **API Key**: Volcano Engine ARK API Key
   - **API Model**: API Model (not required when using private server mode)
   - **Use Private Server**: Optionally switch to private server mode, which only requires the API Key

> Note: You need to configure your own AI Key. To obtain ARK API credentials, visit the [Volcano Engine official website](https://www.volcengine.com/) to register and get your API Key and Model information. Alternatively, click the "私服登录" link in the settings dialog to claim a token.

![Configure API Key Before Use](images/apikey.gif)

### 3. Access Points

- Home / Sch / PCB Menu: `AI巧绘` → `原理图设计助手` to open the chat
- About: `AI巧绘` → `About...`

## Features

### AI Chat

Enter schematic design related questions in the input box, and AI will provide professional answers. Supports natural language Q&A with context management, understanding design intent and offering targeted suggestions.

AI can invoke EDA API tools to read schematic information, for example:
- Query detailed information of selected components (parameters, packages, etc.)
- Read the list of all components in the schematic
- Retrieve component pin information
- Analyze schematic structure and connection relationships

### Component Information Query

After selecting a component in the schematic, enter related questions in the chat interface (e.g., "query detailed information of this component"), and AI will call the EDA API to read the selected component's information and return detailed results.

![Scenario 1: Get Selected Component Info](images/scenario1.gif)

### Multi-step Task Processing

AI巧绘 supports handling complex multi-step tasks, completing multiple operations at once. For example:
- Query multiple component information and perform analysis
- Batch read schematic data and process it
- Execute multiple tool calls to complete complex design tasks

Describe the task requirements in natural language, and AI will understand the task intent, automatically invoking multiple EDA API tools to complete multi-step tasks step by step.

![Scenario 2: Multi-step Tasks](images/scenario2.gif)

### Auto Code Execution

AI can generate and execute code based on the conversation content for reading or modifying schematics. Code execution mechanism:

- **Confirm Execution**: By default, AI-generated code is displayed in the chat interface and requires clicking the "Confirm Execution" button to run
- **Auto Execution**: After enabling the "Auto Execute" toggle in the top-right corner of the chat interface, code will automatically execute after 2 seconds
- **Safety Mechanism**: Write operations (modifying schematics) require confirmation by default to prevent accidental modification of design files

Supported operations include:
- Batch modify component parameters
- Place components on the schematic
- Create wire connections
- Query and analyze schematic structure

### Right-Side Drawer Panel

The chat interface features a six-tab drawer on the right, switchable with one click:

- **Graph**: D3 force-directed graph visualizing AI tool call chains and component relationships, with search-to-center and node highlighting
- **Prompts**: 14 preset prompt templates (system prompts, workflow templates, scenario templates, etc.), click to insert into chat
- **Tools**: Displays 33 available tools (27 custom tools + 6 MCP meta-tools), with search filtering and direct execution
- **EDA Functions**: Complete list of EasyEDA native APIs for easy reference and invocation
- **Resources**: Manage locally imported tools and prompt data, supporting import/export
- **Logs**: Complete records of each AI conversation round, with JSON content supporting hierarchical folding

![Drawer Panel](images/drawer.gif)

### Knowledge Graph

The graph panel presents AI tool call relationships and component association networks as a force-directed graph:

- Node size reflects reference strength; edge width distinguishes strong/weak references
- Click a node to highlight its association path (magenta stroke)
- Search auto-centers on unique matching nodes
- Hover over nodes to view detailed information

![Knowledge Graph](images/graph.gif)

### Editable Code Blocks

AI-generated code blocks support inline editing while remaining executable:

- Click a code block to enter edit mode and modify parameters or logic
- Click execute after editing to run with the modified code
- Edit and read-only modes are mutually exclusive to prevent accidental changes

### Data Import & Export

The Resources panel provides local data management:

- **Import Default**: Load built-in tools and prompt data
- **Import from Source**: Import custom tools or prompts from external JSON files
- **Export**: Export current data as a JSON backup file
- Data is stored in IndexedDB and persists after closing the extension

![Data Import & Export](images/import-data.gif)

## Compatibility

- Requires EasyEDA Pro `>= 2.3.0` (consistent with extension.json `engines.eda`)

## Development & Build

1. Clone the repository

    ```shell
    git clone --depth=1 https://github.com/np1139059565/pro-schematic-ai-drafty.git
    ```

2. Install dependencies

    ```shell
    npm install
    ```

3. Build the extension package

    ```shell
    npm run build
    ```

4. Import the extension package from `./build/dist/` into EasyEDA for debugging

## Changelog

- See `CHANGELOG.md` for details

## Feedback & Support

- Issues: https://github.com/np1139059565/pro-schematic-ai-drafty/issues
- Please back up your design files before use; it is recommended to verify in a test project first

## Contributing

We welcome all forms of contributions! Whether reporting issues, suggesting features, or submitting code improvements, all are valuable support for the project.

### How to Contribute

1. **Fork this Repository**: Click the Fork button on the GitHub page to copy the repository to your account
2. **Create a Branch**: Create a new feature branch from `main`
   ```shell
   git checkout -b feature/your-feature-name
   ```
3. **Develop**: Make code modifications and test locally
4. **Commit Changes**: Commit your changes and push to your fork
   ```shell
   git commit -m "feat: add new feature description"
   git push origin feature/your-feature-name
   ```
5. **Create Pull Request**: Create a Pull Request on GitHub with a detailed description of your changes

### Contribution Types

- 🐛 **Bug Fix**: Fix errors in the code
- ✨ **New Feature**: Add new functionality
- 📝 **Documentation**: Improve project documentation
- 🎨 **Code Optimization**: Optimize code structure or performance
- 🔧 **Tooling**: Improve development tools or build process

### Code Standards

- Follow the existing code style of the project
- Ensure code passes ESLint and Prettier checks
- Add necessary comments and documentation
- Run `npm run fix` before committing to ensure proper code formatting

### Issue Reporting

If you find a bug or have a feature suggestion, please submit it on the [Issues](https://github.com/np1139059565/pro-schematic-ai-drafty/issues) page.

Thank you for your contributions! 🎉

## License

This extension package is open-sourced under the [Apache License 2.0](https://choosealicense.com/licenses/apache-2.0/).
