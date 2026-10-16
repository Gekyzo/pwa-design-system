---
name: ARCHITECTURE
scope: local
load-order: 7
read-when: before a change that crosses a layer or module boundary
description: The shape of this component - its boundaries, its seams, and what it is responsible for.
---

# Architecture

The shared design system of the pwa apps. It has no app; a push to `main` publishes its catalogue page to GitHub Pages.

**Stack:** plain CSS and ES modules. No build step and no dependencies. `node:test` for unit
tests (Node 20 or later).

## Layers

- `catalog.js`: pure parser of the design CSS and the icon sprite into tokens, components and
  icons. It takes `css` as a string or an array of strings, read in order.

## Boundaries

- The apps are siblings under `personal/`. This repository does not change them.
