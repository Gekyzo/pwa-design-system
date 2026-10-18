# Mobile UX revision — design

**Date:** 2026-10-18
**Source:** the review `docs/ux-revision.html` (local, gitignored, with its prototype and 58 shots in
`docs/ux-revision/`). It holds the 31 findings (H1–H7, M1–M13, L1–L11), the before and after
screens, and the CSS sketches. This document records what was decided; the review is the detail.

**Repos:** pwa-design-system (DS 0.2.1 → 0.3.0 → 0.4.0 → 0.5.0) and pwa-shopping-list
(1.0.39 → 1.1.0). Rollback point: tag `v1.0.39` (`c55379e`) in the app, `e55b665` in the DS.

## Direction

Thumb first. The frequent in-store actions move to the bottom 40 % of a phone screen. The look is
softer and calmer: larger radii, one raised surface step, a third weight, softer shadows, one
easing curve. The accent green stays.

## Decisions

| # | Question | Decision |
|---|---|---|
| D1 | M8: a tap on the row body | **Ticks the item.** The check becomes a status mark. Edit moves to an edit button in the row's trailing slot and to the swipe action "Editar". |
| D2 | M8: the left-hand add button covers row text | **The add button collapses** to a 48 px circle while the list scrolls down, and comes back on scroll up. No start inset. |
| D3 | L5: compact density | **A token set**: `:root[data-density="compact"]` in `@layer tokens` sets `--tap-l` 48, `--nav-height` 56, `--dock-height` 48. `--tap` stays 48, so no hit area drops below 48. |
| D4 | H3: how sheets save | **Autosave stays.** The sheet head shows "Guardado" for 1.2 s after each save. "Listo" closes. |
| D5 | Rollback | `v1.0.39` is the rollback point. No new tag. |
| D6 | The review files | Gitignored, not committed. |
| D7 | New copy | Approved: "Preferencias", "Ver todas las tiendas", "Aún no hay recetas", "Tienes la {version}.", and the finish-sheet outcome rows. The other six locales get matching text. |

## Tokens (DS 0.3.0)

