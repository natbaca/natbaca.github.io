export type BlueskyExternalEmbed = {
  uri: string;
  title: string;
  description?: string;
  thumb?: string;
};

export type BlueskyImageEmbed = {
  alt: string;
  thumb: string;
  fullsize: string;
};

export type BlueskyPost = {
  uri: string;
  cid: string;
  url: string;
  profileUrl: string;
  text: string;
  lang?: string;
  displayName: string;
  handle: string;
  avatar?: string;
  createdAt: Date;
  external?: BlueskyExternalEmbed;
  images: BlueskyImageEmbed[];
};

const DEFAULT_HANDLE = "natbaca.bsky.social";
const PAGE_SIZE = 100;
/** Safety cap so a runaway cursor loop cannot hang the build. */
const MAX_PAGES = 50;

type ApiPost = {
  uri: string;
  cid: string;
  author: {
    did: string;
    handle: string;
    displayName?: string;
    avatar?: string;
  };
  record?: {
    text?: string;
    langs?: string[];
    createdAt?: string;
  };
  embed?: {
    $type?: string;
    external?: {
      uri: string;
      title?: string;
      description?: string;
      thumb?: string;
    };
    images?: Array<{
      alt?: string;
      thumb: string;
      fullsize: string;
    }>;
    media?: {
      $type?: string;
      images?: Array<{
        alt?: string;
        thumb: string;
        fullsize: string;
      }>;
      external?: {
        uri: string;
        title?: string;
        description?: string;
        thumb?: string;
      };
    };
  };
};

type FeedItem = {
  post: ApiPost;
  reason?: { $type?: string };
};

/**
 * Fetches the author's Bluesky posts via public API pagination.
 * Pass `limit` to cap results (newest first); omit/`Infinity` for full history.
 */
export async function fetchBlueskyPosts(
  handle = DEFAULT_HANDLE,
  limit: number = Number.POSITIVE_INFINITY
): Promise<{ posts: BlueskyPost[]; error: boolean }> {
  try {
    const posts: BlueskyPost[] = [];
    const seenUris = new Set<string>();
    let cursor: string | undefined;
    let pages = 0;
    const normalizedHandle = handle.replace(/^@/, "").toLowerCase();

    while (pages < MAX_PAGES && posts.length < limit) {
      const feedUrl = new URL(
        "https://public.api.bsky.app/xrpc/app.bsky.feed.getAuthorFeed"
      );
      feedUrl.searchParams.set("actor", handle);
      feedUrl.searchParams.set("limit", String(PAGE_SIZE));
      feedUrl.searchParams.set("filter", "posts_and_author_threads");
      if (cursor) feedUrl.searchParams.set("cursor", cursor);

      const response = await fetch(feedUrl);
      if (!response.ok) {
        throw new Error(`Bluesky feed request failed: ${response.status}`);
      }

      const data = (await response.json()) as {
        feed?: FeedItem[];
        cursor?: string;
      };

      const page = data.feed ?? [];
      if (page.length === 0) break;

      for (const item of page) {
        // Prefer posts authored by the actor (skip reposts of others).
        if (item.post.author.handle.toLowerCase() !== normalizedHandle) {
          continue;
        }

        const mapped = mapApiPost(item.post);
        if (!mapped || seenUris.has(mapped.uri)) continue;

        seenUris.add(mapped.uri);
        posts.push(mapped);
        if (posts.length >= limit) break;
      }

      pages += 1;
      cursor = data.cursor;
      if (!cursor) break;
    }

    return { posts, error: false };
  } catch {
    return { posts: [], error: true };
  }
}

export async function fetchBlueskyPostByUrl(
  url: string
): Promise<BlueskyPost | null> {
  const parsed = parseBskyPostUrl(url);
  if (!parsed) return null;

  try {
    const threadUrl = new URL(
      "https://public.api.bsky.app/xrpc/app.bsky.feed.getPostThread"
    );
    threadUrl.searchParams.set("uri", parsed.atUri);
    threadUrl.searchParams.set("depth", "0");

    const response = await fetch(threadUrl);
    if (!response.ok) return null;

    const data = (await response.json()) as {
      thread?: { post?: ApiPost };
    };

    return data.thread?.post ? mapApiPost(data.thread.post) : null;
  } catch {
    return null;
  }
}

export function parseBskyPostUrl(url: string): {
  handle: string;
  rkey: string;
  atUri: string;
} | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "bsky.app") return null;
    const match = parsed.pathname.match(
      /^\/profile\/([^/]+)\/post\/([^/]+)\/?$/
    );
    if (!match) return null;
    const [, handle, rkey] = match;
    return {
      handle,
      rkey,
      // Resolved later via handle; getPostThread accepts at://did/... or we resolve
      atUri: `at://${handle}/app.bsky.feed.post/${rkey}`,
    };
  } catch {
    return null;
  }
}

function mapApiPost(post: ApiPost): BlueskyPost | null {
  const postKey = post.uri.split("/").at(-1) ?? "";
  const authorHandle = post.author.handle;
  const url = `https://bsky.app/profile/${authorHandle}/post/${postKey}`;
  if (!post.uri || !post.cid || !/\/post\/[^/]+$/.test(url)) return null;

  const createdAt = post.record?.createdAt
    ? new Date(post.record.createdAt)
    : new Date(0);

  const embed = post.embed;
  const imageSource =
    embed?.images ??
    (embed?.media?.$type?.includes("images") ? embed.media.images : undefined);
  const externalSource = embed?.external ?? embed?.media?.external;

  return {
    uri: post.uri,
    cid: post.cid,
    url,
    profileUrl: `https://bsky.app/profile/${authorHandle}`,
    text: post.record?.text ?? "",
    lang: post.record?.langs?.[0],
    displayName: post.author.displayName || authorHandle,
    handle: authorHandle,
    avatar: post.author.avatar,
    createdAt,
    external: externalSource
      ? {
          uri: externalSource.uri,
          title: externalSource.title || externalSource.uri,
          description: externalSource.description,
          thumb: externalSource.thumb,
        }
      : undefined,
    images: (imageSource ?? []).map((image) => ({
      alt: image.alt || "",
      thumb: image.thumb,
      fullsize: image.fullsize,
    })),
  };
}
