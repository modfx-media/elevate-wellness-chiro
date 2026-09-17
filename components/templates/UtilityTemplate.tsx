import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SITE_URL, toSitePath } from "@/lib/constants";
import type { SiteInventoryPage } from "@/lib/site-content";
import { normalizeAssetUrl } from "@/lib/site-content";
import {
  parseServiceBody,
  promoteIntroHeadings,
  type BodyBlock,
  type ServiceSection,
} from "@/lib/parse-service-body";
import { locations } from "@/components/site/footer-data";
import { doctors } from "@/components/home/homepage-data";
import { ProvidersSection } from "@/components/home/ProvidersSection";
import { CtaBand } from "./ConditionTemplate";
import { PagePlaceholder } from "./PagePlaceholder";
import { JsonLd } from "@/components/seo/JsonLd";

// Slugs with real content in site-inventory.json — routed through the full
// prose-and-list utility shell. Other utility slugs (author archives, sitemap,
// thank-you, etc.) keep the placeholder until their data model is defined.
const CONTENT_UTILITY_SLUGS = new Set(["insurances-covered"]);
const ABOUT_SLUG = "elevate-wellness-chiropractic";

// Same 3 bios as the homepage's "Meet Your Chiropractors" section, with roles
// matching how each doctor is billed on the live About Us page.
const ABOUT_PROVIDERS = [
  { ...doctors[0], role: "Founder & Chiropractic" },
  { ...doctors[1], role: "Chiropractor" },
  { ...doctors[2], role: "Chiropractor" },
];

export function UtilityTemplate({ page }: { page: SiteInventoryPage }) {
  if (page.slug === ABOUT_SLUG) {
    return <AboutUsTemplate page={page} />;
  }

  if (!CONTENT_UTILITY_SLUGS.has(page.slug)) {
    return <PagePlaceholder page={page} typeLabel="Utility" />;
  }

  const parsed = promoteIntroHeadings(parseServiceBody(page));
  const bountiful = locations[0];
  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;

  return (
    <main className="flex flex-1 flex-col bg-white">
      <UtilityJsonLd page={page} displayTitle={displayTitle} />

      <HeroBand
        title={displayTitle}
        excerpt={page.metaDescription}
        lastModified={page.lastModified}
      />

      <ArticleBody intro={parsed.intro} sections={parsed.sections} />

      {parsed.cta ? (
        <CtaBand
          eyebrow={parsed.cta.eyebrow}
          heading={parsed.cta.heading}
          body={parsed.cta.body}
          phone={bountiful.phone}
          telHref={bountiful.telHref}
        />
      ) : null}
    </main>
  );
}

// ─── About Us (1 page: elevate-wellness-chiropractic) ───────────────────────
//
// The crawl's H1 echoes as its own body block ("About Us") ahead of the
// "Home - About Us" breadcrumb rather than matching the SEO <title>, so this
// reads the real on-page heading from the parsed preamble instead of
// `page.title`. The one subheading the crawler didn't tag as h2 ("What to
// Expect") is recovered here by splitting the "About Our Chiropractic Care"
// section's blocks around that exact paragraph text.

