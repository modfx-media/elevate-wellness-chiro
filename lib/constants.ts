const CANONICAL_ORIGIN = "https://www.elevatewellnesschiro.com";

function resolveSiteUrl(raw: string | undefined): string {
  const value = (raw || CANONICAL_ORIGIN).replace(/\/$/, "");
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    if (host === "elevatewellnesschiro.com") return CANONICAL_ORIGIN;
  } catch {
    /* ignore invalid env and keep the live www origin */
  }
  return CANONICAL_ORIGIN;
}

/** Always the live www origin. Preview / Vercel hosts never override this. */
export const SITE_URL = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL);

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
