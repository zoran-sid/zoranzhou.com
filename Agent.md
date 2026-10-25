# zoranzhou.com Agent Guide

## Architecture

This repository is an Astro 5 static bilingual website. The two public locales are
`zh-CN` and `en`. TypeScript, MDX, Tailwind CSS 4, MapLibre GL, and Cloudflare Pages
provide the main runtime and deployment layers. There is no production database and no
general production application server.

The repository also contains explicit local maintenance programs:

- `scripts/media-update.ts` updates the static Media Markdown file.
- `tools/content-editor/` edits repository content from a loopback-only browser UI.
- `scripts/translate.ts` manually generates or refreshes English article files with DeepL.

These programs do not belong to the production website runtime.

```text
Versioned source files
  |
  +-- src/content/{blog,essays,research,projects,photos,routes,lab}/
  |      -> Astro content schemas -> locale pages -> layouts/components
  |
  +-- src/content/media.md
  |      -> src/lib/media/list.ts -> static Media page
  |
  +-- public/routes/*.gpx and optional *.geojson
  |      -> route parser -> map components and generated Route frontmatter
  |
  +-- src/assets/photos/ and legacy photo metadata
         -> photo discovery -> static Photos pages

Astro build -> dist/ -> Cloudflare Pages
                         + one Pages Function for the root locale redirect

Local-only processes
  +-- media updater -> verified temporary file -> src/content/media.md
  +-- content editor -> allowlisted repository files only
  +-- route importer -> Route Markdown; original GPX remains unchanged
  +-- manual translator -> DeepL -> validated English Markdown/MDX and pairing keys
```

### Runtime boundaries

| Surface           | Entry point                       | Network/runtime                     | May write repository files?                   |
| ----------------- | --------------------------------- | ----------------------------------- | --------------------------------------------- |
| Static site       | `src/pages/[locale]/`             | Browser, from `dist/`               | No                                            |
| Root redirect     | `functions/index.ts`              | Cloudflare Pages Function, `/` only | No                                            |
| Astro development | `scripts/run-astro.mjs`           | Local Node + Astro dev server       | No content writes                             |
| Media update      | `scripts/media-update.ts`         | Manually started local Node process | Only its selected Media output                |
| Content editor    | `tools/content-editor/server.mjs` | Local Node, `127.0.0.1` only        | Only explicit allowlists                      |
| Route import      | `scripts/import-route.ts`         | Manually started local Node process | Route content after preview/validation        |
| Translation       | `scripts/translate.ts`            | Manually started local Node + DeepL | Article translations and missing pairing keys |

The deployment artifact is `dist/`. Cloudflare must never publish the repository root,
`tools/content-editor/`, scripts, settings, backups, or file-writing APIs.

### Repository map

| Path                                | Responsibility                                                           |
| ----------------------------------- | ------------------------------------------------------------------------ |
| `astro.config.mjs`                  | Static output, MDX plugins, sitemap, i18n, Tailwind, image domains       |
| `package.json`                      | Supported developer commands and runtime dependencies                    |
| `src/content/config.ts`             | Authoritative collection names and frontmatter schemas                   |
| `src/content/`                      | Versioned Markdown/MDX data and the special `media.md` file              |
| `src/pages/[locale]/`               | Locale-prefixed listing, detail, search, RSS, and utility pages          |
| `src/layouts/BaseLayout.astro`      | Global document metadata, navigation, footer, theme, JSON-LD shell       |
| `src/layouts/LabLayout.astro`       | Independent Web3 Lab metadata, navigation, footer, and visual shell      |
| `src/layouts/BlogPostLayout.astro`  | Article TOC, reading metadata, related and adjacent entries              |
| `src/layouts/RoutePostLayout.astro` | Route-specific article and endpoint/statistic presentation               |
| `src/components/`                   | Reusable site UI, navigation, Media table, maps, and route charts        |
| `src/i18n/`                         | Locale types, UI strings, localized paths, and language-cookie logic     |
| `src/lib/routes/`                   | Route parsing, identity, endpoint resolution, rendering geometry, splits |
| `src/lib/media/list.ts`             | Read-only parser used by the production Media page                       |
| `src/lib/photos.ts`                 | Local photo discovery and album filename conventions                     |
| `src/data/legacy-photos.ts`         | Older manually described remote photo albums                             |
| `src/styles/global.css`             | Global tokens, typography and shared layout; maps in maps.css            |
| `public/`                           | Assets copied to `dist/` without application logic                       |
| `public/routes/`                    | Public GPX source files and optional display-only GeoJSON                |
| `scripts/`                          | Explicit importers, migrations, validators, tests, and Astro launcher    |
| `tools/content-editor/`             | Isolated local content manager and its tests/documentation               |
| `functions/index.ts`                | Cloudflare root locale redirect only                                     |
| `public/_routes.json`               | Limits Pages Functions execution to `/`                                  |
| `wrangler.toml`                     | Cloudflare Pages project and `dist` output contract                      |

Never edit generated `dist/`, `.astro/`, or `node_modules/`. Generated directories are
outputs, not sources of truth.

## Build and request flow

`astro.config.mjs` configures:

- `output: "static"`;
- the canonical site origin `https://zoranzhou.com`;
- MDX plus heading slugs, linked headings, and Shiki-based code rendering;
- `zh-CN` as the default locale and `en` as the second locale;
- sitemap filtering, priorities, and locale alternatives;
- Tailwind through the Vite plugin;
- the explicitly allowed external image domain.

`npm run build` means only: compile all static pages and assets into `dist/`. It does not:

- parse a new GPX into Markdown;
- fetch Douban;
- start the editor;
- write content;
- commit or deploy anything.

Remote image metadata may make a build appear idle when network access is slow. Diagnose
the current Astro output before assuming that GPX or editor code is running.

`scripts/run-astro.mjs` starts the local Astro development server with the current Node
executable, disables telemetry, forwards process signals, and passes Astro arguments
through. `npm run dev` and `npm start` both use this launcher.

### Public request path

```text
GET /
  -> Cloudflare functions/index.ts
  -> pref-lang cookie, then Accept-Language
  -> 302 to /zh-CN/ or /en/

GET /zh-CN/... or /en/...
  -> static file generated by Astro

Any /api/... path in production
  -> no editor handler exists
```

`public/_routes.json` includes only `/`, so the Pages Function cannot accidentally become
a catch-all backend. `src/middleware.ts` mirrors root-language behavior for Astro/local
execution; the Pages Function is the production root redirect.

## Content model

### Current collections

The collection list is exact and must agree with `src/content/config.ts`:

```text
blog
essays
research
projects
photos
routes
lab
```

The former Tools, Homelab, and Gear website sections were removed. Do not restore their
schemas, content directories, pages, navigation items, translations, editor options,
redirects, or sample content unless explicitly requested. The directory
`tools/content-editor/` is a development tool and is unrelated to the deleted Tools page.

### Base frontmatter contract

All collections extend the base schema:

| Field            | Type/default                     | Meaning                                                         |
| ---------------- | -------------------------------- | --------------------------------------------------------------- |
| `title`          | required string                  | Visible title                                                   |
| `description`    | optional string                  | Summary and metadata description                                |
| `date`           | required, coerced to `Date`      | Publication date                                                |
| `updated`        | optional, coerced to `Date`      | Last meaningful content update                                  |
| `tags`           | string array, default `[]`       | Tags, related-content matching, tag pages                       |
| `draft`          | boolean, default `false`         | Excluded from public lists/details when true                    |
| `author`         | string, default `Zoran`          | Byline and structured metadata                                  |
| `lang`           | `zh-CN` or `en`, default `zh-CN` | Entry locale                                                    |
| `translationKey` | optional string                  | Connects ordinary translated entries                            |
| `translation`    | optional object                  | Local DeepL provenance and source/output hashes; no credentials |
| `cover`          | optional `{src, alt?, caption?}` | Standard cover image                                            |

The schema intentionally accepts several migrated Hugo fields such as `categories`,
`ShowToc`, `ShowReadingTime`, `word_count`, and `reading_time`. Their presence does not
make them primary application fields. Preserve unknown and compatibility frontmatter
unless a requested migration explicitly removes it.

Collection-specific fields:

| Collection | Additional fields                                                              |
| ---------- | ------------------------------------------------------------------------------ |
| `blog`     | `featured: boolean`                                                            |
| `essays`   | `featured: boolean`; standard author behavior                                  |
| `research` | `status: in-progress/completed/archived`, optional `source`                    |
| `projects` | optional `repo`, `demo`, `icon`; `tech[]`; `status: active/completed/archived` |
| `photos`   | optional location/camera/lens/film; `gallery[]` image objects                  |
| `routes`   | Stable identity, source file, exact endpoints, map and activity metadata       |
| `lab`      | type/track/status/verification; project evidence, boundaries, and technologies |

### Route frontmatter contract

Route fields have stricter invariants:

```ts
type RoutePoint = {
  lat: number;
  lng: number;
  name?: string;
};

// Conceptual schema, simplified from src/content/config.ts
type RouteData = BaseData & {
  routeId: `route-${string}`; // exactly 12 lowercase hex characters after route-
  kind: "run" | "hike" | "ride" | "travel" | "photo-walk";
  location: string;
  distance: number; // nonnegative kilometres in content
  duration?: number; // nonnegative integer seconds
  elevationGain?: number;
  gpx: `/routes/${string}.gpx`;
  displayGeometry?: `/routes/${string}.geojson`;
  published: boolean;
  start?: RoutePoint;
  end?: RoutePoint;
  coordinates?: RoutePoint; // general map/list fallback, not an endpoint replacement
  mapZoom?: number; // 1 through 18
  accent?: string;
  photos: Array<string | { src: string; alt?: string; caption?: string }>;
  metadata?: Record<string, unknown>;
};
```

Route `cover` also accepts a legacy string in addition to the normal image object. Do not
normalize that union casually; existing migrated content depends on it.

### Page generation

Public page families under `src/pages/[locale]/` include Home, Blog, Essays, Research,
Projects, Life, About, Media, Photos, Map, Web3 Lab, Tags, RSS, search data, and locale 404 pages.

The usual collection flow is:

```text
getCollection(collection)
  -> exclude drafts / unpublished Routes
  -> filter entry.data.lang to the page locale
  -> sort for the page family
  -> getStaticPaths() for details or pagination for lists
  -> render a shared layout
```

