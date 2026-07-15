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

const labCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    type: z.enum(["learning", "build", "security", "architecture", "note"]),
    track: z.enum(["integration", "backend", "product-security", "solutions"]),
    status: z.enum([
      "planned",
      "building",
      "prototype",
      "testnet",
      "security-review",
      "completed",
      "blocked",
      "revised",
      "archived",
    ]),
    verificationStatus: z.enum([
      "unverified",
      "documented",
      "tested",
      "verified",
      "theoretical",
    ]),
    project: z.string().optional(),
    week: z.number().int().min(1).max(24).optional(),
    technologies: z.array(z.string()).default([]),
    candidateStack: z
      .array(
        z.object({
          group: z.enum(["server", "onchain", "data", "contracts", "network"]),
          items: z.array(z.string()).min(1),
        }),
      )
      .default([]),
    securityLevel: z.enum(["educational"]).default("educational"),
    testnetOnly: z.boolean().default(false),
    audited: z.boolean().default(false),
    realFunds: z.boolean().default(false),
    featured: z.boolean().default(false),
    currentPhase: z.string().optional(),
    lastVerified: z.coerce.date().optional(),
    implementedFeatures: z.array(z.string()).default([]),
    knownLimitations: z.array(z.string()).default([]),
  }),
});

export const collections = {
  blog: blogCollection,
  essays: essaysCollection,
  research: researchCollection,
  projects: projectsCollection,
  photos: photosCollection,
  routes: routesCollection,
  lab: labCollection,
};
