import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SITE_URL } from "@/lib/constants";
import type { SiteInventoryPage, InventoryImage } from "@/lib/site-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { parseServiceBody } from "@/lib/parse-service-body";
import { BOOKING_URL } from "@/components/site/nav-data";
import { locations } from "@/components/site/footer-data";
import { CtaBand } from "./ConditionTemplate";

const PRACTICE_NAME = "Elevate Wellness Chiropractic";

// Slug-keyed headshot overrides. Keeps the inventory alt text but swaps the src
// for a locally-hosted photo that reads better than the crawled WordPress asset.
const HEADSHOT_OVERRIDES: Record<string, string> = {
  "dr-casey-simmonds": "/images/homepage/casey-simmonds-banner.jpeg",
  "kaden-simmonds-dc": "/images/homepage/kaden-simmonds-banner.jpeg",
};

export function ProviderBioTemplate({ page }: { page: SiteInventoryPage }) {
  const parsed = parseServiceBody(page);
  const bountiful = locations[0];

  const { displayName, credentials } = deriveNameFromTitle(page.title);
  // Casey's page marks the role explicitly as an H2; other bios don't, so fall
  // back to the generic role implied by the site context and body copy.
  const roleHeading =
    parsed.sections.find((s) => !isCtaHeading(s.heading))?.heading ?? null;
  const jobTitle = roleHeading ?? "Chiropractor";

  const headshotRaw =
    page.images.find((img) => img.placement === "hero") ??
    page.images.find((img) => img.placement.startsWith("inline"));
  const overrideSrc = HEADSHOT_OVERRIDES[page.slug];
  const headshot: InventoryImage | undefined = overrideSrc
    ? {
        src: overrideSrc,
        alt: headshotRaw?.alt || displayName,
        placement: headshotRaw?.placement || "hero",
      }
    : headshotRaw;

  const bioParagraphs: string[] = [];
  for (const b of parsed.intro) {
    if (b.type === "paragraph") bioParagraphs.push(b.text);
  }
  for (const s of parsed.sections) {
    if (isCtaHeading(s.heading)) continue;
    for (const b of s.blocks) {
      if (b.type === "paragraph") bioParagraphs.push(b.text);
    }
  }

  return (
    <main className="flex flex-1 flex-col bg-white">
      <ProviderJsonLd
        page={page}
        displayName={displayName}
        credentials={credentials}
        jobTitle={jobTitle}
        headshot={headshot}
      />

      <HeroBand
        breadcrumb={parsed.breadcrumb}
        displayName={displayName}
        credentials={credentials}
        jobTitle={jobTitle}
        headshot={headshot}
        firstParagraph={bioParagraphs[0] ?? null}
        bountiful={{ phone: bountiful.phone, telHref: bountiful.telHref }}
      />

      {bioParagraphs.length > 1 ? (
        <BioBody paragraphs={bioParagraphs.slice(1)} name={displayName} />
      ) : null}

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

function isCtaHeading(heading: string): boolean {
  const t = heading.trim().toUpperCase();
  return t === "SCHEDULE TODAY" || t === "ELEVATE YOUR WELLNESS";
}

// Turns the crawled record title into a clean display name + credential suffix.
// e.g. "Meet Dr. Casey Simmonds | Elevate Wellness Chiropractic" → "Dr. Casey Simmonds"
//      "Kaden Simmonds DC | Elevate Wellness Chiropractic"     → "Dr. Kaden Simmonds" + "DC"
//      "Dr. Mikayla Twarog DC | Elevate Wellness Chiropractic" → "Dr. Mikayla Twarog" + "DC"
function deriveNameFromTitle(title: string): { displayName: string; credentials: string | null } {
  let name = title.split(" | ")[0].split(" - ")[0].trim();
  name = name.replace(/^Meet\s+/i, "").trim();
  const credMatch = name.match(/\s+(DC|D\.C\.|DACBSP|DABCO)\s*$/i);
  const credentials = credMatch ? credMatch[1].toUpperCase() : null;
  if (credMatch) name = name.slice(0, credMatch.index).trim();
  if (!/^Dr\.?\s+/i.test(name)) name = `Dr. ${name}`;
  return { displayName: name, credentials };
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function HeroBand({
  breadcrumb,
  displayName,
  credentials,
  jobTitle,
  headshot,
  firstParagraph,
  bountiful,
}: {
  breadcrumb: string | null;
  displayName: string;
  credentials: string | null;
  jobTitle: string;
  headshot?: InventoryImage;
  firstParagraph: string | null;
  bountiful: { phone: string; telHref: string };
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
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 bottom-0 h-[28rem] w-[28rem] rounded-full bg-primary-500/10 blur-[180px]"
      />

      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-10 px-6 pb-16 pt-12 lg:min-h-[520px] lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:px-8 lg:pb-20 lg:pt-16">
        <div className="reveal">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300"
          >
            <Link href="/" className="transition-colors hover:text-white">
              Home
            </Link>
            <span aria-hidden className="text-white/40">
              /
            </span>
            <span className="text-white/70">
              {breadcrumb
                ? breadcrumb.replace(/^Home\s*[-–—]\s*/i, "")
                : `${displayName}${credentials ? ` ${credentials}` : ""}`}
            </span>
          </nav>

          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            Meet the Team
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            {displayName}
            {credentials ? (
              <span className="ml-2 align-baseline text-2xl font-semibold text-primary-300 sm:text-3xl">
                {credentials}
              </span>
            ) : null}
          </h1>

          <p className="mt-3 text-base font-medium text-primary-300">{jobTitle}</p>

          {firstParagraph ? (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              {firstParagraph}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
            >
              Schedule with {displayName.split(" ").slice(0, 2).join(" ")}
            </a>
            <a
              href={bountiful.telHref}
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Call {bountiful.phone}
            </a>
          </div>
        </div>

        {headshot ? (
          <div
            className="reveal relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:justify-self-end"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            <Image
              src={headshot.src}
              alt={headshot.alt}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority
              className={
                headshot.src.includes("casey-simmonds") ||
                headshot.src.includes("kaden-simmonds")
                  ? "scale-[1.08] object-cover object-[50%_18%]"
                  : "object-cover object-top"
              }
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Bio body ───────────────────────────────────────────────────────────────

function BioBody({ paragraphs, name }: { paragraphs: string[]; name: string }) {
  const firstName = name.replace(/^Dr\.?\s+/i, "").split(" ")[0];
  return (
    <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <div className="reveal">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
            About {firstName}
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {name}&rsquo;s story
          </h2>
        </div>
        <div
          className="reveal mt-8 space-y-5 text-base leading-relaxed text-ink-900"
          style={{ "--reveal-delay": "80ms" } as CSSProperties}
        >
          {paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── JSON-LD ────────────────────────────────────────────────────────────────

function ProviderJsonLd({
  page,
  displayName,
  credentials,
  jobTitle,
  headshot,
}: {
  page: SiteInventoryPage;
  displayName: string;
  credentials: string | null;
  jobTitle: string;
  headshot?: InventoryImage;
}) {
  const person: Record<string, unknown> = {
    "@type": ["Person", "Physician"],
    name: displayName,
    jobTitle,
    url: page.canonicalUrl,
    description: page.metaDescription,
    worksFor: {
      "@type": "MedicalBusiness",
      name: PRACTICE_NAME,
      url: `${SITE_URL}/`,
    },
    medicalSpecialty: "Chiropractic",
  };
  if (credentials) person.honorificSuffix = credentials;
  if (headshot) person.image = headshot.src;

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: displayName, item: page.canonicalUrl },
      ],
    },
    person,
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };
  return <JsonLd id={`provider-jsonld-${page.slug}`} data={jsonLd} />;
}
