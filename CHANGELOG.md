# Changelog

User-visible changes, newest first.

## 0.7.1 - 2026-10-23

- With the left hand, the divider of an `item-row` with a check and an `item-row-end` starts after the slot, where the text starts. 0.7.0 started it at `--space-4`, under the buttons of the slot.

## 0.7.0 - 2026-10-23

- Colour roles replace the single accent: `--primary` and `--on-primary` (the one main action; neutral ink by default), `--done`, `--on-done` and `--done-soft` (progress and the checked state), `--ink` and `--on-ink` (a selected fill), `--secondary` (a tonal fill) and `--control` (the border of an input or an outline button). `--accent`, `--accent-text` and `--accent-soft` stay for one release as aliases of `--primary`, `--on-primary` and `--done-soft`; no shared component reads them. Focus outlines and focus borders take `--text`.
- The grounds take the Ledger values: a stone `--bg`, `--surface` white (near-black in dark), a raised `--surface-2`, ink `--text`, a softer dark `--danger`. `--toast-bg` and `--toast-text` are `--ink` and `--on-ink`: the `toast` is an ink box, no longer green-black.
- Geist is the font: `geist.woff2` (SIL OFL, `OFL.txt`) with an `@font-face` in the tokens layer, first in `--font`; `sync.mjs` copies it beside the CSS. `--radius-m` and `--radius-l` are 8px, `--radius-xl` is 14px. The screen title is 1.5rem and strong; the body is 0.9375rem (15px) and the second text 0.8125rem (13px); a new `--text-label` (0.875rem) keeps group and section heads, chips and segments at 14px. New token `--text-h` (1.25rem): the title of a `sheet-head` and of an `empty-state` is 20px at `--weight-medium`, so a sheet title keeps to one line beside its button. A `primary`, `accent` or `strong` button label takes `--weight-medium`, so a label in half a bar keeps its words.
- A `group-head` is a sticky band on `--bg`, in sentence case at `--weight-medium`; the `section-head` loses its capitals and tracking.
- The check of an `item-row` is a square with `--radius-s` corners, as in Ledger. The divider of an `item-row` with a check starts where its text starts, after the check, and runs to the end (with the left hand, at `--space-4`); a row without a check keeps the full divider. New token `--radius-control` (6px): a `chip` is an outlined box on `--surface` with a `--control` border and those corners, `--ink` when pressed (the dock no longer fills its chip, and the `surface` variant now equals the base); an `input` takes those corners and a `--surface` fill, and the `raised` variant now equals the base. The `nav-bar` and the `dock` stand on `--bg` above a `--line` border, as in Ledger. A `list-group` runs the full width with square corners. Only the `card` variant keeps the inset box, `--radius-l` and the corners of its end rows, now without a shadow.
- New `button` variant `tonal`: the `--secondary` fill with `--text`, no border. It is the role of each action that is not the one main action of a view, the button of a `sheet-head` included. `outline` with `danger` is only for a destructive action. STATE-1 says so for an `empty-state`: its second action is a `tonal` button below the `primary` one. The `outline` rule of 0.6.0 inside an `empty-state` stays for the markup of older apps.
- A `banner` is neutral: `--surface-2` with `--text`. The new `done` variant keeps the `--done-soft` ground for a message about work that is done.
- New `progress` component: a 4px bar the full width of its box, filled with `--done` to `--pct`. The `ring` stays.
- New `dock` part `dock-add`: a square `button primary icon` of the tap size, the last direct child of the dock, at the far left with the left hand. A `dock` `chip` that is `aria-pressed="true"` keeps its `--ink` fill.
- Below 600px the `fab` does not show while a visible dock holds a visible `dock-add`, and `main` then pads only for the dock (`--dock-height` and `--space-4`), so no empty room for the `fab` stays at the end of the list. From 600px the dock does not show, so the `fab` is the add button again. LAY-2 and LAY-4 say so.
- The catalogue page marks a link under the pointer with `--surface-2` and the current link with `--ink` and `--on-ink`, no longer with `--done-soft`.
- Breaking for an app: the colours change. Each app sets `--primary` and `--done` (with their `on-` roles) in its tokens layer and replaces its `--accent*` uses. A group head loses its capitals. A `banner` that tells of work that is done adds the `done` variant to keep its `--done-soft` ground. Body text is now 15px, so an app that runs on iOS Safari should keep its inputs at 16px or accept the zoom on focus.

