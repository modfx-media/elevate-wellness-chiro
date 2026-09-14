import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFlatPageBySlug, getFlatPages } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { buildPseoMetadata, getPseoPageBySlug, pseoPages } from "@/lib/pseo-pages";
import { renderFlatPageTemplate } from "@/components/templates";
import { PseoLocationTemplate } from "@/components/templates/PseoLocationTemplate";

export async function generateStaticParams() {
  const slugs = new Set([
    ...getFlatPages().map((page) => page.slug),
    ...pseoPages.map((page) => page.slug),
  ]);
  return Array.from(slugs, (slug) => ({ slug }));
}

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getFlatPageBySlug(slug);
  if (page) return buildMetadata(page);

  const pseoPage = getPseoPageBySlug(slug);
  if (pseoPage) return buildPseoMetadata(pseoPage);

  return {
    title: "Page Not Found | Elevate Wellness Chiropractic",
    robots: { index: false, follow: true },
  };
}

export default async function FlatPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = getFlatPageBySlug(slug);
  if (page) return renderFlatPageTemplate(page);

  const pseoPage = getPseoPageBySlug(slug);
  if (!pseoPage) notFound();
  return <PseoLocationTemplate page={pseoPage} />;
}
