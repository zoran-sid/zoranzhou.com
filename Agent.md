# zoranzhou.com Agent Guide

## Architecture

This repository is an Astro 5 static bilingual website. The two public locales are
`zh-CN` and `en`. TypeScript, MDX, Tailwind CSS 4, MapLibre GL, and Cloudflare Pages
provide the main runtime and deployment layers. There is no production database and no
general production application server.

The repository also contains two explicit local maintenance programs:

- `scripts/media-update.ts` updates the static Media Markdown file.
- `tools/content-editor/` edits repository content from a loopback-only browser UI.

Neither program belongs to the production website runtime.

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
```

### Runtime boundaries

| Surface           | Entry point                       | Network/runtime                     | May write repository files?            |
| ----------------- | --------------------------------- | ----------------------------------- | -------------------------------------- |
| Static site       | `src/pages/[locale]/`             | Browser, from `dist/`               | No                                     |
| Root redirect     | `functions/index.ts`              | Cloudflare Pages Function, `/` only | No                                     |
| Astro development | `scripts/run-astro.mjs`           | Local Node + Astro dev server       | No content writes                      |
| Media update      | `scripts/media-update.ts`         | Manually started local Node process | Only its selected Media output         |
| Content editor    | `tools/content-editor/server.mjs` | Local Node, `127.0.0.1` only        | Only explicit allowlists               |
| Route import      | `scripts/import-route.ts`         | Manually started local Node process | Route content after preview/validation |

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
| `src/styles/global.css`             | Global tokens, typography, shared layout, and map styling                |
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

| Field            | Type/default                     | Meaning                                      |
| ---------------- | -------------------------------- | -------------------------------------------- |
| `title`          | required string                  | Visible title                                |
| `description`    | optional string                  | Summary and metadata description             |
| `date`           | required, coerced to `Date`      | Publication date                             |
| `updated`        | optional, coerced to `Date`      | Last meaningful content update               |
| `tags`           | string array, default `[]`       | Tags, related-content matching, tag pages    |
| `draft`          | boolean, default `false`         | Excluded from public lists/details when true |
| `author`         | string, default `Zoran`          | Byline and structured metadata               |
| `lang`           | `zh-CN` or `en`, default `zh-CN` | Entry locale                                 |
| `translationKey` | optional string                  | Connects ordinary translated entries         |
| `cover`          | optional `{src, alt?, caption?}` | Standard cover image                         |

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
Projects, Media, Photos, Map, Web3 Lab, Tags, RSS, search data, and locale 404 pages.

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

`BlogPostLayout.astro` computes headings, word count, reading time, and an `h2`/`h3` TOC.
It finds related entries in the same collection and locale using shared tags, calculates
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
- most detail pages return to the target collection listing when no safe translated slug
  can be proven;
- Route details use stable `routeId` to locate the corresponding translated Route entry.

Do not create a target-locale URL by blindly reusing an ordinary source slug. That can
produce a statically nonexistent page.

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
entries remain part of the shared search index and sitemap. The personal-site hero has a
Web3 Lab entry button on wider screens; below the mobile breakpoint it is hidden from the
hero and the `WEB3 LAB` entry remains available in the mobile navigation. Do not remove
one entry point without proving that the other remains reachable and localized.

The Lab has a fixed dark visual system rather than inheriting the personal-site theme.
Its CSS tokens start with a `#05070d` background and cyan, violet, magenta, green, and
amber signals. It uses Inter, JetBrains Mono, and an explicit CJK font stack. Preserve
the `lab-*` class namespace, grid/beam/noise backdrop, translucent sticky header, and
isolated focus/selection treatments; do not move these rules into the global theme.

The home-page section order is Hero, technical tracks, featured build, learning route,
security cases, About, and the Lab footer. Detail pages use a large entry header and
boundary badges followed by a sticky facts rail, evidence notice, and prose column.
Cards with `data-lab-spotlight` track the pointer only for a fine pointer when reduced
motion has not been requested.

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

The main site continues to use `/favicon.png` and `/apple-touch-icon.png`. The Lab icon
matches the header's cyan, violet, and magenta diamond mark. When the mark changes,
update the CSS mark, SVG source, 64 px fallback, and 180 px touch icon together; do not
silently reuse the portrait favicon.

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

### Hero route and execution preview

The hero route replaces the former four-box promotional list (`BUILDING IN PUBLIC`,
`STATIC TECH LAB`, `TESTNET PROJECTS`, and `NO REAL FUNDS`). Do not restore generic
promotional boundary cards. `copy.hero.route` presents a concrete engineering sequence:

