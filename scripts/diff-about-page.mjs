// Verifies the built /elevate-wellness-chiropractic/ (About Us) page against
// its site-inventory.json record: every body block present, headings in
// order, images, internal links, meta/schema. Mirrors the parser in
// lib/parse-service-body.ts locally (kept in sync manually).
import { readFileSync } from "node:fs";

const inventory = JSON.parse(readFileSync("seo-audit/site-inventory.json", "utf8"));
const page = inventory.pages.find((p) => p.slug === "elevate-wellness-chiropractic");
if (!page) throw new Error("Page not found in site-inventory.json");

const html = readFileSync(".next/server/app/elevate-wellness-chiropractic.html", "utf8");

let failures = 0;
function check(label, ok) {
  console.log(`  ${ok ? "✅" : "❌"} ${label}`);
  if (!ok) failures++;
}

console.log("Body copy blocks:");
const blocks = page.bodyCopy
  .split("\n\n")
  .map((b) => b.trim())
  .filter(Boolean);
const ctaTails = new Set(["Call", "or", "Online"]);
// The "Home - X" breadcrumb is intentionally split into a Home link + a
// separate label span (matches every other template's HeroBand pattern).
const skip = new Set([...ctaTails, "Home - About Us"]);
for (const b of blocks) {
  if (skip.has(b)) continue;
  const encoded = b.replace(/'/g, "&#x27;").replace(/&/g, "&amp;");
  const found = html.includes(b) || html.includes(encoded);
  check(b.length > 60 ? b.slice(0, 57) + "..." : b, found);
}

console.log("\nHeadings:");
for (const h of page.headings) {
  check(`${h.level}: ${h.text}`, html.includes(h.text));
}

console.log("\nImages (src or normalized https src present):");
for (const img of page.images) {
  // The header-placement logo is global site chrome (rendered by Header.tsx
  // on every page via /brand/, not page-specific body content) — skip it.
  // The hero-placement banner photo was intentionally removed from the page
  // per an explicit later design request — skip it too, and the office photo
  // added in its place is a locally-sourced asset with no site-inventory
  // src, so it isn't checked here.
  if (img.placement === "header" || img.placement === "hero") continue;
  const httpsSrc = img.src.replace(/^http:\/\//, "https://");
  check(`${img.placement}: ${img.src}`, html.includes(img.src) || html.includes(httpsSrc));
}
check("about office photo (added in place of hero banner)", html.includes("/images/about/elevate-wellness-office.jpg"));

console.log("\nKey internal links preserved:");
const expectedLinks = [
  ["Dr. Casey Simmonds bio", "/dr-casey-simmonds/"],
  ["Dr. Kaden Simmonds bio", "/kaden-simmonds-dc/"],
  ["Dr. Mikayla Twarog bio", "/mikayla-twarog-dc/"],
  ["Insurances Covered", "/insurances-covered/"],
  ["Bountiful contact page", "/elevate-wellness-chiropractic-in-bountiful-ut/"],
];
for (const [label, href] of expectedLinks) {
  check(`${label} (${href})`, html.includes(`href="${href}"`) || html.includes(href));
}

console.log("\nMeta / schema:");
check("canonical", html.includes(`href="${page.canonicalUrl}"`));
const titleEncoded = page.metaTitle.replace(/'/g, "&#x27;");
check("title tag", html.includes(`<title>${page.metaTitle}</title>`) || html.includes(`<title>${titleEncoded}</title>`));
check("meta description", html.includes(page.metaDescription));
check("og:image (normalized)", html.includes(page.openGraph.image.replace(/^http:\/\//, "https://")));
check("AboutPage schema", html.includes('"AboutPage"'));
check("BreadcrumbList schema", html.includes('"BreadcrumbList"'));
check("MedicalClinic/Organization schema", html.includes('"MedicalClinic"') && html.includes('"Organization"'));

console.log(`\n${failures === 0 ? "✅ All checks passed" : `❌ ${failures} check(s) failed`}`);
process.exit(failures === 0 ? 0 : 1);
