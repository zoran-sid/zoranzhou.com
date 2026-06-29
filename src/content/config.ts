import { defineCollection, z } from "astro:content";

const baseSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  date: z.coerce.date(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).default([]),
  draft: z.boolean().default(false),
  author: z.string().default("Zoran"),
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
    pricing: z.enum(["free", "freemium", "paid", "open-source"]).default("free"),
  }),
});

const essaysCollection = defineCollection({
  type: "content",
  schema: baseSchema.extend({
    author: z.string().default("Zoran"),
    featured: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
  essays: essaysCollection,
  research: researchCollection,
  projects: projectsCollection,
  tools: toolsCollection,
};
