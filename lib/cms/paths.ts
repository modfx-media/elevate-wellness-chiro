/** CMS `path` is unique, starts with `/`, and has no trailing slash (except homepage). */

export function toCmsPath(input: string): string {
  const trimmed = (input || "").trim();
  if (!trimmed || trimmed === "/") return "/";
  const withSlash = trimmed.startsWith("/") ? trimmed : `/${trimmed}`;
  return withSlash.replace(/\/+$/, "") || "/";
}

/** Public marketing URLs keep a trailing slash (Next `trailingSlash: true`). */
export function toPublicPath(cmsPath: string): string {
  if (!cmsPath || cmsPath === "/") return "/";
  return `${toCmsPath(cmsPath)}/`;
}

export function pathHasInvalidSegments(path: string): boolean {
  return path.split("/").some((segment) => segment === "null" || segment === "undefined");
}
