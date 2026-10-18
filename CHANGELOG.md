# Changelog

User-visible changes, newest first.

## Unreleased

## 0.5.0 - 2026-10-18

- The current `nav-item` is a pill behind its icon (`--accent-soft`); its label is `--text` at `--weight-medium`.
- From 600px `:root[data-hand="right"]` puts the `nav-bar` rail at the end side, and the `toast` and `fab` clear it. New rule LAY-2. The app pads its body on the rail side. The `dock-field` has a 2px border that turns accent on focus.
- New `dock` component with the parts `dock-field`, `dock-input` and `dock-clear`: the filter and the search of a list, fixed above the bottom bar below 600px and hidden from 600px. The left hand mirrors it. `main` and `fab` clear a visible dock.
- New `fab` state `collapsed`: a square of the tap size, animated.
- The `app-header-title` keeps one line with an ellipsis. The `ring-text` uses tabular digits.
- From 840px a sheet with a `sheet-head` is a side sheet: full height, `--side-sheet` (400px) wide, at the start side next to the rail, or at the end side with `:root[data-hand="right"]`. It enters sideways and has no grab. A sheet without a head keeps the bottom sheet.
- New token `--side-sheet`. New `:root[data-density="compact"]` sets `--tap-l` to 48px, `--nav-height` to 56px and `--dock-height` to 48px; `--tap` does not change.
- An app with its own rail override drops it: LAY-2 now does it.

Migration per app (`node scripts/try-apps.mjs`, an app with DS 0.5.0 synced into a copy; failing rule ids):

- pwa-template — SHEET-1, STATE-1
- pwa-wardrobe — SHEET-1, STATE-1
- pwa-shifts — SHEET-1, STATE-1
- pwa-nexus — SHEET-1, STATE-1
- pwa-financial-calculator — none

## 0.4.0 - 2026-10-18

- New `swipe-action-label` part and `neutral` variant. A swipe action stacks its icon over a label, is 72px
  wide and uses `--text-xs`. Give each action a visible label; the label replaces `aria-label`.
- New `item-row-end` part: a fixed slot two buttons wide for up to two `button icon`. New `item-row-label`
  part: the text of a name, kept to two lines. New `item-row` state `tick` on `item-row-body`: the whole
  body is the tick target and the check is a mark only.
- Left hand: a row no longer reverses its body. Its text starts at `--space-4` as with the right hand; only
  the check (now at the end) and `item-row-end` (now at the start) change side. A row with no `item-row-end`
  keeps its buttons at the end, where they were at the start before.
- New `action-bar`, the `list-group` parts `list-group-head` and `settings-row` (with `settings-row-label`, `settings-row-value`, a `danger` variant and the `chevron`) and a `card` variant, and the `empty-state` `low` variant and `empty-state-title` part. New rule STATE-1: an empty state holds a button, except inline.
- The `input-row` is mirrored for the left hand, has a `pinned` variant that sticks to the bottom of a sheet,
  and its disabled button has no fill. New `input[aria-invalid="true"]` state and `input-help` part with
  a `danger` variant. New rule HAND-1.
- New sheet parts `sheet-head`, `sheet-body`, `sheet-foot` and `sheet-saved`, the `main` title and rule
  SHEET-1. A sheet without a head keeps its old padding, scroll and handle.
- `sheet.js`: a pause after a flick no longer closes the sheet, and a mouse drag needs the main button.
- Migration: a sheet with no `sheet-head` keeps the old padding in 0.4.x; SHEET-1 fails until the app adds one.

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
