# Understanding layer: code knowledge map

> Part of the AI Coding workflow. Run this during stage 1/2 (understanding the
> change scope) before touching any code.

## Why

Before modifying anything you must see how the pieces connect: entry points,
route endpoints, data models, and inter-module dependencies. This doc gives you
two complementary ways to build that mental model.

## Method A - static overview (zero dependency, always works)

Generate a plain-text project navigation doc:

```powershell
# from the repo root
powershell -ExecutionPolicy Bypass -File .\_setup\explore.ps1
```

- Scans top-level structure, entry files, route endpoints, and data models.
- Writes `docs/KNOWLEDGE.md` (safe to commit or ignore - never touches source).
- Optional target override: `-Target .\app`.

This is your fastest "what is here" answer on any machine, even offline.

## Method B - visual dependency graph (recommended for medium+ projects)

Install `dependency-cruiser` and render a real interactive graph of module
imports / requires across the app:

```bash
cd app
npm install --save-dev dependency-cruiser
npx depcruise --config .dependency-cruiser.js src/        # or specify entry dir
npx depcruise --output-type dot src | npx dot --output-type svg > dependency-graph.svg
npx depcruise --output-type html src --output-to depgraph.html   # interactive
```

Suggested minimal config `.dependency-cruiser.js` (JS/Node example - adapt
`allowed`/`recurse` to your app):

```js
module.exports = {
  forbidden: [
    {
      name: 'no-circular',
      severity: 'warn',
      from: {},
      to: { circular: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    exclude: { path: '\\.(test|spec)\\.js$' },
    reporterOptions: { dot: { collapsePattern: '^node_modules/[^/]+' } },
  },
};
```

Add that file at your app root (before `node_modules`). On demand render:

```bash
npx depcruise --config .dependency-cruiser.js src --output-type html --output-to docs/depgraph.html
```

## Choosing

- **Quick recon or tiny project** -> Method A is enough.
- **Medium+ project or you want a shareable visual** -> do A first, then B.
- Both are treated as understanding-layer artifacts; review them before coding,
  update them when the architecture meaningfully changes.

## Relationship to OpenSpec

- Method A/B feed the **context / architecture understanding** that stage 1
  (openspec explore) needs.
- Record significant architectural decisions raised here as ADRs
  (`docs/templates/adr-template.md`).