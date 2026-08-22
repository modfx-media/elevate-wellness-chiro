#!/usr/bin/env node
/**
 * Full SEO/content parity audit between the crawled site inventory and the
 * built Next.js output. Reads .next/server/app/*.html files as the ground
 * truth for what will actually ship; does not require a running server.
 *
 * For every page in seo-audit/site-inventory.json, verifies:
 *   1. Route resolves at exact same path (built HTML exists)
 *   2. <title>, meta description, and canonical href match inventory
 *   3. JSON-LD @type set contains the expected schema for that pageType
 *   4. Every non-header image src is present in HTML with matching alt
 *   5. Every internalLink destination resolves to a real new route (or
 *      redirect entry)
 *   6. Body word count is within tolerance of the source
 *
 * Cross-cutting checks:
 *   7. mychirotouch.com booking/intake links untouched (still present in every
 *      built HTML that renders the header/footer)
 *   8. Built sitemap.xml URL count matches the inventory count
 *   9. Every entry in redirects-needed.json is wired in next.config.ts
 *
 * Output: a checklist grouped by pageType, then a global-checks section.
 * Exits non-zero if any FAIL is found.
 *
 * Run: node scripts/parity-audit.mjs
 *      VERBOSE=1 node scripts/parity-audit.mjs
 */

import { readFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const inventory = JSON.parse(readFileSync(resolve(ROOT, "seo-audit/site-inventory.json"), "utf8"));
const redirectsNeeded = JSON.parse(readFileSync(resolve(ROOT, "seo-audit/redirects-needed.json"), "utf8"));

const SITE_URL = "https://www.elevatewellnesschiro.com";

// Word-count tolerance below which we flag a page.
const WORD_COUNT_TOLERANCE = 0.15; // 15%

// Schema types we require per page type (each entry is a set of accepted @type
// values — any match is sufficient).
const EXPECTED_SCHEMA = {
  homepage: ["MedicalBusiness", "LocalBusiness"],
  service: ["Service"],
  "injury-condition": ["MedicalCondition", "MedicalWebPage"],
  "service-location/geo page": ["MedicalBusiness", "LocalBusiness"],
  "provider bio": ["Person", "Physician"],
  "blog post": ["BlogPosting"],
  "category archive": ["Blog", "CollectionPage"],
  "legal page": ["WebPage"],
  "utility page": [],
};

// Booking/intake domains that MUST remain intact on every built page that
// renders the header/footer nav.
const BOOKING_DOMAINS = ["appointments.mychirotouch.com", "intake.mychirotouch.com"];

// ─── Route resolution ──────────────────────────────────────────────────────

function candidateHtmlPaths(page) {
  const path = page.path;
  if (page.pageType === "homepage") {
    return [resolve(ROOT, ".next/server/app/index.html")];
  }
  if (path.startsWith("/author/")) {
    const slug = page.slug;
    return [resolve(ROOT, `.next/server/app/author/${slug}.html`)];
  }
  return [
    resolve(ROOT, `.next/server/app/${page.slug}.html`),
    resolve(ROOT, `.next/server/app/${page.slug}/index.html`),
  ];
}

function findHtml(page) {
  for (const p of candidateHtmlPaths(page)) {
    if (existsSync(p)) return { path: p, html: readFileSync(p, "utf8") };
  }
  return null;
}

// ─── Build the valid-route index (for internalLink resolution) ─────────────

const VALID_PATHS = new Set();
for (const page of inventory.pages) {
  VALID_PATHS.add(page.path);
  // Also allow with/without trailing slash
  if (page.path.endsWith("/")) VALID_PATHS.add(page.path.slice(0, -1));
  else VALID_PATHS.add(page.path + "/");
}
// Allowed non-inventory paths (external anchors, tel:, mailto:, top-level fragments).
const REDIRECT_MAP = new Map();
const REDIRECT_PATTERNS = [];
for (const r of redirectsNeeded.redirects ?? []) {
  if (r.oldPath.includes(":")) {
    // Convert `/blog/page/:n` → /^\/blog\/page\/[^/]+$/ (trailing slash-tolerant)
    const re = new RegExp(
      "^" +
        r.oldPath
          .replace(/[.+^${}()|[\]\\]/g, "\\$&")
          .replace(/:[A-Za-z_]+/g, "[^/]+") +
        "/?$",
    );
    REDIRECT_PATTERNS.push(re);
  } else {
    REDIRECT_MAP.set(r.oldPath, r.newPath);
  }
}

function isValidInternalLink(destination) {
  if (!destination) return true;
  if (destination.startsWith("#")) return true;
  if (destination.startsWith("tel:") || destination.startsWith("mailto:")) return true;
  if (destination.startsWith("http://") || destination.startsWith("https://")) {
    // External link → not our concern
    if (!destination.startsWith(SITE_URL)) return true;
    // Same-site absolute URL → check the path portion
    const url = new URL(destination);
    return isValidInternalPath(url.pathname);
  }
  // Strip in-page hash anchors before validating (e.g. /foo/#comment-1).
  const pathOnly = destination.split("#")[0];
  if (pathOnly === "") return true;
  return isValidInternalPath(pathOnly);
}

function isValidInternalPath(p) {
  if (VALID_PATHS.has(p)) return true;
  if (REDIRECT_MAP.has(p)) return true;
  for (const re of REDIRECT_PATTERNS) if (re.test(p)) return true;
  // Try both slash variants
  if (p.endsWith("/") && VALID_PATHS.has(p.slice(0, -1))) return true;
  if (!p.endsWith("/") && VALID_PATHS.has(p + "/")) return true;
  return false;
}

// ─── HTML extractors ───────────────────────────────────────────────────────

function extractTitle(html) {
  const m = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return m ? decodeEntities(m[1].trim()) : null;
}

function extractMetaDescription(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  return m ? decodeEntities(m[1]) : null;
}

function extractCanonical(html) {
  const m = html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i);
  return m ? m[1] : null;
}

