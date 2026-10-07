import type { SiteInventoryPage } from "@/lib/site-content";
import { SITE_URL } from "@/lib/constants";
import { toPublicPath } from "@/lib/cms/paths";
import type { CmsDoc } from "@/lib/cms/types";

const PAGE_TYPES: SiteInventoryPage["pageType"][] = [
  "homepage",
  "service",
  "injury-condition",
  "service-location/geo page",
  "category archive",
  "blog post",
  "utility page",
  "legal page",
  "provider bio",
];

function asPageType(value: string | null | undefined): SiteInventoryPage["pageType"] {
  if (value && PAGE_TYPES.includes(value as SiteInventoryPage["pageType"])) {
    return value as SiteInventoryPage["pageType"];
  }
  return "utility page";
}

export function cmsDocToInventoryPage(doc: CmsDoc): SiteInventoryPage {
  const publicPath = toPublicPath(doc.path || "/");
  const title = doc.title || "Untitled";
  const metaTitle = doc.meta?.title || title;
  const metaDescription = doc.meta?.description || "";

  return {
    url: doc.sourceUrl || `${SITE_URL}${publicPath}`,
    path: publicPath,
    httpStatus: 200,
    sourceSitemap: "",
    slug: doc.slug || publicPath.replace(/^\/|\/$/g, "") || "home",
    pageType: asPageType(doc.pageType),
    title,
    metaTitle,
    metaDescription,
    canonicalUrl: doc.canonicalUrl || `${SITE_URL}${publicPath}`,
    headings: (doc.headings || [])
      .filter((heading) => heading.text)
      .map((heading) => ({
        level: heading.level || "h2",
        text: heading.text || "",
      })),
    bodyCopy: doc.bodyCopy || "",
    images: (doc.images || [])
      .filter((image) => image.src)
      .map((image) => ({
        src: image.src || "",
        alt: image.alt || "",
        placement: image.placement || "",
      })),
    videos: (doc.videos || []).map((video) => ({
      type: video.type || "",
      id: video.id || "",
      src: video.src || "",
      placement: video.placement || "",
    })),
    internalLinks: Array.isArray(doc.internalLinks) ? (doc.internalLinks as SiteInventoryPage["internalLinks"]) : [],
    externalLinks: Array.isArray(doc.externalLinks) ? (doc.externalLinks as SiteInventoryPage["externalLinks"]) : [],
    structuredData: doc.structuredData,
    openGraph: doc.openGraph ?? null,
    publishDate: doc.publishedAt || undefined,
    lastModified: doc.sourceUpdatedAt || doc.updatedAt || "",
  };
}