```text
TypeScript typed events
  -> viem RPC log decoding
  -> Solidity replay protection
  -> Foundry fuzz and invariant tests
  -> Sepolia verification and published evidence
```

The hero code panel is a static blockchain execution preview, not an executable console.
Its accessible label must state that commands are not run. The visual contract is:

- keep only the compact, technically meaningful `ReplayGuard` lines needed to show
  authorization, replay protection, and event recording;
- keep the current example within its ten numbered lines; do not expand the hero into a
  full source-file viewer;
- use the blockchain test command
  `forge test --match-test testReplayProtection -vvvv`;
- show `READY`/`就绪`, not an instruction to press Enter;
- do not show `npm run build`, `cat ReplayGuard.sol`, `等待回车`, `Press Enter`, or a
  separate low-value prompt-only line;
- use the cursor and status signal to suggest a pending execution state without claiming
  that a command is actually running;
- allow source-code horizontal scrolling and hide the path before shrinking command text
  below a readable size on mobile.

The concern labels remain `ACCESS CONTROL`, `ERC-20`, `REPLAY GUARD`, and `EVM TRACE`.
They describe the code being previewed; do not replace them with generic build labels.

Cursor and status pulse animations run only when the media query permits motion
(`prefers-reduced-motion: no-preference`). The reduced-motion branch must suppress them.
The preview must never contain secrets, live credentials, or a UI that implies remote
command execution.

### Fishbone learning route

The learning progress visualization is an ordered fishbone route driven by
`copy.learning.evidence`, not a generic checklist. Its five steps are specific and
bilingual:

1. TypeScript: typed onchain event ingestion.
2. viem: RPC log decoding and ERC-20 normalization.
3. Solidity: a replay-protected event registry.
4. Foundry: unit, fuzz, and invariant tests.
5. Sepolia: deployment, transaction hashes, and a verification report.

`currentLearningStage` is a zero-based index and currently remains `0` (TypeScript) until
evidence supports advancing it. Exactly one item may have
`data-state="current"` and `aria-current="step"`; all other steps remain pending until
evidence supports a state change. Current state is expressed with text and ARIA as well
as cyan `#47e7ff`; pending nodes use the readable gray fishbone token `#718198`. Maintain
their contrast against the Lab background and never style a pending stage so that it
appears completed.

On wide containers, the five cards alternate above and below a horizontal spine. Branch
lines occupy only the gap between a card edge and the spine: they must be clipped beneath
the card layer and must never cross into or through a stage card. When the learning-route
container is narrower than `46rem`, the visualization changes to a vertical spine. The
diagonal SVG branches disappear and short horizontal connectors join the vertical spine
to each full-width card.

When the route changes, update all of the following as one bilingual change:

```text
copy.hero.route
copy.learning.evidence
copy.learning.nextGate
currentLearningStage and its evidence-backed state
desktop and narrow-container geometry
```

Do not replace the concrete technology/outcome pairs with labels such as
`implementation`, `test results`, `security review`, or `documentation`. Those labels do
not describe an engineering route.

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

The Security section header intentionally has no generic explanatory paragraph;
`security.description` is not part of `LabCopy`. Keep concrete boundaries in the
security cards, theory notice, and entry evidence instead of restoring the removed
header copy.

Localized Lab copy lives in `src/i18n/lab.ts`. Keep English and Chinese structure,
technical order, status meaning, and accessibility labels synchronized. Lab detail
translations are paired through `translationKey`; when a safe translated entry cannot
be found, language switching returns to the target-locale Lab home rather than inventing
a translated slug.

### Responsive and motion contract

The responsive transitions are part of the design, not optional cleanup:

- below `74rem`, Hero, learning, and About move to one column while technical tracks use
  two columns;
- below `56rem`, the header becomes two rows with horizontally scrollable navigation,
  and featured-build and detail two-column layouts collapse;
- below `40rem`, routes, candidate-stack groups, track cards, and the footer become one
  column; the terminal hides its path and the security flow becomes vertical;
- the learning fishbone also responds to its own `46rem` container threshold, independent
  of the viewport breakpoints.

At each transition, verify long text in both locales, terminal overflow, fishbone
connectors, touch targets, and the detail facts rail. When the user requests reduced
motion (`prefers-reduced-motion: reduce`), disable smooth scrolling, spotlight, hover
translation, cursor blink, and continuous status animations without removing state text
or focus feedback.

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

