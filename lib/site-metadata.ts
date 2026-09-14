import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import type { SiteInventoryPage } from "@/lib/site-content";
import { clampMetaDescription, isNoindexPath, socialMetadata } from "@/lib/seo";

const TITLE_OVERRIDES: Record<string, string> = {
  "/chiropractor-in-north-salt-lake-ut-2/": "Chiropractor in North Salt Lake, UT | Elevate Wellness",
  "/chiropractic-services-in-north-salt-lake-ut/": "Chiropractic Services in North Salt Lake | Elevate Wellness",
};

function pageTitle(page: SiteInventoryPage): string {
  return TITLE_OVERRIDES[page.path] || page.metaTitle || page.title;
}

function pageDescription(page: SiteInventoryPage): string {
  const shortTitle = pageTitle(page).replace(/\s+\|.+$/, "");
  const fallback = `${shortTitle} at Elevate Wellness Chiropractic in Bountiful and Clinton, UT. Book personalized chiropractic care today.`;
  return clampMetaDescription(page.metaDescription || "", fallback);
}

/** Builds page `<head>` metadata (title/description/canonical/OG/Twitter) from an inventory record. */
export function buildMetadata(page: SiteInventoryPage): Metadata {
  const title = pageTitle(page);
  const description = pageDescription(page);
  const canonical = page.canonicalUrl || `${SITE_URL}${page.path}`;
  const index = !isNoindexPath(page.path);

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical },
    ...socialMetadata({ title, description, url: canonical, index }),
  };
}
