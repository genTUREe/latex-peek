import { randomBytes } from 'node:crypto';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { getWebviewContent } from './preview';

let previewPanel: vscode.WebviewPanel | undefined;
let currentFormula = '';

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand(
    'latexPeek.previewSelectedFormula',
    () => {
      const editor = vscode.window.activeTextEditor;
      currentFormula = editor?.document.getText(editor.selection) ?? '';

      if (!previewPanel) {
        previewPanel = vscode.window.createWebviewPanel(
          'latexPeek.preview',
          'LaTeX Preview',
          vscode.ViewColumn.Beside,
          {
            enableScripts: true,
            localResourceRoots: [
              vscode.Uri.file(path.join(context.extensionPath, 'node_modules', 'katex', 'dist'))
            ]
          }
        );

        const katexDist = vscode.Uri.file(
          path.join(context.extensionPath, 'node_modules', 'katex', 'dist')
        );
        const katexScript = previewPanel.webview.asWebviewUri(
          vscode.Uri.joinPath(katexDist, 'katex.min.js')
        );
        const katexStyles = previewPanel.webview.asWebviewUri(
          vscode.Uri.joinPath(katexDist, 'katex.min.css')
        );

        previewPanel.webview.html = getWebviewContent(
          previewPanel.webview.cspSource,
          katexScript.toString(),
          katexStyles.toString(),
          createNonce()
        );

        previewPanel.webview.onDidReceiveMessage((message: unknown) => {
          if (isReadyMessage(message)) {
            void previewPanel?.webview.postMessage({
              type: 'render',
              latex: currentFormula
            });
          }
        }, undefined, context.subscriptions);

        previewPanel.onDidDispose(() => {
          previewPanel = undefined;
        }, undefined, context.subscriptions);
      } else {
        previewPanel.reveal(vscode.ViewColumn.Beside);
        void previewPanel.webview.postMessage({
          type: 'render',
          latex: currentFormula
        });
      }
    }
  );

  context.subscriptions.push(command);
}

export function deactivate(): void {}

function createNonce(): string {
  return randomBytes(16).toString('base64');
}

function isReadyMessage(message: unknown): message is { type: 'ready' } {
  return typeof message === 'object'
    && message !== null
    && 'type' in message
    && message.type === 'ready';
}
