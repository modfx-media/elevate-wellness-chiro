import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthorPageBySlug, getAuthorPages } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { AuthorArchiveTemplate } from "@/components/templates/AuthorArchiveTemplate";

export async function generateStaticParams() {
  return getAuthorPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(props: PageProps<"/author/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getAuthorPageBySlug(slug);
  if (!page) {
    return {
      title: "Page Not Found | Elevate Wellness Chiropractic",
      robots: { index: false, follow: true },
    };
  }
  return buildMetadata(page);
}

export default async function AuthorPage(props: PageProps<"/author/[slug]">) {
  const { slug } = await props.params;
  const page = getAuthorPageBySlug(slug);
  if (!page) notFound();
  return <AuthorArchiveTemplate page={page} />;
}
