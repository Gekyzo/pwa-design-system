# Design System Extraction Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the shared design system of the `pwa-*` apps into `pwa-design-system`, and make `pwa-template` and the five apps load a pinned copy of it.

**Architecture:** `pwa-design-system` holds `design-system.css` (shared tokens, base, 24 core components, layouts), `catalog.js` (the parser), `rules.js` (the design checks as functions) and `sync.mjs`. Each app runs `npm run ds`, which copies those files into `vendor/design-system/` with a `SOURCE.json` of version, commit and hashes. The app's `styles.css` keeps only its own rules; its `tests/design.test.js` runs `rules.js` over the shared and the app files.

**Tech Stack:** plain CSS with `@layer`, ES modules, `node --test`, Node ≥ 20, no dependencies.

**Spec:** `docs/superpowers/specs/2026-10-16-design-system-extraction-design.md` (this repository).

## Global Constraints

- No visual change in any app: same screenshots before and after, light and dark, at each viewport of that app's `.claude/conventions/WORKFLOW.md` (`pwa-template`: 360×800, 768×1024, 1280×800; `pwa-shopping-list`: 390×844).
- No npm package, no build step, no new dependency. `vendor/design-system/` is generated, never edited by hand.
- No app loads a file from another repository at runtime. An app's `npm test` passes without `../pwa-design-system`.
- The shared CSS never changes to fit one app; an app keeps its divergent version as an override after the shared one, with resets where a shared property leaks through.
- The layer statement is `@layer tokens, base, components, layouts, screens;` in both files.
- English in every file; commits follow `~/code/personal/.claude/conventions/GIT.md` (imperative, no prefix, no attribution).
- Each app is committed in its own repository. No push and no GitHub repository creation without the user's yes.
- Before an app task: record its screenshots on the unchanged `HEAD` first.

## Review Focus

1. Cascade order: a shared rule that was after an app rule in the old `styles.css` is now before it (the shared file loads first). Expect the screenshot diff to catch it; Task 5 adds a test that lists each app selector also in `design-system.css` with a different body.
2. `npm run ds` from a `pwa-design-system` with uncommitted changes would record a commit that does not hold those files: `sync.mjs` refuses (test in Task 3).
3. Offline: the vendored CSS missing from `SHELL` of `sw.js` gives an unstyled app with the server stopped (test in Task 5: each `vendor/design-system/*.css` is in `SHELL`).
4. A hand edit of a vendored file: the vendor test of the app fails with the file name (test in Task 5).
5. `npm run init` of `pwa-template` must keep `vendor/` (test in Task 5).

---

### Task 1: Repository and parser

**Files:**
- Create: `package.json`, `README.md`, `CLAUDE.md`, `CHANGELOG.md`, `version.json`, `.gitignore`, `.claude/conventions/*.md`
- Create: `catalog.js` (from `../pwa-template/designs/catalog.js`), `tests/catalog.test.js` (from `../pwa-template/tests/catalog.test.js`)

**Interfaces:**
- Produces: `catalog.js` exports as today (`LAYERS`, `rulesOf`, `blocksOf`, `parseCatalog`, `classesOf`, `iconsOf`, `classesInScript`, `menuOf`), plus `parseCatalog({ css, sprite })` accepting `css` as a string or an array of strings, read in order.

- [ ] **Step 1:** `package.json`: name `pwa-design-system`, version `0.1.0`, `"type": "module"`, `engines.node >=20`, scripts `test: node --test`, `serve: python3 -m http.server 8090`. `version.json` `{ "version": "0.1.0" }`. Conventions: copy `../pwa-template/.claude/conventions/`, with local overrides stating the test command and that this repository has no app and no deploy.
- [ ] **Step 2:** Copy `catalog.js` and `tests/catalog.test.js`; change the test import to `../catalog.js`. Add test `parseCatalog joins an array of css` asserting that `parseCatalog({ css: [a, b], sprite: '' }).components` has the components of `a` then of `b`.
- [ ] **Step 3:** `npm test` → the new test fails; implement; `npm test` → all pass.
- [ ] **Step 4:** Commit `Add the catalogue parser of the pwa apps`.

