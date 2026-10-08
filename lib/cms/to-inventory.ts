import type { SiteInventoryPage } from "@/lib/site-content";
import { SITE_URL } from "@/lib/constants";
import { uploadPublicUrl } from "@/lib/cms/media-url";
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

function asPageType(
  value: string | null | undefined,
  collection?: "pages" | "posts",
): SiteInventoryPage["pageType"] {
  if (value && PAGE_TYPES.includes(value as SiteInventoryPage["pageType"])) {
    return value as SiteInventoryPage["pageType"];
  }
  if (collection === "posts") return "blog post";
  return "utility page";
}

function readOpenGraph(value: CmsDoc["openGraph"]): SiteInventoryPage["openGraph"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as { title?: unknown; description?: unknown; image?: unknown };
  return {
    title: typeof record.title === "string" ? record.title : undefined,
    description: typeof record.description === "string" ? record.description : undefined,
    image: typeof record.image === "string" ? record.image : undefined,
  };
}

export function cmsDocToInventoryPage(
  doc: CmsDoc,
  options?: { collection?: "pages" | "posts" },
): SiteInventoryPage {
  const publicPath = toPublicPath(doc.path || "/");
  const title = doc.title || "Untitled";
  const metaTitle = doc.meta?.title || title;
  const metaDescription = doc.meta?.description || "";
  const featured = uploadPublicUrl(doc.meta?.image);
  const openGraph = readOpenGraph(doc.openGraph);
  const images = (doc.images || [])
    .filter((image) => image.src)
    .map((image) => ({
      src: image.src || "",
      alt: image.alt || "",
      placement: image.placement || "",
    }));
  if (featured && !images.some((image) => image.src === featured.url)) {
    images.unshift({ src: featured.url, alt: featured.alt || title, placement: "hero" });
  }

  return {
    url: doc.sourceUrl || `${SITE_URL}${publicPath}`,
    path: publicPath,
    httpStatus: 200,
    sourceSitemap: "",
    slug: doc.slug || publicPath.replace(/^\/|\/$/g, "") || "home",
    pageType: asPageType(doc.pageType, options?.collection),
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
    images,
    videos: (doc.videos || []).map((video) => ({
      type: video.type || "",
      id: video.id || "",
      src: video.src || "",
      placement: video.placement || "",
    })),
    internalLinks: Array.isArray(doc.internalLinks) ? (doc.internalLinks as SiteInventoryPage["internalLinks"]) : [],
    externalLinks: Array.isArray(doc.externalLinks) ? (doc.externalLinks as SiteInventoryPage["externalLinks"]) : [],
    structuredData: doc.structuredData,
    openGraph: featured
      ? { title: openGraph?.title, description: openGraph?.description || metaDescription, image: featured.url }
      : openGraph,
    publishDate: doc.publishedAt || undefined,
    lastModified: doc.sourceUpdatedAt || doc.updatedAt || "",
  };
}
