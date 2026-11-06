# LaTeX Peek

A small Visual Studio Code extension for previewing a selected LaTeX formula with KaTeX.

## Try it locally

1. Install [Node.js](https://nodejs.org/) and Visual Studio Code.
2. Run `npm install` in this folder.
3. Open this folder in VS Code and press `F5` to launch the Extension Development Host.
4. In the new window, select a LaTeX expression in a text editor, open the Command Palette, and run **LaTeX Peek: Preview Selected Formula**.

The preview opens in a panel and updates each time you run the command. If there is no selection, it prompts you to select a formula. KaTeX syntax errors are shown in the preview.

## Development

- `npm test` compiles the extension and runs its tests.
- `npm run compile` compiles the TypeScript sources.

The extension currently previews the selected text as display math; it does not parse a complete LaTeX document or provide a live-updating preview.
