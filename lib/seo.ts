import type { Metadata } from "next";
import { SITE_URL, toSiteUrl } from "@/lib/constants";

export const DEFAULT_OG_IMAGE = "/images/og-default.jpg";
export const DEFAULT_OG_ALT = "Elevate Wellness Chiropractic in Bountiful and Clinton, UT";

export const NOINDEX_PATHS = new Set([
  "/thank-you/",
  "/form-submission-confirmation/",
  "/reviews/",
  "/new-patient-forms/",
]);

export function isNoindexPath(path: string): boolean {
  return path.startsWith("/author/") || NOINDEX_PATHS.has(path);
}

export function clampMetaDescription(text: string, fallback: string): string {
  const clean = text.replace(/\s+/g, " ").trim();
  const source = clean.length >= 80 ? clean : fallback.replace(/\s+/g, " ").trim();
  if (source.length >= 120 && source.length <= 160) return source;

  if (source.length > 160) {
    const window = source.slice(0, 160);
    const sentence = window.lastIndexOf(". ");
    if (sentence >= 119) return source.slice(0, sentence + 1);
    const space = window.lastIndexOf(" ");
    return `${window.slice(0, space >= 120 ? space : 157).replace(/[.,;:\s]+$/, "")}.`;
  }

  const extras = [
    " Schedule chiropractic care in Bountiful or Clinton, UT today.",
    " Walk-ins welcome at Elevate Wellness Chiropractic.",
    " Personalized pain relief and wellness visits near Davis County.",
  ];
  let out = source.endsWith(".") ? source : `${source}.`;
  for (const extra of extras) {
    if (out.length >= 120) break;
    out += extra;
  }
  if (out.length >= 120 && out.length <= 160) return out;
  if (out.length > 160) {
    const window = out.slice(0, 160);
    const space = window.lastIndexOf(" ");
    return `${window.slice(0, space >= 120 ? space : 157).replace(/[.,;:\s]+$/, "")}.`;
  }
  return out;
}

export function socialImages() {
  return [
    {
      url: DEFAULT_OG_IMAGE,
      width: 1200,
      height: 630,
      alt: DEFAULT_OG_ALT,
    },
  ];
}

export function socialMetadata(input: {
  title: string;
  description: string;
  url: string;
  index?: boolean;
}): Pick<Metadata, "openGraph" | "twitter" | "robots"> {
  const images = socialImages();
  return {
    openGraph: {
      title: input.title,
      description: input.description,
      url: input.url,
      siteName: "Elevate Wellness Chiropractic",
      locale: "en_US",
      type: "website",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: input.index === false ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export function absoluteUrl(path: string): string {
  return toSiteUrl(path.startsWith("http") || path.startsWith("/") ? path : `/${path}`);
}
