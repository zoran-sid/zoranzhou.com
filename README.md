# Zoran Zhou Blog — Astro

## 🚀 Project Structure

```
src/
├── components/        # Reusable UI components
│   └── ui/            # Primitive UI elements
├── content/           # Content collections (Markdown/MDX)
│   ├── blog/          # Blog posts
│   ├── research/      # Research articles
│   ├── projects/      # Project showcases
│   └── tools/         # Tool reviews & guides
├── layouts/           # Page layout wrappers
├── lib/               # Utilities, constants, helpers
├── pages/             # File-based routing
│   ├── blog/
│   ├── research/
│   ├── projects/
│   ├── tools/
│   └── tags/
└── styles/            # Global styles
public/                # Static assets (served as-is)
```

## 🧞 Commands

| Command           | Action                                       |
| :---------------- | :------------------------------------------- |
| `npm install`     | Install dependencies                         |
| `npm run dev`     | Start dev server at `localhost:4321`         |
| `npm run build`   | Build production site to `./dist/`           |
| `npm run preview` | Preview production build locally             |
| `npm run lint`    | Type-check with `astro check`                |
| `npm run format`  | Format with Prettier                         |

## 🛠️ Stack

- **Framework**: Astro 5
- **Language**: TypeScript (strict)
- **Styling**: Tailwind CSS v4
- **UI Components**: React 19
- **Content**: MDX with rehype plugins
- **Syntax Highlighting**: Shiki via rehype-pretty-code
- **Diagrams**: Mermaid via rehype-mermaidjs
- **Deployment**: Cloudflare Pages

## Apple Health running data

1. Export Apple Health data on iPhone: Health app → profile photo → Export All Health Data.
2. Extract the archive and copy `apple_health_export/export.xml` into a local working folder outside `public/`.
3. Import running workout summaries:

```bash
npm run import:apple-health -- path/to/export.xml --activity=running
```

The command writes `src/data/apple-health-workouts.json`. Apple Health's main `export.xml` contains workout summaries but does not reliably include GPS route geometry. Export route files separately as GPX/FIT/TCX, convert to GPX when needed, and place only the publishable route under `public/routes/`. Never commit the complete Health export because it contains sensitive health data.
