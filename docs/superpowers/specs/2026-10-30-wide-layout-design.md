# Wide layout — design

**Date:** 2026-10-30
**Repos:** pwa-design-system (0.7.2 → 0.8.0), pwa-wardrobe (Attire), pwa-shopping-list (Bodega).
**Source:** Bodega `8ae7241` "Lay out the app by four width classes" (DSV-9) and its copy in Attire
`7017da2` (DSV-5). The two copies drifted: at 1280px Attire's title stands 16px from the rail and its
list touches the rail; Bodega's title and list stand 24px or more from it, and its panels are cards.

## Goal

One shared wide layout, so each app that takes 0.8.0 has the same margins, paddings and second
column. The four width classes, the frame and the sidebar move from the apps into
`design-system.css`; the apps delete their copies.

## Decisions

| # | Question | Decision |
|---|---|---|
| D1 | Where the layout lives | `pwa-design-system`, as LAY rules of `docs/spec/02-layout.md`. There is no separate layout repository. |
| D2 | The second column | A card: `--surface`, `--radius-l`, `--space-4` `--space-5` padding, `--space-4` from the header, sticky. The `pane-detail` of LAY-3 becomes this card; it loses its start border. |
| D3 | Where the title stands | From 600px the header and `main` have the same inline padding, so the title lines up with the edge of the content. Below 600px the header keeps `--space-4` and `main` keeps 0. |
| D4 | The other seven apps | They change only when they sync 0.8.0. Each part that needs markup (`nav-brand`, `nav-count`, `nav-foot`, `header-add`) shows only when the app has it, and the `fab` hides from 600px only when the header has a `header-add`. |
| D5 | What stays in an app | The `body` rule (LAY-4 reads it from the app), Bodega's panels, its recipe pane and its sheet in the panel column, and the two-column Settings of both apps. |

## Layout rules

### Width classes (LAY-1)

| Class | Width | Navigation | Content |
|---|---|---|---|
| compact | below 600px | bottom bar | full width |
| medium | 600px | rail at the start | one column, at most `--page-max`, centred |
| expanded | 840px | rail at the start | `pane`: list and detail card side by side |
| large | 1024px | sidebar at the start of a frame of at most `--frame-max`, centred | as expanded |

### Tokens

| Token | Value | Use |
|---|---|---|
| `--frame-max` | 1280px | the widest frame |
| `--sidebar-width` | 232px | the rail from 1024px |
| `--frame-side` | 0, from 1024px `max(0px, (100vw - --frame-max) / 2)` | the end margin of the frame |
| `--rail-width` | 80px, from 1024px `--frame-side + --sidebar-width` | the start margin, rail included |
| `--gutter` | `--space-4`, from 840px `--space-6` | the least inline padding of the header and `main` |
| `--page-max` | `--content-max` | the widest content column; a layout sets it on `body` |
| `--header-height` | 0px | the height of the header; the app writes it |

The page padding is `max(var(--gutter), (100% - var(--page-max)) / 2)`, on `.app-header` and on
`main` from 600px. A layout widens the column through `--page-max`: the `pane` sets it to `100%`
from 840px, so the list and the card fill the frame. An app sets it for its own layouts (Bodega's
panels: `--content-max + --gutter + its panel width`; Settings: `--settings-max`).

### Navigation (LAY-2)

- One element, `.nav-bar`. Below 600px the bottom bar; from 600px a rail of `--rail-width` at the
  start side with either hand; from 1024px a sidebar of `--sidebar-width` at the start of the frame.
- The sidebar shows `nav-brand` (the mark and the name) on top, one row per section with its icon
  and its name, the current one on a `--secondary` pill, an optional `nav-count` at the end of a
  row, and an optional `nav-foot` at the bottom (icon from 600px, icon and text from 1024px).
- From 600px the add of a view is `header-add`, a primary button at the end of the header, when
  the app has one; the `fab` then hides. An app with no `header-add` keeps its `fab`.
- The toast and the `fab` clear the rail at the start and `--frame-side` at the end.

### Pane (LAY-3)

- Below 840px unchanged. From 840px a grid of `--pane-list` and `minmax(0, 1fr)`, `--gutter`
  apart; the `pane-detail` is the card of D2.

### Sheets

- From 600px a sheet is at most `--content-max` wide, centred beside the rail; its veil covers the
  rail.
- From 840px a sheet with a head is a card at the end of the frame with either hand:
  `--side-sheet` wide, from `--header-height` + `--space-4` down, as high as its content,
  `--gutter` from the end of the frame, `--radius-l`, with a short slide and a fade.

### Rules of `rules.js`

- DS-8 allows `min-width: 1024px` as the third breakpoint.
- LAY-2 checks that no sheet moves the rail to the end side: no rule `[data-hand="right"] .nav-bar`.

## Migration

- Attire: sync 0.8.0, delete DSV-5, DSV-6 and their CSS, keep SET-2, delete the DS-8 skip. Its
  `body` rule stays.
- Bodega: sync 0.8.0, delete the shared half of DSV-9 and DSV-6, keep the panels, the recipe pane
  and the sheet in the panel column, now on `--gutter` and `--page-max` in place of `--panel-pad`.
- `scripts/try-apps.mjs` measures the other apps; the result goes in the 0.8.0 changelog entry.

## Checks

- `npm test` in each repository.
- Each app in a browser at 390, 700, 900 and 1440px, both hands, with the server stopped for the
  offline check: the title and the list start at the same x in Bodega and Attire at 900 and
  1440px, and no width scrolls sideways.
