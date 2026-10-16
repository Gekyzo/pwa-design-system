---
name: CANONICAL
scope: tree
load-order: 5
read-when: before creating a file or class, or reshaping one
description: The canonical files new code is copied from, and the design patterns in force.
---

# Canonical files and patterns

## Exemplars

| Kind | Exemplar |
|---|---|
| Pure module | `catalog.js` |
| Unit test | `tests/catalog.test.js` |

## Patterns

- Pure functions: no DOM, no file access, no input is changed.
- Files: lowercase, one word where possible; tests `tests/<module>.test.js`.
