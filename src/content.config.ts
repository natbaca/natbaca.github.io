import { defineCollection } from "astro:content";
import { z } from "astro/zod";
import { glob } from "astro/loaders";

const blog = defineCollection({
  loader: glob({
    base: "./src/content/blog",
    pattern: "**/*.{md,mdx}",
  }),
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      publishedAt: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      heroImage: image().optional(),
    }),
});

/** Curated Bluesky posts to include in the homepage feed (interleaved by date). */
const bluesky = defineCollection({
  loader: glob({
    base: "./src/content/bluesky",
    pattern: "**/*.{md,mdx,yml,yaml}",
  }),
  schema: z.object({
    url: z.string(),
    /** Optional sort date override; otherwise the post's Bluesky timestamp is used. */
    publishedAt: z.coerce.date().optional(),
  }),
});

export const collections = {
  blog,
  bluesky,
};
