#!/usr/bin/env node
/**
 * Parity + uniqueness check for the 32 service-location (geo) pages.
 *
 * Per-page coverage:
 *   Verify every source bodyCopy block from site-inventory.json lands in the
 *   template's rendered text set. Missing blocks → template dropped content.
 *
 * Pairwise near-duplicate detection:
 *   Compute the Jaccard similarity of each page's "unique long-form paragraphs"
 *   (≥100 chars) against every other page's set. Long paragraphs are the parts
 *   that should be locally-authored per city — if two pages share too many of
 *   them, the template collapsed unique content into boilerplate.
 *
 * Run: node scripts/diff-location-pages.mjs
 *      VERBOSE=1 node scripts/diff-location-pages.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const inventory = JSON.parse(readFileSync(resolve(ROOT, "seo-audit/site-inventory.json"), "utf8"));

const LOCATION_PAGES = inventory.pages.filter((p) => p.pageType === "service-location/geo page");

// Boilerplate blocks shared across many geo pages — excluded from uniqueness check.
const BOILERPLATE_SIGNATURES = new Set([
  "REQUEST YOUR FREE ESTIMATE BY FILLING THE FORM BELOW",
  "ELEVATE YOUR WELLNESS",
  "SCHEDULE TODAY",
  "Call",
  "or",
  "Online",
  "Text",
  "CALL",
  "ONLINE",
  "TEXT",
  "Areas We Serve",
  "Chiropractic Care Areas We Serve: Elevate Wellness Chiropractic",
  "Chiropractic Areas We Serve in Woods Cross and Nearby",
  "North Salt LakeWoods CrossCentervilleWest BountifulSalt LakeSalt Lake CityFarmington",
  "West PointHooperSyracuseSunsetRoyWest HavenClearfield",
  "And more!",
]);

// Mirrors lib/parse-service-body.ts inline, so the diff catches drift.
const CTA_EYEBROWS = new Set(["ELEVATE YOUR WELLNESS", "SCHEDULE TODAY", "ELEVATE WELLNESS"]);
const CTA_TAILS = new Set(["Call", "or", "Online", "Text", "CALL", "ONLINE", "TEXT"]);
const FAQ_HEADING = "Frequently Asked Questions";

function parse(page) {
  const rawBlocks = page.bodyCopy.split("\n\n").map((b) => b.trim()).filter(Boolean);
  const headingTexts = new Map();
  for (const h of page.headings) {
    if (!h.text.trim()) continue;
    headingTexts.set(h.text.trim(), h.level);
  }
  let breadcrumb = null;
  const preamble = [];
  let cursor = 0;
  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim();
  const displayLower = displayTitle.toLowerCase();
  while (cursor < rawBlocks.length) {
    const b = rawBlocks[cursor];
    const isTitleEcho =
      b === page.title.split(" - ")[0] ||
      b === displayTitle ||
      (b.length < 60 &&
        (displayLower.includes(b.toLowerCase()) || b.toLowerCase().includes(displayLower)));
    if (!isTitleEcho) break;
    cursor++;
  }
  const bcIdx = rawBlocks.slice(cursor, cursor + 6).findIndex((b) => /^Home\s*[-–—]\s*/i.test(b));
  if (bcIdx >= 0) {
    for (let k = 0; k < bcIdx; k++) preamble.push(rawBlocks[cursor + k]);
    breadcrumb = rawBlocks[cursor + bcIdx];
    cursor += bcIdx + 1;
  }
  const intro = [];
  const sections = [];
  let cta = null;
  const faq = [];
  let mode = "intro";
  let currentSection = null;
  let listBuffer = null;

  const commitList = () => {
    if (listBuffer?.length) {
      const bucket = currentSection ? currentSection.blocks : intro;
      bucket.push({ type: "list", items: listBuffer });
    }
    listBuffer = null;
  };
  const pushParagraph = (text) => {
    commitList();
    const bucket = currentSection ? currentSection.blocks : intro;
    bucket.push({ type: "paragraph", text });
  };
  const previousParagraph = () => {
    const bucket = currentSection ? currentSection.blocks : intro;
    for (let i = bucket.length - 1; i >= 0; i--) {
      if (bucket[i].type === "paragraph") return bucket[i].text;
    }
    return "";
  };

  for (let i = cursor; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];
    if (block === FAQ_HEADING) { commitList(); mode = "faq"; continue; }
    if (mode === "faq") {
      if (block.startsWith("+")) {
        const question = block.replace(/^\+\s*/, "").trim();
        const answer = (rawBlocks[i + 1] ?? "").trim();
        faq.push({ question, answer });
        i++;
      }
      continue;
    }
    if (CTA_EYEBROWS.has(block)) {
      commitList();
      mode = "cta";
      const next = rawBlocks[i + 1];
      cta = { eyebrow: block, heading: next ?? "", body: [] };
      if (next) i++;
      continue;
    }
    if (mode === "cta") {
      if (CTA_TAILS.has(block)) continue;
      if (cta) cta.body.push(block);
      continue;
    }
    if (headingTexts.has(block)) {
      commitList();
      currentSection = { heading: block, level: headingTexts.get(block), blocks: [] };
      sections.push(currentSection);
      mode = "section";
      continue;
    }
    const looksBullet = block.length <= 300 && !/[.!?][")\]]?$/.test(block);
    if (looksBullet && (listBuffer || /:$/.test(previousParagraph().trim()))) {
      if (!listBuffer) listBuffer = [];
      listBuffer.push(block);
      continue;
    }
    pushParagraph(block);
  }
  commitList();
  return { preamble, breadcrumb, intro, sections, cta, faq };
}

