export function getWebviewContent(
  cspSource: string,
  katexScriptUri: string,
  katexStylesUri: string,
  nonce: string
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; font-src ${cspSource}; style-src ${cspSource} 'unsafe-inline'; script-src 'nonce-${nonce}' ${cspSource};">
  <link rel="stylesheet" href="${katexStylesUri}">
  <title>LaTeX Preview</title>
  <style nonce="${nonce}">
    body { padding: 1rem; color: var(--vscode-editor-foreground); }
    #status { color: var(--vscode-descriptionForeground); }
    #formula { overflow-x: auto; padding: 1rem 0; }
    #error { color: var(--vscode-errorForeground); white-space: pre-wrap; }
  </style>
</head>
<body>
  <p id="status" role="status">Waiting for a formula…</p>
  <div id="formula"></div>
  <p id="error" role="alert"></p>
  <script nonce="${nonce}" src="${katexScriptUri}"></script>
  <script nonce="${nonce}">
    const vscode = acquireVsCodeApi();
    const status = document.getElementById('status');
    const formula = document.getElementById('formula');
    const error = document.getElementById('error');

    window.addEventListener('message', (event) => {
      const message = event.data;
      if (!message || message.type !== 'render' || typeof message.latex !== 'string') {
        return;
      }

      formula.replaceChildren();
      error.textContent = '';
      if (message.latex.trim().length === 0) {
        status.textContent = 'Select a LaTeX formula in the editor, then run Preview Selected Formula.';
        return;
      }

      status.textContent = 'Rendering formula…';
      try {
        katex.render(message.latex, formula, { displayMode: true, throwOnError: true });
        status.textContent = '';
      } catch (renderError) {
        status.textContent = 'Could not render this formula.';
        error.textContent = renderError instanceof Error ? renderError.message : String(renderError);
      }
    });

    vscode.postMessage({ type: 'ready' });
  </script>
</body>
</html>`;
}
