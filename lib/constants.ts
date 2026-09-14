/** Production origin for canonicals, sitemap, robots, OG, and JSON-LD. */
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

function pathFromOwnHost(href: string): string | null {
  for (const host of OWN_HOSTS) {
    if (href === host || href.startsWith(`${host}/`)) {
      return href.slice(host.length) || "/";
    }
  }
  return null;
}

/** Absolute www URL for metadata, sitemap, robots, and JSON-LD. */
export function toSiteUrl(href: string): string {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("tel:") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }

  const fromHost = pathFromOwnHost(href);
  if (fromHost) return `${SITE_URL}${fromHost.startsWith("/") ? fromHost : `/${fromHost}`}`;
  if (href.startsWith("/")) return `${SITE_URL}${href}`;
  return href;
}

/** In-app path: strip www / apex / Vercel hosts so navigation stays on this origin. */
export function toSitePath(href: string): string {
  if (
    !href ||
    href.startsWith("#") ||
    href.startsWith("tel:") ||
    href.startsWith("mailto:")
  ) {
    return href;
  }

  return pathFromOwnHost(href) ?? href;
}
