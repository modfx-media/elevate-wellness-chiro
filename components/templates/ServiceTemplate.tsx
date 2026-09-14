import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SITE_URL, toSiteUrl } from "@/lib/constants";
import type { SiteInventoryPage, InventoryVideo, InventoryImage } from "@/lib/site-content";
import { parseServiceBody, type BodyBlock, type ServiceSection } from "@/lib/parse-service-body";
import { BOOKING_URL } from "@/components/site/nav-data";
import { locations } from "@/components/site/footer-data";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import { MotionLink } from "@/components/home/MotionLink";
import { JsonLd } from "@/components/seo/JsonLd";

// Slug-keyed hero image overrides. Keeps the crawled alt text but swaps the src
// for a locally-hosted photo that reads better than the original WordPress asset.
const HERO_OVERRIDES: Record<string, string> = {
  "spinal-decompression": "/images/services/spinal-decompression-hero.jpg",
  "pediatric-chiropractor": "/images/services/pediatric-chiropractor-hero.jpg",
};

export function ServiceTemplate({ page }: { page: SiteInventoryPage }) {
  const parsed = parseServiceBody(page);
  const heroRaw = page.images.find((img) => img.placement === "hero");
  const hero = heroRaw && HERO_OVERRIDES[page.slug]
    ? { ...heroRaw, src: HERO_OVERRIDES[page.slug] }
    : heroRaw;
  const inlineImages = page.images.filter((img) => img.placement === "inline (body content)");
  const inlineVideos = page.videos.filter((v) => v.placement.startsWith("inline"));
  const bountiful = locations[0];

  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;
  const inlineMediaIndex = Math.max(0, Math.floor(parsed.sections.length / 2) - 1);

  return (
    <main className="flex flex-1 flex-col bg-white">
      <ServicePageJsonLd page={page} displayTitle={displayTitle} faq={parsed.faq} />

      <HeroBand
        title={displayTitle}
        breadcrumb={parsed.breadcrumb}
        preamble={parsed.preamble}
        hero={hero}
        intro={parsed.intro}
      />

      {/* Body sections */}
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
            {i === inlineMediaIndex && inlineVideos.length > 0 ? (
              <MediaVideoBand videos={inlineVideos} />
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
}: {
  title: string;
  breadcrumb: string | null;
  preamble: string[];
  hero?: InventoryImage;
  intro: BodyBlock[];
}) {
  const paragraphs = intro.filter((b): b is Extract<BodyBlock, { type: "paragraph" }> => b.type === "paragraph");
  const introLists = intro.filter((b): b is Extract<BodyBlock, { type: "list" }> => b.type === "list");
  const lead = paragraphs[0]?.text;
  const secondary = paragraphs.slice(1);

  // Split the preamble into visual roles:
  // - lines with "|" separators → pill badges (e.g. "Effective | Non-surgical | Pain-Free")
  // - other short lines → subtitle displayed above the H1
  const pillLine = preamble.find((line) => line.includes("|"));
  const pills = pillLine ? pillLine.split("|").map((s) => s.trim()).filter(Boolean) : [];
  const subtitleLines = preamble.filter((line) => line !== pillLine);

  return (
    <section className="relative overflow-hidden bg-navy-900">
      {hero ? (
        <Image
          src={hero.src}
          alt="Chiropractic treatment at Elevate Wellness Chiropractic"
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
            <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
              <Link href={toSiteUrl("/")} className="transition-colors hover:text-white">Home</Link>
              <span aria-hidden className="text-white/40">/</span>
              <span className="text-white/70">{breadcrumb.replace(/^Home\s*[-–—]\s*/i, "")}</span>
            </nav>
          ) : null}
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
  const paragraphBlocks = section.blocks.filter((b) => b.type === "paragraph") as Extract<BodyBlock, { type: "paragraph" }>[];
  const listBlocks = section.blocks.filter((b) => b.type === "list") as Extract<BodyBlock, { type: "list" }>[];
  const totalListItems = listBlocks.reduce((n, l) => n + l.items.length, 0);
  const bg = alternate ? "bg-gray-50" : "bg-white";

  // Layout picker:
  // - no list             → prose (centered narrow column)
  // - list with ≤ 6 items → split (heading+text left, 2-col cards right)
  // - list with 7+ items  → stacked (heading+text full width top, 3-col cards below)
  const layout: "prose" | "split" | "stacked" =
    totalListItems === 0 ? "prose" : totalListItems <= 6 ? "split" : "stacked";

  return (
    <section className={`${bg} px-6 py-16 lg:px-8 lg:py-24`}>
      <div className="mx-auto max-w-[1180px]">
        <SectionCounter index={index} total={total} />

        {layout === "prose" ? (
          <ProseLayout heading={section.heading} paragraphs={paragraphBlocks} />
        ) : layout === "split" ? (
          <SplitLayout heading={section.heading} paragraphs={paragraphBlocks} lists={listBlocks} />
        ) : (
          <StackedLayout heading={section.heading} paragraphs={paragraphBlocks} lists={listBlocks} />
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
      <span className="text-primary-600/80">Step {index + 1} of {total}</span>
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

function MediaVideoBand({ videos }: { videos: InventoryVideo[] }) {
  return (
    <section className="bg-gray-50 px-6 py-14 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div
          className={`grid gap-5 ${videos.length > 1 ? "sm:grid-cols-2 lg:grid-cols-3" : "mx-auto max-w-2xl grid-cols-1"}`}
        >
          {videos.map((video, i) => (
            <div
              key={video.id}
              className="reveal"
              style={{ "--reveal-delay": `${i * 100}ms` } as CSSProperties}
            >
              <VideoEmbed video={video} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function VideoEmbed({ video }: { video: InventoryVideo }) {
  if (video.type !== "youtube") return null;
  return (
    <div className="relative aspect-video overflow-hidden rounded-2xl shadow-lg">
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.id}`}
        title="Video"
        loading="lazy"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="absolute inset-0 h-full w-full border-0"
      />
    </div>
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
            Common questions from patients about this service. Still have a question? Reach out to our team.
          </p>
          <MotionLink
            href={toSiteUrl("/elevate-wellness-chiropractic-in-bountiful-ut/")}
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

function ServicePageJsonLd({
  page,
  displayTitle,
  faq,
}: {
  page: SiteInventoryPage;
  displayTitle: string;
  faq: { question: string; answer: string }[];
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
      "@type": "Service",
      name: displayTitle,
      description: page.metaDescription,
      url: page.canonicalUrl,
      provider: {
        "@type": "MedicalBusiness",
        name: "Elevate Wellness Chiropractic",
        url: `${SITE_URL}/`,
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
  return <JsonLd id={`service-jsonld-${page.slug}`} data={jsonLd} />;
}
