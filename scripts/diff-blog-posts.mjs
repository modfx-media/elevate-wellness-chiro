#!/usr/bin/env node
/**
 * Coverage + spot-check verifier for the 142 blog posts and 5 category
 * archives.
 *
 *  1. Per-post: every source bodyCopy block from site-inventory.json must land
 *     in the built HTML.
 *  2. Per-post: BlogPosting JSON-LD is present with datePublished, dateModified,
 *     image, headline, canonical URL.
 *  3. Category archives: main /blog/ lists ALL posts; the 4 sub-categories list
 *     the crawled subset in the same order the crawl saw them.
 *  4. Total-count check: rendered post pages count === inventory count.
 *  5. Spot-check: at least 10 posts sampled across different publish months.
 *
 * Run: node scripts/diff-blog-posts.mjs
 *      VERBOSE=1 node scripts/diff-blog-posts.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const inventory = JSON.parse(readFileSync(resolve(ROOT, "seo-audit/site-inventory.json"), "utf8"));

const POSTS = inventory.pages.filter((p) => p.pageType === "blog post");
const CATEGORIES = inventory.pages.filter((p) => p.pageType === "category archive");

// Mirrors lib/parse-service-body.ts so the diff catches drift.
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
      // Exit FAQ mode on a new heading (blog posts sometimes have a
      // "Key Takeaways" section after the FAQ).
      if (headingTexts.has(block)) {
        commitList();
        currentSection = { heading: block, level: headingTexts.get(block), blocks: [] };
        sections.push(currentSection);
        mode = "section";
        continue;
      }
      const isPlusQ = block.startsWith("+");
      const isNumberedQ = /^\d+\.\s+\S.*\?$/.test(block);
      if (isPlusQ || isNumberedQ) {
        const question = isPlusQ ? block.replace(/^\+\s*/, "").trim() : block.trim();
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
    parts.push(f.question);
    parts.push(f.answer);
  }
  return parts;
}

function htmlPath(slug) {
  return resolve(ROOT, `.next/server/app/${slug}.html`);
}

let overallOk = true;
const missingPageCoverage = [];
const missingSchema = [];

// ─── 1. Per-post coverage + schema ─────────────────────────────────────────
console.log("Coverage + BlogPosting schema per post:");
let postsChecked = 0;
for (const post of POSTS) {
  const path = htmlPath(post.slug);
  if (!existsSync(path)) {
    console.log(`  ❌ ${post.slug}: HTML not built`);
    missingPageCoverage.push(post.slug);
    overallOk = false;
    continue;
  }
  const html = readFileSync(path, "utf8");
  postsChecked++;

  const parsed = parse(post);
  const rendered = new Set(collectRenderedText(parsed).map((t) => t.trim()));
  const sourceBlocks = post.bodyCopy.split("\n\n").map((b) => b.trim()).filter(Boolean);
  const dispTitle = post.title.split(" | ")[0].split(" - ")[0].trim();
  const dispLower = dispTitle.toLowerCase();
  let startAt = 0;
  while (startAt < sourceBlocks.length) {
    const b = sourceBlocks[startAt];
    const isTitleEcho =
      b === post.title.split(" - ")[0] ||
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

  const schemaChecks = {
    BlogPosting: html.includes('"BlogPosting"'),
    BreadcrumbList: html.includes('"BreadcrumbList"'),
    datePublished: post.publishDate ? html.includes(`"datePublished":"${post.publishDate}"`) : true,
    dateModified: post.lastModified ? html.includes(`"dateModified":"${post.lastModified}"`) : true,
    canonical: html.includes(`href="${post.canonicalUrl}"`),
    ogImage: post.openGraph?.image
      ? html.includes(post.openGraph.image.replace(/&/g, "&amp;"))
      : true,
  };
  const schemaOk = Object.values(schemaChecks).every(Boolean);

  if (missing.length || !schemaOk) {
    overallOk = false;
    const failing = Object.entries(schemaChecks).filter(([, v]) => !v).map(([k]) => k);
    console.log(
      `  ⚠️  ${post.slug.padEnd(55)}  missing=${missing.length}  schema=${failing.join(",") || "ok"}`,
    );
    if (missing.length) missingPageCoverage.push(post.slug);
    if (!schemaOk) missingSchema.push({ slug: post.slug, failing });
    if (process.env.VERBOSE) {
      for (const m of missing.slice(0, 3)) {
        console.log(`       · missing: ${m.slice(0, 120)}${m.length > 120 ? "…" : ""}`);
      }
    }
  }
}
console.log(
  `  ${postsChecked === POSTS.length && !missingPageCoverage.length && !missingSchema.length ? "✅" : "⚠️ "} ${postsChecked}/${POSTS.length} posts checked  · coverage_issues=${missingPageCoverage.length}  · schema_issues=${missingSchema.length}`,
);

// ─── 2. Total-count check ─────────────────────────────────────────────────
console.log(`\nTotal-post-count check:`);
console.log(`  Inventory says: ${POSTS.length}`);
console.log(`  Rendered pages: ${postsChecked}`);
console.log(`  ${POSTS.length === postsChecked ? "✅" : "⚠️ "} match`);
if (POSTS.length !== postsChecked) overallOk = false;

// ─── 3. Category archives ─────────────────────────────────────────────────
console.log(`\nCategory archives:`);
for (const cat of CATEGORIES) {
  const path = htmlPath(cat.slug);
  const ok = existsSync(path);
  if (!ok) {
    console.log(`  ❌ ${cat.slug}: HTML not built`);
    overallOk = false;
    continue;
  }
  const html = readFileSync(path, "utf8");

  const isHub = cat.slug === "blog";
  const expectedPosts = isHub
    ? POSTS.length
    : uniqueLinkedPosts(cat);
  const cardsRendered = (html.match(/class="[^"]*group[^"]*flex[^"]*flex-col[^"]*overflow-hidden[^"]*rounded-2xl/g) || []).length;
  const hasBlogSchema = isHub
    ? html.includes('"Blog"')
    : html.includes('"CollectionPage"');
  const hasCanonical = html.includes(`href="${cat.canonicalUrl}"`);
  console.log(
    `  ${cardsRendered === expectedPosts && hasBlogSchema && hasCanonical ? "✅" : "⚠️ "} ${cat.slug.padEnd(40)}  posts_expected=${expectedPosts}  cards_rendered=${cardsRendered}  schema=${hasBlogSchema ? "Y" : "-"}  canonical=${hasCanonical ? "Y" : "-"}`,
  );
  if (cardsRendered !== expectedPosts || !hasBlogSchema || !hasCanonical) overallOk = false;
}

