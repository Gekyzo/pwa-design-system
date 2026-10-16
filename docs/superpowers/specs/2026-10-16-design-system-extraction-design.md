# Extract the design system to pwa-design-system

Date: 2026-10-16. The user skipped the design questions; every choice below that the
user did not state is marked **(Claude's call)**.

## Intent

The user builds several offline Android PWAs from `pwa-template`. Each app holds its own
copy of the design system in `styles.css`, `designs/` and `tests/design.test.js`. The
copies drift: a fix made in one app does not reach the others. The user asked to move
the design system to a new repository, `../pwa-design-system`, and to make
`pwa-template` and every `pwa-*` app take their UI components from it.

## Measured starting point

Measured on 2026-10-16 with the parser of `designs/catalog.js` over the six
`styles.css` files (`pwa-template`, `pwa-shopping-list`, `pwa-wardrobe`, `pwa-shifts`,
`pwa-nexus`, `pwa-financial-calculator`). All six repos are clean, on `main`.

- `designs/catalog.js` and `tests/catalog.test.js` are byte-identical in the six repos.
  `tests/design.test.js` is identical in five; `pwa-shopping-list` has its own.
- Each `styles.css` declares `@layer tokens, base, components, layouts, screens;`.
- Tokens: 70 names in all; 52 are identical in the six. The others are app-specific
  (`--shift-*`, `--swatch*`, `--dot`, `--agenda-date` in `pwa-shifts`; `--corner-*` in
  `pwa-shopping-list`), and `pwa-shopping-list` has no `--rail-width`,
  `--content-max`, `--pane-list`.
- Base: 16 distinct rules; 11 identical in the six.
- Components layer: 24 components are in all six apps. 14 are identical: `button`,
  `pill`, `segmented`, `switch`, `select`, `app-header`, `ring`, `badge`, `sheet`,
  `banner`, `empty-state`, `item-list`, `swipe-action`, `list-group`. The other 10 have
  one version in at least five apps, and a different one in:
  - `pwa-shopping-list`: `icon`, `nav-bar`, `toast`, `group-head`, `fab`, `item-row`;
  - `pwa-nexus`: `input`, `field`, `section-head`, `item-row`;
  - `pwa-shifts`: `chip`;
  - `pwa-wardrobe`: `item-row`.
- App-only components: 11 in `pwa-wardrobe` (`swatch`, `strip`, `outfit`, …), 1 in
  `pwa-shifts` (`type-swatch`), and the `screens` layer of each app.
- Layouts: 17 rules, the same in five apps; `pwa-shopping-list` lacks the `.pane*` rules.
- `icons.svg`: five different sprites across the six apps.

## Goals

1. `pwa-design-system` is the one source of the shared tokens, base rules, components
   and layouts, of the catalogue parser, of the catalogue page and of the design rules
   DS-1 … DS-7.
2. `pwa-template` and the five apps load the shared CSS from it, and keep in their own
   `styles.css` only what is theirs.
3. A change to the design system reaches an app by one command in that app.
4. A new app made from `pwa-template` (`npm run init`) starts with the design system.

## Non-goals

- No visual change in any app. An app looks the same before and after, pixel for pixel
  at a phone viewport.
- No merge of the divergent component versions. Choosing one version per component is a
  later decision of the user, per component.
- No shared `icons.svg`. The sprites differ; each app keeps its own. **(Claude's call)**
- No npm package, no build step, no new dependency.

## Anti-goals

- An app that fails offline, or that breaks when `pwa-design-system` changes without the
  app asking for it.
- An app whose tests need the sibling directory `../pwa-design-system` to pass.

## Distribution **(Claude's call)**

Each app holds a pinned copy of the design system in `vendor/design-system/`, committed
in the app. `npm run ds` (script `scripts/ds-sync.mjs`) copies the files from
`../pwa-design-system` (or a path given as argument) and writes the source version and
commit into `vendor/design-system/SOURCE.json`. The app never loads a file from another
repository at runtime.

Rejected:
- A runtime URL on the shared GitHub Pages origin: an app breaks on each design-system
  deploy, and `npm run serve` of one app cannot reach it.
- A git submodule: GitHub Pages needs an HTTPS URL, the remotes use the
  `github-personal` SSH alias, and a clone needs an extra step.

`vendor/design-system/` is generated: never edited by hand. A test of the app checks
that each vendored file matches the hash recorded in `SOURCE.json`.

## The pwa-design-system repository

Same conventions as the apps: plain CSS and ES modules, `node --test`, no dependencies,
English in files, the convention docs of `~/code/personal`.

Contents:
- `design-system.css`: the layer statement, then the 52 shared tokens, the shared base
  rules, the 24 core components and the 17 layout rules, each inside its
  `@layer` block. For each core component, the shared version is `pwa-template`'s. For
  nine of the ten divergent components it is also the version of five apps; for
  `item-row` it is the version of three (`pwa-template`, `pwa-shifts`,
  `pwa-financial-calculator`), and the other three apps override it. Tokens and base
  rules in fewer than six apps stay in those apps.
- `catalog.js`: the parser, moved from `designs/catalog.js` unchanged, extended only so
  that it can read more than one CSS file (the shared one, then the app's).
- `index.html` and `page.js`: the catalogue page of the shared parts, served by
  `npm run serve`.
- `rules.js`: the checks of `tests/design.test.js`, as functions over the files they
  read (CSS text, page HTML, the scripts of `src/`, the sprite), each returning its list
  of violations. **(Claude's call)** This answers where the line falls between the
  design system and an app: the rule code has one source, and each app runs it over its
  own files.
- `tests/`: `catalog.test.js` (moved); the checks of `rules.js` that read only CSS, run
  over `design-system.css`; and tests of `rules.js` itself.
- `docs/spec/`: DS-1 … DS-8 from `pwa-template`'s `docs/spec/04-design-system.md`, and
  LAY-1 … LAY-4 from its `docs/spec/05-layout.md`, because the shared CSS holds the
  layouts. Each app's spec file keeps a pointer to them and its own rules.
- `version.json` and `CHANGELOG.md`, as in the apps. The version is what an app records
  at sync.

## In each app (pwa-template first)

- `index.html` links `vendor/design-system/design-system.css` before `styles.css`.
- `styles.css` keeps the layer statement and only the app's own rules: app tokens, app
  base rules, app-only components, the app's `screens`, and its divergent component
  versions. A divergent version stays as it is, placed after the shared one in the same
  layer so that it wins, with a comment that names the shared component it overrides.
  When a property, state or variant of the shared version leaks through the override,
  the builder adds a reset to the override **(Claude's call)**. The shared CSS never
  changes to fit one app; the screenshot check decides.
- `sw.js` adds the vendored CSS to its shell list.
- `designs/` shows the shared parts and the app's parts: the page reads
  `vendor/design-system/catalog.js`, `design-system.css` and `styles.css`.
- `tests/design.test.js` imports `vendor/design-system/rules.js` and runs every check
  over the app's files: the shared CSS and the app CSS together, `index.html`,
  `src/**/*.js` and `icons.svg`. Tests of the app's own code that are not design rules
  (such as `pwa-shopping-list`'s test of `rows.js`) stay in the app.
  `tests/catalog.test.js` goes away (it lives in the design system).
- The app's design-system spec file (`04-design-system.md` in `pwa-template`,
  `15-design-system.md` in `pwa-shopping-list`, whatever each app names it) points to
  the rules of the design system and keeps only rules of its own. A rule that does not
  hold for an app (LAY-3 in `pwa-shopping-list`, which has no pane) is named there as an
  exception, and its check is skipped for that app.
- `scripts/ds-sync.mjs`, the `ds` script in `package.json`, and a line in
  `RELEVANT-FILES.md` and the README.
- `pwa-template`'s `scripts/init.mjs` copies `vendor/` with the rest.

## Order and checks

1. `pwa-design-system`, from `pwa-template`'s copy (the reference version of each
   shared part), with its tests.
2. `pwa-template`, then `pwa-shopping-list`, `pwa-wardrobe`, `pwa-shifts`, `pwa-nexus`,
   `pwa-financial-calculator`, one at a time.

For each app: `npm test` passes; screenshots of each screen at 390×844, light and dark,
before and after the change, are the same; the app loads offline with the server stopped.
Each app is one commit (or a few) in its own repository.

Pushes: none without the user's yes. Each push to an app's `main` is a deploy, and
`pwa-design-system` has no GitHub repository yet; creating it and its first push are the
user's call.

## Left to the builder

- How the parser takes several CSS files, and how the design test reports which file a
  rule comes from.
- The exact hash check of the vendored files.
- How to compare screenshots (pixel diff or visual reading).
