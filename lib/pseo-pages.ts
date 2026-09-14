import type { Metadata } from "next";
import { pseoCities, type PseoCity } from "@/data/pseo-cities";
import { pseoTopics, type PseoTopic } from "@/data/pseo-topics";
import { SITE_URL } from "@/lib/site-content";
import { clampMetaDescription, socialMetadata } from "@/lib/seo";

const BRAND = "Elevate Wellness Chiropractic";
const MAX_TITLE_LENGTH = 59;

export type PseoPage = {
  slug: string;
  city: PseoCity;
  topic: PseoTopic;
};

export const pseoPages: PseoPage[] = pseoTopics.flatMap((topic) =>
  pseoCities.map((city) => ({
    slug: `${topic.slug}-in-${city.slug}`,
    topic,
    city,
  })),
);

const pagesBySlug = new Map(pseoPages.map((page) => [page.slug, page]));

export function getPseoPageBySlug(slug: string): PseoPage | undefined {
  return pagesBySlug.get(slug);
}

export function getPseoTitle(page: PseoPage): string {
  const localTitle = `${page.topic.name} in ${page.city.name}, UT`;
  const brandedTitle = `${localTitle} | ${BRAND}`;
  return brandedTitle.length <= MAX_TITLE_LENGTH ? brandedTitle : localTitle;
}

export function getPseoDescription(page: PseoPage): string {
  const office =
    page.city.county === "Davis" || page.city.county === "Salt Lake" ? "Bountiful" : "Clinton";
  return clampMetaDescription(
    "",
    `${page.topic.name} in ${page.city.name}, UT at Elevate Wellness Chiropractic. Visit our ${office} office for personalized chiropractic care nearby.`,
  );
}

export function buildPseoMetadata(page: PseoPage): Metadata {
  const title = getPseoTitle(page);
  const description = getPseoDescription(page);
  const canonicalUrl = `${SITE_URL}/${page.slug}/`;

  return {
    metadataBase: new URL(SITE_URL),
    title,
    description,
    alternates: { canonical: canonicalUrl },
    ...socialMetadata({ title, description, url: canonicalUrl }),
  };
}
