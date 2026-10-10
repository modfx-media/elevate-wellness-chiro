import { getBlogPosts, type SiteInventoryPage } from "@/lib/site-content";
import { SITE_URL } from "@/lib/constants";
import { uploadPublicUrl } from "@/lib/cms/media-url";
import { toPublicPath } from "@/lib/cms/paths";
import { publishCalendarDay } from "@/lib/cms/publish-date";
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

export function normalizePostTitle(value: string | null | undefined): string {
  return (value || "")
    .split("|")[0]
    .split(" - ")[0]
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

function readOpenGraph(value: CmsDoc["openGraph"]): SiteInventoryPage["openGraph"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as { title?: unknown; description?: unknown; image?: unknown };
  const image = uploadPublicUrl(record.image)?.url;
  return {
    title: typeof record.title === "string" ? record.title : undefined,
    description: typeof record.description === "string" ? record.description : undefined,
    image,
  };
}

/** Inventory article with the same URL or the same title, when the CMS row is a republish. */
function findInventoryTwin(doc: CmsDoc, publicPath: string): SiteInventoryPage | undefined {
  const posts = getBlogPosts();
  const slug = doc.slug || "";
  const byPath = posts.find((post) => post.slug === slug || post.path === publicPath);
  if (byPath) return byPath;

  const titles = new Set(
    [doc.title, doc.meta?.title].map((title) => normalizePostTitle(title)).filter(Boolean),
  );
  if (titles.size === 0) return undefined;
  return posts.find((post) => {
    const title = normalizePostTitle(post.title);
    const meta = normalizePostTitle(post.metaTitle);
    return titles.has(title) || titles.has(meta);
  });
}

export function cmsDocToInventoryPage(
  doc: CmsDoc,
  options?: { collection?: "pages" | "posts" },
): SiteInventoryPage {
  const publicPath = toPublicPath(doc.path || "/");
  const title = doc.title || "Untitled";
  const metaTitle = doc.meta?.title || title;
  const metaDescription = doc.meta?.description || "";
  const isPost = options?.collection === "posts" || doc.pageType === "blog post";
  const twin = isPost ? findInventoryTwin(doc, publicPath) : undefined;
  const samePublicUrl = Boolean(twin && (twin.path === publicPath || twin.slug === doc.slug));
  const featured = uploadPublicUrl(doc.meta?.image);
  const openGraph = readOpenGraph(doc.openGraph);
  const images = (doc.images || [])
    .filter((image) => image.src)
    .map((image) => ({
      src: uploadPublicUrl(image.src)?.url || "",
      alt: image.alt || "",
      placement: image.placement || "",
    }))
    .filter((image) => image.src);
  if (featured && !images.some((image) => image.src === featured.url)) {
    images.unshift({ src: featured.url, alt: featured.alt || title, placement: "hero" });
  }
  if (images.length === 0 && twin) {
    images.push(
      ...twin.images.filter((image) => image.src && !image.src.startsWith("/media/") && !image.src.startsWith("/api/media")),
    );
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
    canonicalUrl:
      doc.canonicalUrl ||
      (twin && !samePublicUrl ? twin.canonicalUrl : `${SITE_URL}${publicPath}`),
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
      : openGraph?.image
        ? openGraph
        : twin?.openGraph?.image
          ? { title: openGraph?.title, description: openGraph?.description || metaDescription, image: twin.openGraph.image }
          : openGraph,
    publishDate: isPost
      ? publishCalendarDay(doc.publishedAt) || twin?.publishDate
      : doc.publishedAt || undefined,
    lastModified: isPost
      ? doc.sourceUpdatedAt || twin?.lastModified || ""
      : doc.sourceUpdatedAt || doc.updatedAt || "",
  };
}