function collectRenderedText(parsed) {
  const parts = [];
  parts.push(...parsed.preamble);
  if (parsed.breadcrumb) parts.push(parsed.breadcrumb);
  const dumpBlocks = (blocks) => {
    for (const b of blocks) {
      if (b.type === "paragraph") parts.push(b.text);
      else parts.push(...b.items);
    }
  };
  dumpBlocks(parsed.intro);
  for (const s of parsed.sections) {
    parts.push(s.heading);
    dumpBlocks(s.blocks);
  }
  if (parsed.cta) {
    parts.push(parsed.cta.eyebrow, parsed.cta.heading, ...parsed.cta.body);
    for (const t of CTA_TAILS) parts.push(t);
  }
  parts.push(FAQ_HEADING);
  for (const f of parsed.faq) {
    parts.push(`+${f.question}`);
    parts.push(f.answer);
  }
  return parts;
}

// Signature = 60-char slice; enough to detect near-verbatim reuse.
function sig(text) {
  return text.replace(/\s+/g, " ").trim().slice(0, 60);
}

function longParagraphs(page) {
  const blocks = page.bodyCopy.split("\n\n").map((b) => b.trim()).filter(Boolean);
  const out = new Set();
  for (const b of blocks) {
    if (b.length < 100) continue;
    if (BOILERPLATE_SIGNATURES.has(b)) continue;
    out.add(sig(b));
  }
  return out;
}

function jaccard(a, b) {
  if (a.size === 0 && b.size === 0) return 0;
  let inter = 0;
  for (const x of a) if (b.has(x)) inter++;
  const union = a.size + b.size - inter;
  return union === 0 ? 0 : inter / union;
}

let overallOk = true;

