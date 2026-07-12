import { defineCollection, z } from "astro:content";

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  author: z.string().default("Zoran"),
  lang: z.enum(["zh-CN", "en"]).default("zh-CN"),
  translationKey: z.string().optional(),
  cover: z
    .object({
      src: z.string(),
      alt: z.string().optional(),
      caption: z.string().optional(),
    })
    .optional(),
  // Hugo compatibility — optional extras that may appear in migrated frontmatter
  categories: z.array(z.string()).optional(),
  ShowToc: z.boolean().optional(),
  TocOpen: z.boolean().optional(),
  ShowWordCount: z.boolean().optional(),
  ShowReadingTime: z.boolean().optional(),
  ShowBreadCrumbs: z.boolean().optional(),
  ShowShareButtons: z.boolean().optional(),
  word_count: z.number().optional(),
  reading_time: z.number().optional(),
});

const blogCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    featured: z.boolean().default(false),
  }),
});

const researchCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    status: z
      .enum(["in-progress", "completed", "archived"])
      .default("completed"),
    source: z.string().optional(),
  }),
});

const projectsCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    repo: z.string().url().optional(),
    demo: z.string().url().optional(),
    tech: z.array(z.string()).default([]),
    status: z.enum(["active", "completed", "archived"]).default("completed"),
    icon: z.string().optional(),
  }),
});

const toolsCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    category: z
      .enum(["cli", "gui", "saas", "library", "hardware"])
      .default("cli"),
    url: z.string().url().optional(),
    pricing: z
      .enum(["free", "freemium", "paid", "open-source"])
      .default("free"),
  }),
});

const homelabCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    area: z
      .enum([
        "network",
        "server",
        "security",
        "automation",
        "storage",
        "observability",
      ])
      .default("network"),
    status: z
      .enum(["planned", "building", "running", "retired"])
      .default("running"),
    tech: z.array(z.string()).default([]),
  }),
});

const gearCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    category: z
      .enum([
        "computer",
        "camera",
        "phone",
        "audio",
        "network",
        "edc",
        "sport",
        "other",
      ])
      .default("other"),
    status: z
      .enum(["using", "testing", "retired", "wishlist"])
      .default("using"),
    rating: z.number().min(0).max(5).optional(),
    brand: z.string().optional(),
  }),
});

const photosCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    location: z.string().optional(),
    camera: z.string().optional(),
    lens: z.string().optional(),
    film: z.string().optional(),
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string().optional(),
          caption: z.string().optional(),
        }),
      )
      .default([]),
  }),
});

const routePointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  name: z.string().optional(),
});

const routeFields = {
  routeId: z.string().regex(/^route-[a-f0-9]{12}$/),
  kind: z
    .enum(["run", "hike", "ride", "travel", "photo-walk"])
    .default("travel"),
  location: z.string().default("Unknown"),
  distance: z.number().nonnegative(),
  duration: z.number().int().nonnegative().optional(),
  elevationGain: z.number().optional(),
  gpx: z.string().regex(/^\/routes\/.+\.gpx$/i),
  displayGeometry: z
    .string()
    .regex(/^\/routes\/.+\.geojson$/i)
    .optional(),
  published: z.boolean().default(true),
  start: routePointSchema.optional(),
  end: routePointSchema.optional(),
  coordinates: routePointSchema.optional(),
  mapZoom: z.number().min(1).max(18).optional(),
  accent: z.string().optional(),
  photos: z
    .array(
      z.union([
        z.string(),
        z.object({
          src: z.string(),
          alt: z.string().optional(),
          caption: z.string().optional(),
        }),
      ]),
    )
    .default([]),
  metadata: z.record(z.unknown()).optional(),
};

const routesCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend(routeFields).extend({
    cover: z
      .union([
        z.string(),
        z.object({
          src: z.string(),
          alt: z.string().optional(),
          caption: z.string().optional(),
        }),
      ])
      .optional(),
  }),
});

const essaysCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    author: z.string().default("Zoran"),
    featured: z.boolean().default(false),
  }),
});

// ── Media collections ──
// Write minimal frontmatter (title, type, status, date).
// Run `npm run enrich` before build to auto-fetch metadata from APIs.
// The enrich script writes enriched data back into these markdown files.

const mediaBaseSchema = z.object({
  title: z.string(),
  originalTitle: z.string().optional(),
  year: z.number().optional(),
  rating: z.number().min(0).max(5).default(0),
  poster: z.string().optional(),
  cover: z.string().optional(),
  genres: z.array(z.string()).default([]),
  country: z.string().optional(),
  director: z.string().optional(),
  author: z.string().optional(),
  developer: z.string().optional(),
  publisher: z.string().optional(),
  runtime: z.string().optional(),
  language: z.string().optional(),
  status: z
    .enum([
      "watched",
      "watching",
      "want-to-watch",
      "completed",
      "playing",
      "want-to-play",
      "read",
      "reading",
      "want-to-read",
      "dropped",
      "on-hold",
    ])
    .default("watched"),
  watchedDate: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  summary: z.string().optional(),
  draft: z.boolean().default(false),
  featured: z.boolean().default(false),
  slug: z.string().optional(),
  lang: z.enum(["zh-CN", "en"]).default("zh-CN"),
});

const moviesCollection = defineCollection({
  type: "content",
  schema: mediaBaseSchema,
});

const tvCollection = defineCollection({
  type: "content",
  schema: mediaBaseSchema.extend({
    seasons: z.number().optional(),
  }),
});

const booksCollection = defineCollection({
  type: "content",
  schema: mediaBaseSchema.extend({
    isbn: z.string().optional(),
    pages: z.number().optional(),
  }),
});

const gamesCollection = defineCollection({
  type: "content",
  schema: mediaBaseSchema.extend({
    platform: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
  essays: essaysCollection,
  research: researchCollection,
  projects: projectsCollection,
  tools: toolsCollection,
  homelab: homelabCollection,
  gear: gearCollection,
  photos: photosCollection,
  routes: routesCollection,
  movies: moviesCollection,
  tv: tvCollection,
  books: booksCollection,
  games: gamesCollection,
};
