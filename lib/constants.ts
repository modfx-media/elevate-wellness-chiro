/** Production origin for canonicals, sitemap, robots, OG, and JSON-LD. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.elevatewellnesschiro.com").replace(
  /\/$/,
  "",
);