Static generation is important: a path that looks dynamic in source still has no server
handler after build. When adding a detail view, verify `getStaticPaths()` emits every
intended locale/slug combination.

`BlogPostLayout.astro` computes headings, reading time, and an `h2`/`h3` TOC.
It finds related writing across Blog, Essays and Research in the same locale using shared tags and categories, calculates
previous/next entries in date order, and emits Article and Breadcrumb JSON-LD.

`BaseLayout.astro` owns canonical and alternate locale links, Open Graph/Twitter fields,
RSS links, global fonts/CSS, navigation, theme bootstrapping, scroll UI, and general
structured data. MapLibre CSS should be enabled only through the layout's map styling
contract, not copied into individual pages.

Web3 Lab intentionally uses `LabLayout.astro` and `src/styles/lab.css` so its technical
subsite shell remains independent from the personal-site navigation and theme. Lab
content still uses the shared locale utilities, Astro content collections, search index,
and sitemap generation.

### Locale rules

Read `src/i18n/utils.ts` before editing locale behavior. It owns:

- the locale union and default locale;
- UI-string lookup and fallback;
- locale extraction/removal from paths;
- localized path construction;
- alternate URL and `hreflang` generation;
- the language preference cookie name.

Navigation uses a deliberate translation policy:

- listing pages switch to the equivalent listing in the target locale;
- ordinary detail pages use a unique public `translationKey` match in the same collection;
  when none can be proven, navigation falls back to the target collection listing;
- Route details use stable `routeId` to locate the corresponding translated Route entry.

Do not create a target-locale URL by blindly reusing an ordinary source slug. That can
produce a statically nonexistent page.

### Main-site editorial structure (2026-10)

Navigation is Writing (/blog), Projects (/projects), Life (/life), About (/about),
and the independent Web3 Lab. Home is identity + Now -> real Notes when published ->
selected writing led by blog construction -> published projects when present -> Life
photography -> contact. HeroSection owns the identity and actual TypeScript-learning
entry. The former radar / ExplorationMap is not the homepage composition.

Keep original article titles and both locales. Blog construction is the lead selection,
followed by AgentShield and an existing personal/practice article. Empty Notes/Projects
sections stay hidden; do not invent projects or metrics to fill a layout.

`src/lib/writing.ts` aggregates Blog, Essays and Research; it preserves source collection
URLs. `content-policy.ts` owns publication, readable-body, category and translation rules.
`/blog/topics/{technology,research,life}` uses complete static pagination, not a client-only
filter of one page. `pagination.ts` is shared by the writing archives. Empty text entries
keep their original detail paths but are excluded from reading indexes, tags, search and
RSS. Metadata-only Routes remain searchable.

`/subscribe` explains email delivery via Blogtrottr and retains the RSS-reader option.
The article feed only includes Blog / Essays / Research: never add Photos, Routes,
Projects, Media or Lab to this notification feed. Do not collect emails or add an email
backend without an explicit architectural change. Readers confirm and unsubscribe with
the provider; the main site must clearly explain the third-party delivery and free-plan ads.

RSS delivery contract (`src/lib/writing-feed.ts`, `[locale]/rss.xml.ts`):

- Resolve the locale from static route params. Chinese and English are independent feeds;
  never mix languages or silently alter a reader's existing subscription. Show the full
  feed URL and explain that changing website language does not subscribe the other feed.
- Feed publication time is the latest of `date`, explicit `updated`, and English
  `translation.translatedAt`. Sort by that time; retain source dates on article pages.
  Local translation exports do not publish anything: only deployed content enters RSS.
- For entries whose effective time is later than `date`, override Astro's permalink GUID
  with a non-permalink revision GUID based on canonical URL and a SHA-256 of title,
  description and normalized body. Leave unrevised legacy GUIDs unchanged. Do not use
  build time, file mtime, random values, or translation provenance in revision identities.
  Repeated builds and identical translations must retain the same identity. Preserve
  canonical article links separately; never append fake query strings to force delivery.
- Authors declare meaningful manual revisions with `updated`; retain that timestamp on
  future edits. Machine translations already carry `translatedAt`. Further content edits
  to an entry with revision metadata change its identity; typo-only edits may therefore
  also be notified. Do not promise only major changes without a publication approval step.
- Emit a localized channel link, language, Atom self-link and content-derived lastBuildDate.
  Initial adoption can notify existing revised/translated articles once. RSS identifiers
  signal updates, but provider filters, polling, deduplication and inbox delivery remain
  external; do not claim a real email was delivered without evidence.

Homepage selections reference translation keys or source slugs in `writing.ts` and must
resolve to public writing in the current locale. Latest notes exclude the selections.
Current work references the public bilingual Lab entry selected by `LAB_CURRENT_FOCUS_KEY`.
The current focus is TypeScript learning; do not substitute an unrelated project or
advance its stage without author confirmation. NetGuard is a preserved draft, excluded
from public views. Search includes essays
and indexes title, description and tags; both search and RSS filter by locale.

Keep the near-white scrolling palette, charcoal night surfaces and shared semantic
colours consistent. DESIGN.md and .impeccable/design.json document the current system.
home.css, collections.css, reading.css and prose.css own scoped responsibilities. `maps.css` preserves the Journey Explorer rules and loads only
with `mapStyles`; do not mix main-site or map CSS into `LabLayout`.

Run `npm run test:editorial` for content/pagination rules and, after a full build,
`npm run test:site-build` for internal links, translated routes, metadata, localized
search/RSS and the static-production boundary. Browser verification still covers mobile
navigation, search focus and Escape, reading TOC, light/dark layouts, and maps.

### Standalone GitHub profile handoff

`docs/github-profile-README.md` is a finished replacement for the author's GitHub profile
README in `zoran-sid/zoran-sid`. It is a handoff artifact, distinct from this blog's root
`README.md`, and must stay outside `public/` and Astro's content collections. The author
will copy it to GitHub manually. Keep the original `BLOG-POST-LIST:START/END` comment
markers around selected writing for compatibility with the profile's existing format. Do not update or push to that separate repository unless
a later user instruction explicitly authorizes it.

The profile keeps English as its primary language with a short Chinese personal line.
Preserve supported network/security experience, put TypeScript under current learning,
and describe viem, Solidity, Foundry and Sepolia as future directions. Do not invent
credentials, employment, proficiency levels, usage numbers or completed projects. NetGuard
must remain absent. Website links use absolute production URLs and should be checked
against the built routes after a structural site change.

### Publishing and verification for editorial changes

Keep the existing Astro static output and Cloudflare Pages integration. The only root
Pages Function remains the language redirect. UI/content work does not authorize adding
an email database, production editor, live trading/wallet connection, or separate hosting
service. For article subscription changes, test the generated XML allowlist and both
locales; do not send real subscription emails as a substitute for local verification.

Before delivering a redesign, verify the complete navigation path from a main-site entry
to the relevant detail and back, desktop/mobile layouts in both themes, and the Lab's
independent metadata. Test search Escape with a nonempty query: native search inputs can
consume Escape to clear their value, so the dialog explicitly closes on that key and then
restores focus and scrolling. A cleared input alone is not a successful close.

Run the appropriate checks listed in the validation matrix. `test:site-build` requires a
fresh, completed `dist/`; do not browse pages while the static build is clearing/recreating
them and interpret a transient missing page as a navigation defect. Refresh the preview
following a completed build and verify the final artifact. Run `git diff --check` and
`git diff --cached --check` because the latter also includes new files after staging.

Only commit/push or publish when the user has authorized it in the active session. Such
authorization remains valid across continuations. The September 2026 refactor explicitly
authorizes `git add .`, a descriptive commit and `git push origin main`; this is a record
of that session, not permanent permission to push future unrelated changes. Fetch and
check remote divergence before pushing, preserve other user changes, and never force-push
as part of routine delivery.

### Content change checklist

When adding or changing a content field, inspect this dependency chain:

```text
src/content/config.ts
  -> existing Markdown/MDX frontmatter
  -> collection listing/detail pages
  -> layouts and components
  -> i18n labels
  -> tags/search/RSS/sitemap where relevant
  -> content editor managed fields/forms where relevant
  -> focused tests and build
```

Change the schema/source first. Avoid a second parser or a parallel content format.

## Web3 Lab subsystem

The Web3 Lab is a deliberately independent technical subsite, not a themed section of
the personal-site shell. Read these files as one design and content system:

```text
src/content/config.ts
src/content/lab/*
src/i18n/lab.ts
src/lib/lab.ts
src/pages/[locale]/lab/index.astro
src/pages/[locale]/lab/[type]/[slug].astro
src/layouts/LabLayout.astro
src/layouts/LabEntryLayout.astro
src/components/lab/{LabHeader,LabFooter}.astro
src/styles/lab.css
public/web3-lab-favicon.svg
public/web3-lab-favicon-64.png
public/web3-lab-apple-touch-icon.png
```

The source-to-UI dependency chain is:

```text
Lab schema + bilingual entries
  -> bilingual Lab copy
  -> Lab home/detail layouts
  -> isolated Lab components and CSS
  -> static bilingual routes and metadata
```

### Routes, discovery, and visual shell

Lab home routes are `/zh-CN/lab/` and `/en/lab/`. Detail routes use
`/[locale]/lab/[type]/[slug]/`; `LAB_TYPE_SEGMENTS` is the only type-to-path mapping:

```text
learning     -> learning
build        -> builds
security     -> security
architecture -> architecture
note         -> notes
```

Use `getLabEntryPath()` and `getLabHomePath()` instead of rebuilding these paths. Lab
entries remain part of the shared search index and sitemap, but are excluded from article
notifications. The main navigation, Practice page and current-learning card provide
localized Lab entry points on desktop and mobile.

The Lab uses a dark blue-grey study surface: #111c32 base, #1d2940 panels,
#eff2ff text and #becdff actions. ScrollAtmosphere supplies a muted charcoal/blue-grey
scroll gradient and viewport-wide ambient light points; the homepage adds slow orbit
geometry. It shares Newsreader / Inter Variable / JetBrains Mono Variable with CJK
fallbacks. Preserve the lab-* namespace and isolated focus/selection treatments.
Do not import main-site layout CSS into Lab; share only the atmosphere components and
synchronize semantic token values deliberately.

