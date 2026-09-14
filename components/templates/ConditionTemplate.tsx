import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
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
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { MotionLink } from "@/components/home/MotionLink";

// The hub page /injuries-we-treat/ is a landing/overview page, not a specific
// condition, so it gets a MedicalWebPage schema while the 12 individual
// condition pages get MedicalCondition.
const HUB_SLUG = "injuries-we-treat";

export function ConditionTemplate({ page }: { page: SiteInventoryPage }) {
  const parsed = promoteIntroHeadings(parseServiceBody(page));
  const hero = page.images.find((img) => img.placement === "hero");
  const inlineImages = page.images.filter((img) => img.placement === "inline (body content)");
  const bountiful = locations[0];

  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;
  const isHub = page.slug === HUB_SLUG;

  const leadParagraph =
    parsed.intro.find((b): b is Extract<BodyBlock, { type: "paragraph" }> => b.type === "paragraph")?.text ?? null;
  const remainingIntro = leadParagraph
    ? regroupConsecutiveShortsAsLists(
        parsed.intro.filter((b, i, arr) => {
          const firstParaIdx = arr.findIndex((x) => x.type === "paragraph");
          return i !== firstParaIdx;
        }),
      )
    : regroupConsecutiveShortsAsLists(parsed.intro);

  // Evenly spread inline images across sections so pages with 2–3 images get a
  // magazine-style image-in-section rhythm instead of a stacked photo column.
  const sectionImageMap = new Map<number, InventoryImage>();
  if (parsed.sections.length > 0 && inlineImages.length > 0) {
    inlineImages.forEach((img, i) => {
      let target = Math.floor(((i + 1) * parsed.sections.length) / (inlineImages.length + 1));
      while (sectionImageMap.has(target) && target < parsed.sections.length - 1) target++;
      sectionImageMap.set(target, img);
    });
  }

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
        hero={hero}
        lead={leadParagraph}
        isHub={isHub}
        bountiful={{ phone: bountiful.phone, telHref: bountiful.telHref }}
      />

      {remainingIntro.length > 0 ? <IntroBody blocks={remainingIntro} /> : null}

      {parsed.sections.map((section, i) => (
        <SectionBand
          key={`${section.heading}-${i}`}
          section={section}
          index={i}
          total={parsed.sections.length}
          alternate={i % 2 === 1}
          image={sectionImageMap.get(i)}
        />
      ))}

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
  hero,
  lead,
  isHub,
  bountiful,
}: {
  title: string;
  breadcrumb: string | null;
  hero?: InventoryImage;
  lead: string | null;
  isHub: boolean;
  bountiful: { phone: string; telHref: string };
}) {
  const eyebrow = isHub ? "Injuries We Treat" : "Injury & Condition Care";

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
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
              {eyebrow}
            </p>
          )}

          <span className="mt-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            {isHub ? "Overview" : "Injury & Condition Care"}
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
            <a
              href={BOOKING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
            >
              Schedule Appointment
            </a>
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

// ─── Intro body ──────────────────────────────────────────────────────────────
//
// Renders the leftover intro content (secondary paragraphs + any intro lists)
// as clean prose + a list-card grid, on a light background between the hero
// and the numbered sections. Prevents the hero from ballooning when the
// crawler missed section H2s.

export function IntroBody({ blocks }: { blocks: BodyBlock[] }) {
  if (blocks.length === 0) return null;
  const paragraphs = blocks.filter(
    (b): b is Extract<BodyBlock, { type: "paragraph" }> => b.type === "paragraph",
  );
  const lists = blocks.filter(
    (b): b is Extract<BodyBlock, { type: "list" }> => b.type === "list",
  );
  const listItems = lists.flatMap((l) => l.items);

  return (
    <section className="bg-white px-6 py-14 lg:px-8 lg:py-16">
      <div className="mx-auto max-w-3xl">
        {paragraphs.length > 0 ? (
          <div
            className="reveal space-y-5 text-base leading-relaxed text-ink-900"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            {paragraphs.map((p, i) => (
              <p key={i}>{p.text}</p>
            ))}
          </div>
        ) : null}

        {listItems.length > 0 ? (
          <ul
            className={`reveal mt-8 grid grid-cols-1 gap-3 ${
              listItems.length > 6 ? "sm:grid-cols-2 lg:grid-cols-3" : "sm:grid-cols-2"
            }`}
            style={{ "--reveal-delay": "120ms" } as CSSProperties}
          >
            {listItems.map((item, i) => (
              <ListCard key={i} index={i} text={item} />
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}

// ─── Body sections ───────────────────────────────────────────────────────────

export function SectionBand({
  section,
  index,
  total,
  alternate,
  image,
}: {
  section: ServiceSection;
  index: number;
  total: number;
  alternate: boolean;
  image?: InventoryImage;
}) {
  const paragraphBlocks = section.blocks.filter(
    (b) => b.type === "paragraph",
  ) as Extract<BodyBlock, { type: "paragraph" }>[];
  const listBlocks = section.blocks.filter(
    (b) => b.type === "list",
  ) as Extract<BodyBlock, { type: "list" }>[];
  const totalListItems = listBlocks.reduce((n, l) => n + l.items.length, 0);
  const bg = alternate ? "bg-gray-50" : "bg-white";
  // Alternate which side the image appears on for a magazine-style rhythm.
  const imageOnRight = index % 2 === 0;

  const layout: "image-split" | "image-stacked" | "prose" | "split" | "stacked" = image
    ? totalListItems > 6
      ? "image-stacked"
      : "image-split"
    : totalListItems === 0
      ? "prose"
      : totalListItems <= 6
        ? "split"
        : "stacked";

  return (
    <section className={`${bg} px-6 py-16 lg:px-8 lg:py-24`}>
      <div className="mx-auto max-w-[1180px]">
        <SectionCounter index={index} total={total} />

        {layout === "image-split" && image ? (
          <ImageSplitLayout
            heading={section.heading}
            paragraphs={paragraphBlocks}
            lists={listBlocks}
            image={image}
            imageOnRight={imageOnRight}
          />
        ) : layout === "image-stacked" && image ? (
          <ImageStackedLayout
            heading={section.heading}
            paragraphs={paragraphBlocks}
            lists={listBlocks}
            image={image}
            imageOnRight={imageOnRight}
          />
        ) : layout === "prose" ? (
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

export function SectionCounter({ index, total }: { index: number; total: number }) {
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

export function ListCard({ index, text }: { index: number; text: string }) {
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

export function SectionImage({ image, className }: { image: InventoryImage; className?: string }) {
  return (
    <figure
      className={`reveal relative overflow-hidden rounded-3xl border border-navy-900/5 shadow-xl ${className ?? ""}`}
      style={{ "--reveal-delay": "100ms" } as CSSProperties}
    >
      <Image
        src={image.src}
        alt={image.alt}
        fill
        sizes="(min-width: 1024px) 44vw, 100vw"
        className="object-cover"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10"
      />
      <figcaption className="sr-only">{image.alt}</figcaption>
    </figure>
  );
}

function ImageSplitLayout({
  heading,
  paragraphs,
  lists,
  image,
  imageOnRight,
}: {
  heading: string;
  paragraphs: Extract<BodyBlock, { type: "paragraph" }>[];
  lists: Extract<BodyBlock, { type: "list" }>[];
  image: InventoryImage;
  imageOnRight: boolean;
}) {
  const items = lists.flatMap((l) => l.items);
  const content = (
    <div className="reveal">
      <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
        {heading}
      </h2>
      <div className="mt-6 space-y-4 text-base leading-relaxed text-ink-900">
        {paragraphs.map((p, i) => (
          <p key={i}>{p.text}</p>
        ))}
      </div>
      {items.length > 0 ? (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, i) => (
            <ListCard key={i} index={i} text={item} />
          ))}
        </ul>
      ) : null}
    </div>
  );
  const media = (
    <SectionImage
      image={image}
      className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[360px]"
    />
  );
  return (
    <div className="mt-2 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
      {imageOnRight ? (
        <>
          {content}
          {media}
        </>
      ) : (
        <>
          {media}
          {content}
        </>
      )}
    </div>
  );
}

function ImageStackedLayout({
  heading,
  paragraphs,
  lists,
  image,
  imageOnRight,
}: {
  heading: string;
  paragraphs: Extract<BodyBlock, { type: "paragraph" }>[];
  lists: Extract<BodyBlock, { type: "list" }>[];
  image: InventoryImage;
  imageOnRight: boolean;
}) {
  const items = lists.flatMap((l) => l.items);
  const intro = (
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
  );
  const media = (
    <SectionImage
      image={image}
      className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-[360px]"
    />
  );
  return (
    <div>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.05fr)] lg:gap-14">
        {imageOnRight ? (
          <>
            {intro}
            {media}
          </>
        ) : (
          <>
            {media}
            {intro}
          </>
        )}
      </div>
      {items.length > 0 ? (
        <ul
          className="reveal mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
          style={{ "--reveal-delay": "140ms" } as CSSProperties}
        >
          {items.map((item, i) => (
            <ListCard key={i} index={i} text={item} />
          ))}
        </ul>
      ) : null}
    </div>
  );
}

// ─── CTA + FAQ ───────────────────────────────────────────────────────────────

export function CtaBand({
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
    <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
      <div className="relative mx-auto max-w-[1180px] overflow-hidden rounded-[2rem] bg-navy-900 shadow-2xl">
        <div className="grid grid-cols-1 items-stretch lg:grid-cols-2">
          <div className="relative min-h-[320px] lg:min-h-[440px]">
            <Image
              src="/images/homepage/schedule-today-v2.jpg"
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
    <section className="bg-gray-50 px-6 py-14 lg:px-8 lg:py-24">
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
  return <JsonLd id={`condition-jsonld-${page.slug}`} data={jsonLd} />;
}
