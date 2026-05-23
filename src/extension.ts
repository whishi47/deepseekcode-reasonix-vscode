import * as vscode from "vscode";

// ═══════════════════════════════════════════════════════════
// DeepSeekCode VS Code Extension
// One-click terminal launch + auto file context injection.
// Powered by Reasonix CLI (deepseekcode).
// ═══════════════════════════════════════════════════════════

const TERMINAL_NAME = "DeepSeek";
const DEFAULT_LAUNCH_COMMAND = "deepseekcode";

// ── Extension Lifecycle ────────────────────────────────────

export function activate(context: vscode.ExtensionContext) {
  console.log("[DeepSeekCode] Extension activated");

  // Command 1: Open or focus existing terminal
  const openTerminalCmd = vscode.commands.registerCommand(
    "deepseekcode.openTerminal",
    async () => {
      const existing = findTerminal();
      if (existing) {
        existing.show();
        return;
      }
      await launchTerminal(context);
    },
  );

  // Command 2: Always create a new terminal
  const openNewTerminalCmd = vscode.commands.registerCommand(
    "deepseekcode.openNewTerminal",
    async () => {
      await launchTerminal(context);
    },
  );

  // Command 3: Inject current file reference into active terminal
  const addFileCmd = vscode.commands.registerCommand(
    "deepseekcode.addFileToTerminal",
    async () => {
      const fileRef = getActiveFileRef();
      if (!fileRef) {
        vscode.window.showWarningMessage("[DeepSeekCode] 没有活动的编辑器文件");
        return;
      }

      const terminal = vscode.window.activeTerminal;
      if (!terminal || terminal.name !== TERMINAL_NAME) {
        // Try to find any DeepSeek terminal
        const dsTerminal = findTerminal();
        if (dsTerminal) {
          dsTerminal.sendText(fileRef, false);
          dsTerminal.show();
        } else {
          vscode.window.showInformationMessage(
            "[DeepSeekCode] 请先打开终端 (Ctrl+Escape)",
          );
        }
        return;
      }

      terminal.sendText(fileRef, false);
      terminal.show();
    },
  );

  // Sidebar provider for activity bar icon
  const sidebarProvider = new SidebarProvider();
  const sidebarView = vscode.window.registerWebviewViewProvider(
    "deepseekcode.sidebar",
    sidebarProvider,
  );

  context.subscriptions.push(
    openTerminalCmd,
    openNewTerminalCmd,
    addFileCmd,
    sidebarView,
  );
}

export function deactivate() {}

// ── Terminal Management ─────────────────────────────────────

function findTerminal(): vscode.Terminal | undefined {
  return vscode.window.terminals.find((t) => t.name === TERMINAL_NAME);
}

async function launchTerminal(context: vscode.ExtensionContext) {
  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath;

  // Build terminal with custom icon
  const terminal = vscode.window.createTerminal({
    name: TERMINAL_NAME,
    iconPath: {
      light: vscode.Uri.file(context.asAbsolutePath("images/button-dark.svg")),
      dark: vscode.Uri.file(context.asAbsolutePath("images/button-light.svg")),
    },
    location: {
      viewColumn: vscode.ViewColumn.Beside,
      preserveFocus: false,
    },
    env: {
      REASONIX_CALLER: "vscode",
    },
  });

  terminal.show();

  // Navigate to workspace root and launch deepseekcode
  if (workspaceRoot) {
    terminal.sendText(`cd "${workspaceRoot}"`);
  }
  terminal.sendText(getLaunchCommand());

  // Auto-inject current file context after giving Reasonix time to initialize
  const fileRef = getActiveFileRef();
  if (fileRef) {
    // Reasonix typically takes 1-2 seconds to display its TUI.
    // We wait 2.5s to be safe, then inject the file reference.
    await new Promise((resolve) => setTimeout(resolve, 2500));
    terminal.sendText(fileRef, false);
  }
}