Following the author's September 2026 redesign request, the home sequence is current
TypeScript focus -> five-stage learning route -> project plans -> security notes ->
About -> footer. The former simulated contract terminal and fishbone diagram are removed.
Detail pages place prose first and a sticky contents/facts rail to the right. Mobile
uses a collapsible contents list above prose and facts below. Learning entries show
learning status and a learning-specific notice; build/security entries retain their
implementation and verification boundaries.

### Brand and metadata boundary

`LabLayout.astro` owns the Lab document shell. Do not route Lab pages through
`BaseLayout.astro` or inherit the personal-site title/favicon contract.

The browser and share metadata rules are exact:

- `/zh-CN/lab/` and `/en/lab/` use the title `WEB3 LAB`.
- Lab details use `<entry title> | WEB3 LAB`.
- Lab titles must not append `ZORAN ZHOU`.
- `og:site_name`, the home JSON-LD `name`, and detail JSON-LD
  `isPartOf.name` are `WEB3 LAB`.
- The Lab description identifies it as an independent technical subsite without
  incorporating the personal-site name as Lab branding.
- Person attribution may remain in JSON-LD `author`, the explicit return-to-site link,
  and copyright. Authorship and subsite branding are separate concerns.

Lab routes use only these Lab-specific icon assets:

```text
/web3-lab-favicon.svg
/web3-lab-favicon-64.png
/web3-lab-apple-touch-icon.png
```

The main site continues to use `/favicon.png` and `/apple-touch-icon.png`. The Lab uses
its own connected-W mark: a continuous pale-blue W, an isolated pale-cyan dot above it,
and a dark blue rounded tile. This replaces the former multicolored diamond mark. The SVG
is the authoritative source; the header renders that same SVG rather than recreating it
with CSS or copying the path into another component.

Icon maintenance is a single-source workflow:

1. Edit `public/web3-lab-favicon.svg` in its 64 × 64 coordinate system. Keep the broad
   stroke readable at 16 and 32 px; avoid text, web fonts, external references or filters.
2. Run `npm run icons:lab`. `scripts/generate-lab-icons.mjs` derives the 64 px favicon
   and 180 px touch icon from the SVG with the pinned Sharp development dependency.
3. Update `LAB_ICON_REVISION` in `src/lib/lab.ts` to a new revision whenever the mark
   changes. Both `LabHeader` and `LabLayout` use this version in their asset URLs to
   avoid returning a cached old icon after deployment. The underlying filenames stay
   stable for external bookmarks.
4. Inspect the SVG at favicon/header scale and the generated PNGs. The mark should be
   recognizable on light browser chrome and on the Lab's dark surface.
5. Commit the SVG, both PNGs, revision and any generation changes together. Rebuild and
   check both home/detail pages in both languages. Never use the personal portrait for Lab.

Brand separation must not remove locale and discovery metadata. Preserve canonical
links, both locale alternates, and the `x-default` link to `/en/lab/`.

### Header, return controls, and responsive behavior

The Lab header provides four independent actions: return to the personal site, return to
the Lab home through the brand, navigate Lab sections, and switch language. Preserve the
meaning and focus order of all four.

Touch targets are deliberate:

- `.lab-return` has a minimum height of `3rem`; at narrow widths it also has a minimum
  width of `3rem`, producing an approximately 48 by 48 px target.
- Mobile may hide the return link's visible text, but it must retain the full localized
  `aria-label` and must not shrink to a bare glyph-sized target.
- `.lab-entry__back` must remain at least `2.75rem` (44 px) high.
- The footer return link must also remain at least `2.75rem` (44 px) high.
- A visible arrow is decoration inside the link, never the only clickable element.
- Keyboard focus indicators and skip-link behavior must remain visible and usable.

At the header breakpoint, Lab navigation becomes a horizontally scrollable second row.
Do not make the brand, language switch, or return target overlap in order to preserve all
desktop labels on a narrow screen.

### Current focus and learning route

`LAB_CURRENT_FOCUS_KEY` in `src/lib/lab.ts` selects the bilingual current-learning entry
for both main-site and Lab home. It currently points to `lab-typescript-foundations`.
The author's confirmed state is TypeScript learning; no completed prototype, published
exercise or test result is claimed. The TS focus card links to that real learning record.

`copy.home.stages` contains five explicit, bilingual technology/outcome pairs:

1. TypeScript: language foundations, then typed event handling.
2. viem: RPC interaction, log parsing and ERC-20 normalization.
3. Solidity: contract foundations and replay-protected event registration.
4. Foundry: unit, fuzz and invariant tests.
5. Sepolia: testnet deployment, transaction records and verification reports.

Exactly one stage has `data-state="current"` and `aria-current="step"`; the other four
have `data-state="pending"`. This is a study direction, not a progress percentage or
completion schedule. Text and ARIA communicate state as well as color. Change the source
record, bilingual copy, both entry points and verification tests together when the author
advances the learning stage. Desktop shows an ordered horizontal sequence; below 900 px
it becomes a vertical list with a simple left rule. Keep all pending text readable.

### Planned stack and evidence semantics

The Lab distinguishes planned technology from adopted technology. Planned builds use the
structured `candidateStack` field, whose group keys are exactly:

```text
server | onchain | data | contracts | network
```

The current wallet-platform plan is explicit:

| Responsibility | Planned selection   |
| -------------- | ------------------- |
| Server         | TypeScript + NestJS |
| Onchain        | viem                |
| Data           | PostgreSQL          |
| Contracts      | Solidity + Foundry  |
| Network        | Sepolia             |

Render these as labeled responsibility groups, not as one slash-separated tool string.
When `status` is `planned` and `candidateStack` is nonempty, the UI uses `PLANNED STACK` /
`规划技术栈` plus the explicit note that the selection is not implemented or verified.

`technologies` is reserved for tools supported by implementation evidence. Moving an
item from the planned stack into actual technology requires the corresponding content
update to `status`, `verificationStatus`, `implementedFeatures`, and evidence or known
limitations. Lifecycle status and verification status are independent axes; do not label
work `tested`, `verified`, or `completed` without reproducible evidence.

### Footer and copy rules

The Lab footer contains only the `WEB3 / LAB` brand, the localized return-to-site link,
and copyright. Do not restore the removed footer boundary slogan:

```text
静态优先 · 教育用途 · 面向测试网 · 不使用真实资金
STATIC-FIRST · EDUCATIONAL · TESTNET-ORIENTED · NO REAL FUNDS
```

Those safety boundaries still belong in entry badges, the About section, entry content,
and evidence notices where they have context. They should not be repeated as a thin
full-width footer sentence.

The Security section explains that existing material is research notes and preserves its
source verification label. Do not present theoretical material as a tested security case.

Localized Lab copy lives in `src/i18n/lab.ts`. Keep English and Chinese structure,
technical order, status meaning, and accessibility labels synchronized. Lab detail
translations are paired through `translationKey`; when a safe translated entry cannot
be found, language switching returns to the target-locale Lab home rather than inventing
a translated slug.

### Responsive and motion contract

The responsive transitions are part of the design:

- below 1100 px, shell spacing and hero/detail gaps tighten;
- below 900 px, the header becomes two rows, the roadmap becomes vertical, and the detail
  rail moves below prose with a separate collapsible mobile contents list;
- below 640 px, hero, project plans, About and footer become single-column.

At each transition, verify both languages, long titles, code/table overflow, touch
targets and the facts rail. Reduced motion disables smooth scrolling and transitions
without removing state text or focus feedback. Avoid continuous decorative animations.

## Route and map subsystem

This is the highest-risk part of the project. Read the following files as one system:

```text
src/lib/routes/gpx.ts
src/lib/routes/identity.ts
src/lib/routes/display-geometry.ts
src/lib/routes/downsample.ts
src/lib/routes/endpoints.ts
src/lib/routes/splits.ts
src/lib/routes/content.ts
scripts/import-route.ts
scripts/route-files.ts
src/components/MapExplorer.astro
src/components/RouteMap.astro
src/layouts/RoutePostLayout.astro
src/pages/[locale]/map/index.astro
src/pages/[locale]/map/[slug].astro
```

### Three geometry layers

Never conflate these layers:

| Layer               | Source                                                 | Purpose                                                | May affect statistics or identity? |
| ------------------- | ------------------------------------------------------ | ------------------------------------------------------ | ---------------------------------- |
| Source geometry     | Original GPX in `public/routes/`                       | Truth for distance, time, elevation, splits, endpoints | Yes                                |
| Computed route data | Parsed points and generated frontmatter                | Stable identity and public route metadata              | Yes                                |
| Display geometry    | Locally cleaned/downsampled points or optional GeoJSON | Map rendering only                                     | No                                 |

The governing invariant is:

```text
source GPX -> computations
source GPX -> display cleanup -> map
display cleanup -X-> computations or generated frontmatter
```

`processRouteForDisplay()` may validate coordinates, remove duplicate points, reject
isolated spikes, smooth small visual jitter, and downsample to a rendering limit. It must:

- operate on every GPX segment independently;
- preserve the first and last point of every segment;
- preserve gaps between segments;
- never draw a line across missing data;
- never overwrite the GPX;
- never change statistics, identity, splits, or exact endpoint markers.

`displayGeometry` is an optional cached GeoJSON path for rendering only. There is no
remote map matching during requests or builds. Off-road routes require a deterministic
local display fallback.

### GPX parser behavior

`src/lib/routes/gpx.ts` exposes the central parser types and functions:

```ts
parseGpx(xml: string): ParsedRoute
parseGeoJson(text: string): ParsedRoute
parseRouteDocument(text: string, filename?: string): ParsedRoute
haversineDistanceMeters(a, b): number
```

Important parser behavior:

- GPX track segments are preserved as separate arrays.
- Route points are used only as a fallback when normal track points are unavailable.
- Cumulative distance is calculated within segments, never across a segment gap.
- The first and last valid source track points define source endpoints.
- Point time, elevation, and cadence are parsed when valid.
- Elevation gain/loss uses distance sampling and smoothing to avoid GPS noise inflation.
- Waypoint labels resembling Start/Finish may name endpoints only when sufficiently near.
- Heart rate, cadence, speed, power, and calorie summaries may be parsed as sensitive
  metrics; do not expose them automatically in new UI.
- GeoJSON supports line and multiline geometry and uses GeoJSON coordinate order.

`parseRouteDocument()` selects the correct parser from the file name/content. Consumers
should call it rather than implement another GPX/GeoJSON detector.

### Coordinate order

The application and MapLibre use different shapes:

