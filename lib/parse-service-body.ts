import type { SiteInventoryPage } from "@/lib/site-content";

/**
 * Structured representation of a service page parsed from the crawl's raw
 * bodyCopy. Every content string here appears verbatim in the inventory.
 */
export interface ParsedServiceBody {
  preamble: string[];
  breadcrumb: string | null;
  intro: BodyBlock[];
  sections: ServiceSection[];
  cta: { eyebrow: string; heading: string; body: string[] } | null;
  faq: { question: string; answer: string }[];
}

export interface ServiceSection {
  heading: string;
  headingLevel: "h1" | "h2";
  blocks: BodyBlock[];
}

export type BodyBlock =
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

const CTA_EYEBROWS = new Set(["ELEVATE YOUR WELLNESS", "SCHEDULE TODAY", "ELEVATE WELLNESS"]);
const CTA_TAILS = new Set(["Call", "or", "Online"]);
const FAQ_HEADING = "Frequently Asked Questions";

/**
 * Parses a crawled service page's `bodyCopy` string into typed sections.
 * The crawl gives one flat string with blocks separated by "\n\n"; we walk
 * those blocks and split them into intro / sections / CTA / FAQ using the
 * `headings` list from the same inventory record as authoritative markers.
 */
export function parseServiceBody(page: SiteInventoryPage): ParsedServiceBody {
  const rawBlocks = page.bodyCopy
    .split("\n\n")
    .map((b) => b.trim())
    .filter(Boolean);

  const headingTexts = new Map<string, "h1" | "h2">();
  for (const h of page.headings) {
    if (!h.text.trim()) continue;
    headingTexts.set(h.text.trim(), h.level === "h1" ? "h1" : "h2");
  }

  let breadcrumb: string | null = null;
  const preamble: string[] = [];
  let cursor = 0;

  // Strip any leading title-echo blocks (crawler artifact). A block is a
  // title-echo if it matches or is a short substring of the display title
  // (e.g. "Pediatric Chiropractor" appearing before "Home - Pediatric
  // Chiropractor"). This prevents the title from rendering twice in the hero.
  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim();
  const displayLower = displayTitle.toLowerCase();
  while (cursor < rawBlocks.length) {
    const block = rawBlocks[cursor];
    const isTitleEcho =
      block === page.title.split(" - ")[0] ||
      block === displayTitle ||
      (block.length < 60 &&
        (displayLower.includes(block.toLowerCase()) || block.toLowerCase().includes(displayLower)));
    if (!isTitleEcho) break;
    cursor++;
  }

  // Scan the next few blocks for a "Home - X" breadcrumb. Anything before it is
  // preamble (badges/taglines that visually sit next to the H1 on the live page).
  const breadcrumbIndex = rawBlocks
    .slice(cursor, cursor + 6)
    .findIndex((b) => /^Home\s*[-–—]\s*/i.test(b));
  if (breadcrumbIndex >= 0) {
    for (let k = 0; k < breadcrumbIndex; k++) {
      preamble.push(rawBlocks[cursor + k]);
    }
    breadcrumb = rawBlocks[cursor + breadcrumbIndex];
    cursor += breadcrumbIndex + 1;
  }

  // Section walker
  const intro: BodyBlock[] = [];
  const sections: ServiceSection[] = [];
  let cta: ParsedServiceBody["cta"] = null;
  const faq: { question: string; answer: string }[] = [];

  let mode: "intro" | "section" | "cta" | "faq" = "intro";
  let currentSection: ServiceSection | null = null;
  let listBuffer: string[] | null = null;

  function commitList() {
    if (listBuffer && listBuffer.length) {
      const bucket = currentSection ? currentSection.blocks : intro;
      bucket.push({ type: "list", items: listBuffer });
    }
    listBuffer = null;
  }

  function pushParagraph(text: string) {
    commitList();
    const bucket = currentSection ? currentSection.blocks : intro;
    bucket.push({ type: "paragraph", text });
  }

  for (let i = cursor; i < rawBlocks.length; i++) {
    const block = rawBlocks[i];

    if (block === FAQ_HEADING) {
      commitList();
      mode = "faq";
      continue;
    }

    if (mode === "faq") {
      // FAQ Q&A: each question is prefixed with '+', the next block is the answer.
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
      const nextHeading = rawBlocks[i + 1];
      cta = { eyebrow: block, heading: nextHeading ?? "", body: [] };
      if (nextHeading) i++;
      continue;
    }

    if (mode === "cta") {
      // Skip the "Call / or / Online" boilerplate that follows the CTA heading.
      if (CTA_TAILS.has(block)) continue;
      // Any other block between the heading and buttons is a real CTA body
      // paragraph (auto-accidents has one). Preserve verbatim.
      if (cta) cta.body.push(block);
      continue;
    }

    // Non-FAQ, non-CTA modes: intro or section
    if (headingTexts.has(block)) {
      commitList();
      const level = headingTexts.get(block)!;
      currentSection = { heading: block, headingLevel: level, blocks: [] };
      sections.push(currentSection);
      mode = "section";
      continue;
    }

    // List-run heuristic: consecutive short blocks that don't end with a
    // terminal period form a bulleted list. Long blocks or period-terminated
    // blocks flush the list buffer as a paragraph.
    const looksBullet = block.length <= 300 && !/[.!?][")\]]?$/.test(block);
    if (looksBullet && (listBuffer || endsWithColon(previousParagraph(currentSection, intro)))) {
      if (!listBuffer) listBuffer = [];
      listBuffer.push(block);
      continue;
    }

    pushParagraph(block);
  }

  commitList();

  return { preamble, breadcrumb, intro, sections, cta, faq };
}

function previousParagraph(section: ServiceSection | null, intro: BodyBlock[]): string {
  const bucket = section ? section.blocks : intro;
  for (let i = bucket.length - 1; i >= 0; i--) {
    if (bucket[i].type === "paragraph") return (bucket[i] as { type: "paragraph"; text: string }).text;
  }
  return "";
}

function endsWithColon(text: string): boolean {
  return /:$/.test(text.trim());
}
