# Changelog

User-visible changes, newest first.

## Unreleased

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
