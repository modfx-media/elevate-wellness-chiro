import { getAllPages } from "@/lib/site-content";
import { pseoPages } from "@/lib/pseo-pages";
import { isNoindexPath } from "@/lib/seo";

export type ManifestEntry = {
  path: string;
  source: "inventory" | "pseo" | "extra";
};

/** Public paths with trailing slash — same coverage as the XML sitemap. */
export function getPublicUrlManifest(): ManifestEntry[] {
  const byPath = new Map<string, ManifestEntry>();

  for (const page of getAllPages()) {
    if (isNoindexPath(page.path)) continue;
    byPath.set(page.path, { path: page.path, source: "inventory" });
  }

  for (const page of pseoPages) {
    const path = `/${page.slug}/`;
    if (!byPath.has(path)) byPath.set(path, { path, source: "pseo" });
  }

  for (const path of ["/areas-we-serve/", "/sitemap/", "/clinton/"]) {
    if (!byPath.has(path)) byPath.set(path, { path, source: "extra" });
  }

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}

export function getAllImportPaths(): ManifestEntry[] {
  const byPath = new Map<string, ManifestEntry>();

  for (const page of getAllPages()) {
    byPath.set(page.path, { path: page.path, source: "inventory" });
  }

  for (const page of pseoPages) {
    const path = `/${page.slug}/`;
    if (!byPath.has(path)) byPath.set(path, { path, source: "pseo" });
  }

  for (const path of ["/areas-we-serve/", "/sitemap/", "/clinton/"]) {
    if (!byPath.has(path)) byPath.set(path, { path, source: "extra" });
  }

  return [...byPath.values()].sort((a, b) => a.path.localeCompare(b.path));
}
