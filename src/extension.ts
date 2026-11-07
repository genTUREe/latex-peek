import { randomBytes } from 'node:crypto';
import * as path from 'node:path';
import * as vscode from 'vscode';
import { getMathAtPosition } from './math';
import { getWebviewContent } from './preview';

let previewPanel: vscode.WebviewPanel | undefined;
let currentFormula = '';

export function activate(context: vscode.ExtensionContext): void {
  const command = vscode.commands.registerCommand(
    'latexPeek.previewSelectedFormula',
    async () => {
      const editor = vscode.window.activeTextEditor;
      currentFormula = getFormulaForEditor(editor);
      if (currentFormula.trim().length === 0) {
        await vscode.window.showInformationMessage(
          'Place the cursor inside a LaTeX math expression or select a formula to preview it.'
        );
      }

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
            void postPreviewUpdate();
          }
        }, undefined, context.subscriptions);

        previewPanel.onDidDispose(() => {
          previewPanel = undefined;
        }, undefined, context.subscriptions);
      } else {
        previewPanel.reveal(vscode.ViewColumn.Beside);
        void postPreviewUpdate();
      }
    }
  );

  const selectionListener = vscode.window.onDidChangeTextEditorSelection((event) => {
    if (!previewPanel || event.textEditor !== vscode.window.activeTextEditor) {
      return;
    }

    currentFormula = getFormulaForEditor(event.textEditor, event.selections[0]);
    void postPreviewUpdate();
  });

  const editorListener = vscode.window.onDidChangeActiveTextEditor((editor) => {
    if (!previewPanel || !editor) {
      return;
    }

    currentFormula = getFormulaForEditor(editor);
    void postPreviewUpdate();
  });

  const configurationListener = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('latexPeek.preview.scale')) {
      void postPreviewUpdate();
    }
  });

  context.subscriptions.push(command, selectionListener, editorListener, configurationListener);
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

function getFormulaForEditor(
  editor: vscode.TextEditor | undefined,
  selection = editor?.selection
): string {
  if (!editor || !selection) {
    return '';
  }

  if (!selection.isEmpty) {
    return editor.document.getText(selection);
  }

  return getMathAtPosition(
    editor.document.getText(),
    editor.document.offsetAt(selection.active)
  ) ?? '';
}

function postPreviewUpdate(): Thenable<boolean> | undefined {
  if (!previewPanel) {
    return undefined;
  }

  const scale = vscode.workspace.getConfiguration('latexPeek.preview').get<number>('scale', 1);
  return previewPanel.webview.postMessage({
    type: 'render',
    latex: currentFormula,
    scale
  });
}
