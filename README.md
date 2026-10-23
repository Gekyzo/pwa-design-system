# pwa-design-system

The shared design system of the offline PWAs: pwa-template, pwa-shopping-list,
pwa-wardrobe, pwa-shifts, pwa-nexus and pwa-financial-calculator. Plain CSS and ES
modules; no build step and no dependencies.

This repository has no app. A push to `main` publishes the catalogue page to
https://gekyzo.github.io/pwa-design-system/ (`.github/workflows/pages.yml`).

## Commands

```sh
npm test         # unit tests (node --test)
npm run serve    # http://localhost:8090
```

## What is here

- `design-system.css`: tokens, base, components, layouts and screen parts.
- `catalog.js`: reads the `@component` comments of the CSS into the catalogue.
- `rules.js`: the DS rules an app checks.
- `sheet.js`: drag a sheet down to close it (`dismissed`, `bindSheetDrag`). An app imports it from
  `vendor/design-system/sheet.js`.
- `geist.woff2`: the Geist variable font that `--font` names. `sync.mjs` copies it beside the CSS.
  `OFL.txt` is its licence.
- `index.html` and `page.js`: the catalogue page. Run `npm run serve`, open
  http://localhost:8090/. Add the CSS of an app with `?css=styles.css,more.css`.
- `scripts/serve.mjs`: the server of `npm run serve`. It sends `Cache-Control: no-cache`, so a
  normal reload shows a CSS edit.
- `sync.mjs`: copies the shared files into an app. It refuses a target with no `package.json` or
  one that holds `design-system.css`, and a source with uncommitted changes to a copied file or to
  `version.json`.

## Use in an app

```sh
npm run ds   # in the app: copies the shared files to vendor/design-system/
```

## Change a shared component

1. Edit `design-system.css`, with its `@component` comment.
2. Run `npm test`.
3. Bump `version.json` and add a line to `CHANGELOG.md`.
4. Commit.
5. Run `npm run ds` in each app.

## Conventions

Read `.claude/conventions/` (loaded at session start): GIT, WRITING, CANONICAL,
WORKFLOW, AUTONOMY, ARCHITECTURE, RELEVANT-FILES.
