---
name: GIT
scope: tree
stub: true
extends: ../../../.claude/conventions/GIT.md
---

# GIT conventions — pwa-design-system

This component inherits the GIT conventions of `personal/`.

**Read the file named in `extends:` above first. Anything under "Local overrides"
below wins over it; everything else there applies here unchanged.**

Do not restate the inherited rules in this file. A restated rule is a copy, and
copies drift — which is the whole reason this is a link.

## Local overrides

- **Remote and release:** `origin` is `git@github-personal:Gekyzo/pwa-design-system.git`. A push to `main` publishes the catalogue page (`.github/workflows/pages.yml`). No release script and no hooks. A change lands as a commit on `main`.
