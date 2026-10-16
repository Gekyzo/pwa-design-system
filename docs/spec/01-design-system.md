# Design system

The parts that a screen is built from, and the rules that keep them the same on each screen.
`design-system.css` holds the shared tokens, base, components and layouts. The `styles.css` of an
app holds its screens and its own overrides. `rules.js` checks the rules; each app runs it in
`tests/design.test.js`. The catalogue page of the app shows each part.

## Layers

- **DS-1** `design-system.css` and `styles.css` each declare
  `@layer tokens, base, components, layouts, screens;` as the first statement, and each rule is in
  one of the five layers. `tokens` holds `:root` and the themes, `base` the element defaults,
  `components` one block class per component, `layouts` the arrangement classes, and `screens` the
  parts of one section.

## Tokens

- **DS-2** A raw value of colour, spacing (`padding`, `margin`, `gap`, `inset`), font size, font
  weight, font family, radius, shadow or duration is only in `@layer tokens`. Other layers use
  the tokens. `0`, `1px` and `2px` border widths, `%`, `auto`, `inherit`, `currentColor`,
  `none` and `transparent` are always allowed. `width` and `height` are raw only in
  `components` and `layouts`. Reduced motion sets the motion tokens to `0ms` in one place.

## Names

- **DS-3** A component is a block class. A variant is a modifier class, valid only with its
  block: `class="button primary"`. A state is an attribute; the state classes of DS-6 are the
  exception.
- **DS-4** No selector styles a bare element inside a class of another component, and no
  selector has an id.

## Icons

- **DS-5** Each icon is a `<symbol>` of `icons.svg`, used as
  `<svg class="icon"><use href="icons.svg#id"/></svg>`. In the views of the app only `icon(name)`
  builds an SVG. The drawings of a walkthrough are inline art inside `onboarding-art`.

## Documentation

- **DS-6** Each component, layout and screen part has one comment block before its first rule,
  with the tags `@component`, `@summary`, `@scope`, `@part`, `@variant`, `@state` and
  `@example`. `@state` names a class that the code sets for a passing state. The comments of
  `design-system.css` carry no word of one app. An app that adds a part, variant or state to a
  shared component documents it in a block that starts with `@extends <name>` and holds only
  `@part`, `@variant` and `@state` entries; it is not a second `@component` block. The examples
  of the shared sheet may use icons that the sprite of the app lacks; only the examples of the
  app's own sheets must use icons of its sprite.
- **DS-7** The catalogue page of the app, served by `npm run serve`, shows the tokens, the icons
  and each documented part with its live examples, its snippet and the files that use it. A menu
  lists each section and part and links to its anchor (`#button`): a sidebar on a wide screen, a
  drawer on a phone. Its list of views names each view of the app, and its frame styles do not
  reach into the examples.
- **DS-8** A width condition of `@media` is `min-width: 600px` or `min-width: 840px`, the
  breakpoints of the size classes (LAY-1). No other width and no `max-width` condition. A rule for
  a size class sits inside the block of its component.

## Parts

The parts of the shared stylesheet, by layer. A request for a screen names them.

| Layer | Parts |
|---|---|
| base | `main` |
| components | `icon`, `button`, `fab`, `chip`, `pill`, `segmented`, `switch`, `input`, `field`, `select`, `app-header`, `ring`, `nav-bar`, `badge`, `sheet`, `toast`, `banner`, `empty-state`, `item-list`, `item-row`, `swipe-action`, `section-head`, `group-head`, `list-group` |
| layouts | `cluster`, `input-row`, `split`, `pane` |

The screen parts belong to the apps.

## Skips

An app may skip a rule by its id in `SKIP` of its `tests/design.test.js`, with the reason in a
comment beside it.
