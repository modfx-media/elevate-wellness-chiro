import type { Metadata } from "next";
import { getHomepage } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { HomepageTemplate } from "@/components/templates/HomepageTemplate";
import { CMSRoute } from "@/components/cms/CMSRoute";
import { cmsMetadata } from "@/lib/cms/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return cmsMetadata("/", buildMetadata(getHomepage()));
}

export default function Home() {
  return (
    <CMSRoute path="/">
      <HomepageTemplate page={getHomepage()} />
    </CMSRoute>
  );
}
