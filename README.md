# markdown-to-html-preview

TypeScript + ESM Node.js project that provides an interactive Markdown-to-HTML preview mode with EJS templates and separated static assets.

## Requirements

- Node.js 20 or newer
- npm

## Project Structure

```text
markdown-to-html-preview/
├─ public/
│  ├─ scripts/
│  │  └─ preview-page.js
│  └─ styles/
│     ├─ html-document.css
│     └─ preview-page.css
├─ src/
│  ├─ default-markdown.ts
│  ├─ index.ts
│  ├─ markdown-to-html.ts
│  └─ template-service.ts
├─ views/
│  ├─ html-document.ejs
│  └─ preview-page.ejs
├─ .gitignore
├─ package.json
├─ README.md
└─ tsconfig.json
```

## Install

```bash
npm install
```

## Run

Build the production output:

```bash
npm run build
```

Start the preview server from the built output:

```bash
npm run start
```

Run the preview server directly from TypeScript during development:

```bash
npm run dev
```

`npm run dev` watches the TypeScript source files and restarts the server automatically when they change.

Then open:

```text
http://localhost:3000
```

The preview page opens with a built-in Markdown example by default, shows a Markdown editor on the left, renders HTML on the right as you type, and lets you download both the current `.md` content and the generated `.html` file.

If port `3000` is already in use, run with another port:

```bash
$env:PORT=3100
npm run start
```

## Scripts

```bash
npm run build
npm run start
npm run dev
```

## Coding Conventions

- file and folder names use kebab-case
- JavaScript variables and function names use camelCase
- the project uses TypeScript and ESM modules

## Notes

- the Express server is started directly from `src/index.ts`
- the preview page is rendered with EJS
- CSS and browser-side logic are served as separate static files from `public/`

## Extension Ideas

- custom template themes
- drag-and-drop preview page
- export bundles that include local CSS assets