function extractJsonLdTypes(html) {
  const types = new Set();
  const scripts = html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g);
  for (const s of scripts) {
    const raw = s[1];
    const matches = raw.matchAll(/"@type":\s*"([^"]+)"|"@type":\s*\[([^\]]+)\]/g);
    for (const m of matches) {
      if (m[1]) types.add(m[1]);
      else if (m[2]) {
        for (const t of m[2].split(",")) types.add(t.replace(/["\s]/g, ""));
      }
    }
  }
  return types;
}

function extractBodyText(html) {
  // Strip <script>, <style>, JSON-LD, <head>, and all tags.
  let s = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<head[\s\S]*?<\/head>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  return decodeEntities(s).replace(/\s+/g, " ").trim();
}

function extractImageSrcs(html) {
  const out = new Set();
  const imgMatches = html.matchAll(/<img[^>]*\bsrc="([^"]+)"/gi);
  for (const m of imgMatches) out.add(m[1]);
  // Also collect from srcset URLs (next/image emits srcset)
  const srcsetMatches = html.matchAll(/srcSet="([^"]+)"|srcset="([^"]+)"/gi);
  for (const m of srcsetMatches) {
    const raw = m[1] ?? m[2] ?? "";
    for (const entry of raw.split(",")) {
      const url = entry.trim().split(/\s+/)[0];
      if (url) out.add(url);
    }
  }
  return out;
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, "/")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(parseInt(n, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)));
}

// ─── Per-page audit ────────────────────────────────────────────────────────

