<p align="center">
  <img src="./images/logo.png" width="160" alt="DeepSeek Reasonix" />
</p>

<h1 align="center">DeepSeek Reasonix · VS Code</h1>

<p align="center">
  <b>在 VS Code 里一键启动 Reasonix，自动注入上下文。把 99.82% 缓存命中率的 AI 编码代理嵌入你的编辑器。</b>
</p>

<p align="center">
  <a href="#chinese">🇨🇳 中文</a> &nbsp;|&nbsp;
  <a href="#english">🇬🇧 English</a>
</p>

<p align="center">
  <img alt="VS Code" src="https://img.shields.io/badge/VS%20Code-^1.85-blue?logo=visualstudiocode" />
  <img alt="Node" src="https://img.shields.io/badge/node-≥20-green?logo=nodedotjs" />
  <img alt="License" src="https://img.shields.io/badge/license-MIT-brightgreen" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178c6?logo=typescript" />
</p>

---

<h2 id="chinese">🇨🇳 中文</h2>

## 这是什么？

> **DeepSeek Reasonix for VS Code** — 把 Reasonix 的原生 AI 编码能力嵌入 VS Code 终端，并非一个独立 UI 面板，而是和编辑器天然一体的终端工作流。

底层引擎是 [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix) —— 一个围绕 DeepSeek API 前缀缓存优化的 AI 编码代理。它的核心壁垒不是「功能多」，而是**长会话中 Token 成本始终极低**。

真实用户单日数据（2026-05-01）：**4.35 亿输入 token，99.82% 缓存命中**，花费约 $12。同等负载在 v4-flash 上无缓存约 $61。这就是为什么我们选择 Reasonix 作为引擎。

这个 VS Code 插件做的事：**把 Reasonix 终端变成编辑器的一部分**。点击图标，终端自动启动 `deepseekcode`，并把你正在编辑的文件路径（和选中行号）以 `@file#L10-L20` 格式注入进去。不用 cd，不用手动 @引用，打开就能对话。

## 亮点

> **缓存稳定性不是一个可以开启的功能；它是整个循环设计所围绕的不变量。** —— 来自 Reasonix 架构文档

- **一键启动**：点击 🐋 图标 → 终端启动 → 文件上下文自动注入。整个过程 < 3 秒。
- **智能终端复用**：同名终端不会重复创建，保持工作区整洁。
- **缓存继承**：通过 Reasonix CLI 启动，自动享有其 99.82% 的前缀缓存命中率。
- **零额外面板**：不占用编辑器面积，AI 交互全部在右侧终端分屏中完成。
- **双模式**：复用现有终端 / 新建独立终端，灵活切换。

## 上手

### 前提

```bash
# 需要 deepseekcode 命令可用
# 方式一：全局安装 reasonix 后 alias
npm install -g reasonix
alias deepseekcode="npx reasonix code"

# 方式二：创建 .bat / shell 脚本封装
# C:\Windows\deepseekcode.bat → npx reasonix code %*
```

验证：

```bash
deepseekcode --help
```

### 安装插件

```bash
git clone https://github.com/whishi47/deepseekcode-reasonix-vscode.git
cd deepseekcode-reasonix-vscode
npm install
npm run package
code --install-extension deepseekcode-*.vsix
```

> 后续会发布到 VS Code Marketplace / Open VSX Registry，届时可直接搜索安装。

### 使用

| 方式 | 操作 | 效果 |
|---|---|---|
| 🐋 活动栏图标 | 点击左侧栏 🐋 | 终端启动并注入当前文件 |
| ⌨ 快捷键 | `Ctrl+Esc` | 打开 / 聚焦终端 |
| ⌨ 快捷键 | `Ctrl+Shift+Esc` | 新建一个终端 |
| ⌨ 快捷键 | `Ctrl+Alt+K` | 注入文件路径到终端 |
| 📎 编辑器按钮 | 右上角 🐋 按钮 | 新建终端并注入上下文 |
| ⌨ 命令面板 | `Ctrl+Shift+P` → 搜索 `DeepSeek` | 所有命令入口 |

## 工作原理

```
┌──────────────────────────────────────────────────────────┐
│                    VS Code 主进程                          │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │ 活动栏图标 │  │ 快捷键绑定 │  │ 编辑器标题栏按钮      │  │
│  └─────┬────┘  └─────┬─────┘  └──────────┬───────────┘  │
│        │             │                   │               │
│        └─────────────┼───────────────────┘               │
│                      ▼                                   │
│         ┌────────────────────────┐                       │
│         │  extension.ts (核心)    │                       │
│         │  · 终端管理             │                       │
│         │  · 文件上下文感知        │                       │
│         │  · 终端就绪检测          │                       │
│         └───────────┬────────────┘                       │
│                     │                                     │
│                     ▼                                     │
│  ┌──────────────────────────────────────┐                │
│  │          VS Code 终端                │                │
│  │  $ deepseekcode                      │  ← 自动执行    │
│  │  @src/foo.ts#L10-L20                 │  ← 2.5s 后注入 │
│  └──────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

**注入逻辑**：
- 如果当前编辑器有选区 → 注入 `@文件路径#起始行-结束行`
- 如果只是光标在文件中 → 注入 `@文件路径`（光标所在行）
- 如果没有打开文件 → 仅启动终端，不注入

