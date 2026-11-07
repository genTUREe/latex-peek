import assert from 'node:assert/strict';
import test from 'node:test';
import { getMathAtPosition } from '../math';
import { getWebviewContent } from '../preview';

test('finds inline math between dollar delimiters', () => {
  const source = 'Area is $A = \\pi r^2$ for a circle.';
  assert.equal(getMathAtPosition(source, source.indexOf('r^2')), 'A = \\pi r^2');
});

test('finds inline math between escaped parenthesis delimiters', () => {
  const source = String.raw`Area is \(A = \pi r^2\) for a circle.`;
  assert.equal(getMathAtPosition(source, source.indexOf('r^2')), 'A = \\pi r^2');
});

test('finds display math between double-dollar delimiters', () => {
  const source = String.raw`$$\sum_{i=1}^{n} i$$`;
  assert.equal(getMathAtPosition(source, source.indexOf('sum')), String.raw`\sum_{i=1}^{n} i`);
});

test('finds display math between escaped bracket delimiters across lines', () => {
  const source = String.raw`Text
\[
\int_0^1 x\,dx
\]
More text`;
  assert.equal(
    getMathAtPosition(source, source.indexOf('int')),
    String.raw`\int_0^1 x\,dx`
  );
});

test('finds content in common equation environments', () => {
  const source = String.raw`\begin{align*}
a &= b + c
\end{align*}`;
  assert.equal(getMathAtPosition(source, source.indexOf('b + c')), 'a &= b + c');
});

test('ignores escaped dollar signs and non-math positions', () => {
  const source = String.raw`A price is \$5, then $x + y$`;
  assert.equal(getMathAtPosition(source, source.indexOf('price')), undefined);
  assert.equal(getMathAtPosition(source, source.indexOf('5')), undefined);
});

test('finds the formula nearest the cursor among multiple expressions', () => {
  const source = String.raw`$x^2$ and then \[y^2\]`;
  assert.equal(getMathAtPosition(source, source.indexOf('y^2')), 'y^2');
});

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
  assert.match(html, /--preview-scale/);
  assert.match(html, /Math\.min\(2, Math\.max\(0\.5, scale\)\)/);
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
  assert.match(html, /Move the cursor into a LaTeX formula or select one/);
});