`src/content/media.md` is the only production Media data source. It is deliberately not
an Astro content collection.

```text
src/content/media.md
  -> imported as raw Markdown by the locale Media page
  -> parseMediaList(markdown)
  -> category counts and filters
  -> responsive static table
```

`src/lib/media/list.ts` recognizes Movies, TV, Books, and Games headings in supported
English/Chinese aliases. It parses Markdown tables with escaped pipes, maps header and
status aliases, clamps ratings to the supported range, defaults absent status sensibly,
and sorts normalized records for presentation.

There are no Media detail pages and no old Media API. Do not reintroduce API fetches,
client-side databases, removed Media card implementations, or production Douban calls.

The Media table uses an explicit responsive grid. Type and Status are independent
columns. Fix truncation or alignment in the table/grid styles, not by modifying parsed
category/status data. Verify both long bilingual labels and the narrow mobile layout.

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

| Command                         | Purpose                                       | Writes content?                    | May use network?               |
| ------------------------------- | --------------------------------------------- | ---------------------------------- | ------------------------------ |
| `npm run dev`                   | Start local Astro development                 | No                                 | May load remote assets         |
| `npm run editor`                | Start loopback content manager                | Yes, through explicit user actions | PicGo only when used           |
| `npm run build`                 | Generate `dist/`                              | Generated output only              | Possibly remote image metadata |
| `npm run preview`               | Serve built static output                     | No                                 | No normal external fetch       |
| `npm run lint`                  | Astro schema/type/component check             | No                                 | No                             |
| `npx tsc --noEmit`              | Independent TypeScript check                  | No                                 | No after install               |
| `npm run format`                | Format repository-supported files             | Yes, broad mechanical rewrite      | No                             |
| `npm run media:update`          | Update Movies table                           | Yes unless dry-run/output changed  | Yes for live mode              |
| `npm run test:media-update`     | Test Media updater                            | Test artifacts only                | No expected live Douban        |
| `npm run import:routes:preview` | Preview GPX import                            | No content publish                 | No geocoding                   |
| `npm run import:routes -- ...`  | Import selected GPX into Route content        | Yes                                | Optional geocoding             |
| `npm run migrate:routes`        | Explicit Route migration                      | Yes                                | Inspect script before use      |
| `npm run validate:routes`       | Validate Route content/source consistency     | No intended content writes         | No                             |
| `npm run test:route-logic`      | Route parsing/identity/split regression tests | Test artifacts only                | No                             |
| `npm run test:language-routing` | Locale redirect/path regression checks        | Test artifacts only                | No                             |
| `npm run test:editor`           | Editor CRUD/security/runtime smoke tests      | Temporary test files, cleaned      | No external service required   |

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
3. Keep `hero.route`, `learning.evidence`, `learning.nextGate`, candidate-stack groups,
   and both locales semantically aligned.
4. Preserve the independent title, Open Graph, JSON-LD, favicon, canonical, and
   `hreflang` contract.
5. Check the header and detail return targets, terminal overflow, fishbone connector
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

| Change                                 | Minimum focused validation                                                 |
| -------------------------------------- | -------------------------------------------------------------------------- |
| Markdown/MDX content                   | `npm run lint`; relevant locale page; build if deployment-bound            |
| Astro page/component/layout            | `npm run lint`, `npm run build`                                            |
| TypeScript library                     | `npx tsc --noEmit` plus focused tests                                      |
| Navigation/i18n/root redirect          | `npm run test:language-routing`, build                                     |
| Route parser/identity/endpoints/splits | `npm run test:route-logic`, `npm run validate:routes`, build               |
| Route importer                         | Dry-run preview, body/manual-field preservation inspection, Route tests    |
| Route/map CSS                          | Desktop and narrow mobile maps, closed-loop marker overlap, light/dark     |
| Media parser/updater                   | `npm run test:media-update`, dry-run, manual-field diff, build             |
| Media table CSS                        | Long Type/Status labels at desktop/mobile, both locales                    |
| Web3 Lab layout/content/metadata       | Lint/build; both locales; home/detail title, favicon, touch targets, route |
| Local editor/API                       | `npm run test:editor`, both Node syntax checks, interactive Windows smoke  |
| Cloudflare/build boundary              | Build, `dist` secret/editor scan, inspect `_routes.json`                   |
| Feature removal                        | Repository-wide stale-reference searches plus build                        |
| Documentation only                     | Prettier/check formatting, verify every named path/command exists          |

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
