# Changelog

User-visible changes, newest first.

## Unreleased

## 0.2.1 - 2026-10-17

- DS-1 names the sheet with no layer statement by its index in the css list.
- `sync.mjs` refuses a source whose `version.json` has uncommitted changes, and refuses a target
  that holds `design-system.css` (`not an app`).
- `@extends` blocks add their `@example` entries to the component; a tag other than `@extends`,
  `@part`, `@variant`, `@state` and `@example` is an error (`<name>: unknown tag @<tag>`); a part,
  variant or state that the component already names is not added twice.
- `--rail-width`, `--content-max` and `--pane-list` are in the size scale, not colour.
- `scripts/split.mjs` drops the rules that the design system already holds inside an overridden
  component, and its header says that declarations are split on `;`.
- The tests of `design-system.css` check that the shared components and tokens are present, not
  their exact counts.

## 0.2.0 - 2026-10-16

- `@extends <name>` blocks: an app documents its own parts, variants and states of a shared component.
- DS-6 checks the icons of the examples only in the sheets of the app.
- `scripts/split.mjs` writes an `@extends` block for an overridden component.

## 0.1.0 - 2026-10-16

- `design-system.css`: the 55 shared tokens, the base rules, the 24 core components and the layouts.
- `catalog.js`: the catalogue parser; the CSS can be one or more sheets.
- `rules.js`: the checks DS-1 to DS-8, LAY-3 and LAY-4 as functions.
- `sync.mjs`: vendors the design system into an app and writes `SOURCE.json`.
- `scripts/split.mjs`: `appPart` and `leaksOf`.
- The catalogue page.