| Token | Value |
|---|---|
| `--tap` | 48px; `button` in `@layer base` takes `min-height: var(--tap)` |
| `--nav-height` | 64px |
| `--dock-height` | new, 56px |
| `--radius-m` / `--radius-l` / `--radius-xl` | 12px / 20px / 28px |
| `--surface` | light-dark(#ffffff, #1d2621) |
| `--surface-2` | new, light-dark(#eef2ef, #26302a) |
| `--weight-medium` | new, 600 |
| `--text-l` | 1.375rem |
| `--space-7` | new, 32px |
| `--shadow-l` | 0 8px 24px rgb(0 0 0 / 0.14) |
| `--ease` | new, cubic-bezier(0.2, 0.8, 0.2, 1) |
| `--motion` | 250ms (still 0ms with reduced motion) |

## Components

| Component | Change | Release |
|---|---|---|
| `button.toggle` | Idle `--muted`, pressed `--accent` with a filled icon (M2) | 0.3.0 |
| `input` | Focus by the border only; `strong` is 1 px at rest, 2 px on focus (M12) | 0.3.0 |
| `input[type=search]` | The native cancel button is gone (M13) | 0.3.0 |
| `item-row` | Closed swipe actions are `visibility: hidden` (M11) | 0.3.0 |
| `cluster.scroll` | An end fade (L4) | 0.3.0 |
| `sheet` | Parts `sheet-head`, `sheet-body`, `sheet-foot`, `sheet-saved`; a 48 px grab area; `.sheet:not(:has(.sheet-head))` keeps the old padding for one release | 0.4.0 |
| `sheet.js` | `dismissed(dy, velocity, height)` — past 30 % of the height or above 0.5 px/ms — and `bindSheetDrag` | 0.4.0 |
| `action-bar` | Sticky bar above the bottom bar for the one main action of a screen, `--tap-l`, one line | 0.4.0 |
| `input-row` | Mirrors with the left hand; variant `pinned` holds the input at the bottom of a sheet with its list above | 0.4.0 |
| `input` | State `invalid` and part `input-help` for a field error (L10) | 0.4.0 |
| `list-group` | Part `settings-row` with `settings-row-value`, `chevron`, variant `danger`; part `list-group-head` | 0.4.0 |
| `empty-state` | Variant `low`: centred in the lower half, `empty-state-title`, a `--tap-l` action | 0.4.0 |
| `swipe-action` | A label under the icon (`swipe-action-label`), 72 px wide, variant `neutral` | 0.4.0 |
| `item-row` | Part `item-row-end`: a fixed trailing slot that mirrors as a whole; `item-row-label` clamps to 2 lines | 0.4.0 |
| `dock` | Fixed above the bottom bar below 600 px, `--dock-height`; hidden from 600 px | 0.5.0 |
| `fab` | State `collapsed` (48 px); stands above the dock when a dock shows | 0.5.0 |
| `app-header`, `ring` | Title on one line with an ellipsis; ring text in tabular figures | 0.5.0 |
| `nav-bar` | A pill behind the current icon; from 600 px the rail stands at the side of the hand (LAY-2) | 0.5.0 |
| `sheet` | From 840 px a side sheet next to the rail, at the side of the hand (L8) | 0.5.0 |
| density | The compact token set (D3) | 0.5.0 |

## Rules

New rule ids in `rules.js` and `docs/spec/01-design-system.md`, `02-layout.md`:

- **TAP-1** Each button, chip, input, toggle and swipe action has a min height of `var(--tap)` or more. No raw `44px`.
- **TAP-2** `--line` is only a border or a background, never the `color` of a control.
- **TXT-1** No `text-align: justify`.
- **FOCUS-1** An element shows focus once: an input by its border, everything else by the outline.
- **SHEET-1** Each sheet of `index.html` has a `sheet-head` with a button.
- **HAND-1** Each row layout of controls (`app-header`, `input-row`, `sheet-head`, `sheet-foot`, `item-row-end`, `dock`) has a `[data-hand="left"]` rule.
- **STATE-1** Each `empty-state` of `index.html` that is not `inline` holds a button.
- **LAY-2** (rewrite) From 600 px the rail stands at the side of the hand: the end side with `data-hand="right"`, the start side with `data-hand="left"` or no `data-hand`.

## App behaviour (pwa-shopping-list)

- **Rows:** a tap on the body ticks (D1). Trailing slot: an edit button. Recurrence is "↻ cada compra" on the meta line, set by the swipe action "Repetir" or the edit sheet. Swipe left: Editar / Repetir / Eliminar. `navigator.vibrate?.(10)` when `armed` turns on. A one-time 24 px nudge of the first row teaches the swipe. No full-swipe delete.
- **Sheets:** every sheet has a head (title, "Listo") and the edit and recipe sheets a foot ("Eliminar" with undo, "Guardado"). A drag on the grab or head closes.
- **Add sheet:** input pinned at the bottom, suggestions above it, "+ Crear «…»" nearest the input, "+1" on items already on the list, a duplicate shows as helper text, not a toast. Submit disabled while empty.
- **Compra:** the dock holds the shop (‹ chip ›, a tap opens a shop picker) and search below 600 px. The header keeps arrange and ⋮. The ring shows the count left. A finished shop shows an end card "Siguiente: {shop} ({n}) →" and "Ver todas las tiendas".
- **Finish:** the sheet is titled "¿Terminar la compra?", lists the outcomes one per row, and has "Seguir comprando". The card and the sheet use one outcome key.
- **Menú:** "Llenar cesta" in the action bar. "Vaciar menú" moves to a ⋮ sheet, with undo. Below 600 px compact density keeps a short day head ("LUN") above the meals.
- **Recetas:** one column up to 840 px; a fixed trailing slot with "Añadir a Compra"; status on the meta line; "Eliminar" in the recipe sheet foot. Empty: "Aún no hay recetas" with "+ Crear receta".
- **Ajustes:** grouped 56 px rows, one card per group, chevrons, a danger row, the update as a banner with a full-width button, no empty group, help text left-aligned with hyphens.
- **Onboarding:** logo on page 1 only, "Atrás" on pages 2–6, "Saltar" top right, full-width "Siguiente", no focus ring on load, tab names as icon + strong text, idle dots in `--muted`.
- **Pseudo-locale** (L9): `?lang=pseudo` makes every string about 40 % longer, for a layout check.