```ts
// Application object
const endpoint = { lat: 31.85101, lng: 117.17634 };

// MapLibre array: longitude first
marker.setLngLat([endpoint.lng, endpoint.lat]);
```

Swapping these values is a data bug, not a styling issue. Search every conversion point
when a marker appears in the wrong region.

### Start and finish invariants

Endpoint resolution is intentionally conservative:

```text
valid Route frontmatter start/end
  -> otherwise first/last valid source segment point
  -> no invented or visually shifted coordinate
```

`resolveRouteEndpoints()` implements that fallback. The importer writes source-derived
coordinates rounded to six decimals. A nearby GPX waypoint may provide a `name`, but its
coordinates do not replace the track endpoint.

Closed routes often start and finish at the same physical point. In that case:

- the S and F markers must overlap;
- do not offset one marker to make both visible;
- do not choose a nearby track point as a fake finish;
- CSS may move labels or change stacking, but never marker coordinates;
- map bounds may add padding but cannot mutate coordinates;
- endpoint summary cards show names only, not latitude/longitude.

Use this debugging order for endpoint defects:

```text
1. Inspect the first and last valid point in the raw GPX.
2. Inspect parseGpx().segments, .start, and .end.
3. Inspect generated Route frontmatter.
4. Inspect resolveRouteEndpoints() or the MapExplorer lazy loader.
5. Confirm setLngLat([lng, lat]), not [lat, lng].
6. Only then inspect marker wrapper, z-index, label, and responsive CSS.
```

Do not fix steps 1-5 with a step-6 visual offset.

### Route identity and importer ownership

`createRouteId()` derives a stable `route-xxxxxxxxxxxx` identifier from normalized source
facts. Changing identity inputs or parser normalization can orphan translations and
existing entries, so treat identity changes as a migration.

The importer attempts to match existing content in this order:

```text
routeId
  -> exact GPX path
  -> constrained source fingerprint/date/endpoint matching
```

On re-import, generated fields may be refreshed, but the authored Markdown body and
manual fields must survive. Translations sharing the same `routeId` may receive the same
generated route facts while retaining localized text.

Reverse geocoding is optional. Use `--no-geocode` for deterministic/offline imports. GPX
files are copied or referenced under public assets and therefore expose route locations;
review privacy before adding a file.

Recommended import sequence:

```powershell
npm run import:routes:preview
npm run import:routes -- public/routes/example.gpx --no-geocode
npm run validate:routes
npm run test:route-logic
```

The preview command is dry-run and disables geocoding. GPX import is never an implicit
part of `npm run build`.

### MapExplorer versus RouteMap

`MapExplorer.astro` powers the locale Map index:

- page code obtains visible Route entries;
- `normalizeRouteEntries()` deduplicates by locale plus `routeId`;
- route geometry is loaded lazily when selected or required for the overview;
- source GPX is parsed and display geometry is processed/cached in memory;
- multi-segment routes remain multi-segment;
- exact start/end markers come from resolved endpoints;
- `fitBounds` frames the data without altering it.

`RouteMap.astro` powers one Route detail:

- fetches the configured GPX and optional display GeoJSON;
- calls the shared parser and display processor;
- resolves exact endpoints through `resolveRouteEndpoints()`;
- adds non-duplicate named waypoints where appropriate;
- renders the route and bounds;
- calculates kilometre splits from parsed source data, never display geometry.

When behavior should be shared by both maps, put it in `src/lib/routes/` instead of
copying client code between the two Astro components.

### Per-kilometre splits

`calculateKilometreSplits(route)` returns distance buckets only when time/distance data is
credible. Current safeguards include adequate timed-distance coverage, adequate coverage
inside each bucket, and plausible pace limits. Cadence appears only when its coverage is
sufficient. A final sub-kilometre bucket may be marked partial.

Formatting helpers are `formatSplitDuration()` and `formatPace()`. Do not change split
math to repair table alignment. Layout belongs in `RouteMap.astro` CSS:

- keep the section title centered;
- center summary/header labels and values;
- preserve distinct readable columns on desktop;
- allow a balanced mobile layout without clipping semantic labels;
- use existing design tokens before adding colors or spacing constants.

If source timestamps are absent, non-monotonic, or insufficient, hiding the split section
is preferable to presenting invented pace values.

### Route visibility helpers

`src/lib/routes/content.ts` centralizes Route entry behavior:

- `isRouteVisible()` excludes drafts and entries with `published: false`;
- `getRouteFile()` normalizes the source GPX field;
- `getRouteStart()`, `getRouteEnd()`, and `getRouteCoordinates()` apply frontmatter
  fallbacks for page data;
- `formatDistance()`, `formatDuration()`, and `formatElevation()` format UI values;
- `normalizeRouteEntries()` deduplicates translated/stable entries.

Use these functions instead of recreating visibility or fallback rules in pages.

## Media subsystem

### Production data path

`src/content/media.md` remains the canonical source for personal media records. It is
raw Markdown, deliberately outside Astro's content collections. No movie, book, photo,
or route update enters article RSS or email notifications.

```text
src/content/media.md -> src/lib/media/list.ts
  -> LibraryShelf (homepage + Life, first six books)
  -> /[locale]/library (complete book shelf)
  -> HomeActivities (latest three watched movies)
  -> /[locale]/media (poster archive, type/search filters, 24 items per reveal)

src/data/media-covers.json -> public/media/covers/*.webp
  derived image cache, written only by the manual media:images command
```

Keep `year` (release/original publication year) separate from `watchedDate` (an actual
recorded calendar date, `YYYY-MM-DD`). `parseMediaList` sorts by descending valid
`watchedDate`; same-day records retain Markdown order, and undated records retain their
order after dated records. Never infer a viewing date from `year`, import time, file
mtime, or today's date. Invalid calendar dates are treated as absent. Existing bulk
collection dates remain source facts; do not invent historical viewing dates.

Supported display columns: `id`, `name`, optional `nameEn`, `author` (Chinese / English),
`year`, `rating` (personal 0–5), `status`, `watchedDate`, `poster`, `url`, `urlEn`, `imdb`.
Legacy four-column tables remain valid. `poster` and detail URLs accept HTTP(S) only.
Missing ratings are not printed as zero-star reviews. Missing covers keep a readable
text fallback. For English titles, use `nameEn` then the last ` / ` title alias; do not
pretend a Korean/original title has been translated.

Chinese film links use the existing Douban subject URL. English links use a verified
`imdb` title ID (`tt…`) when present; otherwise the cover/title opens an IMDb
title/year search. Film cards omit source labels and visible viewing dates. Never guess an IMDb ID from a title. Book Chinese links
use verified Douban book pages; English links currently use Google Books title/author
search. Linked cover editions are references, not assertions of the edition read.

`MediaCard.astro` shares covers and metadata across these surfaces. All content is in
static HTML. With JavaScript, Media reveals 24 results at a time, provides category
and title/author filtering, updates the live count, and focuses newly revealed results.
Without JavaScript all records remain readable. The page never calls Douban/IMDb APIs.
Remote uncached covers load lazily; cache covers locally for reliable availability.

### Cover maintenance

```sh
npm run media:images         # all books + 24 most recent film/TV records
npm run media:images -- --all # all available book/film/TV cover URLs
npm run test:media-list
```

This opt-in command uses the existing Sharp dependency to create thumbnails bounded
by 320×480, hashes the source URL into a stable filename, and atomically writes the
cache index. Cached files are reused; failed requests preserve previous files and are
reported. No Markdown, rating, viewing date, or source link is modified. Source
catalogue Referer and normal User-Agent headers are used for the source image CDN.
Do not bypass a blocked/captcha source. Do not run this command during Astro build,
Cloudflare deployment, or a visitor request. Review and commit the generated cache
index and thumbnails together when publishing. Keep original artwork; never generate
fake covers or use a placeholder image as if it were the book or film.

### Douban update pipeline

```text
scripts/media-update.ts          CLI, options, orchestration, safe output replacement
scripts/media/douban.ts          pagination, HTML/JSON input, normalization, blocking checks
scripts/media/markdown.ts        table parsing, matching, merging, deduplication, serialization
scripts/media-update.test.ts     updater regression coverage
```

Supported commands:

```powershell
npm run media:update
npm run media:update -- --dry-run
npm run media:update -- --input C:\path\to\saved-pages
npm run media:update -- --delay 2500
npm run test:media-update
```

The live workflow uses a normal browser User-Agent, a reasonable delay, and follows all
advertised pagination pages. The updater treats timeouts, empty pages, changed HTML,
captcha/block pages, rate limits, and incomplete pagination as failures.

Saved input is a first-class fallback:

- a directory may contain saved Douban HTML pages;
- a supported JSON export may contain normalized subject data;
- coverage/advertised totals are still checked when the input exposes them.

### Media merge ownership

Matching prefers:

```text
stable Douban subject ID
  -> normalized title + year fallback
```

The update policy is field-preserving:

- a non-empty existing/manual value wins over a scraped replacement;
- an empty supported field may be filled from Douban;
- stable existing IDs/slugs are retained where possible;
- duplicate subjects are collapsed;
- unmatched manually maintained movie rows remain;
- unknown table columns remain;
- only the Movies table is replaced/merged;
- Games and every other manual section remain byte-for-byte outside the edited region.

The output policy is transactional:

```text
fetch/read every page
  -> parse and validate complete result
  -> merge in memory
  -> serialize to a same-directory temporary file
  -> read/verify temporary output
  -> atomic rename over the selected real file
```

An error before the final rename must leave the original file intact. The updater never
commits. Use `--dry-run` or `--output` when verifying changes without touching the normal
data file.

Douban may return 403, 418, 429, captcha, or structurally empty pages. Do not weaken
partial-update protection to work around blocking; use saved HTML or JSON instead.

## Photos subsystem

Local photo discovery lives in `src/lib/photos.ts`. It uses `import.meta.glob` for assets
under `src/assets/photos/`, ignores hidden/underscore-prefixed support files, applies
natural ordering, and derives album structure from repository naming conventions.

`src/data/legacy-photos.ts` contains older manually defined remote albums. Treat this as a
migration source, not a new competing format. Before changing Photos behavior, inspect the
locale Photos pages to see how content entries, discovered local assets, and legacy records
are currently combined.

Do not copy large photo assets into editor code or public JavaScript. PicGo insertion in
the local editor should produce content references using the user's existing PicGo setup.

## Local content editor

### Purpose and isolation

