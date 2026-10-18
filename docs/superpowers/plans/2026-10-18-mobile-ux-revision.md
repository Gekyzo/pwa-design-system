# Mobile UX Revision (design system) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship the design-system half of the mobile UX revision as three releases (0.3.0 tokens and small fixes, 0.4.0 components, 0.5.0 patterns), with the new rules that keep the apps to it.

**Architecture:** All CSS goes into `design-system.css` inside its `@layer`s, with tokens only (DS-1..DS-4) and an `@component`/`@part`/`@variant`/`@state` comment for every new class (DS-6). The one new script, `sheet.js`, is a pure helper plus a DOM binding, copied to the apps by `sync.mjs`. New rules are entries of `RULES` in `rules.js`, tested in `tests/rules.test.js` with a passing and a failing input. The app half is the sibling plan `pwa-shopping-list/docs/superpowers/plans/2026-10-18-mobile-ux-revision.md`; it consumes each release through `npm run ds`.

**Tech Stack:** plain CSS with `@layer`, ES modules, `node --test`, Node ≥ 20, no dependencies.

**Spec:** `docs/superpowers/specs/2026-10-18-mobile-ux-revision-design.md`. Detail and sketches: `docs/ux-revision.html` (local, gitignored); the prototype CSS in `docs/ux-revision/prototype/proto*.css` shows each "after" look as unlayered overrides — re-express it with tokens, never copy it.

## Global Constraints

- Token values exactly as the spec's token table. The accent colours do not change.
- No raw value outside `@layer tokens` (DS-2). Breakpoints only `min-width: 600px` / `min-width: 840px` (DS-8).
- The doc comments of `design-system.css` use no app words (the DS-6 foreign-word rule: no "shop", "Buscar", "Borrar", "recipe", "product"…). Examples use neutral text ("Done", "Notes", "Filter").
- Every new class has a doc comment and a catalogue `@example` (DS-6). `npm run serve` shows it.
- Each release: bump `version.json` and `package.json` `version`, move `## Unreleased` lines under `## X.Y.0 - <date>` in `CHANGELOG.md`, in the commit that ends the release's last task.
- Commits: one per task, imperative English, no prefix, no attribution, body for a behaviour change (`GIT.md`). No push without the user's yes (a push publishes the catalogue page).
- The siblings (pwa-template, pwa-wardrobe, pwa-shifts, pwa-nexus, pwa-financial-calculator) are never edited by this plan. Task 12 only measures them.

## Review Focus

1. A sheet with no `sheet-head` (all five siblings today) must keep its 0.2.1 padding and scroll: Task 5 tests that `.sheet:not(:has(.sheet-head))` keeps `padding` and `overflow-y: auto`.
2. Reduced motion: `--motion` 250ms and the new `--ease` must still collapse to 0ms in the one reduced-motion block (DS-2 rule already counts it; Task 1 asserts `--motion: 0ms` is still there).
3. A drag on a sheet that starts in its body must never close it (body scroll): Task 5 tests that `bindSheetDrag` ignores a pointerdown whose target is outside `.sheet-grab`/`.sheet-head`, and that a button inside the head is not a drag start.
4. LAY-2 with no `data-hand` (apps without a hand setting) keeps the rail at the start side: Task 10 tests the rule with `data-hand` absent.
5. Compact density must not drop any hit area below 48 px: Task 11 asserts the compact block does not set `--tap`.

---

### Task 1: Tokens for 0.3.0

**Files:**
- Modify: `design-system.css:3-83` (tokens), `:95-101` (`button` in base)
- Test: `tests/design-system.test.js`

**Interfaces:**
- Produces: tokens `--dock-height`, `--surface-2`, `--weight-medium`, `--space-7`, `--ease`, with the values of the spec. Later tasks use them by name.