### Task 2: design-system.css

**Files:**
- Create: `design-system.css`, `scripts/split.mjs`, `tests/split.test.js`, `tests/design-system.test.js`

**Interfaces:**
- Consumes: `rulesOf`, `blocksOf` (Task 1).
- Produces: `design-system.css`; `split.mjs` exports `appPart(appCss: string, sharedCss: string) => string`, the app CSS without each rule and each token declaration identical (same layer, selector and declarations) to one of `sharedCss`, and without the `@component` blocks of shared components. Run as `node scripts/split.mjs <app styles.css>` it prints `appPart` of that file.

- [ ] **Step 1:** Tests of `appPart`: an identical rule goes; a rule with one declaration more stays; an identical token goes, an app token stays; the `@component` block of a shared name goes, the rules of an overriding version stay with a `/* Overrides <name> of the design system. */` comment in place of the block.
- [ ] **Step 2:** Run, see fail; implement; run, see pass.
- [ ] **Step 3:** Write `design-system.css` from `../pwa-template/styles.css`: the layer statement; the 52 tokens identical in the six apps (spec, "Measured starting point"); the 11 base rules identical in the six; the 24 core components with their `@component` blocks; the 17 layout rules with their blocks. Nothing app-specific: no `screens` rule.
- [ ] **Step 4:** `tests/design-system.test.js`: `parseCatalog` has no error; component names are exactly the 24 of the spec; 52 `:root` tokens; no rule in `screens`.
- [ ] **Step 5:** `npm test` → pass. Commit `Add the shared stylesheet`.

### Task 3: rules.js and sync.mjs

**Files:**
- Create: `rules.js`, `tests/rules.test.js`, `sync.mjs`, `tests/sync.test.js`, `docs/spec/01-design-system.md`, `docs/spec/02-layout.md`

**Interfaces:**
- Consumes: `catalog.js` (Task 1).
- Produces:
  - `rules.js`: `export const RULES = [{ id: 'DS-1', title: string, reads: ['css'] | ['css', 'html', 'scripts', 'sprite', 'page'], check: (files) => string[] }]`, where `files = { css: string[], html, scripts: [name, text][], sprite, page }` and `check` returns the violations (empty = pass). One entry per `test(...)` of `../pwa-template/tests/design.test.js`, same titles.
  - `sync.mjs`: `node ../pwa-design-system/sync.mjs [appDir=cwd]` writes `vendor/design-system/{design-system.css,catalog.js,rules.js,SOURCE.json}`; `SOURCE.json = { version, commit, files: { [name]: sha256hex } }`. Exports `sync({ from, to }) => SOURCE`.

- [ ] **Step 1:** `tests/rules.test.js`: every `RULES` entry has a unique title and an `id` of the form `DS-n` or `LAY-n`; for DS-1, DS-2 and DS-4, one fixture CSS that violates the rule gives a non-empty result; each entry with `reads: ['css']` gives `[]` over `design-system.css`.
- [ ] **Step 2:** `tests/sync.test.js` (temp dirs with `fs.mkdtempSync`): writes the four files with the hashes of their content; refuses with `uncommitted changes in pwa-design-system` when `git status --porcelain` of `from` is not empty; refuses with `not an app` when `to` has no `package.json`.
- [ ] **Step 3:** Run, see fail; implement `rules.js` by moving the bodies of the template tests; implement `sync.mjs`; run, see pass.
- [ ] **Step 4:** Move DS-1 … DS-8 from `../pwa-template/docs/spec/04-design-system.md` and LAY-1 … LAY-4 from `05-layout.md` into `docs/spec/`, worded for `design-system.css` plus the app's `styles.css`.
- [ ] **Step 5:** Commit `Add the design rules and the sync script`.

