import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { buildContentExport } from "../lib/cms/build-export";

const here = dirname(fileURLToPath(import.meta.url));
const outFile = resolve(here, "../data/content-export.json");

const exported = buildContentExport();
mkdirSync(dirname(outFile), { recursive: true });
writeFileSync(outFile, `${JSON.stringify(exported)}\n`);
console.log(`Wrote ${exported.records.length} records to ${outFile}`);
