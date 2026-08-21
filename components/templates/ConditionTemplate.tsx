import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { SiteInventoryPage, InventoryImage } from "@/lib/site-content";
import { parseServiceBody, type BodyBlock, type ServiceSection } from "@/lib/parse-service-body";
import { BOOKING_URL } from "@/components/site/nav-data";
import { locations } from "@/components/site/footer-data";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { MotionLink } from "@/components/home/MotionLink";

// The hub page /injuries-we-treat/ is a landing/overview page, not a specific
// condition, so it gets a MedicalWebPage schema while the 12 individual
// condition pages get MedicalCondition.
const HUB_SLUG = "injuries-we-treat";

export function ConditionTemplate({ page }: { page: SiteInventoryPage }) {
  const parsed = parseServiceBody(page);
  const hero = page.images.find((img) => img.placement === "hero");
  const inlineImages = page.images.filter((img) => img.placement === "inline (body content)");
  const bountiful = locations[0];

  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;
  const inlineMediaIndex = Math.max(0, Math.floor(parsed.sections.length / 2) - 1);
  const isHub = page.slug === HUB_SLUG;

  return (
    <main className="flex flex-1 flex-col bg-white">
      <ConditionPageJsonLd
        page={page}
        displayTitle={displayTitle}
        faq={parsed.faq}
        isHub={isHub}
      />

      <HeroBand
        title={displayTitle}
        breadcrumb={parsed.breadcrumb}
        preamble={parsed.preamble}
        hero={hero}
        intro={parsed.intro}
        isHub={isHub}
      />

      {parsed.sections.map((section, i) => {
        const isAlt = i % 2 === 1;
        return (
          <div key={`${section.heading}-${i}`}>
            <SectionBand
              section={section}
              index={i}
              total={parsed.sections.length}
              alternate={isAlt}
            />
            {i === inlineMediaIndex && inlineImages[0] ? (
              <MediaImageBand image={inlineImages[0]} />
            ) : null}
            {i === inlineMediaIndex && inlineImages[1] ? (
              <MediaImageBand image={inlineImages[1]} />
            ) : null}
          </div>
        );
      })}

      {parsed.cta ? (
        <CtaBand
          eyebrow={parsed.cta.eyebrow}
          heading={parsed.cta.heading}
          body={parsed.cta.body}
          phone={bountiful.phone}
          telHref={bountiful.telHref}
        />
      ) : null}

      {parsed.faq.length > 0 ? <FaqBand items={parsed.faq} /> : null}
    </main>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroBand({
  title,
  breadcrumb,
  preamble,
  hero,
  intro,
  isHub,
}: {
  title: string;
  breadcrumb: string | null;
  preamble: string[];
  hero?: InventoryImage;
  intro: BodyBlock[];
  isHub: boolean;
}) {
  const paragraphs = intro.filter(
    (b): b is Extract<BodyBlock, { type: "paragraph" }> => b.type === "paragraph",
  );
  const introLists = intro.filter(
    (b): b is Extract<BodyBlock, { type: "list" }> => b.type === "list",
  );
  const lead = paragraphs[0]?.text;
  const secondary = paragraphs.slice(1);

  const pillLine = preamble.find((line) => line.includes("|"));
  const pills = pillLine ? pillLine.split("|").map((s) => s.trim()).filter(Boolean) : [];
  const subtitleLines = preamble.filter((line) => line !== pillLine);

  const eyebrow = isHub ? "Injuries We Treat" : "Condition Care";

  return (
    <section className="relative overflow-hidden bg-navy-900">
      {hero ? (
        <Image
          src={hero.src}
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-30"
        />
      ) : null}
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-900/95 to-navy-700/80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 top-1/3 h-96 w-96 rounded-full bg-primary-500/15 blur-[160px]"
      />

      <div className="relative mx-auto grid max-w-[1180px] grid-cols-1 items-center gap-14 px-6 pb-20 pt-16 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16 lg:px-8 lg:pb-24 lg:pt-20">
        <div className="reveal">
          {breadcrumb ? (
            <nav
              aria-label="Breadcrumb"
              className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300"
            >
              <Link href="/" className="transition-colors hover:text-white">
                Home
              </Link>
              <span aria-hidden className="text-white/40">
                /
              </span>
              {!isHub ? (
                <>
                  <Link
                    href="/injuries-we-treat/"
                    className="transition-colors hover:text-white"
                  >
                    Injuries We Treat
                  </Link>
                  <span aria-hidden className="text-white/40">
                    /
                  </span>
                </>
              ) : null}
              <span className="text-white/70">
                {breadcrumb.replace(/^Home\s*[-–—]\s*/i, "")}
              </span>
            </nav>
          ) : (
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
              {eyebrow}
            </p>
          )}
          <h1 className="mt-6 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
            {title}
          </h1>
          {subtitleLines.length > 0 ? (
            <p className="mt-3 max-w-xl text-base font-medium text-primary-300">
              {subtitleLines.join(" · ")}
            </p>
          ) : null}
          {pills.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {pills.map((pill, i) => (
                <span
                  key={i}
                  className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/85"
                >
                  {pill}
                </span>
              ))}
            </div>
          ) : null}
          {lead ? (
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/80">{lead}</p>
          ) : null}
          {introLists.length > 0 ? (
            <div className="mt-5 flex flex-wrap gap-2">
              {introLists.flatMap((list) => list.items).map((item, i) => (
                <span
                  key={i}
                  className="rounded-full border border-white/20 bg-white/5 px-3.5 py-1.5 text-xs font-semibold text-white/80"
                >
                  {item}
                </span>
              ))}
            </div>
          ) : null}
          {secondary.length > 0 ? (
            <div className="mt-5 space-y-3 text-base leading-relaxed text-white/70">
              {secondary.map((p, i) => (
                <p key={i}>{p.text}</p>
              ))}
            </div>
          ) : null}
          <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
            >
              Schedule Appointment
            </a>
            <a
              href={locations[0].telHref}
              className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
            >
              Call {locations[0].phone}
            </a>
          </div>
        </div>

        {hero ? (
          <div className="reveal relative aspect-[4/5] overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
            <Image
              src={hero.src}
              alt={hero.alt}
              fill
              sizes="(min-width: 1024px) 40vw, 90vw"
              priority
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-t from-navy-900/70 via-navy-900/10 to-transparent"
            />
          </div>
        ) : null}
      </div>
    </section>
  );
}

// ─── Body sections ───────────────────────────────────────────────────────────

function SectionBand({
  section,
  index,
  total,
  alternate,
}: {
  section: ServiceSection;
  index: number;
  total: number;
  alternate: boolean;
}) {
  const paragraphBlocks = section.blocks.filter(
    (b) => b.type === "paragraph",
  ) as Extract<BodyBlock, { type: "paragraph" }>[];
  const listBlocks = section.blocks.filter(
    (b) => b.type === "list",
  ) as Extract<BodyBlock, { type: "list" }>[];
  const totalListItems = listBlocks.reduce((n, l) => n + l.items.length, 0);
  const bg = alternate ? "bg-gray-50" : "bg-white";

  const layout: "prose" | "split" | "stacked" =
    totalListItems === 0 ? "prose" : totalListItems <= 6 ? "split" : "stacked";

  return (
    <section className={`${bg} px-6 py-16 lg:px-8 lg:py-20`}>
      <div className="mx-auto max-w-[1180px]">
        <SectionCounter index={index} total={total} />

        {layout === "prose" ? (
          <ProseLayout heading={section.heading} paragraphs={paragraphBlocks} />
        ) : layout === "split" ? (
          <SplitLayout
            heading={section.heading}
            paragraphs={paragraphBlocks}
            lists={listBlocks}
          />
        ) : (
          <StackedLayout
            heading={section.heading}
            paragraphs={paragraphBlocks}
            lists={listBlocks}
          />
        )}
      </div>
    </section>
  );
}

function SectionCounter({ index, total }: { index: number; total: number }) {
  return (
    <div className="reveal flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
      <span className="tabular-nums text-navy-900">
        {String(index + 1).padStart(2, "0")}
      </span>
      <span aria-hidden className="h-px w-8 bg-primary-500/60" />
      <span className="text-primary-600/80">
        Section {index + 1} of {total}
      </span>
    </div>
  );
}

function ProseLayout({
  heading,
  paragraphs,
}: {
  heading: string;
  paragraphs: Extract<BodyBlock, { type: "paragraph" }>[];
}) {
  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="reveal mt-4 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
        {heading}
      </h2>
      <div
        className="reveal mt-6 space-y-5 text-base leading-relaxed text-ink-900"
        style={{ "--reveal-delay": "80ms" } as CSSProperties}
      >
        {paragraphs.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </div>
    </div>
  );
}

function SplitLayout({
  heading,
  paragraphs,
  lists,
}: {
  heading: string;
  paragraphs: Extract<BodyBlock, { type: "paragraph" }>[];
  lists: Extract<BodyBlock, { type: "list" }>[];
}) {
  const items = lists.flatMap((l) => l.items);
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
      <div className="reveal">
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          {heading}
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-900">
          {paragraphs.map((p, i) => (
            <p key={i}>{p.text}</p>
          ))}
        </div>
      </div>
      <ul
        className="reveal grid grid-cols-1 gap-3 self-start sm:grid-cols-2 lg:mt-16"
        style={{ "--reveal-delay": "100ms" } as CSSProperties}
      >
        {items.map((item, i) => (
          <ListCard key={i} index={i} text={item} />
        ))}
      </ul>
    </div>
  );
}

