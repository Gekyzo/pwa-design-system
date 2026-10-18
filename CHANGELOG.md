# Changelog

User-visible changes, newest first.

## Unreleased

- New `action-bar`, the `list-group` parts `list-group-head` and `settings-row` (with `settings-row-label`, `settings-row-value`, a `danger` variant and the `chevron`) and a `card` variant, and the `empty-state` `low` variant and `empty-state-title` part. New rule STATE-1: an empty state holds a button, except inline.
- The `input-row` is mirrored for the left hand, has a `pinned` variant that sticks to the bottom of a sheet,
  and its disabled button has no fill. New `input[aria-invalid="true"]` state and `input-help` part with
  a `danger` variant. New rule HAND-1.
- New sheet parts `sheet-head`, `sheet-body`, `sheet-foot` and `sheet-saved`, the `main` title and rule
  SHEET-1. A sheet without a head keeps its old padding, scroll and handle.
- `sheet.js`: a pause after a flick no longer closes the sheet, and a mouse drag needs the main button.

## 0.3.0 - 2026-10-18

- Breaking for an app: `--tap` is 48px (was 44px), so a base button, input and chip are taller. An
  app that sets a 44px height of its own must use `--tap`; TAP-1 flags it.
- New tokens `--dock-height`, `--surface-2`, `--weight-medium`, `--space-7` and `--ease`. The dark
  `--surface` and `--surface-2` separate from `--bg` more clearly (the old pair was 1.11:1). Every
  transition uses `--ease`.
- The idle toggle is in `--muted`; the pressed one takes the accent over a soft accent shape.
- An input shows one focus indicator, the accent border, with no outline. The `strong` input is 1px,
  and 2px on focus. The native clear button of a search input is removed.
- The actions of a closed swipe row are hidden. A scrolling cluster fades its end.
- New rules TAP-1 (no 44px height; a button, chip, input, swipe action or segment is at least
  `--tap`), TAP-2 (`--line` is a border colour, never a text colour), TXT-1 (no justified text) and
  FOCUS-1 (an input has a border focus and no outline).

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