// ─── Coverage per page ──────────────────────────────────────────────────────
console.log("Coverage:");
for (const page of LOCATION_PAGES) {
  const parsed = parse(page);
  const rendered = new Set(collectRenderedText(parsed).map((t) => t.trim()));
  const sourceBlocks = page.bodyCopy.split("\n\n").map((b) => b.trim()).filter(Boolean);
  const dispTitle = page.title.split(" | ")[0].split(" - ")[0].trim();
  const dispLower = dispTitle.toLowerCase();
  let startAt = 0;
  while (startAt < sourceBlocks.length) {
    const b = sourceBlocks[startAt];
    const isTitleEcho =
      b === page.title.split(" - ")[0] ||
      b === dispTitle ||
      (b.length < 60 &&
        (dispLower.includes(b.toLowerCase()) || b.toLowerCase().includes(dispLower)));
    if (!isTitleEcho) break;
    startAt++;
  }
  const missing = [];
  for (let i = startAt; i < sourceBlocks.length; i++) {
    if (!rendered.has(sourceBlocks[i])) missing.push(sourceBlocks[i]);
  }
  const status = missing.length === 0 ? "✅" : "⚠️ ";
  console.log(`  ${status} ${page.slug.padEnd(48)}  blocks=${sourceBlocks.length.toString().padStart(3)}  sections=${parsed.sections.length}  faq=${parsed.faq.length}  missing=${missing.length}`);
  if (missing.length && process.env.VERBOSE) {
    for (const m of missing.slice(0, 5)) {
      console.log(`       · missing: ${m.slice(0, 120)}${m.length > 120 ? "…" : ""}`);
    }
    if (missing.length > 5) console.log(`       · …and ${missing.length - 5} more`);
  }
  if (missing.length) overallOk = false;
}

// ─── Pairwise uniqueness ────────────────────────────────────────────────────
console.log("\nPairwise long-paragraph Jaccard similarity (excluding boilerplate):");
const THRESHOLD = 0.6; // above this, two pages share too many "unique" paragraphs
const paraSets = LOCATION_PAGES.map((p) => ({ slug: p.slug, sigs: longParagraphs(p) }));

const flagged = [];
for (let i = 0; i < paraSets.length; i++) {
  for (let j = i + 1; j < paraSets.length; j++) {
    const a = paraSets[i];
    const b = paraSets[j];
    const score = jaccard(a.sigs, b.sigs);
    if (score >= THRESHOLD && (a.sigs.size > 0 || b.sigs.size > 0)) {
      flagged.push({ a: a.slug, b: b.slug, score, aSize: a.sigs.size, bSize: b.sigs.size });
    }
  }
}

if (flagged.length === 0) {
  console.log(`  ✅ No pairs share ≥${(THRESHOLD * 100).toFixed(0)}% of their long-form paragraphs.`);
} else {
  console.log(`  ⚠️  ${flagged.length} pair(s) share ≥${(THRESHOLD * 100).toFixed(0)}% of long paragraphs:`);
  flagged.sort((x, y) => y.score - x.score);
  for (const f of flagged.slice(0, 40)) {
    console.log(`     ${f.score.toFixed(2)}  ${f.a}  ↔  ${f.b}   (${f.aSize}/${f.bSize} unique paras)`);
  }
  if (flagged.length > 40) console.log(`     …and ${flagged.length - 40} more`);
  overallOk = false;
}

// Any page whose long-para set is empty AND body >1000 chars is suspicious.
console.log("\nEmpty-unique-content check (long body but 0 unique paragraphs):");
const suspiciousEmpty = LOCATION_PAGES
  .map((p) => ({ slug: p.slug, bodyLen: p.bodyCopy.length, sigs: longParagraphs(p).size }))
  .filter((r) => r.sigs === 0 && r.bodyLen > 1000);
if (suspiciousEmpty.length === 0) {
  console.log("  ✅ All content-heavy pages contribute unique paragraphs.");
} else {
  for (const s of suspiciousEmpty) {
    console.log(`  ⚠️  ${s.slug.padEnd(48)}  body=${s.bodyLen}b  unique=0`);
  }
  overallOk = false;
}

console.log("");
console.log(overallOk
  ? "✅ All 32 service-location pages: content preserved, no near-duplicates."
  : "⚠️  Some issues detected (rerun with VERBOSE=1 for missing-block details).");
process.exit(overallOk ? 0 : 1);