function StackedLayout({
  heading,
  paragraphs,
  lists,
}: {
  heading: string;
  paragraphs: Extract<BodyBlock, { type: "paragraph" }>[];
  lists: Extract<BodyBlock, { type: "list" }>[];
}) {
  const items = lists.flatMap((l) => l.items);
  return (
    <div>
      <div className="reveal mx-auto max-w-3xl">
        <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
          {heading}
        </h2>
        <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-900">
          {paragraphs.map((p, i) => (
            <p key={i}>{p.text}</p>
          ))}
        </div>
      </div>
      <ul
        className="reveal mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        style={{ "--reveal-delay": "120ms" } as CSSProperties}
      >
        {items.map((item, i) => (
          <ListCard key={i} index={i} text={item} />
        ))}
      </ul>
    </div>
  );
}

function ListCard({ index, text }: { index: number; text: string }) {
  return (
    <li className="group flex gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <span
        aria-hidden
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary-100 font-display text-sm font-bold text-navy-900 transition-colors group-hover:bg-primary-500 group-hover:text-white"
      >
        {String(index + 1).padStart(2, "0")}
      </span>
      <span className="text-sm leading-relaxed text-ink-900">{text}</span>
    </li>
  );
}

// ─── Inline media ────────────────────────────────────────────────────────────

