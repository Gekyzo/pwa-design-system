# Layout

Rules of `design-system.css` and the `styles.css` of the app for the size classes, the safe
areas and the pane layout.

## Size classes

- **LAY-1** The layout follows the Material window size classes, with a large class for a
  desktop:

  | Class | Width | Navigation | Content |
  |---|---|---|---|
  | compact | below 600px | bottom bar | full width |
  | medium | 600px to 839px | rail at the start side | one column, at most `--page-max`, centred |
  | expanded | 840px to 1023px | rail at the start side | the `pane` layout: list and detail card side by side |
  | large | 1024px and up | sidebar at the start of a frame | as expanded, in a frame of at most `--frame-max` (1280px), centred |

  `--rail-width` is the start margin with the rail: 80px, and from 1024px `--frame-side` plus
  `--sidebar-width` (232px). `--frame-side` is the end margin of the frame: 0 below 1024px. From
  600px `.app-header` and `main` share one side padding, `max(var(--gutter), (100% -
  var(--page-max)) / 2)`, so the title lines up with the edge of the content. `--gutter` is 16px,
  and 24px from 840px. `--page-max` is `--content-max`; a layout widens it on `body`.
- **LAY-2** The navigation is one element, `.nav-bar`. Below 600px it is the bar at the bottom;
  from 600px the same element is a rail at the start side with either hand, and from 1024px a
  sidebar at the start of the frame. The sidebar shows the optional `nav-brand` on top (the mark
  and the name of the app), one row per section with its icon and its name, the current one on a
  pill, an optional `nav-count` at the end of a row, and an optional `nav-foot` at the foot (its
  icon from 600px, with its text from 1024px). No rule moves the rail with the hand. The toast and
  the add button clear the rail and the end margin of the frame. The app pads its body on the rail
  side and on the end margin. Below 600px the add button is the `dock-add` of the dock when the
  view has a visible one; the `fab` does not show then. From 600px the dock does not show; the add
  button is the `header-add` of the header when the app has one, else the `fab`.
- **LAY-3** A section with a list and a detail uses the `pane` layout. Below 840px it shows the
  list, or the detail alone while an entry is open, with a **Back** button (`pane-back`). From
  840px it shows both, `--gutter` apart, and fills the content area (`--page-max: 100%`); the
  detail is a sticky card on `--surface`, 16px below the header. With no entry open the detail
  shows a hint, and **Back** is hidden. The `pane` block documents the parts `pane-list`,
  `pane-detail` and `pane-back`.
- **LAY-4** The safe-area insets of the phone pad the header (top), the bar (bottom), the rail
  (start side), the sheets and the walkthrough. The page keeps out of a cutout on either side,
  and so do the toast and the add button (the `fab`, or the `dock-add` of the dock), which are fixed. The `body` rule of the app sets the
  side padding; `rules.js` checks it when the app sheet follows the shared one.

## Sheets

- **LAY-5** From 600px a sheet is at most `--content-max` wide, centred beside the rail; its veil
  covers the rail. From 840px a sheet with a head is a card at the end of the frame with either
  hand: `--side-sheet` wide, from `--header-height` plus 16px down, as high as its content,
  `--gutter` from the end of the frame, with the radius of a group, and it comes in with a short
  slide and a fade. The app writes the height of its header to `--header-height`. A sheet without
  a head stays a bottom sheet.
