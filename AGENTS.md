# AGENTS.md — Zoran Zhou Blog (Astro)

> See [README.md](./README.md) for project structure, stack overview, and commands.

## Quick Reference

| Command | What it does |
|---------|-------------|
| `npm run dev` | Dev server at `localhost:4321` |
| `npm run build` | Production build to `dist/` |
| `npm run lint` | Type-check via `astro check` (no ESLint) |
| `npm run format` | Prettier (Astro + TailwindCSS plugins) |

## Architecture

Two layouts power the entire site:

- **`BaseLayout.astro`** — HTML shell: `<head>` with SEO/OG/RSS, `<Navigation/>`, `<slot/>`, `<Footer/>`. Also bundles scroll progress bar, back-to-top button, and scroll-reveal IntersectionObserver. Used by homepage, all list pages, tags, 404.
- **`BlogPostLayout.astro`** — Wraps `BaseLayout` with `article={true}`. Handles TOC (from h2+h3), reading time, related posts (tag overlap, max 3), prev/next navigation. Renders content via `entry.render()`. Uses a `labelMap` to display collection name. Used by all 5 `[slug].astro` routes.

All 5 content collections (blog, essays, research, projects, tools) share one Zod `baseSchema` in `src/content/config.ts`, extended per collection.

Every `[slug].astro` route is identical (~12 lines): imports `BlogPostLayout`, defines `getStaticPaths` (filter drafts, map to props), and renders `<BlogPostLayout entry={entry} />`.

### Routing

| Path | File | Notes |
|------|------|-------|
| `/` | `pages/index.astro` | 8 sections: Hero, About, LatestArticles, FeaturedResearch, WorkingOn, ProjectsGrid, Skills, Contact |
| `/blog` | `pages/blog/[...page].astro` | Paginated (`pageSize: 10`) |
| `/blog/:slug` | `pages/blog/[slug].astro` | Via `BlogPostLayout` |
| `/essays` | `pages/essays/[...page].astro` | Paginated |
| `/essays/:slug` | `pages/essays/[slug].astro` | Via `BlogPostLayout` |
| `/research` | `pages/research/[...page].astro` | Paginated |
| `/research/:slug` | `pages/research/[slug].astro` | Via `BlogPostLayout` |
| `/projects` | `pages/projects/index.astro` | Single page, no pagination |
| `/projects/:slug` | `pages/projects/[slug].astro` | Via `BlogPostLayout` |
| `/tools` | `pages/tools/index.astro` | Single page, no pagination |
| `/tools/:slug` | `pages/tools/[slug].astro` | Via `BlogPostLayout` |
| `/tags` | `pages/tags/index.astro` | Tag cloud |
| `/tags/:tag` | `pages/tags/[tag].astro` | Filtered by slugified tag |
| `/rss.xml` | `pages/rss.xml.ts` | blog + essays + research only |
| `/search-index.json` | `pages/search-index.json.ts` | blog + research + projects only |
| `/404` | `pages/404.astro` | Uses `content-container` |

### Search Architecture

- **Build time**: `search-index.json.ts` generates static JSON from 3 collections (blog, research, projects — **not** essays or tools). Each entry: `{ title, collection, slug, url, date }`.
- **Runtime**: `SearchModal.tsx` (React island, `client:load`) fetches `/search-index.json` lazily on first open.
- **Fuse.js v7**: fuzzy search on titles only (`threshold: 0.4`, max 8 results).
- **Keyboard**: `Ctrl+K` / `⌘K` toggle, `↑↓` navigate, `Enter` open, `Esc` close.

### Dark Mode

Two parallel systems — **only one is active**:

| System | Status | Files |
|--------|--------|-------|
| Inline script | **ACTIVE** | `Navigation.astro` (inline toggle), `ThemeScript.astro` (in `<head>` — prevents flash) |
| Web Component | **UNUSED** | `Header.astro`, `src/lib/theme.ts` |

- `ThemeScript.astro` runs synchronously in `<head>` to add the `dark` class before first paint (FART prevention).
- `Navigation.astro` inline script toggles `dark` class + `localStorage("pref-theme")`.
- `Header.astro` and `theme.ts` (`initTheme`, `toggleTheme`, `getStoredTheme`) are a WIP dark-mode rewrite using a `<theme-toggle-client>` custom element — **do NOT import or use them**.