function AboutUsTemplate({ page }: { page: SiteInventoryPage }) {
  const parsed = parseServiceBody(page);
  const bountiful = locations[0];

  const displayTitle = parsed.preamble[0] ?? page.title.split(" | ")[0].split(" - ")[0].trim();
  const breadcrumbLabel = parsed.breadcrumb?.replace(/^Home\s*[-–—]\s*/i, "") ?? displayTitle;

  const inventoryInline = page.images.find((img) => img.placement.startsWith("inline"));
  const inlineImage = {
    src: "/images/about/treatment-seated.jpeg",
    alt: "Chiropractic neck adjustment at Elevate Wellness Chiropractic",
    placement: inventoryInline?.placement || "inline (body content)",
  };

  const aboutSection = parsed.sections.find((s) => s.heading === "About Our Chiropractic Care");
  const splitIdx =
    aboutSection?.blocks.findIndex((b) => b.type === "paragraph" && b.text === "What to Expect") ?? -1;
  const introBlocks = aboutSection ? (splitIdx >= 0 ? aboutSection.blocks.slice(0, splitIdx) : aboutSection.blocks) : [];
  const expectBlocks = aboutSection && splitIdx >= 0 ? aboutSection.blocks.slice(splitIdx + 1) : [];

  return (
    <main className="flex flex-1 flex-col bg-white">
      <AboutJsonLd page={page} displayTitle={displayTitle} bountiful={bountiful} />

      <AboutHero breadcrumbLabel={breadcrumbLabel} title={displayTitle} excerpt={page.metaDescription} />

      <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <div className="reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
              Our Practice
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              About Our Chiropractic Care
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-900 sm:text-lg">
              <RenderBlocks blocks={introBlocks} />
            </div>
          </div>

          {inlineImage ? (
            <div
              className="reveal relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-navy-900/5 shadow-xl lg:self-start"
              style={{ "--reveal-delay": "100ms" } as CSSProperties}
            >
              <Image
                src={normalizeAssetUrl(inlineImage.src)}
                alt={inlineImage.alt}
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          ) : null}
        </div>

        {expectBlocks.length > 0 ? (
          <div
            className="reveal mx-auto mt-14 grid max-w-[1180px] grid-cols-1 items-start gap-12 border-t border-navy-900/10 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16"
            style={{ "--reveal-delay": "80ms" } as CSSProperties}
          >
            <div>
              <h3 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                What to Expect
              </h3>
              <div className="mt-5 max-w-3xl space-y-5 text-base leading-relaxed text-ink-900 sm:text-lg">
                <RenderBlocks blocks={expectBlocks} />
              </div>
            </div>

            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-navy-900/5 shadow-xl lg:self-start">
              <Image
                src="/images/about/treatment-decompression.jpeg"
                alt="Spinal decompression treatment at Elevate Wellness Chiropractic"
                fill
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="object-cover"
              />
            </div>
          </div>
        ) : null}
      </section>

      <ProvidersSection heading="Meet Our Chiropractors" providers={ABOUT_PROVIDERS} />

      <div className="mx-auto -mt-12 mb-12 max-w-[1180px] px-6 text-center lg:px-8">
        <Link
          href={toSitePath("/insurances-covered/")}
          className="inline-flex items-center gap-2 text-sm font-semibold text-primary-700 hover:underline"
        >
          See the insurance plans we accept &rarr;
        </Link>
      </div>

      {parsed.cta ? (
        <CtaBand
          eyebrow={parsed.cta.eyebrow}
          heading={parsed.cta.heading}
          body={parsed.cta.body}
          phone={bountiful.phone}
          telHref={bountiful.telHref}
        />
      ) : null}
    </main>
  );
}

function AboutHero({
  breadcrumbLabel,
  title,
  excerpt,
}: {
  breadcrumbLabel: string;
  title: string;
  excerpt: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-500/10 blur-[160px]"
      />

      <div className="relative mx-auto max-w-3xl px-6 pb-16 pt-12 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="reveal">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300"
          >
            <Link href={toSitePath("/")} className="transition-colors hover:text-white">
              Home
            </Link>
            <span aria-hidden className="text-white/40">
              /
            </span>
            <span className="text-white/70">{breadcrumbLabel}</span>
          </nav>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
            {title}
          </h1>

          {excerpt ? (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">{excerpt}</p>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function AboutJsonLd({
  page,
  displayTitle,
  bountiful,
}: {
  page: SiteInventoryPage;
  displayTitle: string;
  bountiful: (typeof locations)[number];
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: displayTitle, item: page.canonicalUrl },
      ],
    },
    {
      "@type": "AboutPage",
      name: displayTitle,
      description: page.metaDescription,
      url: page.canonicalUrl,
      dateModified: page.lastModified,
    },
    {
      "@type": ["MedicalClinic", "Organization"],
      name: "Elevate Wellness Chiropractic",
      url: `${SITE_URL}/`,
      telephone: bountiful.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: "190 W 100 S Ste C",
        addressLocality: "Bountiful",
        addressRegion: "UT",
        postalCode: "84010",
        addressCountry: "US",
      },
    },
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };
  return <JsonLd id={`about-jsonld-${page.slug}`} data={jsonLd} />;
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroBand({
  title,
  excerpt,
  lastModified,
}: {
  title: string;
  excerpt: string;
  lastModified: string;
}) {
  return (
    <section className="relative overflow-hidden bg-navy-900">
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-900 to-navy-800"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-96 w-96 rounded-full bg-primary-500/10 blur-[160px]"
      />

      <div className="relative mx-auto max-w-3xl px-6 pb-14 pt-14 lg:px-8 lg:pb-20 lg:pt-20">
        <nav
          aria-label="Breadcrumb"
          className="reveal flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300"
        >
          <Link href={toSitePath("/")} className="transition-colors hover:text-white">
            Home
          </Link>
          <span aria-hidden className="text-white/40">
            /
          </span>
          <span className="text-white/70">{title}</span>
        </nav>

        <span className="reveal mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-400" />
          Patient Info
        </span>

        <h1 className="reveal mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
          {title}
        </h1>

        {excerpt ? (
          <p
            className="reveal mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            {excerpt}
          </p>
        ) : null}

        {lastModified ? (
          <p
            className="reveal mt-6 text-xs text-white/60"
            style={{ "--reveal-delay": "100ms" } as CSSProperties}
          >
            Last updated <time dateTime={lastModified}>{formatDate(lastModified)}</time>
          </p>
        ) : null}
      </div>
    </section>
  );
}

