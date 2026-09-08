import type { MetadataRoute } from "next";
import { getAllPages, SITE_URL } from "@/lib/site-content";
import { pseoPages } from "@/lib/pseo-pages";

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const page of getAllPages()) {
    const url = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
    entries.set(url, { url, lastModified: page.lastModified });
  }

  for (const page of pseoPages) {
    const url = `${SITE_URL}/${page.slug}/`;
    if (!entries.has(url)) entries.set(url, { url });
  }

  const areasWeServeUrl = `${SITE_URL}/areas-we-serve/`;
  entries.set(areasWeServeUrl, { url: areasWeServeUrl });

  return Array.from(entries.values());
}
