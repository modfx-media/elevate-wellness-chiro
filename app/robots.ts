import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-content";

/** Matches the live site's intent: allow all crawlers, point to the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
