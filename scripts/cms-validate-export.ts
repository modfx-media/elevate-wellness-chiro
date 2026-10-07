import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { toCmsPath } from "../lib/cms/paths";
import { getPublicUrlManifest } from "../lib/cms/url-manifest";
import type { CmsExportFile } from "../lib/cms/build-export";

const here = dirname(fileURLToPath(import.meta.url));
const exportFile = resolve(here, process.argv[2] || "../data/content-export.json");

const exported = JSON.parse(readFileSync(exportFile, "utf8")) as CmsExportFile;
if (exported.version !== 1 || !Array.isArray(exported.records)) {
  throw new Error("Invalid content export: expected { version: 1, records }");
}

const recordPaths = new Set(
  exported.records
    .map((record) => (typeof record.data?.path === "string" ? toCmsPath(record.data.path) : null))
    .filter((path): path is string => Boolean(path)),
);

const missing = getPublicUrlManifest()
  .map((entry) => toCmsPath(entry.path))
  .filter((path) => !recordPaths.has(path));

if (missing.length) {
  console.error(`Missing ${missing.length} sitemap paths in export:`);
  for (const path of missing.slice(0, 50)) console.error(`  ${path}`);
  process.exit(1);
}

console.log(`Export covers all ${getPublicUrlManifest().length} sitemap paths (${exported.records.length} records).`);
