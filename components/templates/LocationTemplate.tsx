import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import type { CSSProperties } from "react";
import { SITE_URL, toSitePath } from "@/lib/constants";
import type { SiteInventoryPage, InventoryImage } from "@/lib/site-content";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  parseServiceBody,
  promoteIntroHeadings,
  regroupConsecutiveShortsAsLists,
  type BodyBlock,
  type ServiceSection,
} from "@/lib/parse-service-body";
import { BOOKING_URL } from "@/components/site/nav-data";
import { locations } from "@/components/site/footer-data";
import { toTestimonials } from "@/components/home/homepage-data";
import { ReviewCarousel } from "@/components/home/ReviewCarousel";
import { GoogleReviews } from "@/components/home/GoogleReviews";
import napAndHours from "@/seo-audit/nap-and-hours.json";
import {
  SectionBand,
  CtaBand,
  IntroBody,
} from "./ConditionTemplate";

// Concatenated "Areas We Serve" strings split back into named cities using the
// two known variants that appear on-site (Bountiful-area vs Clearfield-area).
const AREA_LISTS: string[][] = [
  ["North Salt Lake", "Woods Cross", "Centerville", "West Bountiful", "Salt Lake", "Salt Lake City", "Farmington"],
  ["West Point", "Hooper", "Syracuse", "Sunset", "Roy", "West Haven", "Clearfield"],
];

// City name → canonical geo-page slug for area chip links.
const CITY_TO_SLUG: Record<string, string | null> = {
  Bountiful: "elevate-wellness-chiropractic-in-bountiful-ut",
  Clinton: "clinton",
  "North Salt Lake": "chiropractor-in-north-salt-lake-ut",
  "Woods Cross": "chiropractor-in-woods-cross-ut",
  Centerville: "chiropractic-services-in-centerville-ut",
  "West Bountiful": "chiropractor-in-west-bountiful-ut",
  "Salt Lake": null,
  "Salt Lake City": "chiropractor-in-salt-lake-city-ut",
  Farmington: "chiropractor-in-farmington-ut",
  "West Point": "chiropractic-in-west-point-ut",
  Hooper: "chiropractic-in-hooper-ut",
  Syracuse: "chiropractor-in-syracuse-ut",
  Sunset: "chiropractor-in-sunset-ut",
  Roy: "chiropractor-in-roy-ut",
  "West Haven": "chiropractor-in-west-haven-ut",
  Clearfield: "chiropractor-in-clearfield-ut",
};

const OFFICE_CARD_SLUGS = new Set(["bountiful-location", "elevate-wellness-chiropractic-in-clinton-ut"]);
const CONTACT_SLUG = "elevate-wellness-chiropractic-in-bountiful-ut";
const CLINTON_HUB_SLUG = "clinton";

const REQUEST_FORM_HEADING = "REQUEST YOUR FREE ESTIMATE BY FILLING THE FORM BELOW";
const AREAS_HEADING_RE = /Areas\s+(?:We\s+Serve|Served)/i;
const SERVING_HEADING_RE = /^Serving\b/i;

// ─── Router ──────────────────────────────────────────────────────────────────

export function LocationTemplate({ page }: { page: SiteInventoryPage }) {
  if (OFFICE_CARD_SLUGS.has(page.slug)) return <OfficeCardTemplate page={page} />;
  if (page.slug === CONTACT_SLUG) return <ContactTemplate page={page} />;
  if (page.slug === CLINTON_HUB_SLUG) return <ClintonHubTemplate page={page} />;
  return <StandardGeoTemplate page={page} />;
}

// ─── Standard geo (28 pages) ────────────────────────────────────────────────