function MediaImageBand({ image }: { image: InventoryImage }) {
  return (
    <section className="bg-white px-6 py-4 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <figure className="reveal relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="(min-width: 1024px) 768px, 100vw"
            className="object-cover object-center"
          />
          <figcaption className="sr-only">{image.alt}</figcaption>
        </figure>
      </div>
    </section>
  );
}

// ─── CTA + FAQ ───────────────────────────────────────────────────────────────

function CtaBand({
  eyebrow,
  heading,
  body,
  phone,
  telHref,
}: {
  eyebrow: string;
  heading: string;
  body: string[];
  phone: string;
  telHref: string;
}) {
  return (
    <section className="bg-white px-6 py-20 lg:px-8 lg:py-24">
      <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[2rem] bg-navy-900 shadow-2xl">
        <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[440px]">
            <Image
              src="/images/homepage/schedule-today.png"
              alt="Chiropractor evaluating a patient at Elevate Wellness Chiropractic"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-r from-navy-900/60 via-transparent to-navy-900 lg:from-transparent lg:via-transparent lg:to-navy-900/40"
            />
          </div>
          <div className="relative flex flex-col justify-center px-8 py-14 sm:px-12 lg:py-16 lg:pr-14">
            <div className="reveal relative">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
                <span aria-hidden className="h-px w-8 bg-primary-500/60" />
                {eyebrow}
              </p>
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl">
                {heading}
              </h2>
              {body.length > 0 ? (
                <div className="mt-5 space-y-4 text-lg leading-relaxed text-white/80">
                  {body.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              ) : null}
              <div className="mt-8 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <a
                  href={BOOKING_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-primary-500 px-7 py-3.5 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
                >
                  Schedule Online
                </a>
                <a
                  href={telHref}
                  className="rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Call: {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FaqBand({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <section className="bg-gray-50 px-6 py-20 lg:px-8 lg:py-24">
      <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="reveal lg:sticky lg:top-32 lg:self-start">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
            Questions? Answered.
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-base leading-relaxed text-ink-700">
            Common questions patients ask about this condition. Still have a question? Reach out to our team.
          </p>
          <MotionLink
            href="/elevate-wellness-chiropractic-in-bountiful-ut/"
            className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-navy-900/90"
          >
            Contact Us &rarr;
          </MotionLink>
        </div>
        <div className="reveal" style={{ "--reveal-delay": "100ms" } as CSSProperties}>
          <FaqAccordion items={items.map((f) => ({ question: f.question, answer: f.answer }))} />
        </div>
      </div>
    </section>
  );
}

// ─── JSON-LD ─────────────────────────────────────────────────────────────────

function ConditionPageJsonLd({
  page,
  displayTitle,
  faq,
  isHub,
}: {
  page: SiteInventoryPage;
  displayTitle: string;
  faq: { question: string; answer: string }[];
  isHub: boolean;
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: isHub
        ? [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.elevatewellnesschiro.com/" },
            { "@type": "ListItem", position: 2, name: displayTitle, item: page.canonicalUrl },
          ]
        : [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://www.elevatewellnesschiro.com/" },
            { "@type": "ListItem", position: 2, name: "Injuries We Treat", item: "https://www.elevatewellnesschiro.com/injuries-we-treat/" },
            { "@type": "ListItem", position: 3, name: displayTitle, item: page.canonicalUrl },
          ],
    },
    isHub
      ? {
          "@type": "MedicalWebPage",
          name: displayTitle,
          description: page.metaDescription,
          url: page.canonicalUrl,
          about: {
            "@type": "MedicalCondition",
            name: "Injuries treated with chiropractic care",
          },
          provider: {
            "@type": "MedicalBusiness",
            name: "Elevate Wellness Chiropractic",
            url: "https://www.elevatewellnesschiro.com/",
          },
        }
      : {
          "@type": "MedicalCondition",
          name: displayTitle,
          description: page.metaDescription,
          url: page.canonicalUrl,
          possibleTreatment: {
            "@type": "MedicalTherapy",
            name: "Chiropractic care",
            provider: {
              "@type": "MedicalBusiness",
              name: "Elevate Wellness Chiropractic",
              url: "https://www.elevatewellnesschiro.com/",
            },
          },
        },
  ];
  if (faq.length > 0) {
    graph.push({
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    });
  }
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}