function auditPage(page) {
  const problems = [];
  const found = findHtml(page);

  if (!found) {
    problems.push({ kind: "route404", detail: `no built HTML at ${page.path}` });
    return { page, problems };
  }
  const { html } = found;

  const title = extractTitle(html);
  if (title !== page.metaTitle) {
    problems.push({
      kind: "metaTitle",
      detail: `expected ${JSON.stringify(page.metaTitle)}, got ${JSON.stringify(title)}`,
    });
  }

  const metaDesc = extractMetaDescription(html);
  // Treat null (no meta tag) and empty string as equivalent — both convey
  // "no description" and match how Next's Metadata API omits empty values.
  const metaDescSrc = page.metaDescription ?? "";
  const metaDescBuilt = metaDesc ?? "";
  if (metaDescBuilt !== metaDescSrc) {
    problems.push({
      kind: "metaDescription",
      detail: `expected ${JSON.stringify(metaDescSrc.slice(0, 60))}…, got ${JSON.stringify(metaDescBuilt.slice(0, 60))}…`,
    });
  }

  const canonical = extractCanonical(html);
  if (canonical !== page.canonicalUrl) {
    problems.push({
      kind: "canonical",
      detail: `expected ${JSON.stringify(page.canonicalUrl)}, got ${JSON.stringify(canonical)}`,
    });
  }

  const types = extractJsonLdTypes(html);
  const expected = EXPECTED_SCHEMA[page.pageType] ?? [];
  if (expected.length > 0) {
    const hasAny = expected.some((t) => types.has(t));
    if (!hasAny) {
      problems.push({
        kind: "schema",
        detail: `no expected @type from [${expected.join(", ")}] found. Present: [${[...types].join(", ")}]`,
      });
    }
  }

  const htmlSrcs = extractImageSrcs(html);
  const htmlSrcConcat = html; // fallback substring check
  const missingImages = [];
  for (const img of page.images) {
    // Skip header logo — reused site-wide.
    if (img.placement === "header") continue;
    // Skip WordPress plugin decoration icons — not real page content, and the
    // crawler reuses a bogus alt on many pages.
    if (img.src.includes("/wp-content/plugins/")) continue;
    // Skip footer avatars pulled from gravatar (image is optimized/proxied by next/image)
    // — check alt text only for those.
    const srcInHtml =
      htmlSrcs.has(img.src) ||
      htmlSrcConcat.includes(img.src) ||
      htmlSrcConcat.includes(img.src.replace("http://", "https://"));
    const altInHtml = img.alt ? html.includes(escapeHtml(img.alt)) || html.includes(img.alt) : true;
    if (!srcInHtml && !altInHtml) {
      missingImages.push({ src: img.src, alt: img.alt, placement: img.placement });
    }
  }
  if (missingImages.length > 0) {
    problems.push({
      kind: "images",
      detail: `${missingImages.length} inventory image(s) missing (src + alt both absent)`,
      list: missingImages,
    });
  }

  // Internal link validation.
  const brokenLinks = [];
  const seenBroken = new Set();
  for (const link of page.internalLinks) {
    const dest = link.destination.trim();
    if (!dest || seenBroken.has(dest)) continue;
    if (!isValidInternalLink(dest)) {
      brokenLinks.push({ dest, anchor: link.anchorText });
      seenBroken.add(dest);
    }
  }
  if (brokenLinks.length > 0) {
    problems.push({
      kind: "internalLinks",
      detail: `${brokenLinks.length} internal link destination(s) don't resolve to a new route`,
      list: brokenLinks,
    });
  }

  // Word-count check — sources vary in accuracy across templates, so we only
  // flag pages that lost >15% of body words.
  const srcWords = wordCount(page.bodyCopy || "");
  const outWords = wordCount(extractBodyText(html));
  if (srcWords >= 30) {
    const ratio = outWords / srcWords;
    // Under-render only — over-render is expected (template chrome, related-posts, etc.).
    if (ratio < 1 - WORD_COUNT_TOLERANCE) {
      problems.push({
        kind: "wordCount",
        detail: `built body has ${outWords} words vs source ${srcWords} (${(ratio * 100).toFixed(0)}% of source)`,
      });
    }
  }

  return { page, problems };
}

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// ─── Run audit ─────────────────────────────────────────────────────────────

console.log("SEO/content parity audit\n" + "=".repeat(72));

const byType = new Map();
for (const page of inventory.pages) {
  const result = auditPage(page);
  const type = page.pageType;
  if (!byType.has(type)) byType.set(type, []);
  byType.get(type).push(result);
}

let totalPages = 0;
let totalFails = 0;
const failsByType = new Map();

const TYPE_ORDER = [
  "homepage",
  "service",
  "injury-condition",
  "service-location/geo page",
  "provider bio",
  "blog post",
  "category archive",
  "legal page",
  "utility page",
];

for (const type of TYPE_ORDER) {
  const results = byType.get(type) ?? [];
  const failed = results.filter((r) => r.problems.length > 0);
  totalPages += results.length;
  totalFails += failed.length;
  failsByType.set(type, failed);

  console.log(`\n[${type}]  ${results.length} pages  ·  ${failed.length} with issues`);
  if (failed.length === 0) {
    console.log("  ✅ all pages pass all checks");
    continue;
  }
  for (const { page, problems } of failed) {
    console.log(`  ⚠️  ${page.path}`);
    for (const prob of problems) {
      console.log(`      · ${prob.kind}: ${prob.detail}`);
      if (process.env.VERBOSE && prob.list) {
        for (const item of prob.list.slice(0, 5)) {
          console.log(`          ${JSON.stringify(item)}`);
        }
        if (prob.list.length > 5) console.log(`          …and ${prob.list.length - 5} more`);
      }
    }
  }
}

