# 🐋 DeepSeek Reasonix · VS Code 插件

<p align="center">
  <img src="./images/logo.png" width="128" alt="DeepSeek Reasonix">
</p>

<p align="center">
  <b>在 VS Code 中一键启动 DeepSeek Reasonix 终端，自动注入文件上下文。</b><br/>
  极致缓存优化 + IDE 深度集成 = 低成本 AI 编码体验
</p>

<p align="center">
  <a href="#zh">🇨🇳 中文</a> &nbsp;|&nbsp; <a href="#en">🇬🇧 English</a>
</p>

---

## 这是什么？

在 VS Code 侧边栏点击 🐋 图标，插件自动打开终端并运行 `deepseekcode` 命令，
同时把当前编辑的文件路径（和选中行号）注入到终端里。

不用手动敲 `cd`、不用手动 `@引用文件`——打开就能直接跟 AI 对话当前代码。

底层依赖 [DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix)，
借助其 99.82% 的前缀缓存命中率，长会话 Token 成本始终保持在极低水平。

---

## 上手

### 前提

系统需已有 `deepseekcode` 命令（封装 `npx reasonix code`，或全局安装 `reasonix` 后自行 alias）。

```bash
# 验证
deepseekcode --help
```

### 安装插件

```bash
git clone <你的仓库地址>
cd deepseekcode-vscode
npm install
npm run package
code --install-extension deepseekcode-*.vsix
```

### 使用

| 方式 | 操作 |
|---|---|
| 🐋 活动栏图标 | 点击左侧栏 🐋，终端自动启动并注入当前文件 |
| ⌨ 快捷键 | `Ctrl+Esc` 打开 / 聚焦；`Ctrl+Shift+Esc` 新建终端 |
| 📎 编辑器按钮 | 编辑器右上角 🐋 按钮一键启动 |
| ⌨ 命令面板 | `Ctrl+Shift+P` → `DeepSeek Reasonix: 打开终端` |
| 🔗 引用文件 | 光标定位到代码 → `Ctrl+Alt+K` 注入文件路径到终端 |

---

## 工作流程

```
Ctrl+Esc / 点击 🐋
       │
       ▼
  ┌──────────────┐
  │ 打开终端       │  ← 位置：编辑器右侧分屏
  │ 名称：DeepSeek │  ← 同名终端自动复用
  └──────┬───────┘
         │
         ▼
  deepseekcode    ← 一键启动，自动 cd 到项目根目录
         │
         ▼  (2.5s 后)
  @src/foo.ts#L10-L20  ← 自动注入当前文件+选区行号
```

> 选中代码时附带行号范围，不选时只注入文件路径。

---

## 快捷键一览

| 快捷键 | 功能 |
|---|---|
| `Ctrl+Esc` | 打开 / 聚焦终端 |
| `Ctrl+Shift+Esc` | 新建一个终端 |
| `Ctrl+Alt+K` | 将当前文件引用发送到终端 |

---

## 为什么用这个？

**缓存第一**。Reasonix 专为 DeepSeek API 的前缀缓存设计——同样的问题反复问、
长会话持续编辑，Token 成本极低。真实用户数据显示单日消耗 4.35 亿 Token，
缓存命中 99.82%，实际花费仅约 $12。

**上下文自动**。打开插件的那一刻，当前文件就已经作为上下文传给 AI 了。
不用再手动描述「我在看哪个文件」。

**终端即界面**。不搞额外面板，不占用编辑区，终端贴在右侧分屏。
所有 AI 交互都在终端里，和原版 Reasonix 完全一致的体验。

---

## 开发

```bash
# 构建
npm run compile

# 监听
npm run watch

# 打包 VSIX
npm run package
```

在 VS Code 中打开项目文件夹，按 `F5` 启动扩展调试。

---

<h3 id="en">🇬🇧 English</h3>

**DeepSeek Reasonix for VS Code** — one-click terminal launch with automatic file context injection.

### What it does

Click the 🐋 icon in the activity bar (or press `Ctrl+Esc`).  
The extension opens a terminal, runs `deepseekcode`, and automatically injects
the current file path (with line range if selected) into the terminal.

Powered by [DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix)
and its 99.82% prefix cache hit rate.

### Install

```bash
git clone <your-repo-url>
cd deepseekcode-vscode
npm install
npm run package
code --install-extension deepseekcode-*.vsix
```

**Prerequisite**: `deepseekcode` command available on your system.

### Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl+Esc` | Open / focus terminal |
| `Ctrl+Shift+Esc` | New terminal |
| `Ctrl+Alt+K` | Add file reference to terminal |

### Dev

```bash
npm run compile   # build
npm run watch     # watch mode
npm run package   # pack VSIX
```

---

### 致谢 · Credits

- [esengine/DeepSeek-Reasonix](https://github.com/esengine/DeepSeek-Reasonix) — 核心 AI 编码引擎
- [anomalyco/opencode](https://github.com/anomalyco/opencode) — 终端 IDE 集成参考

### 协议 · License

MIT
