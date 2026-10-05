import type { Metadata } from "next";
import { withCMS } from "@/lib/cms/safe";
import { queryRoutedContentByPath } from "@/lib/cms/query";
import { cmsDocToInventoryPage } from "@/lib/cms/to-inventory";
import { buildMetadata } from "@/lib/site-metadata";
import { SITE_URL } from "@/lib/constants";
import { socialMetadata } from "@/lib/seo";
import { toPublicPath } from "@/lib/cms/paths";
import type { CmsDoc } from "@/lib/cms/types";

function metadataFromDoc(doc: CmsDoc): Metadata {
  const page = cmsDocToInventoryPage(doc);
  const base = buildMetadata(page);
  const canonical = doc.canonicalUrl || `${SITE_URL}${toPublicPath(doc.path || "/")}`;
  const title = doc.meta?.title || doc.title || base.title;
  const description = doc.meta?.description || page.metaDescription;
  const index = !doc.noIndex;
  const follow = !doc.noFollow;

  return {
    ...base,
    title,
    description,
    alternates: { canonical },
    ...socialMetadata({
      title: typeof title === "string" ? title : page.title,
      description: typeof description === "string" ? description : page.metaDescription,
      url: canonical,
      index,
    }),
    robots: { index, follow },
  };
}

export async function cmsMetadata(path: string, fallback: Metadata): Promise<Metadata> {
  return withCMS(async () => {
    const routed = await queryRoutedContentByPath(path);
    if (!routed) return fallback;
    return metadataFromDoc(routed.doc);
  }, fallback);
}
