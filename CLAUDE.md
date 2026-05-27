# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev          # Start dev server
pnpm build        # Type-check (astro check) then build
pnpm check        # Astro check + Biome lint/format (read-only)
pnpm check:fix    # Astro check + Biome lint/format with auto-fix
pnpm preview      # Preview production build
```

> **Package manager:** pnpm only — `only-allow pnpm` enforces this.

## Architecture

Astro 6 static site with TypeScript strict mode. No framework components — `.astro` files only.

**Import alias:** `@/` maps to `src/` (e.g. `import BaseLayout from "@/layouts/BaseLayout.astro"`). Note: README mentions `~` but `tsconfig.json` uses `@/`.

**`src/layouts/BaseLayout.astro`** is the single shared layout. It accepts `title`, `description`, and optional `image` props. Key behaviors:
- Runs all title/description strings through `smartypants` for typographic quotes.
- Appends `· Adrian Altner` to the page `<title>` on every page including `/`.
- Includes canonical URL, OG tags, and reset.css automatically.

**Linting:** Biome handles both formatting and linting. 2-space indent, LF line endings. Several rules (`useConst`, `useImportType`, unused vars/imports) are disabled for `.astro` files due to Biome's partial Astro support.

**Pre-commit hook:** `simple-git-hooks` + `nano-staged` run `biome check --write` on staged JS/TS/CSS/Astro/JSON files automatically.

**Site URL:** `https://altner.github.io/blog` (configured in `astro.config.mjs`). Sitemap integration is active — update `site` there if the deployment URL changes.
