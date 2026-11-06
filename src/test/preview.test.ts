import assert from 'node:assert/strict';
import test from 'node:test';
import { getWebviewContent } from '../preview';

test('creates a webview with restricted content security policy and local KaTeX assets', () => {
  const html = getWebviewContent(
    'vscode-webview://test',
    'vscode-webview://test/katex.min.js',
    'vscode-webview://test/katex.min.css',
    'test-nonce'
  );

  assert.match(html, /default-src 'none'/);
  assert.match(html, /script-src 'nonce-test-nonce' vscode-webview:\/\/test/);
  assert.match(html, /href="vscode-webview:\/\/test\/katex\.min\.css"/);
  assert.match(html, /src="vscode-webview:\/\/test\/katex\.min\.js"/);
  assert.match(html, /vscode\.postMessage\(\{ type: 'ready' \}\)/);
});

test('receives formulas as messages and displays them through KaTeX, not HTML interpolation', () => {
  const html = getWebviewContent(
    'vscode-webview://test',
    'vscode-webview://test/katex.min.js',
    'vscode-webview://test/katex.min.css',
    'test-nonce'
  );

  assert.match(html, /event\.data/);
  assert.match(html, /katex\.render\(message\.latex, formula/);
  assert.match(html, /formula\.replaceChildren\(\)/);
  assert.match(html, /error\.textContent = renderError/);
  assert.doesNotMatch(html, /innerHTML\s*=/);
});

test('shows guidance when the selection is empty', () => {
  const html = getWebviewContent(
    'vscode-webview://test',
    'vscode-webview://test/katex.min.js',
    'vscode-webview://test/katex.min.css',
    'test-nonce'
  );

  assert.match(html, /message\.latex\.trim\(\)\.length === 0/);
  assert.match(html, /Select a LaTeX formula in the editor/);
});
