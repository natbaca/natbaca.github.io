import { getCollection, render, type CollectionEntry } from "astro:content";
import type { Tag } from "../content.config";

export type RenderedPost = {
  post: CollectionEntry<"blog">;
  Content: Awaited<ReturnType<typeof render>>["Content"];
};

export const PAGE_SIZE = 10;

/** Newest first, with each post's body already rendered for inline display. */
export async function getRenderedPosts(): Promise<RenderedPost[]> {
  const posts = (await getCollection("blog")).sort(
    (a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf()
  );

  return Promise.all(
    posts.map(async (post) => ({
      post,
      Content: (await render(post)).Content,
    }))
  );
}

export const totalPages = (count: number) =>
  Math.max(1, Math.ceil(count / PAGE_SIZE));

export type TagSummary = { name: Tag; count: number; href: string };

export const tagHref = (tag: Tag) => `/tags/${tag}/`;

/** Every tag in use, alphabetical, with how many posts carry it. */
export function summarizeTags(posts: RenderedPost[]): TagSummary[] {
  const counts = new Map<Tag, number>();

  for (const { post } of posts) {
    for (const tag of post.data.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([name, count]) => ({ name, count, href: tagHref(name) }));
}

export const postsWithTag = (posts: RenderedPost[], tag: Tag) =>
  posts.filter(({ post }) => post.data.tags.includes(tag));