// ─── Article body ───────────────────────────────────────────────────────────

function ArticleBody({
  intro,
  sections,
}: {
  intro: BodyBlock[];
  sections: ServiceSection[];
}) {
  // Split intro around a "…accepted:" paragraph so the list gets its own
  // heading and card-grid treatment. Everything before/after stays as prose.
  const listAnchorIdx = intro.findIndex(
    (b) => b.type === "paragraph" && /accepted:\s*$/i.test(b.text),
  );

  let beforeBlocks: BodyBlock[] = intro;
  let listLabel: string | null = null;
  const listItems: string[] = [];
  let afterBlocks: BodyBlock[] = [];

  if (listAnchorIdx >= 0) {
    const anchor = intro[listAnchorIdx] as Extract<BodyBlock, { type: "paragraph" }>;
    listLabel = anchor.text;
    beforeBlocks = intro.slice(0, listAnchorIdx);

    // After the anchor: consume list-like items (either a real list block, or
    // a run of short paragraphs). Stop at the first long paragraph — that's
    // the closing prose.
    let i = listAnchorIdx + 1;
    while (i < intro.length) {
      const b = intro[i];
      if (b.type === "list") {
        listItems.push(...b.items);
        i++;
        continue;
      }
      // A "list item" here is any paragraph short enough to fit a plan name.
      if (b.type === "paragraph" && b.text.length <= 120) {
        listItems.push(b.text);
        i++;
        continue;
      }
      break;
    }
    afterBlocks = intro.slice(i);
  }

  return (
    <article className="bg-white px-6 pb-20 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
      <div className="mx-auto max-w-3xl">
        {beforeBlocks.length > 0 ? (
          <div
            className="reveal space-y-5 text-base leading-relaxed text-ink-900 sm:text-lg"
            style={{ "--reveal-delay": "40ms" } as CSSProperties}
          >
            <RenderBlocks blocks={beforeBlocks} />
          </div>
        ) : null}

        {listItems.length > 0 && listLabel ? (
          <section
            className="reveal mt-12"
            style={{ "--reveal-delay": "80ms" } as CSSProperties}
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              {listLabel}
            </h2>
            <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {listItems.map((item, i) => (
                <InsuranceCard key={i} index={i} text={item} />
              ))}
            </ul>
          </section>
        ) : null}

        {afterBlocks.length > 0 ? (
          <div
            className="reveal mt-12 space-y-5 text-base leading-relaxed text-ink-900 sm:text-lg"
            style={{ "--reveal-delay": "100ms" } as CSSProperties}
          >
            <RenderBlocks blocks={afterBlocks} />
          </div>
        ) : null}

        {sections.map((section, i) => (
          <section
            key={`${section.heading}-${i}`}
            className="reveal mt-12"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              {section.heading}
            </h2>
            <div className="mt-5 space-y-5 text-base leading-relaxed text-ink-900 sm:text-lg">
              <RenderBlocks blocks={section.blocks} />
            </div>
          </section>
        ))}
      </div>
    </article>
  );
}

function InsuranceCard({ index, text }: { index: number; text: string }) {
  return (
    <li className="group flex items-center gap-4 rounded-2xl border border-navy-900/5 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-primary-200 hover:shadow-xl">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 font-display text-sm font-bold text-navy-900 transition-colors group-hover:bg-primary-500 group-hover:text-white"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-sm font-medium leading-relaxed text-ink-900">{text}</span>
    </li>
  );
}

function RenderBlocks({ blocks }: { blocks: BodyBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "paragraph") return <p key={i}>{b.text}</p>;
        return (
          <ul key={i} className="ml-1 list-disc space-y-2 pl-5 marker:text-primary-500">
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

// ─── Formatting ─────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

// ─── JSON-LD ────────────────────────────────────────────────────────────────

function UtilityJsonLd({
  page,
  displayTitle,
}: {
  page: SiteInventoryPage;
  displayTitle: string;
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: displayTitle, item: page.canonicalUrl },
      ],
    },
    {
      "@type": "WebPage",
      name: displayTitle,
      description: page.metaDescription,
      url: page.canonicalUrl,
      dateModified: page.lastModified,
    },
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };
  return <JsonLd id={`utility-jsonld-${page.slug}`} data={jsonLd} />;
}
