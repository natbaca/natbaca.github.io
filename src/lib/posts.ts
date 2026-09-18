import { getCollection, render, type CollectionEntry } from "astro:content";

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