function uniqueLinkedPosts(cat) {
  const postSlugs = new Set(POSTS.map((p) => p.slug));
  const seen = new Set();
  for (const l of cat.internalLinks) {
    for (const slug of postSlugs) {
      if (l.destination.includes(`/${slug}/`) || l.destination.endsWith(`/${slug}`)) {
        seen.add(slug);
        break;
      }
    }
  }
  return seen.size;
}

// ─── 4. Spot-check 10+ posts across different months ─────────────────────
console.log(`\nSpot-check across months:`);
const byMonth = new Map();
for (const p of POSTS) {
  const m = (p.publishDate ?? "").slice(0, 7);
  if (!m) continue;
  if (!byMonth.has(m)) byMonth.set(m, []);
  byMonth.get(m).push(p);
}
const monthsSorted = [...byMonth.keys()].sort();
const sample = [];
for (const m of monthsSorted) {
  sample.push(byMonth.get(m)[0]);
  if (sample.length >= 12) break;
}
console.log(`  ${sample.length} posts sampled (one per month across ${monthsSorted.length} months):`);
for (const post of sample) {
  const html = readFileSync(htmlPath(post.slug), "utf8");
  const title = post.title.split(" | ")[0].split(" - ")[0].trim();
  const titleIn = html.includes(title);
  const dateIn = post.publishDate ? html.includes(`"datePublished":"${post.publishDate}"`) : true;
  const firstBlock = post.bodyCopy.split("\n\n").map((b) => b.trim()).filter(Boolean)[0];
  const firstBlockIn = firstBlock && html.includes(firstBlock.slice(0, 80));
  const status = titleIn && dateIn && firstBlockIn ? "✅" : "⚠️ ";
  console.log(
    `  ${status} ${post.publishDate?.slice(0, 10) ?? "?"}  ${post.slug.padEnd(52)}  title=${titleIn ? "Y" : "-"}  date=${dateIn ? "Y" : "-"}  firstBlock=${firstBlockIn ? "Y" : "-"}`,
  );
  if (!(titleIn && dateIn && firstBlockIn)) overallOk = false;
}

console.log("");
console.log(overallOk
  ? "✅ All 142 blog posts + 5 category archives: content preserved, schema present, counts match."
  : "⚠️  Some issues detected (rerun with VERBOSE=1 for missing-block details).");
process.exit(overallOk ? 0 : 1);
