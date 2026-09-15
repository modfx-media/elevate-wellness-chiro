import Link from "next/link";
import type { CSSProperties } from "react";
import { SITE_URL, toSitePath } from "@/lib/constants";
import type { SiteInventoryPage } from "@/lib/site-content";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  parseServiceBody,
  promoteIntroHeadings,
  type BodyBlock,
  type ServiceSection,
} from "@/lib/parse-service-body";

export function LegalTemplate({ page }: { page: SiteInventoryPage }) {
  const parsed = promoteIntroHeadings(parseServiceBody(page));

  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;

  return (
    <main className="flex flex-1 flex-col bg-white">
      <LegalJsonLd page={page} displayTitle={displayTitle} />
      <HeroBand title={displayTitle} lastModified={page.lastModified} />
      <ArticleBody intro={parsed.intro} sections={parsed.sections} />
    </main>
  );
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroBand({
  title,
  lastModified,
}: {
  title: string;
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
          Legal
        </span>

        <h1 className="reveal mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl">
          {title}
        </h1>

        {lastModified ? (
          <p
            className="reveal mt-6 text-sm text-white/70"
            style={{ "--reveal-delay": "80ms" } as CSSProperties}
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
  return (
    <article className="bg-white px-6 pb-20 pt-10 lg:px-8 lg:pb-24 lg:pt-14">
      <div className="mx-auto max-w-3xl">
        {intro.length > 0 ? (
          <div
            className="reveal space-y-5 text-base leading-relaxed text-ink-900"
            style={{ "--reveal-delay": "40ms" } as CSSProperties}
          >
            <RenderBlocks blocks={intro} />
          </div>
        ) : null}

        {sections.map((section, i) => (
          <section
            key={`${section.heading}-${i}`}
            className="reveal mt-10 sm:mt-12"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            <h2 className="font-display text-xl font-bold tracking-tight text-navy-900 sm:text-2xl">
              {section.heading}
            </h2>
            <div className="mt-4 space-y-4 text-base leading-relaxed text-ink-900">
              <RenderBlocks blocks={section.blocks} />
            </div>
          </section>
        ))}
      </div>
    </article>
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

function LegalJsonLd({
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
  return <JsonLd id={`legal-jsonld-${page.slug}`} data={jsonLd} />;
}
