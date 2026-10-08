import { HomepageTemplate } from "@/components/templates/HomepageTemplate";
import { renderFlatPageTemplate } from "@/components/templates";
import { AuthorArchiveTemplate } from "@/components/templates/AuthorArchiveTemplate";
import { AreasWeServeTemplate } from "@/components/templates/AreasWeServeTemplate";
import { BlogPostTemplate } from "@/components/templates/BlogPostTemplate";
import { HtmlSitemapTemplate } from "@/components/templates/HtmlSitemapTemplate";
import { PseoLocationTemplate } from "@/components/templates/PseoLocationTemplate";
import { cmsDocToInventoryPage } from "@/lib/cms/to-inventory";
import { getPseoPageBySlug } from "@/lib/pseo-pages";
import { toCmsPath } from "@/lib/cms/paths";
import type { CmsDoc } from "@/lib/cms/types";

export function RenderRoutedContent({
  doc,
  collection,
}: {
  doc: CmsDoc;
  collection?: "pages" | "posts";
}) {
  const cmsPath = toCmsPath(doc.path || "/");
  const page = cmsDocToInventoryPage(doc, { collection });

  if (cmsPath === "/clinton") {
    return <HomepageTemplate page={page} location="clinton" />;
  }

  if (cmsPath === "/" || doc.pageType === "homepage") {
    return <HomepageTemplate page={page} />;
  }

  if (cmsPath === "/areas-we-serve") {
    return <AreasWeServeTemplate />;
  }

  if (cmsPath === "/sitemap") {
    return <HtmlSitemapTemplate />;
  }

  if (cmsPath.startsWith("/author/")) {
    return <AuthorArchiveTemplate page={page} />;
  }

  if (doc.sourceKind === "pseo") {
    const pseo = getPseoPageBySlug(page.slug);
    if (pseo) return <PseoLocationTemplate page={pseo} />;
  }

  if (page.pageType === "blog post") {
    return <BlogPostTemplate page={page} richText={doc.content} />;
  }

  return renderFlatPageTemplate(page);
}