**终端管理策略**：
- 默认模式：查找名为 `DeepSeek` 的终端，存在则复用，不存在则新建
- 新建模式（`Ctrl+Shift+Esc`）：始终创建新终端

## 完整快捷键

| 快捷键 (Win/Linux) | 快捷键 (Mac) | 命令 | 功能 |
|---|---|---|---|
| `Ctrl+Esc` | `Cmd+Esc` | 打开终端 | 聚焦或创建 Reasonix 终端 |
| `Ctrl+Shift+Esc` | `Cmd+Shift+Esc` | 新建终端 | 总是创建新终端窗口 |
| `Ctrl+Alt+K` | `Cmd+Alt+K` | 注入路径 | 把当前文件路径 @引用发送到活跃终端 |

## 配置

插件无需额外配置。安装即可用。

唯一需要的是系统 PATH 中有 `deepseekcode` 命令。除此之外：
- 终端名称：固定为 `DeepSeek`
- 等待就绪时间：2.5s（后自动注入文件上下文）
- 启动命令：可自由修改 `deepseekcode` 为其他别名

> 💡 建议：在 Reasonix 的 `~/.reasonix/config.json` 中提前配置好 API key 和偏好模型，这样插件启动后无需额外操作。

## 为什么不用其他方案？

| 维度 | 本插件 | 直接用 Reasonix CLI | OpenCode |
|---|---|---|---|
| 文件上下文注入 | ✅ 自动 | ❌ 需手动 @引用 | ✅ 自动 |
| 缓存命中率 | 99.82%（继承 Reasonix） | 99.82% | 取决于后端 |
| API 成本 | 极低（DeepSeek 缓存） | 极低 | 取决于模型 |
| 终端集成 | VS Code 内置终端 | 系统终端 | VS Code 内置 |
| 快捷键 | ✅ 三种 | ❌ | ✅ |
| 编辑器按钮 | ✅ | ❌ | ✅ |
| 许可证 | MIT | MIT | MIT |

**本插件的定位**：你不是「替换 Reasonix」，而是「让 Reasonix 长在编辑器里」。所有实际的 AI 能力、缓存优化、工具调用都由 Reasonix CLI 完成，插件只做一件事——**消除启动摩擦**。

## 开发

```bash
# 克隆项目
git clone https://github.com/whishi47/deepseekcode-reasonix-vscode.git
cd deepseekcode-reasonix-vscode

# 安装依赖
npm install

# TypeScript 编译 + esbuild 打包
npm run compile

# 监听模式
npm run watch

# 打包 VSIX
npm run package
```

在 VS Code 中按 `F5` 启动扩展调试。

## 发布

```bash
# 发布到 VS Code Marketplace（需要 publisher token）
npm run publish
```

> 在发布前记得更新 `package.json` 中的 `version` 字段。

## 致谢