- [ ] **Step 1: Write the failing tests** in `tests/design-system.test.js`: add the five new names to `TOKENS` and change the count to 60; add `test('the tokens take the values of the revision')` that reads the `:root` declarations of `@layer tokens` and asserts `--tap: 48px`, `--nav-height: 64px`, `--dock-height: 56px`, `--radius-m: 12px`, `--radius-l: 20px`, `--radius-xl: 28px`, `--surface: light-dark(#ffffff, #1d2621)`, `--surface-2: light-dark(#eef2ef, #26302a)`, `--weight-medium: 600`, `--text-l: 1.375rem`, `--space-7: 32px`, `--shadow-l: 0 8px 24px rgb(0 0 0 / 0.14)`, `--ease: cubic-bezier(0.2, 0.8, 0.2, 1)`, `--motion: 250ms`; add `test('a base button is as tall as --tap')` asserting the `button` rule of `@layer base` has `min-height: var(--tap)`; assert the reduced-motion block still sets `--motion: 0ms`.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL on the new token tests.
- [ ] **Step 3: Implement** the token table in `:root`, each with a short trailing comment like its neighbours; `button { min-height: var(--tap); }`. Replace `ease-out` with `var(--ease)` in every `transition`/`animation` of the file.
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** `Raise the tap size and soften the tokens` (body: L1 dark separation 1.11:1 → new surface; `--tap` 48 is Android's floor).

### Task 2: Small component fixes

**Files:**
- Modify: `design-system.css` — `.button.toggle` (:251-257), `:focus-visible` (:112-115), `.input`/`.input.strong` (:406-422), `.item-row-actions` (:895-901), `.cluster.scroll` (:1227-1231)
- Test: `tests/design-system.test.js`

- [ ] **Step 1: Write the failing tests**, one per fix, each finding the rule with `rulesOf(css)`:
  - `.button.toggle` has `color: var(--muted)`; `.button.toggle[aria-pressed="true"] .icon` has `fill: currentColor` (M2).
  - `.input:focus-visible` has `outline: none` and `border-color: var(--accent)`; `.input.strong` has a 1px border; `.input.strong:focus-visible` has `border-width: 2px` (M12).
  - A rule `.input::-webkit-search-cancel-button` with `appearance: none` (M13).
  - `.item-row-swipe:not(.open) .item-row-actions` has `visibility: hidden` (M11).
  - `.cluster.scroll` has a `mask-image` (L4).
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement.** The fade: `mask-image: linear-gradient(to right, black calc(100% - var(--space-7)), transparent)` plus `padding-inline-end: var(--space-6)`; with the left hand the cluster is not mirrored, so no hand rule. The pressed toggle fills its icon; the `@variant toggle` text says so. Note on `.item-row-actions`: an open row still shows them, and the drag code of an app adds `open` only on settle, so during a drag the actions stay hidden; document that in the `item-row` comment ("Hidden while the row is closed, so a fractional pixel ratio shows no edge of them").
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** `Fix the idle toggle contrast, the double focus ring and the native search cancel`.

### Task 3: Rules TAP-1, TAP-2, TXT-1, FOCUS-1 and release 0.3.0

**Files:**
- Modify: `rules.js` (append to `RULES`), `docs/spec/01-design-system.md`, `tests/rules.test.js:9-21`, `version.json`, `package.json`, `CHANGELOG.md`, `README.md` (rule list, if it names the ids)

**Interfaces:**
- Produces: rule ids `TAP-1`, `TAP-2`, `TXT-1`, `FOCUS-1`; the id pattern `/^(DS|LAY|TAP|TXT|FOCUS|SHEET|HAND|STATE)-\d+$/`.

- [ ] **Step 1: Write the failing tests** in `tests/rules.test.js`: widen the id regex to the pattern above; extend the "each id has a rule" list with the four ids; for each rule a test with one failing and one passing `css` (built with the `LAYERS` prefix, like the DS-2 test):
  - TAP-1: `.x { min-height: 44px; }` fails; `min-height: var(--tap)` passes; a `.chip`/`.button`/`.input`/`.swipe-action` rule whose `min-height` or `height` is a token smaller than `--tap` (`var(--icon)`) fails.
  - TAP-2: `.button.x { color: var(--line); }` fails; `border-color: var(--line)` passes.
  - TXT-1: `text-align: justify` fails anywhere, `text-align: start` passes.
  - FOCUS-1: an `.input…:focus-visible` rule without `outline: none` fails; a rule that sets `outline` on `:focus-visible` of anything that is also `.input` and sets a border passes.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement** the four rules with `define(id, title, ['css'], check)`, titles ending in `(TAP-1)` etc., matching the spec's rule text. TAP-1 reads `rules` and flags `min-height`/`height` of `44px` anywhere, and `min-height` of the classes `button`, `chip`, `input`, `swipe-action`, `segment` that is a literal px under 48 or a token other than `--tap`/`--tap-l`. Add the rule texts to `docs/spec/01-design-system.md` under a new `## Touch, text and focus` heading, in the `- **ID** text` form.
- [ ] **Step 4: Run** `npm test` — Expected: PASS, including "each rule that reads only css passes over design-system.css" (fix any shared rule it flags; `.switch-input` is a checkbox drawn at 26px inside a 56px row: give `.switch` the hit area and exempt `switch-input` by name, documented in the rule).
- [ ] **Step 5: Release 0.3.0** — `version.json` `{ "version": "0.3.0" }`, `package.json` version, `CHANGELOG.md` `## 0.3.0 - <date>` with one line per change of Tasks 1–3 (start with "Breaking for an app: `--tap` is 48px; …").
- [ ] **Step 6: Commit** `Add the touch, text and focus rules and release 0.3.0`.

### Task 4: sheet.js and its sync

**Files:**
- Create: `sheet.js`, `tests/sheet.test.js`
- Modify: `sync.mjs:10` (`FILES`), `tests/sync.test.js`, `README.md` ("What is here")

**Interfaces:**
- Produces (in `sheet.js`):
  - `export const dismissed = (dy, velocity, height) => boolean` — true when `dy > height * 0.3 || velocity > 0.5`; false for `dy <= 0` whatever the velocity.
  - `export const bindSheetDrag = (layer, { close }) => () => void` — binds pointer events on `layer`; returns an unbind function.

- [ ] **Step 1: Write the failing tests** in `tests/sheet.test.js` (style of `tests/catalog.test.js`): `dismissed(0, 0, 600)` false; `dismissed(181, 0, 600)` true; `dismissed(180, 0, 600)` false; `dismissed(20, 0.6, 600)` true; `dismissed(-50, 2, 600)` false; `dismissed(10, 0.5, 600)` false. In `tests/sync.test.js` assert `sheet.js` is copied and hashed in `SOURCE.json`.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL (`sheet.js` missing).
- [ ] **Step 3: Implement** `dismissed`, and `bindSheetDrag`: pointerdown only when the target is inside `.sheet-grab` or `.sheet-head` and not inside a `button, input, a, select`; on move (downward only) set `sheet.style.transform = translateY(dy px)` and the veil opacity to `1 - dy / height`, with `transition: none` while dragging; on release compute velocity from the last 100 ms of moves, then `dismissed(...) ? close() : snap back` (clear the inline styles). No DOM in `dismissed`. Add `'sheet.js'` to `FILES`.
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** `Add sheet.js: drag a sheet down to close it`.

### Task 5: Sheet head, body and foot, and SHEET-1

**Files:**
- Modify: `design-system.css:634-733` (sheet), `rules.js`, `docs/spec/01-design-system.md`, `tests/design-system.test.js`, `tests/rules.test.js`

**Interfaces:**
- Produces classes: `sheet-head`, `sheet-body`, `sheet-foot`, `sheet-saved` (parts of `sheet`; `sheet-saved` has state `on`); `sheet-title` gains variant `main` (the 20 px title in a head). Rule `SHEET-1` reads `html`.

- [ ] **Step 1: Write the failing tests:** the four parts and the `main` variant are in the catalogue; `.sheet:has(.sheet-head)` has `padding: 0`, `display: flex`, `flex-direction: column`, `overflow: hidden`; `.sheet-body` has `overflow-y: auto` and `flex: 1`; `.sheet-foot` has `border-top`; `.sheet:not(:has(.sheet-head))` keeps the 0.2.1 `padding` and `overflow-y: auto`; `.sheet-grab` hit area is `var(--tap)` tall. `[data-hand="left"] .sheet-head` and `.sheet-foot` have `flex-direction: row-reverse`. SHEET-1: html with a `class="sheet"` element that holds no `sheet-head` fails; one with `<header class="sheet-head">…<button` passes; html with no sheet passes.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement** from sketch 2 of the review (`proto.css` `.proto-head`/`.proto-foot`/`.proto-saved`): head `display: flex; align-items: center; gap: var(--space-3); padding: 0 var(--space-4) var(--space-2); touch-action: none`; the grab becomes a `--tap`-tall box whose 4 px bar is drawn by `::before` in `--muted`; `sheet-title.main` is `--text-l`, `--weight-strong`, `--text`, `flex: 1`, one line with an ellipsis; foot `padding: var(--space-3) var(--space-4) calc(var(--space-3) + env(safe-area-inset-bottom))`, `justify-content: space-between`; `sheet-saved` is `--muted` `--text-s`, `opacity: 0` and `on` makes it 1 with a `var(--motion)` transition. The sheet transition uses `var(--ease)`. Update the `@component sheet` summary and add one example with head, body and foot (neutral copy: "Note", "Done", "Delete", "Saved"). SHEET-1 text: "Each sheet has a sheet-head with a close or Done button."
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** `Give the sheet a head with Done and a sticky foot`.

### Task 6: input-row mirrored and pinned, field errors, HAND-1

**Files:**
- Modify: `design-system.css` — `input` (:399-422), `input-row` (:1233-1243), the left-hand block (:1169-1197); `rules.js`; `docs/spec/01-design-system.md`; tests

**Interfaces:**
- Produces: `input-row` variant `pinned`; `input` state `invalid` (`aria-invalid="true"`) and part `input-help` (with variant `danger`); rule `HAND-1` reading `css`.

- [ ] **Step 1: Write the failing tests:** `[data-hand="left"] .input-row` has `flex-direction: row-reverse`; `.input-row > .button:disabled` exists (no fill: `background: var(--surface-2)`, `color: var(--muted)`, `opacity: 1`) so an empty field reads as not ready; `.input-row.pinned` is `position: sticky; bottom: 0` with `background: var(--surface)`; `.input[aria-invalid="true"]` has `border-color: var(--danger)`; `.input-help.danger` has `color: var(--danger)`. HAND-1: a css with `.input-row { display: flex }` and no `[data-hand="left"] .input-row` rule fails; with it, passes; it checks the names `app-header, input-row, sheet-head, sheet-foot, item-row-end, dock` only when the css defines them, so this task's own run passes before `item-row-end` and `dock` exist.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement.** A pinned row in a sheet body sits at the bottom; the list above it is ordered by the app (the DS does not reverse it). Examples: one pinned row with an `input-help` above it.
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** `Mirror the input row for the left hand and pin it in a sheet`.

### Task 7: action-bar, settings rows, empty state with an action, STATE-1

**Files:**
- Modify: `design-system.css` — `empty-state` (:805-823), `list-group` (:1071-1149), new `action-bar` block after `fab`; `rules.js`; spec; tests

**Interfaces:**
- Produces: `action-bar` (component); `list-group` parts `list-group-head`, `settings-row`, `settings-row-label`, `settings-row-value`, `chevron` already exists (reuse it); `settings-row` variant `danger`; `empty-state` variant `low` and part `empty-state-title`; rule `STATE-1` reading `html`.

- [ ] **Step 1: Write the failing tests:** `.action-bar` is `position: sticky`, `bottom: 0`, and `.action-bar .button` has `min-height: var(--tap-l)` and `white-space: nowrap`; `.settings-row` has `min-height: var(--tap-l)`; `.settings-row.danger` has `color: var(--danger)`; `.list-group-head` has `color: var(--muted)`, `font-weight: var(--weight-medium)` and no `text-transform`; `.empty-state.low` has `display: flex`, `flex-direction: column`, `justify-content: flex-end`, `min-height: 50%`, and `.empty-state.low .button` has `min-height: var(--tap-l)`. STATE-1: html `<div class="empty-state"><p>x</p></div>` fails; with a `<button` inside passes; `class="empty-state inline"` passes without a button.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement** from `proto-b.css` (`.proto-row`, `.proto-group-head`, `.proto-card`, `.proto-danger`) and `proto-a.css` (`.proto-empty`), tokens only: the card loses its border and takes `box-shadow: var(--shadow-s)`; a `chevron` in a settings row is the `--muted` end mark. `action-bar` background: `linear-gradient(transparent, var(--bg) var(--space-4))`, `padding: var(--space-2) var(--space-4)`. Note in the `empty-state` comment: "Holds a button, except inline (STATE-1)".
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** `Add the action bar, settings rows and an empty state with an action`.

### Task 8: Labelled swipe actions and the row trailing slot, release 0.4.0

**Files:**
- Modify: `design-system.css` — `item-row` (:842-1003), `swipe-action` (:1005-1026), left-hand block; `version.json`, `package.json`, `CHANGELOG.md`; tests

**Interfaces:**
- Produces: `swipe-action-label` (part), `swipe-action` variant `neutral` (`--surface-2`, `--text`); `item-row-end` (part: fixed width `calc(var(--tap) * 2)`, holds up to two `button icon`, mirrors as a whole); `item-row` state `tick` (on `item-row-body`: the whole body is the tick target; `item-row-check` becomes a mark with `pointer-events: none`).

- [ ] **Step 1: Write the failing tests:** `.swipe-action` has `flex-direction: column`, `width: calc(var(--tap) + var(--space-6))` (72 px) and `font-size: var(--text-xs)`; `.swipe-action.neutral` exists; `.item-row-end` has `flex: none` and `width: calc(var(--tap) * 2)`; `[data-hand="left"] .item-row-end` has `flex-direction: row-reverse`; `.item-row-name` has `-webkit-line-clamp: 2`; `.item-row-body.tick .item-row-check` has `pointer-events: none`. HAND-1 passes over the shared css (now with `item-row-end`).
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement.** With the left hand, rows keep their text starting at `--space-4` and only `item-row-end` and the check change side (review M8, `proto-b.css` "Recetas: a fixed trailing slot"). The swipe-action `@example` shows three labelled actions (neutral "Edit", plain "Repeat", danger "Delete").
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Release 0.4.0** (Tasks 4–8 in `CHANGELOG.md`; name the migration: "A sheet with no `sheet-head` keeps the old padding in 0.4.x; SHEET-1 fails until the app adds one.").
- [ ] **Step 6: Commit** `Label the swipe actions, add the row trailing slot and release 0.4.0`.

### Task 9: The dock, the collapsing add button and the header

**Files:**
- Modify: `design-system.css` — new `dock` block after `fab`; `fab` (:1151-1208); `app-header`/`ring` (:493-559); `main` (:122-130); tests

**Interfaces:**
- Produces: `dock` with parts `dock-field` (the search box inside a dock, holding an `input` and a `dock-clear` button) and `dock-clear`; `fab` state `collapsed`; `main` picks its bottom padding from whether a dock shows.

- [ ] **Step 1: Write the failing tests:** `.dock` is `position: fixed`, `bottom: calc(var(--nav-height) + env(safe-area-inset-bottom))`, `height: var(--dock-height)`, `background: var(--surface)`; inside `@media (min-width: 600px)` `.dock` has `display: none`; `[data-hand="left"] .dock` has `flex-direction: row-reverse`; `body:has(.dock:not([hidden])) .fab` lifts by `var(--dock-height)` below 600 px; `.fab.collapsed` is `var(--tap)` square; `.app-header-title` has `white-space: nowrap` and `text-overflow: ellipsis`; `.ring-text` has `font-variant-numeric: tabular-nums`; `body:has(.dock:not([hidden])) main` adds `var(--dock-height)` to its bottom padding. LAY-4 still passes (the dock pads `padding-inline` with both safe-area insets).
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement** from sketch 1 and `proto.css`/`proto-a.css` (`.proto-dock`, `.proto-dock-search`): a dock chip takes `flex: 1` and `--surface-2`; `dock-clear` is a `--tap` round button in `--muted` (M13's own clear); the fab collapse animates `width`/`height` with `var(--motion-fast) var(--ease)`. Doc comment: "The filter and the search of a list, in thumb reach below 600px (REACH-2). From 600px the app shows them in the header." The `@example` uses neutral text ("All 4", "Filter").
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** `Add the dock and let the add button collapse`.

### Task 10: Nav pill and LAY-2 at the side of the hand

**Files:**
- Modify: `design-system.css` — `nav-bar` (:561-612), `toast` (:781-787), `fab` 600px block (:1199-1208), `sheet-layer`; `rules.js` (LAY-2); `docs/spec/02-layout.md:16-18`; tests

**Interfaces:**
- Produces: rule `LAY-2` reading `css`; the selectors `:root[data-hand="right"] .nav-bar` (end side) and the default (start side).

- [ ] **Step 1: Write the failing tests:** `.nav-item[aria-current="page"] .icon` has `background: var(--accent-soft)` and `border-radius: var(--radius-pill)`; `.nav-item[aria-current="page"]` has `color: var(--text)` and `font-weight: var(--weight-medium)`; LAY-2 passes over the shared css and fails over a css whose 600px `.nav-bar` rule has no `[data-hand="right"]` counterpart; a test that the default (no `data-hand`) keeps `inset-inline-start: 0`.
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement** the move of pwa-shopping-list's DSV-5 override (`styles.css:83-113` there: nav-bar, toast, fab) into the DS under `:root[data-hand="right"]`, plus the `body` padding side (LAY-4: the rail side pads `body`, so give the shared sheet a `:root[data-hand="right"] main` margin rule rather than the body rule of the app). Rewrite LAY-2 in `02-layout.md` with the spec's text.
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Commit** `Put the rail at the side of the hand and add the nav pill`.

### Task 11: Side sheets, compact density, release 0.5.0

**Files:**
- Modify: `design-system.css` — tokens layer (density), sheet (840px block); `version.json`, `package.json`, `CHANGELOG.md`; tests

**Interfaces:**
- Produces: `:root[data-density="compact"]` token set; side sheet from 840 px.

- [ ] **Step 1: Write the failing tests:** a tokens-layer rule `:root[data-density="compact"]` sets exactly `--tap-l: 48px`, `--nav-height: 56px`, `--dock-height: 48px` and does not set `--tap`; in `@media (min-width: 840px)` `.sheet-layer` is `flex-direction: row` and `.sheet` has `height: 100%`, `max-height: 100%`, `width: var(--side-sheet)`; `:root[data-hand="right"]` puts it at the end next to the rail, the default at the start; `.sheet-grab` has `display: none` there. New token `--side-sheet: 400px` (size scale; add to `TOKENS`).
- [ ] **Step 2: Run** `npm test` — Expected: FAIL.
- [ ] **Step 3: Implement** from `proto-b.css` (`.proto-side-sheet`, `.proto-compact`). The side sheet enters with `translateX(100%)` (start side: `-100%`) instead of `translateY`.
- [ ] **Step 4: Run** `npm test` — Expected: PASS.
- [ ] **Step 5: Release 0.5.0** in `CHANGELOG.md` (Tasks 9–11; "An app with its own rail override drops it: LAY-2 now does it.").
- [ ] **Step 6: Commit** `Add side sheets and compact density as tokens and release 0.5.0`.

### Task 12: Measure the siblings and check the catalogue

**Files:**
- Create: `scripts/try-apps.mjs` (dev helper: copies each sibling into a temp dir under `os.tmpdir()`, runs `sync` into the copy, runs `node --test` there, prints a pass/fail table and the failing rule titles; never writes to a sibling)

- [ ] **Step 1:** Run `node scripts/try-apps.mjs` — Expected: a table for pwa-template, pwa-wardrobe, pwa-shifts, pwa-nexus, pwa-financial-calculator. Known expected failures: SHEET-1 (no `sheet-head`), TAP-1 (raw `44px`), TXT-1 (justify, where present). Record the table in `CHANGELOG.md` under 0.5.0 as "Migration per app" — the user decides when each app migrates.
- [ ] **Step 2:** `npm run serve`, open http://localhost:8090/ in a browser at 412×915 and 1280×800, light and dark; check each new component's example renders (sheet with head/foot, dock, action bar, settings rows, labelled swipe actions, empty state low). Screenshot to the scratchpad.
- [ ] **Step 3: Commit** `Add a script that tries the design system in each app` (with the table in the body).
