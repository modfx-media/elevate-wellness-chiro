import type { Metadata } from "next";
import { getHomepage } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { HomepageTemplate } from "@/components/templates/HomepageTemplate";

export function generateMetadata(): Metadata {
  return buildMetadata(getHomepage());
}

export default function Home() {
  return <HomepageTemplate page={getHomepage()} />;
}
