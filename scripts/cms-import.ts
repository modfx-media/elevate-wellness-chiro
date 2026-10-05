import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadEnv } from "dotenv";
import type { CmsExportFile, CmsExportRecord } from "../lib/cms/build-export";

const here = dirname(fileURLToPath(import.meta.url));
loadEnv({ path: resolve(here, "../.env.local") });
loadEnv({ path: resolve(here, "../.env") });

const apply = process.env.CMS_IMPORT_APPLY === "1" || process.argv.includes("--apply");
const fileArg = process.argv.find((arg) => arg.endsWith(".json") && !arg.includes("node_modules"));
const exportFile = resolve(here, fileArg || "../data/content-export.json");

function collectionOrder(record: CmsExportRecord): number {
  if (record.collection === "pages" && record.data.pageType === "category archive") return 0;
  if (record.collection === "pages") return 1;
  return 2;
}

function stripRefs(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(stripRefs);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    if (typeof record.$ref === "string") return undefined;
    const next: Record<string, unknown> = {};
    for (const [key, nested] of Object.entries(record)) {
      const cleaned = stripRefs(nested);
      if (cleaned !== undefined) next[key] = cleaned;
    }
    return next;
  }
  return value;
}

async function main() {
  if (!process.env.DATABASE_URL && !process.env.POSTGRES_URL) {
    console.error("DATABASE_URL (Neon pooled) is required to import.");
    process.exit(1);
  }

  const exported = JSON.parse(readFileSync(exportFile, "utf8")) as CmsExportFile;
  const records = [...exported.records].sort((a, b) => collectionOrder(a) - collectionOrder(b));

  console.log(`${apply ? "Applying" : "Dry-run"} import of ${records.length} records from ${exportFile}`);
  if (!apply) {
    console.log("Re-run with CMS_IMPORT_APPLY=1 and --apply to write drafts.");
    return;
  }

  process.env.CMS_IMPORT_APPLY = "1";
  const { getPayload } = await import("payload");
  const payloadConfig = (await import("../payload.config")).default;
  const payload = await getPayload({ config: payloadConfig });

  async function findExisting(collection: "pages" | "posts", record: CmsExportRecord) {
    if (record.legacyId) {
      const byLegacy = await payload.find({
        collection,
        where: { legacyId: { equals: record.legacyId } },
        limit: 1,
        draft: true,
        overrideAccess: true,
      });
      if (byLegacy.docs[0]) return byLegacy.docs[0];
    }
    if (record.sourceUrl) {
      const byUrl = await payload.find({
        collection,
        where: { sourceUrl: { equals: record.sourceUrl } },
        limit: 1,
        draft: true,
        overrideAccess: true,
      });
      if (byUrl.docs[0]) return byUrl.docs[0];
    }
    return null;
  }

  for (const record of records) {
    const data = {
      ...(stripRefs(record.data) as Record<string, unknown>),
      legacyId: record.legacyId,
      sourceUrl: record.sourceUrl,
      _status: "draft" as const,
    };

    const existing = await findExisting(record.collection, record);
    if (existing) {
      await payload.update({
        collection: record.collection,
        id: existing.id,
        data,
        draft: true,
        overrideAccess: true,
      });
      continue;
    }

    await payload.create({
      collection: record.collection,
      data,
      draft: true,
      overrideAccess: true,
    });
  }

  for (const [slug, data] of Object.entries(exported.globals || {})) {
    await payload.updateGlobal({
      slug: slug as "header" | "footer" | "site-settings",
      data: { ...data, _status: "draft" as const },
      draft: true,
      overrideAccess: true,
    });
  }

  console.log("Import complete. Documents remain drafts until published in /admin.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