function getLaunchCommand(): string {
  const configured = vscode.workspace
    .getConfiguration("deepseekcode")
    .get<string>("launchCommand");
  return configured?.trim() || DEFAULT_LAUNCH_COMMAND;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

// ── File Context ────────────────────────────────────────────

/**
 * Build a file reference string from the active editor.
 * Format: @relative/path  or  @relative/path#L10  or  @relative/path#L10-L20
 * Returns undefined if no active editor or no workspace folder.
 */
function getActiveFileRef(): string | undefined {
  const editor = vscode.window.activeTextEditor;
  if (!editor) return undefined;

  const workspaceFolder = vscode.workspace.getWorkspaceFolder(
    editor.document.uri,
  );
  if (!workspaceFolder) return undefined;

  const relativePath = vscode.workspace.asRelativePath(editor.document.uri);
  let ref = `@${relativePath}`;

  // Append line range if there's a selection
  const selection = editor.selection;
  if (!selection.isEmpty) {
    const startLine = selection.start.line + 1; // 1-based
    const endLine = selection.end.line + 1;

    if (startLine === endLine) {
      ref += `#L${startLine}`;
    } else {
      ref += `#L${startLine}-${endLine}`;
    }
  }

  return ref;
}

// ── Sidebar Webview ─────────────────────────────────────────

class SidebarProvider implements vscode.WebviewViewProvider {
  resolveWebviewView(webviewView: vscode.WebviewView) {
    webviewView.webview.options = {
      enableScripts: true,
    };

    webviewView.webview.html = getSidebarHtml(getLaunchCommand());

    // Handle button clicks from the webview
    webviewView.webview.onDidReceiveMessage((msg) => {
      switch (msg.command) {
        case "openTerminal":
          vscode.commands.executeCommand("deepseekcode.openTerminal");
          break;
        case "newTerminal":
          vscode.commands.executeCommand("deepseekcode.openNewTerminal");
          break;
      }
    });
  }
}

function getSidebarHtml(launchCommand: string): string {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8"/>
  <style>
    :root {
      --bg: var(--vscode-sideBar-background, #1a1a2e);
      --fg: var(--vscode-sideBar-foreground, #e0e0e0);
      --accent: #4fc3f7;
      --accent-dim: rgba(79, 195, 247, 0.15);
      --border: var(--vscode-sideBar-border, rgba(255,255,255,0.08));
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--bg);
      color: var(--fg);
      font-family: var(--vscode-font-family, -apple-system, sans-serif);
      padding: 20px 16px;
      user-select: none;
    }
    .logo-area {
      text-align: center;
      margin-bottom: 20px;
    }
    .logo {
      font-size: 40px;
      margin-bottom: 8px;
    }
    .title {
      font-size: 15px;
      font-weight: 700;
      letter-spacing: -0.3px;
    }
    .subtitle {
      font-size: 11px;
      opacity: 0.45;
      margin-top: 4px;
    }
    .divider {
      border: none;
      border-top: 1px solid var(--border);
      margin: 16px 0;
    }
    .btn {
      display: flex;
      align-items: center;
      gap: 8px;
      width: 100%;
      padding: 10px 12px;
      margin-bottom: 8px;
      background: var(--accent-dim);
      color: var(--fg);
      border: 1px solid var(--border);
      border-radius: 6px;
      font-size: 12px;
      font-family: inherit;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn:hover {
      background: rgba(79, 195, 247, 0.25);
    }
    .btn-icon {
      font-size: 16px;
      flex-shrink: 0;
    }
    .shortcut {
      margin-left: auto;
      font-size: 10px;
      opacity: 0.4;
      font-family: monospace;
    }
    .tip {
      font-size: 11px;
      opacity: 0.4;
      line-height: 1.5;
      margin-top: 16px;
      padding-top: 12px;
      border-top: 1px solid var(--border);
    }
    .tip kbd {
      background: rgba(255,255,255,0.1);
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="logo-area">
    <div class="logo">🐋</div>
    <div class="title">DeepSeekCode</div>
    <div class="subtitle">Powered by Prefix Cache</div>
  </div>

  <hr class="divider" />

  <button class="btn" onclick="send('openTerminal')">
    <span class="btn-icon">▶</span>
    <span>打开终端</span>
    <span class="shortcut">Ctrl+Esc</span>
  </button>

  <button class="btn" onclick="send('newTerminal')">
    <span class="btn-icon">＋</span>
    <span>新建终端</span>
    <span class="shortcut">Ctrl+Shift+Esc</span>
  </button>

  <div class="tip">
    选中代码后按 <kbd>Ctrl+Alt+K</kbd> 添加文件引用到终端<br/>
    终端命令：<kbd>${escapeHtml(launchCommand)}</kbd>
  </div>

  <script>
    const vscode = acquireVsCodeApi();
    function send(cmd) { vscode.postMessage({ command: cmd }); }
  </script>
</body>
</html>`;
}
