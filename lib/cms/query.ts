import { getPayload } from "payload";
import { draftMode } from "next/headers";
import config from "@payload-config";
import { toCmsPath } from "@/lib/cms/paths";
import { isScheduledInFuture } from "@/lib/cms/publish-date";
import type { CmsDoc, RoutedContent } from "@/lib/cms/types";

async function findByPath(collection: "pages" | "posts", cmsPath: string, draftEnabled: boolean) {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection,
    where: { path: { equals: cmsPath } },
    limit: 1,
    depth: 2,
    draft: draftEnabled,
    overrideAccess: draftEnabled,
  });
  return (result.docs[0] as CmsDoc | undefined) ?? null;
}

export async function queryRoutedContentByPath(path: string): Promise<RoutedContent | null> {
  const cmsPath = toCmsPath(path);
  const draft = await draftMode();
  const draftEnabled = draft.isEnabled;

  const page = await findByPath("pages", cmsPath, draftEnabled);
  if (page) return { collection: "pages", doc: page };

  const post = await findByPath("posts", cmsPath, draftEnabled);
  if (post) {
    if (!draftEnabled && isScheduledInFuture(post.publishedAt)) return null;
    return { collection: "posts", doc: post };
  }

  return null;
}

export async function queryPublishedSitemapDocs(): Promise<CmsDoc[]> {
  const payload = await getPayload({ config });
  const docs: CmsDoc[] = [];

  for (const collection of ["pages", "posts"] as const) {
    const result = await payload.find({
      collection,
      where: {
        and: [
          { _status: { equals: "published" } },
          { path: { exists: true } },
        ],
      },
      limit: 5000,
      depth: 0,
      pagination: false,
    });
    docs.push(...(result.docs as CmsDoc[]));
  }

  return docs;
}

/** Published posts, newest `publishedAt` first. Drafts are not included. */
export async function queryPublishedBlogPosts(): Promise<CmsDoc[]> {
  const payload = await getPayload({ config });
  const result = await payload.find({
    collection: "posts",
    where: {
      and: [
        { _status: { equals: "published" } },
        {
          or: [
            { pageType: { equals: "blog post" } },
            { pageType: { exists: false } },
          ],
        },
      ],
    },
    sort: "-publishedAt",
    limit: 1000,
    depth: 1,
    pagination: false,
    draft: false,
  });
  return result.docs as CmsDoc[];
}
