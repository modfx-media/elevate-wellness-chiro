import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { socialMetadata } from "@/lib/seo";
import { CMSRoute } from "@/components/cms/CMSRoute";
import { cmsMetadata } from "@/lib/cms/metadata";
import { AreasWeServeTemplate, areasWeServeCopy } from "@/components/templates/AreasWeServeTemplate";

const TITLE = `${areasWeServeCopy.title} | Elevate Wellness`;

const fallback: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: areasWeServeCopy.description,
  alternates: { canonical: `${SITE_URL}/areas-we-serve/` },
  ...socialMetadata({
    title: TITLE,
    description: areasWeServeCopy.description,
    url: `${SITE_URL}/areas-we-serve/`,
  }),
};

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/areas-we-serve", fallback);
}

export default function AreasWeServePage() {
  return (
    <CMSRoute path="/areas-we-serve">
      <AreasWeServeTemplate />
    </CMSRoute>
  );
}
