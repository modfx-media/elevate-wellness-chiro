import type { SiteInventoryPage } from "@/lib/site-content";
import { cmsDocToInventoryPage, normalizePostTitle } from "@/lib/cms/to-inventory";
import { toCmsPath } from "@/lib/cms/paths";
import { isScheduledInFuture, publishSortTime } from "@/lib/cms/publish-date";
import type { CmsDoc } from "@/lib/cms/types";

/**
 * Published CMS posts join the designed list. Same slug, path, or title keeps
 * one card. A future `publishedAt` stays off the list until that calendar day.
 * Hardcoded posts stay when the CMS query fails (the caller passes them as the
 * `withCMS` fallback).
 */
export function mergePublishedBlogPosts(
  hardcoded: SiteInventoryPage[],
  docs: CmsDoc[],
): SiteInventoryPage[] {
  const bySlug = new Map<string, SiteInventoryPage>();
  const slugByPath = new Map<string, string>();
  const slugByTitle = new Map<string, string>();

  const remember = (post: SiteInventoryPage) => {
    for (const title of [post.title, post.metaTitle]) {
      const key = normalizePostTitle(title);
      if (key) slugByTitle.set(key, post.slug);
    }
  };

  for (const post of hardcoded) {
    if (isScheduledInFuture(post.publishDate)) continue;
    bySlug.set(post.slug, post);
    slugByPath.set(toCmsPath(post.path), post.slug);
    remember(post);
  }

  for (const doc of docs) {
    if (isScheduledInFuture(doc.publishedAt)) continue;
    const page = cmsDocToInventoryPage(doc, { collection: "posts" });
    if (!page.slug || page.path === "/") continue;
    if (isScheduledInFuture(page.publishDate)) continue;

    const pathKey = toCmsPath(page.path);
    const titleSlug =
      slugByTitle.get(normalizePostTitle(page.title)) ||
      slugByTitle.get(normalizePostTitle(page.metaTitle));
    const existingSlug = bySlug.has(page.slug) ? page.slug : slugByPath.get(pathKey);

    if (!existingSlug && titleSlug && titleSlug !== page.slug) {
      continue;
    }

    if (existingSlug) {
      const existing = bySlug.get(existingSlug);
      if (!existing) continue;
      const images = page.images.length > 0 ? page.images : existing.images;
      const openGraph = page.openGraph?.image ? page.openGraph : existing.openGraph;
      bySlug.set(existingSlug, {
        ...page,
        slug: existingSlug,
        path: existing.path || page.path,
        images,
        openGraph,
        publishDate: page.publishDate || existing.publishDate,
        lastModified: page.lastModified || existing.lastModified,
      });
      continue;
    }

    bySlug.set(page.slug, page);
    slugByPath.set(pathKey, page.slug);
    remember(page);
  }

  return [...bySlug.values()].sort(
    (a, b) => publishSortTime(b.publishDate) - publishSortTime(a.publishDate),
  );
}