## Key Conventions

### Layout — Apple-style full-width
- **`.page-container`**: full-width with responsive side padding (`clamp(1.5rem, 5vw, 5rem)`), **no max-width**. Used by all sections, list pages, nav, footer.
- **`.content-container`**: capped at `48rem` for article readability. Used only by `BlogPostLayout` and 404 page.
- List pages (blog, essays, research, projects, tools, tags) use **card grids** (`grid sm:grid-cols-2 lg:grid-cols-3`) inside `page-container`.

### Imports — relative only
Path aliases (`@/*`, `@components/*`, etc.) are defined in `tsconfig.json` but **not used**. Always use relative imports:
```astro
import { SITE } from "../lib/constants";
import Navigation from "../components/Navigation.astro";
```

### Tailwind CSS v4 — CSS-first config
No `tailwind.config.js`. Configuration lives in `src/styles/global.css` via `@import "tailwindcss"` and `@theme {}`. The `@tailwindcss/vite` plugin is in `astro.config.mjs` (not in Astro integrations).

### Content patterns
- **Drafts filtered everywhere**: `getCollection("blog", ({ data }) => !data.draft)`
- **Sort by date desc**: `.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf())`
- **Frontmatter**: Blog & essays use `.md` with Hugo-era fields; research, projects, tools use `.mdx` with clean modern schemas. Both styles pass Zod validation.

### Component patterns
- Sections: `<section class="border-t border-gray-100 py-20 md:py-28">` with inner `<div class="page-container">`
- Cards: `rounded-xl border border-gray-100 bg-white p-6` + `group-hover:` transitions
- Dates: `entry.data.date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })`
- Empty states: `{items.length === 0 ? <p class="text-gray-400">...</p> : <div>...}`

## Gotchas

- **`Navigation.astro`** is the active nav (light-mode only, hardcoded grays). **`Header.astro`** is a WIP dark-mode-ready version — do NOT use it.
- **`Section.astro`** (`ui/Section.astro`) exists but is unused. All section components inline their own `<section>` wrapper.
- **`formatDate()`** and **`readingTime()`** exist in `src/lib/utils.ts` but components inline their own `toLocaleDateString` and `wordCount/200` — prefer using the helpers for consistency.
- **No `@tailwindcss/typography` plugin**. The `.prose` class in `global.css` is hand-rolled. Add new prose styles there.
- **Deployment**: Cloudflare Pages (`wrangler.toml` with Node 20).

## Key Files

| File | Purpose |
|------|---------|
| `src/lib/constants.ts` | All site config: nav items, social links/icons (raw SVGs), bio, timeline, skills, pagination |
| `src/content/config.ts` | Zod `baseSchema` + 5 per-collection schemas (blog, essays, research, projects, tools) |
| `src/styles/global.css` | Tailwind v4 config (`@theme`), dark mode variant, hand-rolled `.prose`, surface system (`.surface-*`), shadow scale, scroll reveal, section dividers, textures |
| `src/layouts/BaseLayout.astro` | HTML shell: SEO, fonts, nav, footer, scroll progress bar, back-to-top, `IntersectionObserver` scroll reveal |
| `src/layouts/BlogPostLayout.astro` | Article layout: TOC, reading time, related posts, prev/next, `labelMap` |
| `src/components/Navigation.astro` | Fixed glassmorphism nav with search modal + theme toggle (ACTIVE — has inline dark mode) |
| `src/components/SearchModal.tsx` | React fuzzy search island (Fuse.js, Ctrl+K) |
| `src/components/ThemeScript.astro` | Inline `<script>` in `<head>` — prevents theme flash before first paint |
| `src/components/Header.astro` | **DO NOT USE** — WIP dark-mode rewrite with web components, not imported anywhere |
| `src/lib/theme.ts` | **DO NOT USE** — theme utilities used only by the dead `Header.astro` |
| `src/lib/utils.ts` | `formatDate`, `readingTime`, `wordCount`, `slugify`, `groupBy` — prefer these over inline equivalents |
| `astro.config.mjs` | MDX plugins (rehype-slug, rehype-autolink-headings, rehype-pretty-code), prefetch, image domains |
