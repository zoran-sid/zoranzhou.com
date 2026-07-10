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
