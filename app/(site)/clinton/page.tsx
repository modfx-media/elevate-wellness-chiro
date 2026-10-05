import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { getHomepage, type SiteInventoryPage } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { HomepageTemplate } from "@/components/templates/HomepageTemplate";
import { CMSRoute } from "@/components/cms/CMSRoute";
import { cmsMetadata } from "@/lib/cms/metadata";

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

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/clinton", buildMetadata(getClintonPage()));
}

export default function ClintonHome() {
  return (
    <CMSRoute path="/clinton">
      <HomepageTemplate page={getClintonPage()} location="clinton" />
    </CMSRoute>
  );
}
