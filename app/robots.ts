import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-content";

/** Allow crawlers on indexable pages; keep confirmation and author stubs out. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/thank-you/",
        "/form-submission-confirmation/",
        "/reviews/",
        "/new-patient-forms/",
        "/author/",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
