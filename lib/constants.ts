/** Production origin for canonicals, sitemap, robots, OG, JSON-LD, and internal links. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.elevatewellnesschiro.com").replace(
  /\/$/,
  "",
);

const OWN_HOSTS = [
  SITE_URL,
  "https://elevatewellnesschiro.com",
  "http://www.elevatewellnesschiro.com",
  "http://elevatewellnesschiro.com",
  "https://elevate-wellness-chiro.vercel.app",
  "http://elevate-wellness-chiro.vercel.app",
];

/** Turns a relative, apex, or Vercel URL into the live www origin. */
export function toSiteUrl(href: string): string {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("tel:") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }

  for (const host of OWN_HOSTS) {
    if (href === host || href.startsWith(`${host}/`)) {
      const path = href.slice(host.length) || "/";
      return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
    }
  }

  if (href.startsWith("/")) {
    return `${SITE_URL}${href}`;
  }

  return href;
}
