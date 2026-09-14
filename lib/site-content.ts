import inventory from "@/seo-audit/site-inventory.json";

/** One crawled record from the Phase 1 SEO content inventory. */
export interface SiteInventoryPage {
  url: string;
  path: string;
  httpStatus: number;
  sourceSitemap: string;
  slug: string;
  pageType:
    | "homepage"
    | "service"
    | "injury-condition"
    | "service-location/geo page"
    | "category archive"
    | "blog post"
    | "utility page"
    | "legal page"
    | "provider bio";
  title: string;
  metaTitle: string;
  metaDescription: string;
  canonicalUrl: string;
  headings: { level: string; text: string }[];
  bodyCopy: string;
  images: InventoryImage[];
  videos: InventoryVideo[];
  internalLinks: InventoryLink[];
  externalLinks: { anchorText: string; destination: string; doNotChange?: boolean }[];
  structuredData: unknown;
  openGraph: { title?: string; description?: string; image?: string } | null;
  publishDate?: string;
  lastModified: string;
}

export interface InventoryImage {
  src: string;
  alt: string;
  placement: string;
}

export interface InventoryVideo {
  type: string;
  id: string;
  src: string;
  placement: string;
}

export interface InventoryLink {
  anchorText: string;
  destination: string;
  doNotChange?: boolean;
}

interface SiteInventory {
  generatedAt: string;
  sourceSite: string;
  totalUrlsInSitemapIndex: number;
  totalUrlsCrawled: number;
  pages: SiteInventoryPage[];
}

const data = inventory as unknown as SiteInventory;

export { SITE_URL } from "@/lib/constants";

/**
 * Upgrades http:// URLs on the site's own host to https://. Some crawled
 * openGraph.image values use http even though the site itself is https-only,
 * which trips next/image's remotePatterns check.
 */
export function normalizeAssetUrl(url: string): string {
  return url
    .replace(/^http:\/\/(www\.)?elevatewellnesschiro\.com/, "https://www.elevatewellnesschiro.com")
    .replace(/^https:\/\/elevatewellnesschiro\.com/, "https://www.elevatewellnesschiro.com");
}

const AUTHOR_PATH_PREFIX = "/author/";

export function getAllPages(): SiteInventoryPage[] {
  return data.pages;
}

export function getHomepage(): SiteInventoryPage {
  const home = data.pages.find((p) => p.pageType === "homepage");
  if (!home) throw new Error("site-inventory.json is missing the homepage record");
  return home;
}

function isAuthorPage(page: SiteInventoryPage): boolean {
  return page.path.startsWith(AUTHOR_PATH_PREFIX);
}

/** All flat, single-segment pages (everything except the homepage and /author/* pages). */
export function getFlatPages(): SiteInventoryPage[] {
  return data.pages.filter((p) => p.pageType !== "homepage" && !isAuthorPage(p));
}

export function getFlatPageBySlug(slug: string): SiteInventoryPage | undefined {
  return getFlatPages().find((p) => p.slug === slug);
}

/** The 6 WordPress author-archive pages, nested under /author/[slug]/. */
export function getAuthorPages(): SiteInventoryPage[] {
  return data.pages.filter(isAuthorPage);
}

export function getAuthorPageBySlug(slug: string): SiteInventoryPage | undefined {
  return getAuthorPages().find((p) => p.slug === slug);
}

// ─── Blog helpers ────────────────────────────────────────────────────────────

export function getBlogPosts(): SiteInventoryPage[] {
  return data.pages.filter((p) => p.pageType === "blog post");
}

export function getBlogPostBySlug(slug: string): SiteInventoryPage | undefined {
  return getBlogPosts().find((p) => p.slug === slug);
}

/** All blog posts sorted newest-first by publishDate. */
export function getBlogPostsSortedByDate(): SiteInventoryPage[] {
  return [...getBlogPosts()].sort((a, b) => {
    const ad = a.publishDate ?? "";
    const bd = b.publishDate ?? "";
    return bd.localeCompare(ad);
  });
}

export function getCategoryArchives(): SiteInventoryPage[] {
  return data.pages.filter((p) => p.pageType === "category archive");
}

/**
 * Returns the blog posts linked from `categorySlug`'s crawled archive page —
 * the same posts that showed on the live-site's first page. Preserves the
 * order they appeared in the crawl's `internalLinks` array (dedup keeps first).
 */
export function getPostsLinkedFromCategory(categorySlug: string): SiteInventoryPage[] {
  const category = data.pages.find(
    (p) => p.pageType === "category archive" && p.slug === categorySlug,
  );
  if (!category) return [];
  const posts = getBlogPosts();
  const postBySlug = new Map(posts.map((p) => [p.slug, p]));
  const seen = new Set<string>();
  const out: SiteInventoryPage[] = [];
  for (const link of category.internalLinks) {
    for (const post of posts) {
      if (seen.has(post.slug)) continue;
      if (link.destination.includes(`/${post.slug}/`) || link.destination.endsWith(`/${post.slug}`)) {
        const rec = postBySlug.get(post.slug);
        if (rec) {
          out.push(rec);
          seen.add(post.slug);
        }
        break;
      }
    }
  }
  return out;
}
