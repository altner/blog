---
title: "Deployment auf GitHub Pages"
description: "Wie ich meinen Blog automatisch auf GitHub Pages deploye."
date: 2026-05-20
---

Mit einer GitHub Action wird der Blog bei jedem Push auf `main` neu gebaut und deployt.

## Workflow

Der Build läuft via `pnpm build`, das Ergebnis landet in `dist/` und wird von `actions/deploy-pages` veröffentlicht.