function StandardGeoTemplate({ page }: { page: SiteInventoryPage }) {
  const parsed = promoteIntroHeadings(parseServiceBody(page));
  const bountiful = locations[0];
  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;

  const inlineImages = page.images.filter(
    (img) => img.placement.startsWith("inline") || img.placement === "gallery",
  );
  const explicitHero = page.images.find((img) => img.placement === "hero");
  const heroImage = explicitHero ?? inlineImages[0];
  const bodyInlineImages = explicitHero ? inlineImages : inlineImages.slice(1);

  const leadParagraph =
    parsed.intro.find((b): b is Extract<BodyBlock, { type: "paragraph" }> => b.type === "paragraph")?.text ?? null;
  const remainingIntroSrc = leadParagraph
    ? parsed.intro.filter((b, i, arr) => {
        const firstParaIdx = arr.findIndex((x) => x.type === "paragraph");
        return i !== firstParaIdx;
      })
    : parsed.intro;
  const remainingIntro = regroupConsecutiveShortsAsLists(remainingIntroSrc);

  const contentSections: ServiceSection[] = [];
  let areasSection: ServiceSection | null = null;
  let servingSection: ServiceSection | null = null;
  let formCalloutCount = 0;

  for (const s of parsed.sections) {
    if (s.heading === REQUEST_FORM_HEADING) {
      formCalloutCount++;
      continue;
    }
    if (AREAS_HEADING_RE.test(s.heading) && !areasSection) {
      areasSection = s;
      continue;
    }
    if (SERVING_HEADING_RE.test(s.heading) && !servingSection) {
      servingSection = s;
      continue;
    }
    contentSections.push(s);
  }

  const sectionImageMap = new Map<number, InventoryImage>();
  if (contentSections.length > 0 && bodyInlineImages.length > 0) {
    bodyInlineImages.forEach((img, i) => {
      let t = Math.floor(((i + 1) * contentSections.length) / (bodyInlineImages.length + 1));
      while (sectionImageMap.has(t) && t < contentSections.length - 1) t++;
      sectionImageMap.set(t, img);
    });
  }

  const areas = areasSection ? extractAreas(areasSection) : null;
  const midIdx = Math.floor(contentSections.length / 2);

  return (
    <main className="flex flex-1 flex-col bg-white">
      <LocationJsonLd page={page} displayTitle={displayTitle} />

      <HeroBand
        title={displayTitle}
        breadcrumb={parsed.breadcrumb}
        hero={heroImage}
        lead={leadParagraph}
        bountiful={{ phone: bountiful.phone, telHref: bountiful.telHref }}
      />

      {formCalloutCount > 0 ? <FormEstimateCallout /> : null}

      {remainingIntro.length > 0 ? <IntroBody blocks={remainingIntro} /> : null}

      {contentSections.map((section, i) => (
        <div key={`${section.heading}-${i}`}>
          <SectionBand
            section={section}
            index={i}
            total={contentSections.length}
            alternate={i % 2 === 1}
            image={sectionImageMap.get(i)}
          />
          {formCalloutCount > 1 && i === midIdx ? <FormEstimateCallout /> : null}
        </div>
      ))}

      {areasSection && areas ? (
        <AreasWeServeBand
          heading={areasSection.heading}
          areas={areas}
          activeSlug={page.slug}
        />
      ) : null}

      {servingSection ? <ServingCityBand section={servingSection} /> : null}

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

function extractAreas(section: ServiceSection): string[] | null {
  const paragraph = section.blocks.find((b) => b.type === "paragraph") as
    | Extract<BodyBlock, { type: "paragraph" }>
    | undefined;
  if (!paragraph) return null;
  const text = paragraph.text.trim();
  for (const list of AREA_LISTS) {
    if (list.join("") === text) return list;
  }
  return null;
}

// ─── Hero ────────────────────────────────────────────────────────────────────

export function HeroBand({
  title,
  breadcrumb,
  hero,
  lead,
  bountiful,
  showBookingButton = true,
}: {
  title: string;
  breadcrumb: string | null;
  hero?: { src: string; alt: string };
  lead: string | null;
  bountiful: { phone: string; telHref: string };
  showBookingButton?: boolean;
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
          {breadcrumb ? (
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
              <span className="text-white/70">
                {breadcrumb.replace(/^Home\s*[-–—]\s*/i, "")}
              </span>
            </nav>
          ) : (
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
              Location & Service Area
            </p>
          )}

          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            Serving Bountiful, Clinton &amp; nearby areas
          </span>

          <h1 className="mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
            {title}
          </h1>

          {lead ? (
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
              {lead}
            </p>
          ) : null}

          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            {showBookingButton ? (
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
              >
                Schedule Appointment
              </a>
            ) : null}
            <a
              href={bountiful.telHref}
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Call {bountiful.phone}
            </a>
          </div>
        </div>

        {hero ? (
          <div
            className="reveal relative aspect-[5/4] w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl lg:aspect-[4/5] lg:justify-self-end"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              priority
              className="object-cover"
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

// ─── Form callout ────────────────────────────────────────────────────────────

function FormEstimateCallout() {
  return (
    <section className="bg-white px-6 py-8 lg:px-8 lg:py-10">
      <div className="mx-auto max-w-[1180px]">
        <div className="reveal flex flex-col items-start gap-5 rounded-2xl border border-primary-100 bg-primary-50/60 px-6 py-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8 lg:px-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700">
              Free Estimate
            </p>
            <p className="mt-2 font-display text-lg font-bold text-navy-900 sm:text-xl">
              {REQUEST_FORM_HEADING.charAt(0) + REQUEST_FORM_HEADING.slice(1).toLowerCase()}
            </p>
          </div>
          <a
            href={BOOKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="shrink-0 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-navy-900/90"
          >
            Start Your Estimate
          </a>
        </div>
      </div>
    </section>
  );
}

// ─── Areas We Serve ──────────────────────────────────────────────────────────

export function AreasWeServeBand({
  heading,
  areas,
  activeSlug,
  hrefForArea,
}: {
  heading: string;
  areas: string[];
  activeSlug: string;
  hrefForArea?: (area: string) => string | null;
}) {
  return (
    <section className="bg-navy-900 px-6 py-16 lg:px-8 lg:py-28">
      <div className="mx-auto max-w-[1180px]">
        <div className="reveal">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
            Service Areas
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {heading}
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/70">
            Bountiful- and Clinton-based care across northern Utah. Tap a city to see the local page.
          </p>
        </div>
        <ul
          className="reveal mt-8 flex flex-wrap gap-2"
          style={{ "--reveal-delay": "100ms" } as CSSProperties}
        >
          {areas.map((area) => {
            const slug = CITY_TO_SLUG[area] ?? null;
            const href = hrefForArea ? hrefForArea(area) : slug ? `/${slug}/` : null;
            const isActive = href === `/${activeSlug}/`;
            const base =
              "rounded-full border px-4 py-2 text-sm font-semibold transition-colors";
            if (!href) {
              return (
                <li key={area}>
                  <span className={`${base} border-white/15 bg-white/5 text-white/70`}>
                    {area}
                  </span>
                </li>
              );
            }
            return (
              <li key={area}>
                <Link
                  href={toSitePath(href)}
                  className={
                    isActive
                      ? `${base} border-primary-500 bg-primary-500 text-ink-900`
                      : `${base} border-white/20 bg-white/5 text-white hover:border-primary-400 hover:bg-primary-500/20`
                  }
                  aria-current={isActive ? "page" : undefined}
                >
                  {area}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

// ─── Serving [City] ──────────────────────────────────────────────────────────

function ServingCityBand({ section }: { section: ServiceSection }) {
  const paragraphs = section.blocks.filter(
    (b): b is Extract<BodyBlock, { type: "paragraph" }> => b.type === "paragraph",
  );
  return (
    <section className="bg-gray-50 px-6 py-14 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="reveal">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
            About the Area
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {section.heading}
          </h2>
        </div>
        <div
          className="reveal mt-8 grid grid-cols-1 gap-6 text-base leading-relaxed text-ink-900 lg:grid-cols-2 lg:gap-10"
          style={{ "--reveal-delay": "100ms" } as CSSProperties}
        >
          {paragraphs.map((p, i) => (
            <p key={i}>{p.text}</p>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Office card (2 pages: bountiful-location, elevate-...-clinton-ut) ──────

function OfficeCardTemplate({ page }: { page: SiteInventoryPage }) {
  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;
  const blocks = page.bodyCopy.split("\n\n").map((b) => b.trim()).filter(Boolean);
  const officeName = blocks[0] ?? "";
  const addrLine = blocks[1] ?? "";
  const { address, phone, phoneHref } = splitAddressPhone(addrLine);
  const matching = napAndHours.locations.find((l) =>
    officeName.toLowerCase().includes(l.address.addressLocality.toLowerCase()),
  );
  const mapQuery = encodeURIComponent(
    matching
      ? `Elevate Wellness Chiropractic, ${matching.address.streetAddress}, ${matching.address.addressLocality}, ${matching.address.addressRegion}`
      : `Elevate Wellness Chiropractic, ${address}`,
  );

  return (
    <main className="flex flex-1 flex-col bg-white">
      <LocationJsonLd page={page} displayTitle={displayTitle} />
      <HeroBand
        title={displayTitle}
        breadcrumb={null}
        hero={undefined}
        lead={null}
        bountiful={{ phone: locations[0].phone, telHref: locations[0].telHref }}
      />
      <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 lg:grid-cols-[1fr_1fr] lg:gap-14">
          <div className="reveal">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
              Office
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              {officeName}
            </h2>
            <address className="mt-6 space-y-3 not-italic text-base leading-relaxed text-ink-900">
              <p>{address}</p>
            </address>
            {matching ? (
              <div className="mt-6 border-t border-navy-900/10 pt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
                  Hours
                </p>
                <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                  {groupHours(matching.hours).map((row, j) => (
                    <div key={j} className="contents">
                      <dt className="font-semibold text-navy-900">{row.day}</dt>
                      <dd className="text-ink-700">{row.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
            <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
              >
                Schedule Appointment
              </a>
              <a
                href={phoneHref}
                className="rounded-full border border-navy-900/20 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-navy-900/5"
              >
                Call {phone}
              </a>
            </div>
          </div>
          <div
            className="reveal relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-navy-900/5 shadow-xl"
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            <iframe
              title={`Map of ${officeName}`}
              src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
      </section>
    </main>
  );
}

function splitAddressPhone(line: string) {
  const m = line.match(/^(.*?)(\(\d{3}\)\s*\d{3}-\d{4})\s*$/);
  const address = (m?.[1] ?? line).trim();
  const phone = m?.[2] ?? "";
  const phoneHref = phone ? `tel:+1${phone.replace(/\D/g, "")}` : "#";
  return { address, phone, phoneHref };
}

const DAY_ORDER = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
const DAY_ABBR: Record<string, string> = {
  Monday: "Mon",
  Tuesday: "Tue",
  Wednesday: "Wed",
  Thursday: "Thu",
  Friday: "Fri",
  Saturday: "Sat",
  Sunday: "Sun",
};

// Collapses a Mon-Sun hours map into "Mon–Fri" / "Sat–Sun"-style ranges
// wherever consecutive days share the same value.
function groupHours(hours: Record<string, string>): { day: string; value: string }[] {
  const groups: { days: string[]; value: string }[] = [];
  for (const day of DAY_ORDER) {
    const value = hours[day];
    const last = groups[groups.length - 1];
    if (last && last.value === value) {
      last.days.push(day);
    } else {
      groups.push({ days: [day], value });
    }
  }
  return groups.map((g) => ({
    day: g.days.length > 1 ? `${DAY_ABBR[g.days[0]]}–${DAY_ABBR[g.days[g.days.length - 1]]}` : DAY_ABBR[g.days[0]],
    value: g.value,
  }));
}

// ─── Contact (both offices + hours) ─────────────────────────────────────────

function ContactTemplate({ page }: { page: SiteInventoryPage }) {
  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;
  const blocks = page.bodyCopy.split("\n\n").map((b) => b.trim()).filter(Boolean);

  const introText = blocks[0] ?? "";
  const offices: {
    name: string;
    addrLine: string;
    hours: { day: string; value: string }[];
  }[] = [];
  let i = 1;
  while (i < blocks.length) {
    const name = blocks[i];
    const addr = blocks[i + 1] ?? "";
    i += 2;
    const hours: { day: string; value: string }[] = [];
    if (blocks[i] === "Hours") {
      i++;
      while (i + 1 < blocks.length && !/Office$/i.test(blocks[i])) {
        hours.push({ day: blocks[i], value: blocks[i + 1] });
        i += 2;
      }
    }
    offices.push({ name, addrLine: addr, hours });
  }

  return (
    <main className="flex flex-1 flex-col bg-white">
      <LocationJsonLd page={page} displayTitle={displayTitle} />
      <HeroBand
        title={displayTitle}
        breadcrumb={null}
        hero={{
          src: "/images/about/elevate-wellness-office.jpg",
          alt: "Elevate Wellness Chiropractic office in Bountiful, UT",
        }}
        lead={introText}
        bountiful={{ phone: locations[0].phone, telHref: locations[0].telHref }}
        showBookingButton={false}
      />

      <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-10 lg:grid-cols-2 lg:gap-14">
          {offices.map((office, i) => {
            const { address, phone, phoneHref } = splitAddressPhone(office.addrLine);
            return (
              <article
                key={i}
                className="reveal rounded-3xl border border-navy-900/5 bg-gray-50 p-8 shadow-sm lg:p-10"
                style={{ "--reveal-delay": `${i * 80}ms` } as CSSProperties}
              >
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
                  Office
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                  {office.name}
                </h2>
                <address className="mt-4 space-y-2 not-italic text-base leading-relaxed text-ink-900">
                  <p>{address}</p>
                  {phone ? (
                    <p>
                      <a href={phoneHref} className="font-semibold text-primary-700 hover:underline">
                        {phone}
                      </a>
                    </p>
                  ) : null}
                </address>
                {office.hours.length > 0 ? (
                  <div className="mt-6 border-t border-navy-900/10 pt-6">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
                      Hours
                    </p>
                    <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm">
                      {office.hours.map((row, j) => (
                        <div key={j} className="contents">
                          <dt className="font-semibold text-navy-900">{row.day}</dt>
                          <dd className="text-ink-700">{row.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                ) : null}
                <div className="mt-8">
                  <a
                    href={BOOKING_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
                  >
                    Schedule at {office.name.replace(/\s*Office\s*$/i, "")}
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <ContactFormSection />
      <ContactTestimonialsSection />
    </main>
  );
}

// ─── Contact form (LeadConnector embed) ─────────────────────────────────────
// Note: GHL's form_embed.js resizes the <iframe> itself to match its real
// content height (form vs. the short post-submit "thank you" view). The
// wrapper must NOT force a fixed height / overflow-hidden or it either clips
// taller content or leaves a huge empty gap around a short thank-you message.

function ContactFormSection() {
  const bountiful = locations[0];
  const clinton = locations[1];

  return (
    <section className="bg-gray-50 px-6 py-14 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-[1180px]">
        <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[2fr_3fr] lg:gap-12">
          <div className="reveal rounded-3xl bg-navy-900 p-8 text-white shadow-xl lg:sticky lg:top-32 lg:p-10">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
              Get In Touch
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Send Us a Message
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Have a question or ready to book? Fill out the form and our team will get back to you shortly.
            </p>

            <div className="mt-8 space-y-5 border-t border-white/10 pt-8">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
                Prefer to Call?
              </p>
              {[bountiful, clinton].map((loc) => (
                <div key={loc.name}>
                  <p className="text-sm font-semibold text-white">{loc.name}</p>
                  <a
                    href={loc.telHref}
                    className="text-lg font-semibold text-primary-300 transition-colors hover:text-primary-200"
                  >
                    {loc.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div
            className="reveal rounded-3xl border border-navy-900/5 bg-white p-2 shadow-xl sm:p-3"
            style={{ "--reveal-delay": "100ms" } as CSSProperties}
          >
            <iframe
              src="https://api.leadconnectorhq.com/widget/form/g2azdkFCcq3kjNFj0EKF"
              style={{ width: "100%", height: 760, minHeight: 760, border: "none", borderRadius: "12px", display: "block" }}
              id="inline-g2azdkFCcq3kjNFj0EKF"
              data-layout="{'id':'INLINE'}"
              data-trigger-type="alwaysShow"
              data-trigger-value=""
              data-activation-type="alwaysActivated"
              data-activation-value=""
              data-deactivation-type="neverDeactivate"
              data-deactivation-value=""
              data-form-name="🟢 website form"
              data-height="760"
              data-layout-iframe-id="inline-g2azdkFCcq3kjNFj0EKF"
              data-form-id="g2azdkFCcq3kjNFj0EKF"
              title="🟢 website form"
            />
          </div>
        </div>
      </div>
      <Script src="https://link.msgsndr.com/js/form_embed.js" strategy="lazyOnload" />
    </section>
  );
}

// ─── Contact page testimonials ──────────────────────────────────────────────

function ContactTestimonialsSection() {
  return (
    <GoogleReviews>
      {({ reviews }) => (
        <section className="relative overflow-hidden bg-navy-900 px-6 py-16 lg:px-8 lg:py-28">
          <div
            aria-hidden
            className="pointer-events-none absolute left-1/2 top-0 h-[320px] w-[640px] -translate-x-1/2 rounded-full bg-primary-500/10 blur-[150px]"
          />
          <div className="relative mx-auto max-w-[1280px]">
            <div className="reveal mx-auto max-w-2xl text-center">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
                Real Reviews
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                What Our Patients Are Saying
              </h2>
            </div>
            <div
              className="reveal mt-12"
              style={{ "--reveal-delay": "120ms" } as CSSProperties}
            >
              <ReviewCarousel reviews={toTestimonials(reviews)} />
            </div>
          </div>
        </section>
      )}
    </GoogleReviews>
  );
}

// ─── Clinton hub ────────────────────────────────────────────────────────────
//
// The `/clinton/` page is the flagship location landing — service cards,
// provider bio, testimonials, and FAQ. The crawl duplicates every service-card
// paragraph (mobile + desktop DOM), so we let the shared parser render each
// section verbatim; visual dedupe / testimonial data is out of scope for this
// pass and left for a follow-up.

function ClintonHubTemplate({ page }: { page: SiteInventoryPage }) {
  return <StandardGeoTemplate page={page} />;
}

// ─── JSON-LD ────────────────────────────────────────────────────────────────

function LocationJsonLd({
  page,
  displayTitle,
}: {
  page: SiteInventoryPage;
  displayTitle: string;
}) {
  const nap = napAndHours.locations.find((l) =>
    page.canonicalUrl.includes(l.address.addressLocality.toLowerCase()),
  ) ?? napAndHours.locations[0];

  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: displayTitle, item: page.canonicalUrl },
      ],
    },
    {
      "@type": "MedicalBusiness",
      name: nap.name,
      url: page.canonicalUrl,
      telephone: nap.phone,
      address: {
        "@type": "PostalAddress",
        streetAddress: nap.address.streetAddress,
        addressLocality: nap.address.addressLocality,
        addressRegion: nap.address.addressRegion,
        postalCode: nap.address.postalCode,
        addressCountry: nap.address.addressCountry,
      },
    },
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };
  return <JsonLd id={`location-jsonld-${page.slug}`} data={jsonLd} />;
}