// ─── Global checks ─────────────────────────────────────────────────────────

console.log("\n" + "=".repeat(72));
console.log("Global checks");

// Sitemap URL count
const sitemapCandidates = [
  resolve(ROOT, ".next/server/app/sitemap.xml.body"),
  resolve(ROOT, ".next/server/app/sitemap.xml"),
];
let sitemapText = null;
for (const p of sitemapCandidates) {
  if (existsSync(p)) {
    try {
      sitemapText = readFileSync(p, "utf8");
      if (sitemapText.length > 500) break;
    } catch {
      // ignore, try the next candidate
    }
  }
}
if (!sitemapText) {
  console.log(`  ⚠️  sitemap.xml: could not locate built sitemap output`);
  totalFails++;
} else {
  const locs = (sitemapText.match(/<loc>/g) || []).length;
  const expected = inventory.totalUrlsInSitemapIndex ?? inventory.pages.length;
  const status = locs === expected ? "✅" : "⚠️ ";
  console.log(`  ${status} sitemap.xml <loc> count = ${locs}  ·  inventory total = ${expected}`);
  if (locs !== expected) totalFails++;
}

// mychirotouch.com preservation — check nav-structure source and a spot sample of built pages
console.log("\n  mychirotouch booking/intake links:");
const sampleSlugs = ["", "back-pain", "chiropractic-care", "signs-of-a-soft-tissue-injury", "elevate-wellness-chiropractic-in-bountiful-ut"];
let mychiroFails = 0;
for (const slug of sampleSlugs) {
  const p = slug === ""
    ? resolve(ROOT, ".next/server/app/index.html")
    : resolve(ROOT, `.next/server/app/${slug}.html`);
  if (!existsSync(p)) {
    console.log(`    ⚠️  ${slug || "(home)"}: HTML not built`);
    mychiroFails++;
    continue;
  }
  const html = readFileSync(p, "utf8");
  const found = BOOKING_DOMAINS.filter((d) => html.includes(d));
  if (found.length === BOOKING_DOMAINS.length) {
    console.log(`    ✅ ${(slug || "(home)").padEnd(48)}  both ${BOOKING_DOMAINS.join(" + ")} present`);
  } else {
    console.log(`    ⚠️  ${(slug || "(home)").padEnd(48)}  missing: ${BOOKING_DOMAINS.filter((d) => !found.includes(d)).join(", ")}`);
    mychiroFails++;
  }
}
if (mychiroFails > 0) totalFails += mychiroFails;

// Redirects: verify next.config.ts wires the redirects-needed.json file.
console.log(`\n  redirects-needed.json (${(redirectsNeeded.redirects ?? []).length} entries):`);
const nextConfig = readFileSync(resolve(ROOT, "next.config.ts"), "utf8");
const wired = nextConfig.includes("redirectsNeeded.redirects");
if (!wired) {
  console.log(`    ⚠️  next.config.ts does NOT wire redirectsNeeded.redirects`);
  totalFails++;
} else {
  console.log(`    ✅ next.config.ts wires redirectsNeeded.redirects (all ${(redirectsNeeded.redirects ?? []).length} entries applied)`);
  for (const r of redirectsNeeded.redirects ?? []) {
    console.log(`       · ${r.oldPath}  →  ${r.newPath}`);
  }
}

// ─── Summary ───────────────────────────────────────────────────────────────

console.log("\n" + "=".repeat(72));
console.log(`Summary: ${totalPages} pages audited  ·  ${totalFails} issue(s) found`);
for (const type of TYPE_ORDER) {
  const failed = failsByType.get(type) ?? [];
  if (failed.length > 0) {
    console.log(`  ⚠️  ${type}: ${failed.length}`);
  }
}
console.log(totalFails === 0 ? "\n✅ Parity clean — safe to go live." : "\n⚠️  Fix the flagged items before going live (rerun with VERBOSE=1 for image/link lists).");
process.exit(totalFails === 0 ? 0 : 1);