### Task 4: Catalogue page

**Files:**
- Create: `index.html`, `page.js` (from `../pwa-template/designs/`), `README.md` section

- [ ] **Step 1:** `page.js` reads `design-system.css` and `icons.svg` of this repository only if present (no sprite here: the icon section shows none). It takes an optional list of extra CSS from `?css=` for an app's page.
- [ ] **Step 2:** `npm run serve`, open http://localhost:8090/ at 390×844 and 1280×800, light and dark: the 24 components and the tokens show, no error line.
- [ ] **Step 3:** README: what is here, `npm run ds` in an app, how to change a shared component (edit, test, bump `version.json`, commit, then `npm run ds` in each app). Commit `Add the catalogue page`.

### Task 5: pwa-template

**Files (in `../pwa-template`):**
- Create: `vendor/design-system/*` (by `npm run ds`), `tests/vendor.test.js`
- Modify: `package.json` (`"ds": "node ../pwa-design-system/sync.mjs"`), `index.html` (link before `styles.css`), `styles.css` (`node ../pwa-design-system/scripts/split.mjs styles.css`), `sw.js` (`SHELL`), `designs/page.js` and `designs/index.html` (use `vendor/design-system/catalog.js`, read both CSS), `tests/design.test.js` (loop over `RULES`), `docs/spec/04-design-system.md`, `docs/spec/05-layout.md` (pointer + own rules), `scripts/init.mjs` (keeps `vendor/`), `README.md`, `.claude/conventions/RELEVANT-FILES.md`
- Delete: `designs/catalog.js`, `tests/catalog.test.js`

- [ ] **Step 1:** Screenshots of every section on unchanged `HEAD`, light and dark, at 360×800, 768×1024, 1280×800, into the scratchpad.
- [ ] **Step 2:** `tests/vendor.test.js`: each file of `SOURCE.json` matches its sha256 (message names the file); each `vendor/design-system/*.css` is in `SHELL` of `sw.js`; `index.html` links `vendor/design-system/design-system.css` before `styles.css`; no selector of `styles.css` in `components` or `layouts` matches a selector of the shared CSS unless it follows an `Overrides <name>` comment. Add to the `init` test: the copy keeps `vendor/design-system/`.
- [ ] **Step 3:** Run, see fail; `npm run ds`; apply the file changes above; run `npm test`, see pass.
- [ ] **Step 4:** Screenshots again; compare with Step 1 (pixel diff with `scripts/png.mjs`); stop the server and load offline.
- [ ] **Step 5:** Commit in `pwa-template`: `Load the design system from pwa-design-system`, body naming the vendored version and the checks.

### Tasks 6–10: one app each

Same steps and files as Task 5, in this order: `pwa-shopping-list` (Task 6), `pwa-wardrobe` (7), `pwa-shifts` (8), `pwa-nexus` (9), `pwa-financial-calculator` (10). Per app:
- Its divergent components (spec, "Measured starting point") stay as overrides; add resets until Step 4 shows no difference.
- Its own spec file name and its own viewports (its `WORKFLOW.md`).
- `pwa-shopping-list`: LAY-3 is named as an exception in its spec and skipped in its design test; its `rows.js` test stays as an app test.
- Its own components and tokens stay in `styles.css`, with their blocks.
- If the app has a `pre-commit` spec hook, the commit changes its spec file, so no `--no-verify`.

### Task 11: Close

- [ ] **Step 1:** `CHANGELOG.md` of `pwa-design-system`: `0.1.0`, the 24 components and the rules. Each app's `CHANGELOG.md`: no entry (no change for the user).
- [ ] **Step 2:** Run `npm test` in the seven repositories; report each result.
- [ ] **Step 3:** Ask the user: create the GitHub repository `Gekyzo/pwa-design-system` and push; push each app (a deploy).
