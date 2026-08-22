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
// "Text" and "CALL"/"ONLINE" cover geo/location pages that add a Text-us option
// and use uppercase button labels; safe additive tokens (none appear as real CTA
// body copy on services/conditions).
const CTA_TAILS = new Set(["Call", "or", "Online", "Text", "CALL", "ONLINE", "TEXT"]);
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
      // Exit FAQ mode if a new heading appears (e.g. blog posts that put a
      // "Key Takeaways" section after the FAQ). Services/conditions always
      // end with FAQ, so this is safe there.
      if (headingTexts.has(block)) {
        commitList();
        const level = headingTexts.get(block)!;
        currentSection = { heading: block, headingLevel: level, blocks: [] };
        sections.push(currentSection);
        mode = "section";
        continue;
      }
      // Question forms accepted: `+How ...` (services/conditions) or
      // `1. How ...?` / `2. How ...?` (some blog posts).
      const isPlusQ = block.startsWith("+");
      const isNumberedQ = /^\d+\.\s+\S.*\?$/.test(block);
      if (isPlusQ || isNumberedQ) {
        // Strip the "+" service-page prefix; keep "1. "-style numbering as-is
        // since it's part of the original question copy.
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

// ─── Post-processors ─────────────────────────────────────────────────────────
//
// Some crawled pages (e.g. tension-headache, migraines, sciatica) are missing
// most H2 markers in `headings`, so parseServiceBody dumps 30+ blocks into
// `intro`. These helpers recover structure from the flat block stream.

const HEADING_MAX_LEN = 100;
const BODY_MIN_LEN = 90;

function looksLikeHeading(text: string): boolean {
  const t = text.trim();
  if (t.length === 0 || t.length > HEADING_MAX_LEN) return false;
  if (/[.!:][")\]]?$/.test(t)) return false;
  return true;
}

function isBodyParagraph(text: string): boolean {
  const t = text.trim();
  return t.length >= BODY_MIN_LEN || /:$/.test(t);
}

/** Regroups runs of ≥2 consecutive short-no-terminal paragraphs into a list. */
export function regroupConsecutiveShortsAsLists(blocks: BodyBlock[]): BodyBlock[] {
  const out: BodyBlock[] = [];
  let run: string[] = [];
  const flush = () => {
    if (run.length >= 2) out.push({ type: "list", items: run });
    else if (run.length === 1) out.push({ type: "paragraph", text: run[0] });
    run = [];
  };
  for (const b of blocks) {
    if (b.type === "paragraph" && b.text.length <= 200 && !/[.!?][")\]]?$/.test(b.text.trim()) && !/:$/.test(b.text.trim())) {
      run.push(b.text);
    } else {
      flush();
      out.push(b);
    }
  }
  flush();
  return out;
}

/**
 * Promotes heading-like paragraphs in `intro` into synthetic sections.
 * A block is promoted only when it's short, non-terminal, and the NEXT block
 * is real body content — that gate keeps runs of short items (real list
 * items) from being mis-promoted.
 */
export function promoteIntroHeadings(parsed: ParsedServiceBody): ParsedServiceBody {
  const introParaCount = parsed.intro.filter((b) => b.type === "paragraph").length;
  if (introParaCount <= 3) return parsed;

  const regrouped = regroupConsecutiveShortsAsLists(parsed.intro);

  const newIntro: BodyBlock[] = [];
  const newSections: ServiceSection[] = [];
  let current: ServiceSection | null = null;

  for (let i = 0; i < regrouped.length; i++) {
    const b = regrouped[i];
    const next = regrouped[i + 1];

    const nextIsBody =
      next &&
      ((next.type === "paragraph" && isBodyParagraph(next.text)) || next.type === "list");

    if (b.type === "paragraph" && looksLikeHeading(b.text) && nextIsBody) {
      current = { heading: b.text.trim(), headingLevel: "h2", blocks: [] };
      newSections.push(current);
      continue;
    }

    if (current) {
      current.blocks.push(b);
    } else {
      newIntro.push(b);
    }
  }

  if (newSections.length === 0) return parsed;

  return {
    ...parsed,
    intro: newIntro,
    sections: [...newSections, ...parsed.sections],
  };
}
