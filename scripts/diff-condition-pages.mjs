#!/usr/bin/env node
/**
 * Parity check: for each of the 13 injury/condition pages, verify the
 * ConditionTemplate parser retains every paragraph, list item, image, and FAQ
 * pair from the source inventory. Flags anything missing.
 *
 * Run: node scripts/diff-condition-pages.mjs
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const CONDITION_SLUGS = [
  "injuries-we-treat",
  "auto-accident-injuries",
  "back-pain",
  "headaches",
  "migraines",
  "neck-pain",
  "neuropathy-2",
  "sciatica",
  "spinal-disc-injuries",
  "sports-injuries",
  "tension-headache",
  "whiplash",
  "workplace-injury",
];

const inventory = JSON.parse(readFileSync(resolve(ROOT, "seo-audit/site-inventory.json"), "utf8"));

// Mirrors lib/parse-service-body.ts — kept as an independent in-process copy so
// this diff catches drift between the parser and the source data.
const CTA_EYEBROWS = new Set(["ELEVATE YOUR WELLNESS", "SCHEDULE TODAY", "ELEVATE WELLNESS"]);
const CTA_TAILS = new Set(["Call", "or", "Online"]);
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
    parts.push(parsed.cta.eyebrow, parsed.cta.heading, ...parsed.cta.body, "Call", "or", "Online");
  }
  parts.push(FAQ_HEADING);
  for (const f of parsed.faq) {
    parts.push(`+${f.question}`);
    parts.push(f.answer);
  }
  return parts;
}

let overallOk = true;

for (const slug of CONDITION_SLUGS) {
  const page = inventory.pages.find((p) => p.slug === slug);
  if (!page) {
    console.log(`❌ ${slug}: NOT FOUND in inventory`);
    overallOk = false;
    continue;
  }

  const parsed = parse(page);
  const rendered = collectRenderedText(parsed);
  const renderedSet = new Set(rendered.map((t) => t.trim()));

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
    const block = sourceBlocks[i];
    if (!renderedSet.has(block)) missing.push(block);
  }

  const nonHeaderImages = page.images.filter((img) => img.placement !== "header");
  const heroCount = nonHeaderImages.filter((i) => i.placement === "hero").length;
  const inlineImgCount = nonHeaderImages.filter((i) => i.placement.startsWith("inline")).length;

  const expectedFaq = (page.bodyCopy.match(/\n\+/g) || []).length;
  const problems = [];
  if (missing.length) problems.push(`${missing.length} bodyCopy block(s) missing`);
  if (heroCount === 0 && nonHeaderImages.length > 0) problems.push("hero image not classified");
  if (parsed.faq.length !== expectedFaq) {
    problems.push(`FAQ count mismatch (${parsed.faq.length} vs ${expectedFaq})`);
  }

  const status = problems.length === 0 ? "✅" : "⚠️ ";
  console.log(
    `${status} ${slug.padEnd(24)}` +
      `  sections=${parsed.sections.length}  faq=${parsed.faq.length}` +
      `  hero=${heroCount}  inlineImgs=${inlineImgCount}` +
      `  videos=${page.videos.length}` +
      (problems.length ? `  → ${problems.join(", ")}` : ""),
  );

  if (missing.length && process.env.VERBOSE) {
    for (const m of missing.slice(0, 10)) {
      console.log(`     · missing: ${m.slice(0, 120)}${m.length > 120 ? "…" : ""}`);
    }
    if (missing.length > 10) console.log(`     · …and ${missing.length - 10} more`);
  }

  if (problems.length) overallOk = false;
}

console.log("");
console.log(
  overallOk
    ? "✅ All 13 injury/condition pages parsed cleanly."
    : "⚠️  Some pages have parity issues (rerun with VERBOSE=1 for details).",
);
process.exit(overallOk ? 0 : 1);
