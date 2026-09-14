import type { Metadata } from "next";
import { getHomepage, SITE_URL, type SiteInventoryPage } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { HomepageTemplate } from "@/components/templates/HomepageTemplate";

function getClintonPage(): SiteInventoryPage {
  const home = getHomepage();
  return {
    ...home,
    title: "Expert Chiropractic Care in Clinton, UT | Elevate Wellness",
    metaTitle: "Expert Chiropractic Care in Clinton, UT | Elevate Wellness Chiropractic",
    metaDescription:
      "Expert chiropractic care in Clinton, UT at Elevate Wellness Chiropractic. Meet Dr. Mikayla Twarog and schedule your visit today.",
    canonicalUrl: `${SITE_URL}/clinton/`,
  };
}

export function generateMetadata(): Metadata {
  return buildMetadata(getClintonPage());
}

export default function ClintonHome() {
  return <HomepageTemplate page={getClintonPage()} location="clinton" />;
}
