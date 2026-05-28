import { defineCollection, z } from "astro:content";

const pages = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    navLabel: z.string(),
    seoTitle: z.string(),
    description: z.string(),
    order: z.number(),
    published: z.boolean(),
  }),
});

export const collections = { pages };
