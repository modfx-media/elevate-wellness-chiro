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

/** Production site origin these routes/canonicals are built for. */
export const SITE_URL = "https://www.elevatewellnesschiro.com";

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
