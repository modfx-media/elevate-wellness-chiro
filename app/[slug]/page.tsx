import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFlatPageBySlug, getFlatPages } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { renderFlatPageTemplate } from "@/components/templates";

export async function generateStaticParams() {
  return getFlatPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(props: PageProps<"/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getFlatPageBySlug(slug);
  if (!page) return {};
  return buildMetadata(page);
}

export default async function FlatPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = getFlatPageBySlug(slug);
  if (!page) notFound();
  return renderFlatPageTemplate(page);
}
