import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getFlatPageBySlug, getFlatPages } from "@/lib/site-content";
import { buildMetadata } from "@/lib/site-metadata";
import { buildPseoMetadata, getPseoPageBySlug, pseoPages } from "@/lib/pseo-pages";
import { renderFlatPageTemplate } from "@/components/templates";
import { PseoLocationTemplate } from "@/components/templates/PseoLocationTemplate";
import { CMSRoute } from "@/components/cms/CMSRoute";
import { cmsMetadata } from "@/lib/cms/metadata";

export const dynamicParams = true;
export const revalidate = 60;

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
  const fallback = page
    ? buildMetadata(page)
    : (() => {
        const pseoPage = getPseoPageBySlug(slug);
        if (pseoPage) return buildPseoMetadata(pseoPage);
        return {
          title: "Page Not Found | Elevate Wellness Chiropractic",
          robots: { index: false, follow: true },
        };
      })();

  return cmsMetadata(`/${slug}`, fallback);
}

export default async function FlatPage(props: PageProps<"/[slug]">) {
  const { slug } = await props.params;
  const page = getFlatPageBySlug(slug);
  if (page) {
    return (
      <CMSRoute path={`/${slug}`}>
        {renderFlatPageTemplate(page)}
      </CMSRoute>
    );
  }

  const pseoPage = getPseoPageBySlug(slug);
  if (pseoPage) {
    return (
      <CMSRoute path={`/${slug}`}>
        <PseoLocationTemplate page={pseoPage} />
      </CMSRoute>
    );
  }

  // Designed routes above win. This only resolves a published CMS document
  // whose root slug is not already a page in the site (for example
  // /pediatric-chiropractic-in-clinton-utah).
  return (
    <CMSRoute path={`/${slug}`}>
      <CmsSlugMiss />
    </CMSRoute>
  );
}

function CmsSlugMiss(): never {
  notFound();
}
