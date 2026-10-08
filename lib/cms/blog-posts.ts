import type { SiteInventoryPage } from "@/lib/site-content";
import { cmsDocToInventoryPage } from "@/lib/cms/to-inventory";
import { toCmsPath } from "@/lib/cms/paths";
import type { CmsDoc } from "@/lib/cms/types";

function publishedTime(value: string | undefined): number {
  if (!value) return 0;
  const time = Date.parse(value);
  return Number.isNaN(time) ? 0 : time;
}

/**
 * Published CMS posts join the designed list. Same slug or path keeps one card,
 * and the published CMS doc supplies that card. Hardcoded posts stay when the
 * CMS query fails (the caller passes them as the `withCMS` fallback).
 */
export function mergePublishedBlogPosts(
  hardcoded: SiteInventoryPage[],
  docs: CmsDoc[],
): SiteInventoryPage[] {
  const bySlug = new Map<string, SiteInventoryPage>();
  const slugByPath = new Map<string, string>();

  for (const post of hardcoded) {
    bySlug.set(post.slug, post);
    slugByPath.set(toCmsPath(post.path), post.slug);
  }

  for (const doc of docs) {
    const page = cmsDocToInventoryPage(doc, { collection: "posts" });
    if (!page.slug || page.path === "/") continue;
    const pathKey = toCmsPath(page.path);
    const existingSlug = bySlug.has(page.slug) ? page.slug : slugByPath.get(pathKey);
    if (existingSlug) {
      bySlug.set(existingSlug, { ...page, slug: existingSlug });
      continue;
    }
    bySlug.set(page.slug, page);
    slugByPath.set(pathKey, page.slug);
  }

  return [...bySlug.values()].sort(
    (a, b) => publishedTime(b.publishDate) - publishedTime(a.publishDate),
  );
}
