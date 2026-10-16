---
name: RELEVANT-FILES
scope: local
load-order: 6
read-when: when looking for where something lives, or which tests cover it
description: Where to look first in this component, what to ignore, and which peers it works with.
---

# Relevant files

## Entry points

- `catalog.js`: the catalogue parser.

## Tests

The test command is `npm test`. `tests/catalog.test.js` covers `catalog.js`.

## Ignore

- `.superpowers/`: scratch workspace of plans (gitignored).
