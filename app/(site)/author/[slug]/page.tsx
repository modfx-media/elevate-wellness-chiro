import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAuthorPageBySlug, getAuthorPages } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { AuthorArchiveTemplate } from "@/components/templates/AuthorArchiveTemplate";
import { CMSRoute } from "@/components/cms/CMSRoute";
import { cmsMetadata } from "@/lib/cms/metadata";

export async function generateStaticParams() {
  return getAuthorPages().map((page) => ({ slug: page.slug }));
}

export async function generateMetadata(props: PageProps<"/author/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const page = getAuthorPageBySlug(slug);
  const fallback = page
    ? buildMetadata(page)
    : {
        title: "Page Not Found | Elevate Wellness Chiropractic",
        robots: { index: false, follow: true },
      };
  return cmsMetadata(`/author/${slug}`, fallback);
}

export default async function AuthorPage(props: PageProps<"/author/[slug]">) {
  const { slug } = await props.params;
  const page = getAuthorPageBySlug(slug);
  if (!page) notFound();
  return (
    <CMSRoute path={`/author/${slug}`}>
      <AuthorArchiveTemplate page={page} />
    </CMSRoute>
  );
}
