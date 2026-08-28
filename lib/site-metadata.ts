import type { Metadata } from "next";
import { SITE_URL, type SiteInventoryPage } from "@/lib/site-content";

/** Builds page `<head>` metadata (title/description/canonical/OG) from a crawled inventory record. */
export function buildMetadata(page: SiteInventoryPage): Metadata {
  return {
    metadataBase: new URL(SITE_URL),
    title: page.metaTitle || page.title,
    description: page.metaDescription,
    alternates: {
      canonical: page.canonicalUrl,
    },
    openGraph: page.openGraph
      ? {
          title: page.openGraph.title ?? page.metaTitle ?? page.title,
          description: page.openGraph.description ?? page.metaDescription,
          url: page.canonicalUrl,
          images: page.openGraph.image ? [page.openGraph.image] : undefined,
        }
      : {
          title: page.metaTitle || page.title,
          description: page.metaDescription,
          url: page.canonicalUrl,
        },
  };
}
