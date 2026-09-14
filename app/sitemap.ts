import type { MetadataRoute } from "next";
import { getAllPages, SITE_URL, type SiteInventoryPage } from "@/lib/site-content";
import { pseoPages } from "@/lib/pseo-pages";
import { isNoindexPath } from "@/lib/seo";

function priorityFor(page: SiteInventoryPage): number {
  if (page.pageType === "homepage") return 1;
  if (page.pageType === "service" || page.pageType === "service-location/geo page") return 0.8;
  if (page.pageType === "injury-condition" || page.pageType === "provider bio") return 0.7;
  if (page.pageType === "blog post") return 0.6;
  if (page.pageType === "legal page") return 0.3;
  return 0.5;
}

function changeFrequencyFor(page: SiteInventoryPage): MetadataRoute.Sitemap[number]["changeFrequency"] {
  if (page.pageType === "blog post" || page.pageType === "category archive") return "weekly";
  if (page.pageType === "legal page") return "yearly";
  return "monthly";
}

export default function sitemap(): MetadataRoute.Sitemap {
  const entries = new Map<string, MetadataRoute.Sitemap[number]>();

  for (const page of getAllPages()) {
    if (isNoindexPath(page.path)) continue;
    const url = page.path === "/" ? `${SITE_URL}/` : `${SITE_URL}${page.path}`;
    entries.set(url, {
      url,
      lastModified: page.lastModified || new Date(),
      changeFrequency: changeFrequencyFor(page),
      priority: priorityFor(page),
    });
  }

  for (const page of pseoPages) {
    const url = `${SITE_URL}/${page.slug}/`;
    if (!entries.has(url)) {
      entries.set(url, {
        url,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.5,
      });
    }
  }

  entries.set(`${SITE_URL}/areas-we-serve/`, {
    url: `${SITE_URL}/areas-we-serve/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  });

  entries.set(`${SITE_URL}/sitemap/`, {
    url: `${SITE_URL}/sitemap/`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.4,
  });

  return Array.from(entries.values());
}
