import type { MetadataRoute } from "next";
import { getAllPages, SITE_URL } from "@/lib/site-content";

/** Mirrors the exact URL set of the live site's /sitemap_index.xml (223 URLs). */
export default function sitemap(): MetadataRoute.Sitemap {
  return getAllPages().map((page) => ({
    url: page.path === "/" ? SITE_URL + "/" : `${SITE_URL}${page.path}`,
    lastModified: page.lastModified,
  }));
}
