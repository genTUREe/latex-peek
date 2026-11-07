# LaTeX Peek

A small Visual Studio Code extension for previewing a selected LaTeX formula with KaTeX.

[![Open the live LaTeX Peek website](website/preview.png)](https://latexpeek.vercel.app/)

**[Open the live website →](https://latexpeek.vercel.app/)**

## Try it locally

1. Install [Node.js](https://nodejs.org/) and Visual Studio Code.
2. Run `npm install` in this folder.
3. Open this folder in VS Code and press `F5` to launch the Extension Development Host.
4. In the new window, place the cursor inside a LaTeX math expression or select it, then press **Ctrl+Alt+M** (**Cmd+Option+M** on macOS) or run **LaTeX Peek: Preview Formula at Cursor or Selection** from the Command Palette.

The preview opens beside the editor and follows the cursor or selection as you move through the document. LaTeX Peek recognizes `$...$`, `$$...$$`, `\(...\)`, `\[...\]`, and common equation environments. KaTeX syntax errors are shown in the preview.

Adjust the formula size with the `latexPeek.preview.scale` setting (default `1`, range `0.5`–`2`). Changes apply immediately to an open preview.

## Development

- `npm test` compiles the extension and runs its tests.
- `npm run compile` compiles the TypeScript sources.

The static website source is in `website/`; open `website/index.html` in a browser to preview it locally.

The extension previews individual math expressions; it does not compile a complete LaTeX document.
