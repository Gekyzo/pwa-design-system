# Layout

Rules of `design-system.css` and the `styles.css` of the app for the size classes, the safe
areas and the pane layout.

## Size classes

- **LAY-1** The layout follows the Material window size classes:

  | Class | Width | Navigation | Content |
  |---|---|---|---|
  | compact | below 600px | bottom bar | full width |
  | medium | 600px to 839px | rail at the side of the hand | one column, at most `--content-max`, centred |
  | expanded | 840px and up | rail at the side of the hand | the `pane` layout: list and detail side by side |

- **LAY-2** The navigation is one element, `.nav-bar`. Below 600px it is the bar at the bottom;
  from 600px the same element is a rail of `--rail-width`. The rail stands at the start side, or at
  the end side with `data-hand="right"` on the root. The toast and the add button clear it. The app
  pads its body on the rail side, so the page moves beside it.
- **LAY-3** A section with a list and a detail uses the `pane` layout. Below 840px it shows the
  list, or the detail alone while an entry is open, with a **Back** button (`pane-back`). From
  840px it shows both; with no entry open the detail shows a hint, and **Back** is hidden. The
  `pane` block documents the parts `pane-list`, `pane-detail` and `pane-back`.
- **LAY-4** The safe-area insets of the phone pad the header (top), the bar (bottom), the rail
  (start side), the sheets and the walkthrough. The page keeps out of a cutout on either side,
  and so do the toast and the add button, which are fixed. The `body` rule of the app sets the
  side padding; `rules.js` checks it when the app sheet follows the shared one.