`npm run editor` starts `tools/content-editor/server.mjs` on
`http://127.0.0.1:4322`. The tool directly edits this repository; it does not introduce a
database or a second content representation.

```text
tools/content-editor/server.mjs          loopback API, filesystem boundary, PicGo, GPX, tasks
tools/content-editor/public/index.html   browser application shell
tools/content-editor/public/editor.js    visual/source editing and API client
tools/content-editor/public/styles.css   isolated editor presentation
tools/content-editor/smoke-test.mjs      CRUD, security, task, Explorer, and GPX regression test
tools/content-editor/README.md           operator-facing workflow
```

The server refuses to start when `CI`, `CF_PAGES`, or `CF_PAGES_BRANCH` indicates a build
environment. Its source is outside `src/`, site `public/`, and `functions/`, so Astro does
not bundle it.

### Server configuration

Key fixed boundaries in `server.mjs`:

```text
host                  127.0.0.1
default port          4322 (override with EDITOR_PORT)
JSON body             5 MiB
image                 20 MiB
GPX                    25 MiB
asset request         36 MiB
task timeout          5 minutes
task output retention bounded in memory
```

The content collection write allowlist is explicit:

```text
blog, essays, research, projects, photos, routes
```

Routes appear in the manager but normal blank creation is disabled; GPX-to-Route creation
must use the existing importer flow.

### HTTP API map

| Method/path                  | Responsibility                                            |
| ---------------------------- | --------------------------------------------------------- |
| `GET /api/config`            | Collection/capability list plus per-process request token |
| `GET/POST /api/settings`     | Read/write local PicGo settings                           |
| `POST /api/images/upload`    | Validate image and upload through local PicGo             |
| `GET /api/gpx`               | List approved GPX assets                                  |
| `POST /api/gpx/import`       | Validate and add a GPX asset                              |
| `POST /api/gpx/create-route` | Invoke the existing Route content generation path         |
| `POST /api/gpx/delete`       | Back up and remove an approved GPX asset                  |
| `POST /api/gpx/explorer`     | Open the approved Route assets directory                  |
| `GET /api/entries`           | List entries in one allowlisted collection                |
| `GET /api/entry`             | Read one validated entry                                  |
| `GET /api/git-status`        | Return read-only repository status                        |
| `POST /api/save`             | Validate, back up, and atomically save/rename an entry    |
| `POST /api/delete`           | Back up and delete one entry                              |
| `POST /api/explorer`         | Open an approved content path in Windows Explorer         |
| `POST /api/task`             | Legacy synchronous fixed task API                         |
| `POST /api/tasks`            | Start one fixed asynchronous lint/build task              |
| `GET /api/tasks/:id`         | Poll task output and completion state                     |

This table documents the current implementation; it does not authorize adding generic
filesystem or command-execution endpoints.

### Request security

Every request is constrained by several independent checks:

- the server binds to loopback, not `0.0.0.0`;
- accepted Host and Origin values are explicit loopback values;
- state-changing requests require the random per-process token from `/api/config`;
- JSON size and expected data shape are validated;
- collection names and file extensions are allowlisted;
- resolved and real paths must remain inside approved roots;
- traversal, Windows reserved names, symlinks, and junction escapes are rejected;
- settings and temporary files remain in ignored local tool storage.

Do not simplify this to a single string-prefix path check. Correct path containment must
use resolved paths, separators, and real-path/link validation.

### Save protocol and frontmatter ownership

The editor manages a small known set of common frontmatter fields while preserving all
unknown fields. Conceptually:

```text
read file
  -> parse frontmatter without discarding unknown keys
  -> present managed fields + Markdown/MDX body
  -> client sends original version hash and desired file/fields/body
  -> server rejects stale version or duplicate slug/path
  -> validate required fields and safe filename
  -> back up old file
  -> write temporary file
  -> atomic rename
  -> if renamed, remove old path only within the same guarded operation
```

Never serialize frontmatter exclusively from visible form controls. That would delete
collection-specific, migrated, or future fields.

Backups are required before overwrite, rename, and deletion. A content version hash
prevents silently replacing a file changed by another process after it was loaded.

### Visual versus source editing

The browser UI is visual-first for ordinary Markdown, with source mode as the lossless
escape hatch. `editor.js` performs a risk scan before converting source into the visual
editor. Unsupported constructs include complex MDX/JSX, expressions, directives, footnote
and reference-link structures, complex nested lists, math, alignment-sensitive tables,
and other syntax that cannot round-trip reliably.

Required behavior:

```text
safe ordinary Markdown -> visual editor -> serialize -> source -> preview/save
risky Markdown or MDX   -> source mode -> exact source preserved
serialization failure  -> block save and retain original source
```

The preview renderer is intentionally limited and must not execute MDX or arbitrary HTML.
Do not claim WYSIWYG support for syntax the serializer cannot preserve.

Unsaved-change warnings must remain active for navigation, entry switching, and window
close. Duplicate slug/path errors are ultimately enforced by the server even if the UI
also warns earlier.

### PicGo integration

The only required setting is an absolute path to the installed PicGo executable. Upload
flow:

```text
paste/drop/select image
  -> client sends validated data to loopback server
  -> server verifies size and file signature
  -> try local PicGo HTTP service at 127.0.0.1:36677
  -> fall back to configured PicGo executable
  -> obtain URL
  -> insert Markdown image at the current editor cursor
  -> clean temporary image data
```

Do not embed cloud credentials in this repository. PicGo owns the user's image-host
configuration. The server must never execute a user-composed shell command.

### GPX management

The editor validates GPX as UTF-8 XML, applies the size limit, rejects duplicates/unsafe
names, and publishes only inside `public/routes/`. Route Markdown generation delegates to
the existing import script so identity and computed fields stay consistent.

GPX deletion requires a backup. Import failure must not leave a partial asset. Inserting
a GPX reference into content and creating a Route entry are separate user actions.

### Windows Explorer integration

Explorer actions may open only approved absolute repository directories/files. On Windows,
use the system `explorer.exe`, an argument array, `shell: false`, and an intentionally
visible window. Do not build a `cmd /c` command containing a requested path.

When Explorer appears to do nothing, debug in this order:

```text
client button event and API response
  -> server allowlist/path validation
  -> absolute normalized target
  -> explorer.exe spawn event/error/exit handling
  -> Windows session/desktop availability
```

The smoke test can verify spawn wiring, but only an interactive Windows session can prove
that a visible Explorer window appeared.

### Fixed project tasks and Windows spawn behavior

The editor exposes only fixed `lint` and `build` package scripts. Request data selects an
allowlisted task name; it never becomes a command or argument. Only one project task runs
at a time. The browser polls bounded output and elapsed state. Timeout/termination must
kill the Windows process tree and must not leave the task lock permanently occupied.

On current Windows/Node versions, spawning `npm.cmd` directly with `shell: false` can throw
`spawn EINVAL`. The safe implementation resolves npm's JavaScript CLI and runs it with the
current Node executable:

```text
process.execPath + [resolved npm CLI, "run", fixedScriptName]
shell: false
fixed argument array
```

Do not solve this by using `shell: true`, concatenating command strings, or accepting
arbitrary task names. Those approaches reintroduce command injection and quoting bugs.

Editor checks:

```powershell
npm run test:editor
node --check tools/content-editor/server.mjs
node --check tools/content-editor/public/editor.js
```

## Manual Chinese-to-English translation

Read `docs/translation.md` before changing this workflow. The user maintains Chinese
source files and explicitly runs `npm run translate`, following the `media:update`
maintenance pattern. This is a local CLI, not a content-editor button or a background
job. Never wire it into save, dev, build, deployment, CI, Git hooks or GitHub Actions.

Ownership:

- `scripts/translate.ts`: allowlisted collection discovery, pairing, incremental status,
  character budget, credential loading, lock, backup journal and guarded file writes.
- `scripts/translation/content.ts`: YAML documents, Markdown/MDX AST text extraction,
  structural/numerical validation, hashes, translated fields and `RULES_VERSION`.
- `scripts/translation/deepl.ts`: official HTTPS endpoints, header authentication,
  batching, timeout and sanitized provider errors.
- `scripts/translation.test.ts`: offline fixtures and mocked network; never real keys.
- `src/content/config.ts`: optional `translation` provenance in the shared base schema.

### Credentials and deployment boundary

`DEEPL_AUTH_KEY` comes from the local process environment or root `.env.translation`.
The environment value takes precedence. `.env.translation.example` contains only a
placeholder. `.env.translation` and `.local/translation/` are Git-ignored; local secrets
should be owner-readable/writable only. Never put credentials in tracked files, content,
test fixtures, URLs, public assets, browser code, logs or GitHub Secrets. Never use a
`PUBLIC_` prefix. Never print API response bodies, request headers or nested fetch errors.
Do not force-add ignored local files or copy them into deployment directories.

Only the official `api-free.deepl.com` (`:fx` keys) and `api.deepl.com` endpoints are
allowed, with redirects rejected. Keys go in the Authorization header. A run with CI or
CF_PAGES set is rejected. The tool never calls Git, commits, pushes or deploys.

### Scope, identity and manual edits

- Allowlisted collections: blog, essays, research, lab; Chinese only. Drafts and empty
  bodies are skipped. No photos, routes, projects, Media or shared UI translation.
- `--dry-run` needs no credential, performs no API calls and writes no files or locks.
- `--file` takes one source path; `--collection` narrows the scope. Default total character
  budget is 20,000, checked before API use; `--max-characters` explicitly changes it.
- Reuse a unique same-collection `translationKey`; include drafts in ambiguity checks.
  Recognize conventional `.en.md`/`.en.mdx` pairs when keys are absent. Nonconventional
  existing pairs must first receive explicit matching keys to avoid duplicate entries.
- When missing, generate a key once from collection + relative-path SHA-256 prefix,
  persist only after translation succeeds, and copy it to English. Renames do not change
  persisted keys. Do not regenerate them from titles, slugs or translated content.
- Existing English filenames/slugs stay fixed. New explicit slugs gain `-en`. Dates and
  factual source metadata sync from Chinese, while target-only unknown fields remain.
- English `translation` stores provider, sourceHash, outputHash, rulesVersion and
  translatedAt, never credentials. Output hash excludes the translation record itself.
- `new` and `stale` entries are eligible; `synced` entries make no API requests.
  `existing-preserved` means untracked legacy English; `manual-preserved` means the
  generated output changed. Both are skipped by default, even when Chinese changes.
