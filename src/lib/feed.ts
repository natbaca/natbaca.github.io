import { getCollection, render, type CollectionEntry } from "astro:content";
import {
  fetchBlueskyPostByUrl,
  fetchBlueskyPosts,
  type BlueskyPost,
} from "./bluesky";

export type BlogFeedItem = {
  kind: "blog";
  date: Date;
  post: CollectionEntry<"blog">;
  Content: Awaited<ReturnType<typeof render>>["Content"];
};

export type BlueskyFeedItem = {
  kind: "bluesky";
  date: Date;
  post: BlueskyPost;
};

export type FeedItem = BlogFeedItem | BlueskyFeedItem;

/**
 * Builds a single chronological feed of blog posts + Bluesky posts.
 * - Blog entries come from `src/content/blog`
 * - Curated Bluesky URLs come from `src/content/bluesky` (optional date override)
 * - Author posts are fetched via paginated public API and deduped against curated ones
 */
export async function getCombinedFeed(): Promise<FeedItem[]> {
  const [blogEntries, curatedEntries, blueskyFeed] =
    await Promise.all([
      getCollection("blog"),
      getCollection("bluesky").catch(() => []),
      fetchBlueskyPosts(),
    ]);

  if (blueskyFeed.error) {
    throw new Error(
      "Unable to refresh the Bluesky feed; keeping the previous deployment."
    );
  }

  const recentPosts = blueskyFeed.posts;

  const blogItems: BlogFeedItem[] = await Promise.all(
    blogEntries.map(async (post) => ({
      kind: "blog" as const,
      date: post.data.updatedDate ?? post.data.publishedAt,
      post,
      Content: (await render(post)).Content,
    }))
  );

  const curatedPosts = (
    await Promise.all(
      curatedEntries.map(async (entry) => {
        const post = await fetchBlueskyPostByUrl(entry.data.url);
        if (!post) return null;
        return {
          kind: "bluesky" as const,
          date: entry.data.publishedAt ?? post.createdAt,
          post,
        } satisfies BlueskyFeedItem;
      })
    )
  ).filter((item): item is BlueskyFeedItem => item !== null);

  const curatedUris = new Set(curatedPosts.map((item) => item.post.uri));

  const recentItems: BlueskyFeedItem[] = recentPosts
    .filter((post) => !curatedUris.has(post.uri))
    .map((post) => ({
      kind: "bluesky" as const,
      date: post.createdAt,
      post,
    }));

  return [...blogItems, ...curatedPosts, ...recentItems].sort(
    (a, b) => b.date.valueOf() - a.date.valueOf()
  );
}
