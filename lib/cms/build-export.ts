import { SITE_URL } from "@/lib/constants";
import { getAllPages, type SiteInventoryPage } from "@/lib/site-content";
import { getPseoContent } from "@/lib/pseo-content";
import { getPseoDescription, getPseoTitle, pseoPages } from "@/lib/pseo-pages";
import { toCmsPath } from "@/lib/cms/paths";
import { headerMenu } from "@/components/site/nav-data";
import { disclaimerText, legalLinks } from "@/components/site/footer-data";
import { areasWeServeCopy } from "@/components/templates/AreasWeServeTemplate";
import { htmlSitemapCopy } from "@/components/templates/HtmlSitemapTemplate";

export type CmsExportRecord = {
  collection: "pages" | "posts";
  legacyId: string;
  sourceUrl: string;
  data: Record<string, unknown>;
};

export type CmsExportFile = {
  version: 1;
  records: CmsExportRecord[];
  globals: {
    header: Record<string, unknown>;
    footer: Record<string, unknown>;
    "site-settings": Record<string, unknown>;
  };
};

function inventoryData(page: SiteInventoryPage, extras: Record<string, unknown> = {}) {
  const cmsPath = toCmsPath(page.path);
  return {
    title: page.title,
    slug: page.slug || null,
    path: cmsPath,
    pageType: page.path === "/clinton/" ? "homepage" : page.pageType,
    bodyCopy: page.bodyCopy,
    headings: page.headings,
    images: page.images,
    videos: page.videos,
    internalLinks: page.internalLinks,
    externalLinks: page.externalLinks,
    structuredData: page.structuredData,
    openGraph: page.openGraph,
    canonicalUrl: page.canonicalUrl,
    sourceUrl: page.url,
    sourceUpdatedAt: page.lastModified || null,
    publishedAt: page.publishDate || null,
    meta: {
      title: page.metaTitle || page.title,
      description: page.metaDescription,
    },
    noIndex: page.path.startsWith("/author/") || false,
    noFollow: false,
    excludeFromSitemap:
      page.path.startsWith("/author/") ||
      page.path === "/thank-you/" ||
      page.path === "/form-submission-confirmation/" ||
      page.path === "/reviews/" ||
      page.path === "/new-patient-forms/",
    locationKey: page.path === "/clinton/" ? "clinton" : page.path === "/" ? "bountiful" : null,
    ...extras,
  };
}

export function buildContentExport(): CmsExportFile {
  const recordsByPath = new Map<string, CmsExportRecord>();

  for (const page of getAllPages()) {
    const cmsPath = toCmsPath(page.path);
    const collection = page.pageType === "blog post" ? "posts" : "pages";
    recordsByPath.set(cmsPath, {
      collection,
      legacyId: `inventory:${cmsPath}`,
      sourceUrl: page.url,
      data: inventoryData(page, { sourceKind: "inventory" }),
    });
  }

  for (const page of pseoPages) {
    const cmsPath = `/${page.slug}`;
    if (recordsByPath.has(cmsPath)) continue;
    const title = getPseoTitle(page);
    const description = getPseoDescription(page);
    const content = getPseoContent(page);
    recordsByPath.set(cmsPath, {
      collection: "pages",
      legacyId: `pseo:${page.slug}`,
      sourceUrl: `${SITE_URL}/${page.slug}/`,
      data: {
        title,
        slug: page.slug,
        path: cmsPath,
        pageType: "service-location/geo page",
        sourceKind: "pseo",
        topicSlug: page.topic.slug,
        citySlug: page.city.slug,
        bodyCopy: [content.introHeading, ...content.introParagraphs, content.whyHeading, ...content.whyParagraphs].join(
          "\n\n",
        ),
        headings: [
          { level: "h1", text: content.h1 },
          { level: "h2", text: content.introHeading },
          { level: "h2", text: content.whyHeading },
        ],
        images: [],
        videos: [],
        canonicalUrl: `${SITE_URL}/${page.slug}/`,
        sourceUrl: `${SITE_URL}/${page.slug}/`,
        meta: { title, description },
        noIndex: false,
        noFollow: false,
        excludeFromSitemap: false,
      },
    });
  }

  const extras: { path: string; title: string; description: string; pageType: string }[] = [
    {
      path: "/areas-we-serve",
      title: `${areasWeServeCopy.title} | Elevate Wellness`,
      description: areasWeServeCopy.description,
      pageType: "utility page",
    },
  ];

  if (!recordsByPath.has("/sitemap")) {
    extras.push({
      path: "/sitemap",
      title: htmlSitemapCopy.title,
      description: htmlSitemapCopy.description,
      pageType: "utility page",
    });
  }

  for (const extra of extras) {
    if (recordsByPath.has(extra.path)) continue;
    recordsByPath.set(extra.path, {
      collection: "pages",
      legacyId: `extra:${extra.path}`,
      sourceUrl: `${SITE_URL}${extra.path}/`,
      data: {
        title: extra.title,
        slug: extra.path.slice(1),
        path: extra.path,
        pageType: extra.pageType,
        sourceKind: "extra",
        canonicalUrl: `${SITE_URL}${extra.path}/`,
        sourceUrl: `${SITE_URL}${extra.path}/`,
        meta: { title: extra.title, description: extra.description },
        noIndex: false,
        noFollow: false,
        excludeFromSitemap: false,
      },
    });
  }

  return {
    version: 1,
    records: [...recordsByPath.values()],
    globals: {
      header: { nav: headerMenu },
      footer: { disclaimer: disclaimerText, links: legalLinks },
      "site-settings": {
        siteName: "Elevate Wellness Chiropractic",
        defaultTitle: "Expert Chiropractic Care in Bountiful, UT | Elevate Wellness",
        defaultDescription:
          "Elevate Wellness Chiropractic provides personalized chiropractic care in Bountiful and Clinton, UT for pain relief and wellness. Schedule your visit today.",
      },
    },
  };
}