- `--retranslate` requires `--file` and explicitly replaces that one existing English
  body, including manual revisions; it is not a paragraph merge or a batch force flag.

### Translation and integrity contract

Translate Chinese text nodes, title, description, cover alt/caption and Lab currentPhase,
implementedFeatures and knownLimitations. Retain code, images, link targets, HTML and
MDX code/components byte-for-byte. JSX children and HTML-block prose are intentionally
not extracted; tags, enums, stack, unknown fields and image Markdown alt text stay as-is.
Use parsed YAML documents to preserve unknown metadata and comments. Do not replace
this with broad regular-expression frontmatter/Markdown rewriting.

Source/target are ZH/EN-US. Title and description supply bounded context. Requests batch
at 50 strings and below 120,000 bytes. Missing/empty translations, altered Arabic digits,
or changed Markdown/MDX structure abort writing. These checks do not establish semantic
accuracy: review terms, quotations, negation, planned/completed claims, inline-formatting
fragments and heading-anchor links. No glossary or second-model semantic review is
implemented. Bump `RULES_VERSION` when extraction or translation behavior changes.

### Writes, failure and recovery

Acquire an exclusive `.local/translation/lock`. Check source and target snapshots again
after the API request and before writing; concurrent editor changes must not be lost.
Keep originals in `.local/translation/backups/<id>/journal.json`. Prepare same-directory
temporary files; replace existing files atomically and create new destinations with an
exclusive hard link. Roll back caught partial-write failures. Mark success with `complete`.
This is atomic per file, not a crash-proof multi-file transaction: after forced termination,
inspect journals without `complete` and Git diffs before recovering the stale lock.

Batch execution stops at the first failure; earlier successful articles remain, later
articles are untouched. No source key is saved when provider/validation fails. Retry only
429 responses, at most three attempts; timeouts/network failures are not retried because
the request may already have been billed. API success followed by local rejection may
still consume quota. Do not claim rollback of remote usage.

Focused validation: `npm run test:translation`, CLI dry-run, and explicit script typecheck
(`npx tsc --noEmit --module nodenext --moduleResolution nodenext --target es2022
--skipLibCheck --strict scripts/translate.ts scripts/translation.test.ts`). The main
tsconfig does not include scripts. If content/schema changes, also run lint, language
routing checks, static build and site-build checks; scan distributable and tracked files
for credentials without displaying any matching secret. The editor must continue to
preserve the nested translation provenance as unknown frontmatter.

## Production and Cloudflare boundary

Deployment contract:

```text
build command    npm run build
publish output   dist/
function routes  / only
```

Production may contain static HTML/CSS/JavaScript/assets and the root locale redirect. It
must not contain:

- local editor UI or APIs;
- repository filesystem access;
- PicGo paths/settings;
- editor backups or temporary files;
- generic subprocess execution;
- Media/Douban scraping code executed at request time;
- a database or hosted CMS backend.

After changing boundaries or build configuration:

```powershell
npm run build
rg -n "content-editor|X-Editor-Token|/api/save|/api/gpx|PicGo.exe|local-settings.json" dist
```

The scan should return no matches. Also inspect `public/_routes.json`; it must continue to
limit Pages Functions to the intended root redirect unless a separately reviewed
production function is explicitly requested.

## Supported commands

| Command                          | Purpose                                       | Writes content?                    | May use network?               |
| -------------------------------- | --------------------------------------------- | ---------------------------------- | ------------------------------ |
| `npm run dev`                    | Start local Astro development                 | No                                 | May load remote assets         |
| `npm run editor`                 | Start loopback content manager                | Yes, through explicit user actions | PicGo only when used           |
| `npm run build`                  | Generate `dist/`                              | Generated output only              | Possibly remote image metadata |
| `npm run preview`                | Serve built static output                     | No                                 | No normal external fetch       |
| `npm run lint`                   | Astro schema/type/component check             | No                                 | No                             |
| `npx tsc --noEmit`               | Independent TypeScript check                  | No                                 | No after install               |
| `npm run format`                 | Format repository-supported files             | Yes, broad mechanical rewrite      | No                             |
| `npm run media:update`           | Update Movies table                           | Yes unless dry-run/output changed  | Yes for live mode              |
| `npm run media:images`           | Cache books/games/recent film thumbnails     | Derived cache only                 | Yes                            |
| `npm run test:media-list`        | Test display dates, links and filters        | No                                 | No                             |
| `npm run test:media-update`      | Test Media updater                            | Test artifacts only                | No expected live Douban        |
| `npm run translate -- --dry-run` | Preview Chinese-to-English changes            | No                                 | No                             |
| `npm run translate -- ...`       | Manually update English articles              | Yes, with backups                  | DeepL for pending entries      |
| `npm run test:translation`       | Test translation integrity and preservation   | Temporary fixtures only            | Mocked API only                |
| `npm run import:routes:preview`  | Preview GPX import                            | No content publish                 | No geocoding                   |
| `npm run import:routes -- ...`   | Import selected GPX into Route content        | Yes                                | Optional geocoding             |
| `npm run migrate:routes`         | Explicit Route migration                      | Yes                                | Inspect script before use      |
| `npm run validate:routes`        | Validate Route content/source consistency     | No intended content writes         | No                             |
| `npm run test:route-logic`       | Route parsing/identity/split regression tests | Test artifacts only                | No                             |
| `npm run test:language-routing`  | Locale redirect/path regression checks        | Test artifacts only                | No                             |
| `npm run test:editor`            | Editor CRUD/security/runtime smoke tests      | Temporary test files, cleaned      | No external service required   |

Do not run broad `npm run format` merely to format one edited file in a dirty worktree.
Use Prettier on the intended file(s) when unrelated user formatting must be preserved.

## Change recipes

### Add or change a normal content field

1. Update `src/content/config.ts`.
2. Decide whether the field is common, collection-specific, generated, or manual.
3. Update only the pages/layouts that consume it.
4. Add i18n labels if visible.
5. Add editor form support only if round-trip preservation is guaranteed.
6. Verify old entries and unknown fields still parse.
7. Run Astro checks and build.

### Change Route endpoint behavior

1. Prove raw GPX first/last points.
2. Test `parseGpx()` output.
3. Test importer/frontmatter output.
4. Test `resolveRouteEndpoints()`.
5. Verify MapLibre coordinate order in both map components.
6. Add/adjust route-logic tests.
7. Use CSS only for label overlap after coordinate correctness is proven.

### Change map rendering quality

1. Keep source parsing untouched unless source data is actually wrong.
2. Modify `display-geometry.ts` or `downsample.ts` with segment/endpoints tests.
3. Confirm computed distance, splits, identity, start, and finish are unchanged.
4. Check overview and detail maps at desktop/mobile widths.

### Change Media fields or layout

1. Inspect the actual `media.md` table headers and unknown columns.
2. Update updater normalization/serialization only if the storage field changes.
3. Update `parseMediaList()` only if production interpretation changes.
4. Keep Type and Status columns independent in responsive CSS.
5. Test escaped pipes, bilingual labels, missing ratings, and manual values.
6. Run updater tests, dry-run, and build.

### Change Web3 Lab design or content

1. Read the Lab schema, both localized entries, `src/i18n/lab.ts`, both Lab layouts,
   Lab components, and `src/styles/lab.css` as one system.
2. Change structured content or schema before its visual consumers; do not encode planned
   stack or progress evidence only in CSS or page markup.
3. Keep `LAB_CURRENT_FOCUS_KEY`, its bilingual learning record, `home.stages`,
   candidate-stack groups and both locale entry points semantically aligned.
4. Preserve the independent title, Open Graph, JSON-LD, favicon, canonical, and
   `hreflang` contract.
5. Check the header and detail return targets, code/table overflow, roadmap state and
   geometry, current/pending contrast, and text wrapping at desktop and mobile widths.
6. Verify planned tools are not presented as implemented and that verification claims
   match checked-in evidence.
7. Run Astro checks and the full static build, then inspect a home and detail page in both
   locales.

### Change the editor

1. Keep code under `tools/content-editor/`.
2. Extend an explicit API/collection/path/task allowlist; never add generic primitives.
3. Preserve token, origin, traversal, link, size, version, backup, and atomic-write checks.
4. Make source mode the fallback for syntax that cannot round-trip visually.
5. Add smoke coverage for success and rejection paths.
6. Scan `dist/` after build.

### Remove a feature completely

Search the full dependency graph, not only navigation:

```text
schema/collection
content/data/assets
pages/getStaticPaths
layouts/components/styles
navigation/footer/search/tags/RSS/sitemap
i18n strings and locale switching
editor allowlists/forms
scripts/tests/docs/redirects
```

Use repository-wide `rg` for the feature name, route segment, collection key, labels in
both languages, type names, and imports. Preserve similarly named development tooling
unless it belongs to the removed public feature.

## Validation matrix

| Change                                 | Minimum focused validation                                                                                                               |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Markdown/MDX content                   | `npm run lint`; relevant locale page; build if deployment-bound                                                                          |
| Astro page/component/layout            | `npm run lint`, `npm run build`                                                                                                          |
| TypeScript library                     | `npx tsc --noEmit` plus focused tests                                                                                                    |
| Navigation/i18n/root redirect          | `npm run test:language-routing`, build                                                                                                   |
| Route parser/identity/endpoints/splits | `npm run test:route-logic`, `npm run validate:routes`, build                                                                             |
| Route importer                         | Dry-run preview, body/manual-field preservation inspection, Route tests                                                                  |
| Route/map CSS                          | Desktop and narrow mobile maps, closed-loop marker overlap, light/dark                                                                   |
| Media parser/updater                   | `npm run test:media-update`, dry-run, manual-field diff, build                                                                           |
| Manual translator                      | `npm run test:translation`, explicit script typecheck, dry-run, key-ignore check; content/schema changes also need lint/build/site-build |
| Media table CSS                        | Long Type/Status labels at desktop/mobile, both locales                                                                                  |
| Web3 Lab layout/content/metadata       | Lint/build; both locales; home/detail title, favicon, touch targets, route                                                               |
| Local editor/API                       | `npm run test:editor`, both Node syntax checks, interactive Windows smoke                                                                |
| Cloudflare/build boundary              | Build, `dist` secret/editor scan, inspect `_routes.json`                                                                                 |
| Feature removal                        | Repository-wide stale-reference searches plus build                                                                                      |
| Documentation only                     | Prettier/check formatting, verify every named path/command exists                                                                        |