Migration per app (`node scripts/try-apps.mjs`, an app with DS 0.7.0 synced into a copy; failing tests):

- pwa-template — SHEET-1, STATE-1, vendor.test
- pwa-wardrobe — SHEET-1, STATE-1, vendor.test
- pwa-shifts — SHEET-1, STATE-1, vendor.test
- pwa-nexus — vendor.test
- pwa-financial-calculator — vendor.test
- pwa-shopping-list — vendor.test

For every app: the file list of its `tests/vendor.test.js` gains `geist.woff2`. Set `--primary` and `--done` in the tokens layer of `styles.css`, and replace each `--accent*` use with a role token. SHEET-1 and STATE-1 still fail in pwa-template, pwa-wardrobe and pwa-shifts, as with 0.5.0; pwa-nexus no longer fails them.

## 0.6.0 - 2026-10-21

- A row of a `list-group` draws its focus ring inside itself (`outline-offset: -2px`); a first or last row takes the corners of the group (`--radius-l` less the border), also in `pair`, so any ring of the row bends with them, also one an app draws for a control inside the row. Before, the group clipped the ring: round at the top, square at the bottom and over the next row.
- A `segmented` is drawn as a switch: a `--surface-2` pill track, and an `--accent` knob with `--shadow-s` that slides to the segment with `aria-pressed="true"` (two or three segments, by `:has()`). The chosen label is `--accent-text`; the idle segments have no fill of their own. No markup changes.
- An `outline` button inside an `empty-state` takes `--surface` and `--text`: the art and the muted text of the empty state no longer show through it.

Migration per app (`node scripts/try-apps.mjs`): none. The six apps pass with 0.6.0 synced into a copy.

## 0.5.0 - 2026-10-18

- The idle track of a `switch-input` is `--muted`, not `--line`: it reaches 3:1 on `--surface` in both themes; the white knob stays visible.
- An `input` with `aria-invalid="true"` keeps the `--danger` border on focus, also the `strong` variant and a `field-input`.
- The current `nav-item` is a pill behind its icon (`--accent-soft`); its label is `--text` at `--weight-medium`.
- From 600px `:root[data-hand="right"]` puts the `nav-bar` rail at the end side, and the `toast` and `fab` clear it. New rule LAY-2. The app pads its body on the rail side. The `dock-field` has a 2px border that turns accent on focus.
- New `dock` component with the parts `dock-field`, `dock-input` and `dock-clear`: the filter and the search of a list, fixed above the bottom bar below 600px and hidden from 600px. The left hand mirrors it. `main` and `fab` clear a visible dock.
- New `fab` state `collapsed`: a square of the tap size, animated.
- The `app-header-title` keeps one line with an ellipsis. The `ring-text` uses tabular digits.
- From 840px a sheet with a `sheet-head` is a side sheet: full height, `--side-sheet` (400px) wide, at the start side next to the rail, or at the end side with `:root[data-hand="right"]`. It enters sideways and has no grab. A sheet without a head keeps the bottom sheet.
- New token `--side-sheet`. New `:root[data-density="compact"]` sets `--tap-l` to 48px, `--nav-height` to 56px and `--dock-height` to 48px; `--tap` does not change.
- An app with its own rail override drops it: LAY-2 now does it.
- The `dock-input` has no outline and no native clear button; FOCUS-1 counts it as an input. A visible dock lifts the `toast` as well. The `dock-field` is `--dock-height` minus `--space-2` tall, so it fits the compact dock. A sheet with a head clears the bottom safe area in its body (and a last `input-row` `pinned`), and a side sheet clears the top safe area in its head. The `input` `strong` keeps its text still on focus. `sheet.js` ends a drag on `lostpointercapture` and starts none when the grab is hidden (side sheet).

Migration per app (`node scripts/try-apps.mjs`, an app with DS 0.5.0 synced into a copy; failing rule ids):

- pwa-template — SHEET-1, STATE-1
- pwa-wardrobe — SHEET-1, STATE-1
- pwa-shifts — SHEET-1, STATE-1
- pwa-nexus — SHEET-1, STATE-1
- pwa-financial-calculator — none

For every app: move the body rail padding to the side of the hand (LAY-2 puts the rail at the end with `data-hand="right"`).

## 0.4.0 - 2026-10-18

Migration per app: the file list of each app's `tests/vendor.test.js` gains `sheet.js`.

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
