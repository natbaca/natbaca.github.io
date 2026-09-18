import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const TAGS = z.enum([
  "animals",
  "art",
  "books",
  "etymology",
  "folklore",
  "food",
  "history",
  "humor",
  "linguistics",
  "music",
  "philosophy",
  "sports",
]);

export type Tag = z.infer<typeof TAGS>;

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // Kept to a fixed vocabulary so the tag filter stays small and browsable
    tags: z.array(TAGS).min(1),
  }),
});

export const collections = {
  blog,
};