Final hygiene:

```powershell
git diff --check
git status --short
```

Remove test entries, temporary imported assets, local server processes, and generated
artifacts that do not belong in the requested change. Do not remove unrelated dirty
worktree changes; assume they belong to the user.

## Agent operating rules

- Start with `git status --short`, `package.json`, the authoritative schema, and the files
  that own the requested behavior.
- Use `rg` to locate definitions, every consumer, tests, route strings, locale labels, and
  documentation before editing.
- Treat the current dirty worktree as user-owned. Do not reset, overwrite, or reformat
  unrelated changes.
- Change the source of truth before consumers. Prefer a shared library function over
  copied parsing/fallback logic.
- Preserve manual content and unknown frontmatter by default.
- Never hide Route data defects with marker-coordinate offsets.
- Validate all external HTML, JSON, Markdown, GPX, file paths, and browser request data.
- Use backups, same-directory temporary files, and atomic rename for destructive writes.
- Keep subprocess executable and arguments separate, commands allowlisted, and
  `shell: false`.
- Do not auto-commit, push, deploy, scrape, geocode, or contact external services unless
  the requested workflow explicitly requires it.
- Do not broaden Cloudflare runtime capability while implementing a local tool.
- Run checks proportional to risk, inspect the final diff, and report limitations rather
  than weakening safety or data-integrity checks.

## Digital Garden workflow (2026-10)

This section supersedes the old homepage order and adds publication rules. Read
`docs/digital-garden.md`, `PRODUCT.md`, and `DESIGN.md` for the current workflow.

- Preserve old collections, filenames, slugs and bilingual identities. `format` is optional:
  note/guide/essay; `maturity` is optional seed/growing/evergreen. Neither requires a cover,
  description, tags or translation. Legacy technical Blog resolves to guide; other writing
  resolves to essay. Never relabel an old long article as a Note simply to fill the homepage.
- New format-bearing entries require `publication: approved`; legacy entries without
  format/publication retain existing semantics. `draft: true` always excludes an entry.
  Keep detail paths, indexes, tags, alternates, search and RSS aligned with this rule.
- The GitHub repository is PUBLIC. Private Inbox and prepared packages MUST be outside it.
  `.env.content` configures a local path and is ignored. Never enumerate an entire Vault.
  Tools accept one explicit Markdown file and referenced images only. Do not add private
  assets to public/ or src/assets/photos/, which are public by design.
- `content:new` creates a private Note. `content:prepare` creates a new external review
  package without changing its source. `content:check` checks metadata/links/images and
  flags possible credentials. `content:approve --confirm` explicitly promotes the reviewed
  article and referenced images; it does not commit, push, send email or deploy. Images
  are encoded as WebP with EXIF removed. Existing slugs/files are protected from overwrite.
- AI editing belongs to an explicit Codex conversation over the chosen file. Preserve code,
  factual qualifications, uncertainty and author voice. List unverified claims in review.md;
  do not manufacture experiences, findings or inferred personal details. Secret heuristics
  are advisory coverage, not a guarantee that a document is safe to publish.
- npm prebuild runs the draft-resource guard. Draft images/MDX imports can be compiled even
  without routes, so guard them before Astro runs. A hidden route/noindex does not protect
  Git history or public assets. Existing tracked placeholder drafts are not private storage.
- Homepage order: identity + Notes (随记), selected long writing led by blog construction,
  published projects when present, library, life photography and activities.
  The Notes entry point remains visible with an honest empty state until a first note exists.
  HeroSection receives the latest published note in the current locale from getWriting;
  never manufacture a dated note from static focus copy. `src/data/now.ts` remains on /now.
  NoteCard renders a plain-text/image preview on the homepage and Markdown in the Notes feed.
  note-preview.ts uses the existing Markdown parser, excludes HTML/comments/code blocks from
  previews, and accepts root-relative or HTTP(S) preview images only. Keep relative source
  images in Astro's full content renderer. Order by original date, not updated or build time.
