import type { Metadata } from "next";
import { SITE_URL } from "@/lib/constants";
import { socialMetadata } from "@/lib/seo";
import { CMSRoute } from "@/components/cms/CMSRoute";
import { cmsMetadata } from "@/lib/cms/metadata";
import { HtmlSitemapTemplate, htmlSitemapCopy } from "@/components/templates/HtmlSitemapTemplate";

const fallback: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: htmlSitemapCopy.title,
  description: htmlSitemapCopy.description,
  alternates: { canonical: `${SITE_URL}/sitemap/` },
  ...socialMetadata({
    title: htmlSitemapCopy.title,
    description: htmlSitemapCopy.description,
    url: `${SITE_URL}/sitemap/`,
  }),
};

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/sitemap", fallback);
}

export default function SitemapPage() {
  return (
    <CMSRoute path="/sitemap">
      <HtmlSitemapTemplate />
    </CMSRoute>
  );
}