- [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix) — 核心 AI 编码引擎，本插件的能力全部来源于此
- [anomalyco/opencode](https://github.com/anomalyco/opencode) — 终端 IDE 集成模式的灵感来源

## 协议

MIT © 2026

---

<h2 id="english">🇬🇧 English</h2>

## What is this?

> **DeepSeek Reasonix for VS Code** — launch the Reasonix AI coding agent inside your editor's terminal, with automatic file context injection. No UI panels, no bloat — just the terminal you already know, integrated into your workflow.

Powered by [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix), the open-source AI coding agent engineered specifically for DeepSeek's prefix-cache architecture. The core value isn't features — it's **extreme cost efficiency across long coding sessions**.

Real-world data from a single user (2026-05-01): **435M input tokens, 99.82% cache hit rate**, ~$12 spent. Equivalent workload on v4-flash without caching: ~$61. That's why we chose Reasonix as the engine.

This VS Code extension does one thing well: it eliminates the friction between your editor and Reasonix. Click the 🐋 icon — your terminal launches, `deepseekcode` runs, and your current file path (with selection line range) is injected as `@file.ts#L10-L20`. No `cd`, no manual `@reference`, just start talking to AI about the code you're looking at.

## Highlights

> **Cache stability is not a feature you turn on; it is the invariant the entire loop is designed around.** — from the Reasonix architecture docs

- **One-click launch**: Click 🐋 → terminal starts → context auto-injected. Under 3 seconds.
- **Smart terminal reuse**: Same-name terminals won't duplicate, keeping your workspace clean.
- **Cache inheritance**: Runs through Reasonix CLI, inheriting its 99.82% prefix-cache hit rate.
- **Zero extra panels**: All AI interaction happens in the right-side split terminal, not in a separate panel.
- **Dual mode**: Reuse existing terminal, or spawn a new one anytime.

## Prerequisites

```bash
# The `deepseekcode` command must be available on your PATH
# Option 1: global install + alias
npm install -g reasonix
alias deepseekcode="npx reasonix code"

# Option 2: wrapper script
# /usr/local/bin/deepseekcode → npx reasonix code "$@"
```

Verify:

```bash
deepseekcode --help
```

## Install

```bash
git clone https://github.com/whishi47/deepseekcode-reasonix-vscode.git
cd deepseekcode-reasonix-vscode
npm install
npm run package
code --install-extension deepseekcode-*.vsix
```

> VS Code Marketplace / Open VSX Registry listing coming soon.

## Usage

| Trigger | Action | Result |
|---|---|---|
| 🐋 Activity bar icon | Click 🐋 in sidebar | Launch terminal with file context |
| `Ctrl+Esc` | Keyboard shortcut | Open / focus terminal |
| `Ctrl+Shift+Esc` | Keyboard shortcut | New terminal |
| `Ctrl+Alt+K` | Keyboard shortcut | Inject file reference to active terminal |
| 📎 Editor button | Click 🐋 in editor toolbar | New terminal with context |
| Command palette | `Ctrl+Shift+P` → `DeepSeek` | All available commands |

## How it works

```
┌──────────────────────────────────────────────────────────┐
│                   VS Code Main Process                    │
│  ┌──────────┐  ┌───────────┐  ┌──────────────────────┐  │
│  │ Activity  │  │  Keyboard  │  │  Editor toolbar      │  │
│  │ Bar icon  │  │  shortcuts │  │  button              │  │
│  └─────┬────┘  └─────┬─────┘  └──────────┬───────────┘  │
│        │             │                   │               │
│        └─────────────┼───────────────────┘               │
│                      ▼                                   │
│         ┌────────────────────────┐                       │
│         │  extension.ts          │                       │
│         │  · terminal manager    │                       │
│         │  · context extractor   │                       │
│         │  · readiness detector  │                       │
│         └───────────┬────────────┘                       │
│                     │                                     │
│                     ▼                                     │
│  ┌──────────────────────────────────────┐                │
│  │          VS Code Terminal            │                │
│  │  $ deepseekcode                      │  ← auto-run    │
│  │  @src/foo.ts#L10-L20                 │  ← injected    │
│  └──────────────────────────────────────┘                │
└──────────────────────────────────────────────────────────┘
```

**Context injection logic**:
- Active selection → inject `@file.ts#L10-L20` (line range)
- Cursor in file, no selection → inject `@file.ts` (file only)
- No open editor → terminal starts without injection

**Terminal management**:
- Default mode: Find existing "DeepSeek" terminal → reuse. Create if missing.
- New mode (`Ctrl+Shift+Esc`): Always create a fresh terminal.

## All Shortcuts

| Shortcut (Win/Linux) | Shortcut (Mac) | Command | Description |
|---|---|---|---|
| `Ctrl+Esc` | `Cmd+Esc` | Open terminal | Focus or create Reasonix terminal |
| `Ctrl+Shift+Esc` | `Cmd+Shift+Esc` | New terminal | Always create a new terminal |
| `Ctrl+Alt+K` | `Cmd+Alt+K` | Inject path | Send current file path to active terminal |

## Configuration

The extension requires zero configuration. Install and go.

The only prerequisite is the `deepseekcode` command on your PATH. Built-in defaults:

- Terminal name: `DeepSeek`
- Readiness wait: 2.5 seconds (before injecting file context)
- Launch command: `deepseekcode`

> 💡 Tip: Pre-configure your DeepSeek API key in `~/.reasonix/config.json` so the terminal session starts ready to code immediately.

## Why this over alternatives?

| Aspect | This Extension | Raw Reasonix CLI | OpenCode |
|---|---|---|---|
| File context injection | ✅ Automatic | ❌ Manual @reference | ✅ Automatic |
| Cache hit rate | 99.82% (inherits Reasonix) | 99.82% | Backend-dependent |
| API cost | Low (DeepSeek cache) | Low | Model-dependent |
| Terminal integration | VS Code built-in | System terminal | VS Code built-in |
| Keyboard shortcuts | ✅ Three | ❌ | ✅ |
| Editor toolbar button | ✅ | ❌ | ✅ |
| License | MIT | MIT | MIT |

**Where this fits**: You're not replacing Reasonix — you're making it feel native to your editor. All AI capabilities, cache optimization, and tool execution live in the Reasonix CLI. This extension handles exactly one job: **eliminating launch friction**.

## Development

```bash
# Clone
git clone https://github.com/whishi47/deepseekcode-reasonix-vscode.git
cd deepseekcode-reasonix-vscode

# Install dependencies
npm install

# Build (TypeScript + esbuild)
npm run compile

# Watch mode
npm run watch

# Package as .vsix
npm run package
```

Press `F5` in VS Code to launch the extension in debug mode.

## Credits

- [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix) — the core AI engine. All coding capabilities originate here.
- [anomalyco/opencode](https://github.com/anomalyco/opencode) — inspired the terminal-first IDE integration pattern.

## License

MIT © 2026