- Writing formats live at /blog/formats/{note,guide,essay}; old /blog/topics/* stay intact.
  Notes have no TOC/sidebar; Guides/Essays reuse tested long reading controls.
  Public Chinese labels now say 随记; the stored enum and old URLs remain note.
  Chinese notes may publish independently; do not manufacture English copies or require
  translation. RSS continues to include published Notes under the existing Writing policy.
  Mobile-independent publishing is not connected yet. Pages CMS is a researched option in
  docs/digital-garden.md, pending the author's workflow choice. Do not expose the local
  editor or claim that adding front-end Notes UI enables phone publishing.
- This request requires separate confirmation before Git commit, branch push or PR creation;
  never automatically push main or merge. Cloudflare production configuration is unchanged.
- Test content imports in temporary external Inbox/repository fixtures. Test privacy against
  production output, and remove synthetic articles/assets before the final deliverable.


### October 2026 design and verification contract

- Treat `DESIGN.md` as the human-readable visual authority, `.impeccable/design.json` as
  its machine-readable counterpart, and `src/styles/global.css` / `lab.css` as the runtime
  tokens. `design-system/zoran-journal/MASTER.md` records the reconciled UI UX Pro Max
  research. Keep the final low-saturation scroll palette; do not restore earlier fixed green
  or burgundy palettes or the research tool's unrelated Brutalism layout.
- Home is an author index with a full-width name; Writing is a browsable reference list;
  Life is led by a real photograph; About pairs a portrait with open text; Projects links
  actual practice; Lab is an explicitly staged learning space. Share type, colour, spacing
  and interactions while preserving these different compositions.
- `public/fonts/newsreader-regular.ttf` is self-hosted under SIL OFL; retain the adjacent
  license and attribution. Use the exact installed family names `Inter Variable` and
  `JetBrains Mono Variable`. Chinese display text uses the documented serif fallbacks.
  Do not add a font CDN or replace the display font with an unlicensed download.
- Display/copy comes from real content. Blog construction remains the lead selection.
  Its historical Hugo guide is labelled as an early construction record in Projects;
  the current site is Astro. Keep article titles verbatim even when mobile wrapping
  exceeds a landing-page headline heuristic.
- Format and topic navigation are separate routes, not combinable live filters.
  `languageCounterpart()` preserves a format or topic route when switching languages.
- `src/lib/markdown/heading-levels.mjs` normalizes legacy Markdown that starts with H1
  to H2+ at render time. Source Markdown, heading IDs and translation keys stay intact.
  Each built page has exactly one H1. Reading width is 42rem, with desktop side contents
  and mobile disclosure; code/tables scroll inside the reading column.
- `src/data/now.ts` owns both languages of the homepage's current-learning copy.
  `LAB_CURRENT_FOCUS_KEY` chooses its linked published Lab entry. Update them together
  when the author actually changes learning stage; future plans remain labelled planned.
- Life sections share `LifeNavigation`. Media filtering updates the visible item count
  and `aria-pressed`; photo lightbox retains focus and keyboard controls. Route geometry,
  source GPX and route statistics remain owned by the existing map modules.
- Review actual production preview as well as development. Check 1440px desktop, 768px
  tablet and 390px phone, English/Chinese, light/dark, long titles and real images. Check
  search, Escape/focus, mobile menu, code copy, contents, media filters, lightbox, route
  selection and RSS copying. Build-time checks do not prove third-party email delivery.
- `.taste-skill/direction-notes.md` records design decisions and deliberate inspector
  exceptions. `.taste-skill/before`, `round-*` and `.impeccable/review` are ignored local
  screenshots/review evidence. Do not claim that picture/video/motion quotas passed
  when they were intentionally waived for this reading site.
- Preserve unrelated user edits. At the beginning of this redesign, `src/content/media.md`
  already contained two new movie rows; the redesign preserves those changes.

### Scroll atmosphere and section motion (current design)

- User direction: viewport-wide moving light points, very pale scroll-driven gradients,
  and different section effects, especially on the homepage. No burgundy. Main gradient:
  #eef4fa -> #f3f0f8 -> #faf1ed -> #f9f6ed. Stable reading/control colours live in global.css.
- ScrollAtmosphere.astro is mounted once by each document layout. AmbientLights.astro
  generates 108 deterministic SVG points in 9 groups across the fixed viewport, not a
  hero-only ornament. No React/Canvas/WebGL or new animation dependency is required.
- src/lib/scroll-atmosphere.ts owns pure interpolation and page/section progress. The
  shared controller batches geometry reads, smooths with a 140ms time constant and
  schedules frames only while scroll state needs updating. Native CSS animates light
  groups; do not add a perpetual JavaScript render loop.
- SectionAtmosphere has lines, light and orbit variants. Add scene-section to its parent
  to isolate the negative decorative layer. Selected writing uses lines; LifeFeature uses
  light; actual project sections and Lab home use orbit. Read-mode paragraphs stay static.
- System reduced motion is respected. Decoration is aria-hidden, pointer-events:none,
  outside normal layout.
  Without JavaScript it stays static and content remains visible. Print hides all effects.
- Pause section loops offscreen, all loops on hidden tabs, and resume correctly after
  back/forward cache restoration. Releasing the page disconnects observers/listeners.
  Phone layouts reduce point density and movement, and keep all content actionable.
- Checks: npm run test:atmosphere (bounds, continuous colour, text contrast with light-point
  overlay), npm run lint, npm run build, npm run test:site-build, git diff --check.
  Current user requested code/build checks only and will inspect locally; no final browser
  or performance pass is implied by these tests. Do not deploy or push without authorization.

### Day / dusk / night theme lifecycle

- src/lib/theme.ts owns theme persistence, OS preference, and the 1800ms sunset/dawn
  timeline. Navigation calls initTheme once. ThemeScript remains a tiny synchronous
  pre-paint bootstrap; both validate stored values and tolerate unavailable localStorage.
- ScrollAtmosphere renders day, dusk, night and a separate solar disc. Its scroll controller
  writes both day/night gradient stops; CSS or theme animations choose opacity. Do not
  restore the old SMIL sun, pseudo-element wash or an independent theme timeout there.
- Theme switching uses three bounded Web Animations (night opacity, dusk opacity, sun
  transform/opacity). Commit text/control theme at 62% of sunset or 38% of dawn.
  The sun must remain separate from the faint particle SVG, so its brightness is independent.
- Read active.target when toggling during a transition. Repeated clicks finish/cancel the
  current sequence and apply the latest request; no stale timer may flip it back. On hidden
  tabs, pagehide or reduced-motion changes, settle the target and release animation work.
  Theme button aria-pressed mirrors the committed dark state. Lab stays independently dark.
- test:theme covers sequence completion, reverse playback, repeated clicks, reduced motion,
  visibility/navigation cancellation, storage restrictions and the pre-paint bootstrap.
- test:atmosphere reads actual CSS tokens and particle intensity, including dark star peaks,
  rather than hardcoding an old palette. A failed contrast test requires a colour/intensity
  fix, never a lower threshold. This checks stable scroll colours, not every sunset frame.

### Karpathy Guidelines maintenance pass

- Read and apply the installed karpathy-guidelines SKILL.md: explicit success criteria,
  minimum needed implementation, surgical edits, and testable completion. Do not rewrite
  working content/import/translation code just to increase the number of changed files.
- Homepage lettering now uses the bounded ping-pong introduction documented below.
  Measure glyph tops once after fonts load, animate transforms, and cancel motion on
  preference/visibility changes. Keep the complete name available without JavaScript.
- BaseLayout caches the comet element and batches scroll indicator writes in animation
  frames; use shared scrollProgress instead of another clamp implementation.
- RouteMap / RoutePostLayout use --line and --surface. Removed legacy --border-color and
  --surface-color references had no definitions; preserve real route geometry and statistics.
- Static generation builds each ambient point once. Stars and floating light groups share
  visibility/reduced-motion lifecycle. Avoid permanent will-change and unnecessary observers.
- Full checks for this maintenance pass: lint, targeted script typecheck, test:theme,
  test:atmosphere, test:editorial, test:content, test:language-routing, test:route-logic,
  validate:routes, test:translation (mocked), test:media-update (fixtures), test:editor,
  build, test:site-build, and diff whitespace. Browser and production checks remain with
  the user as requested. Do not claim measured rendering performance from code inspection.


## Homepage collections and travel journal (2026-10-24)

The homepage keeps the existing introduction, current TypeScript focus, selected
writing and conditional projects, followed by LibraryShelf, LifeFeature and
HomeActivities. The visual reference is Maggie Appleton's separation of writing and
personal collections; preserve Zoran's own pale scroll gradients, full-screen light
points, typography and day/dusk/night transition.

- Library uses only books already recorded in `media.md`; never fabricate reading
  dates, reviews, authorship or new books to fill a layout.
- LifeFeature is a landscape image with an adjacent travel journal and two other
  public life entries. The Sichuan article is found within published localized writing;
  its actual title, description, date and URL supply the feature. If absent, link the
  image to photography. Do not invent trips or use a non-public translated entry.
- HomeActivities takes the three newest visible localized `kind: run` routes after
  route-identity normalization. Show date, location, distance, duration and detail
  link only. It must not import MapLibre, embed route geometry/GPX URLs, preload GPX,
  or instantiate preview maps. Full maps stay on the existing map/detail pages.
- Home and Life reuse these components. Library is a separate bilingual route and
  is included in LifeNavigation and the Garden directory on both desktop and mobile.
- On narrow screens the photo/journal and running/film columns stack in DOM order;
  book/poster grids reduce to two columns. Keep long original titles, visible metadata,
  keyboard focus and reduced-motion behavior.
- New code checks are `test:media-list` and collection assertions in `test:site-build`.
  Validation remains code/build only at the user's request. No current screenshot or
  browser-performance approval is implied by the earlier historical browser record.

## Personal wordmark, navigation and profile (2026-10-24)

This section supersedes earlier references to pointer-driven hero lettering, the
compact mobile menu and visible film viewing dates.

### Mobile layout and typography update (2026-10-25)

- Typography is defined in `src/styles/global.css` and DESIGN.md frontmatter.
  The supplied `Canela-Regular.otf`, `CanelaDeck-Regular.otf` and
  `CanelaText-RegularNo2.otf` serve display, title and English body roles at 400.
  Do not reference missing Light/Medium files. Noto Serif SC supplies Chinese title
  glyphs; system Chinese sans supplies body text; Lato/system sans supplies UI and data.
  `--font-title-leading`, `--font-title-tracking` and `--font-prose-leading` have locale
  overrides. Keep Chinese titles uncompressed and avoid synthetic bold display type.
- Below 640px, homepage section headings, descriptions and collection links stack.
  Keep the book shelf in two columns and the existing motion/background preferences.
  `LifeFeature.astro` owns the photo + location/date + featured title/summary group,
  followed by a separate recent-reflections list. The photo/title both open the article;
  the collection link follows the complete section. This component is shared with Life.
- The mobile toolbar is sticky. The native dialog temporarily receives the existing
  toolbar node, preserving its search/theme/language listeners and original geometry.
  Reserve the header height before moving it. Animate only `.garden-mobile__body`:
  320ms entry from the right, 240ms exit. Its content scrolls below the toolbar.
  The same menu button becomes a thin X, with an updated accessible label.
  Keep six mobile links: Blog, Essays, Library, Photography, Now and About. The desktop
  directory contains the first four; Now/About remain in its toolbar. Essays links to
  `/blog/formats/essay`, the existing cross-collection essay index. Other sections remain in their collection
  navigation and the full two-column footer directory, which is visible on phones.
  Language switching appears once, in the toolbar; scale the logo on narrow phones
  instead of hiding or duplicating the language control.
  Restore the toolbar, original root/body overflow and header height synchronously on
  close/pagehide; a queued native close event must not dismantle a reopened menu.
  Resize to desktop closes immediately. Reduced motion skips or finishes the motion.
- `RoutePostLayout.astro` separates date/location (`route-context`) from available
  numeric metrics (`route-facts`). The metric grid derives its column count from actual
  formatted values. No placeholder fifth cell or clipped rounded statistics box.
  Preserve route identity, dates, GPX processing, map and splits without alteration.
  The Markdown supplies the story heading; do not add another STORY label. Remove only
  the first heading's excess top margin and underline, keeping later Markdown styling.
- Checks for this surface: `npm run test:mobile-menu`, `npm run lint`, `npm run build`,
  `npm run test:site-build`, `npm run test:route-logic`,
  `npm run test:language-routing`, `npm run test:atmosphere` and `git diff --check`.
  Mobile-menu tests run the actual component script with DOM/animation doubles;
  they cover transitions and restoration, not browser layout or native focus trapping.
  User-requested acceptance remains code/build only; the user checks actual rendering.

### Shared identity and content behavior

- `GardenMark.astro` renders **zoran** in lowercase with two three-leaf clusters
  attached above its first and last letters like small antlers. The full word stays
  visible on phones. Leaves retain the existing green and never animate, including
  hover/focus. Only the word is magenta, using the theme-specific `--brand-magenta`.
  The current site uses the already supplied Canela Regular font in `public/fonts`.
  Keep font family roles synchronized with the DESIGN.md typography tokens.
- `HeroSection.astro` currently keeps the accessible H1 `Zoran` visible by default. A white
  ping-pong ball enters from the upper left, lands on each glyph in reading order,
  makes a small final hop, then fades out. Each visit varies only the arc
  height and slight sideways drift; the measured landing positions stay exact.
  Measure after fonts are ready: the inline baseline marker plus Canvas text ascenders
  locate each actual glyph top. Do not substitute equal-height letter boxes or run
  geometry reads in an animation frame loop. `src/lib/name-bounce.ts` generates the
  bounded parabolic keyframes; `scripts/test-name-bounce.ts` checks landings and fade.
  Resize, hidden tabs and reduced-motion changes cancel the sequence. With scripts
  disabled or reduced motion enabled, the complete name remains and the ball is hidden.
- `Navigation.astro`: The Garden itself links to `/blog`; its adjacent native details
  summary opens the desktop directory. Directory rows contain text only. Now links
  to `/now`, About to `/about`.
  Mobile uses a native modal dialog. It temporarily contains the original `.site-nav`
  toolbar; only `.garden-mobile__body` slides in from the right and scrolls. Keep
  the toolbar at the same position and restore it synchronously when closing.
  Preserve native focus containment/Escape, explicit close,
  focus restoration, body scroll restoration, resize closure, search, language-cookie
  handling and theme initialization. Narrow phones retain the header language link;
  do not reintroduce a second English link inside the drawer.
- `GardenGlyph.astro` is shared by directory entries and running rows: a circle with
  four inward arcs crossfades to four pointed petals on hover/focus. Touch navigation
  never depends on hover. Reduced motion swaps the states without spatial animation.
- Homepage labels: BLOG, 点点滴滴, 在路中去感受; footer heading 联络.
  All major titles use the shared ink in both themes. Canela, Canela Deck
  and Noto Serif SC distinguish sections through letterforms,
  size and spacing. Keep mobile paragraphs grouped under clear headings.
- `SiteFooter.astro` uses one outlined elliptical article-subscription link, icon-only
  social links with accessible names, and an envelope that opens on hover/focus.
  It retains the real subscription page, mailto destination and licence. Do not restore
  the removed motivational footer sentence or decorative arrow links in the directory.
  The full directory appears in two columns after copyright on phones, with 44px targets.
- `/now` derives a chronological timeline from published localized writing and visible,
  identity-normalized routes. Article timestamps mean publication dates; route dates
  mean activity dates. The caption states this distinction. `src/data/now.ts` owns
  the manually maintained current learning focus. Do not invent dated life events.
- `src/data/profile.ts` owns the public bilingual CV summary used by About. The supplied
  private PDF is not a public asset. Use sector descriptions for employers; omit client
  names, internal systems, asset counts, vulnerability details and private contact data.
  Keep degree status/expected completion explicit; do not upgrade learning into expertise.
- Media cards retain viewing dates in `data-watched-date` for internal ordering, with
  no visible viewing date or Douban/IMDb action label. Covers/titles are the actual
  links. Pointer hover gently blurs neighbouring covers; keyboard focus keeps titles
  readable and all links available. Book source labels remain explicit.
- TV metadata resolves against a **unique** imported catalogue record by ID, URL, or
  normalized name/year. Manual values win. First-season aliases may omit Season 1;
  later season numbers must remain distinct. Ambiguous matches stay unmatched.
  `test:media-list` checks metadata inheritance, ambiguity, category filtering and all
  current TV/game cached files. Cache all games in the normal manual `media:images` run.
- Validation for this change is code/build only by user request. No browser, screenshot
  or production acceptance is implied. Do not deploy or push as part of this pass.
