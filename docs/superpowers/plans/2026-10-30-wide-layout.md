# Wide Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the four width classes, the frame and the sidebar from Bodega and Attire into the design system as release 0.8.0, with one page padding and one second-column card, then migrate both apps.

**Architecture:** All shared CSS goes into `design-system.css` in its layers, tokens only (DS-2), with `@part` docs for each new class (DS-6). `rules.js` changes DS-8 and LAY-2, with a passing and a failing input in `tests/rules.test.js`. Each app takes the release through `npm run ds` and deletes its copy.

**Tech Stack:** plain CSS with `@layer`, ES modules, `node --test`, no dependencies.

**Spec:** `docs/superpowers/specs/2026-10-30-wide-layout-design.md`.

## Global Constraints

- Breakpoints only `min-width: 600px`, `840px` and `1024px`.
- The doc comments of `design-system.css` use no app words (DS-6).
- An app with no `header-add`, `nav-brand`, `nav-count` or `nav-foot` looks as in 0.7.2 at its width class, except the rail side and the pane card.
- Commits: one per task, imperative English, body for a behaviour change, no attribution. No push.

---

### Task 1: Shared wide layout in design-system.css

**Repo:** pwa-design-system

**Files:**
- Modify: `design-system.css` (tokens, `main`, `app-header`, `nav-bar`, `toast`, `fab`, `sheet`, `pane`)
- Test: `tests/design-system.test.js`

- [ ] Tokens of the spec table; `--rail-width` redefined at 1024px.
- [ ] `.app-header` and `main` padding from 600px: `max(var(--gutter), (100% - var(--page-max)) / 2)`.
- [ ] `nav-bar` at the start with either hand from 600px (delete the right-hand block); sidebar from 1024px; parts `nav-brand`, `nav-count`, `nav-foot`, `nav-foot-text`.
- [ ] `header-add` part of `app-header`; `body:has(.header-add) .fab` hidden from 600px; toast and fab clear `--frame-side`.
- [ ] Sheets from 600px and the side sheet card from 840px.
- [ ] `pane` from 840px: gap `--gutter`, `--page-max: 100%` on the body while a pane shows, `pane-detail` card.
- [ ] Tests: the tokens exist; no `[data-hand="right"] .nav-bar`; the fab is hidden only under `:has(.header-add)`.

### Task 2: Rules, spec and release 0.8.0

**Repo:** pwa-design-system

**Files:**
- Modify: `rules.js` (DS-8, LAY-2), `tests/rules.test.js`, `docs/spec/01-design-system.md` (DS-8), `docs/spec/02-layout.md`, `CHANGELOG.md`, `version.json`, `package.json`

- [ ] DS-8 accepts `min-1024px`, still needs 600 and 840; tests with and without it.
- [ ] LAY-2 fails on a `[data-hand="right"] .nav-bar` rule; tests.
- [ ] LAY-1 to LAY-3 rewritten as the spec; the sheet rules in 02-layout.
- [ ] Catalogue page shows the new parts (`npm run serve`, checked in a browser).
- [ ] `node scripts/try-apps.mjs` table in the 0.8.0 entry; bump to 0.8.0.

### Task 3: Attire on 0.8.0

**Repo:** pwa-wardrobe

**Files:**
- Modify: `vendor/design-system/*` (by `npm run ds`), `styles.css`, `tests/design.test.js`, `docs/spec/04-design-system.md`, `docs/spec/05-layout.md`, `CHANGELOG.md`, `release-notes/*.md`

- [ ] `npm run ds`; delete the tokens, `nav-bar`, `app-header`, `sheet` versions that 0.8.0 now holds; keep `body`, Settings (`--page-max: var(--settings-max)`).
- [ ] Delete the DS-8 skip and the `withoutQuery` tests; DSV-5 and DSV-6 point to LAY-1 to LAY-3.
- [ ] `npm test`; browser at 390, 700, 900, 1440, both hands, offline.

### Task 4: Bodega on 0.8.0

**Repo:** pwa-shopping-list

**Files:**
- Modify: `vendor/design-system/*` (by `npm run ds`), `styles.css`, `tests/design.test.js`, `docs/spec/15-design-system.md`, `docs/spec/07-screen.md`, `CHANGELOG.md`, `release-notes/*.md`

- [ ] `npm run ds`; delete the shared half of DSV-9; panels on `--gutter`, `--page-max` and the card of the DS; sheet in the panel column on the same padding.
- [ ] Delete the DS-8 skip; DSV-8, DSV-9 point to LAY rules.
- [ ] `npm test`; browser at 390, 700, 900, 1440, both hands, offline; title and list x equal to Attire at 900 and 1440.
