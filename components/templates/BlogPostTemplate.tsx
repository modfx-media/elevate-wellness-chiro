import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import type { SiteInventoryPage, InventoryImage } from "@/lib/site-content";
import { JsonLd } from "@/components/seo/JsonLd";
import { getBlogPosts, getCategoryArchives, normalizeAssetUrl } from "@/lib/site-content";
import {
  parseServiceBody,
  promoteIntroHeadings,
  type BodyBlock,
  type ServiceSection,
} from "@/lib/parse-service-body";
import { BOOKING_URL } from "@/components/site/nav-data";
import { locations } from "@/components/site/footer-data";

const PRACTICE_NAME = "Elevate Wellness Chiropractic";
const PRACTICE_URL = "https://www.elevatewellnesschiro.com/";

export function BlogPostTemplate({ page }: { page: SiteInventoryPage }) {
  const parsed = promoteIntroHeadings(parseServiceBody(page));
  const bountiful = locations[0];

  const displayTitle = page.title.split(" | ")[0].split(" - ")[0].trim() || page.title;

  const featured = deriveFeaturedImage(page);
  const inlineImages = page.images.filter((img) => img.placement === "inline (body content)");
  const inlineBodyImages =
    featured && inlineImages[0] && inlineImages[0].src === featured.src
      ? inlineImages.slice(1)
      : inlineImages;

  const author = deriveAuthor(page);
  const category = deriveCategoryForPost(page);

  return (
    <main className="flex flex-1 flex-col bg-white">
      <BlogPostingJsonLd
        page={page}
        displayTitle={displayTitle}
        featured={featured}
        author={author}
      />

      <HeroBand
        title={displayTitle}
        publishDate={page.publishDate ?? null}
        lastModified={page.lastModified}
        excerpt={page.openGraph?.description ?? page.metaDescription}
        author={author}
        category={category}
      />

      {featured ? <FeaturedImage image={featured} /> : null}

      <ArticleBody
        intro={parsed.intro}
        sections={parsed.sections}
        faq={parsed.faq}
        inlineImages={inlineBodyImages}
      />

      <PostFooter
        author={author}
        publishDate={page.publishDate ?? null}
        lastModified={page.lastModified}
        phone={bountiful.phone}
        telHref={bountiful.telHref}
      />
    </main>
  );
}

// ─── Data derivations ────────────────────────────────────────────────────────

function deriveFeaturedImage(page: SiteInventoryPage): InventoryImage | undefined {
  const og = page.openGraph?.image ? normalizeAssetUrl(page.openGraph.image) : undefined;
  if (og) {
    // Try to find the matching inventory record so we keep the original alt text.
    const match = page.images.find((img) => normalizeAssetUrl(img.src) === og);
    if (match) return { ...match, src: normalizeAssetUrl(match.src) };
    return { src: og, alt: page.title, placement: "hero" };
  }
  const fallback =
    page.images.find((img) => img.placement === "hero") ??
    page.images.find((img) => img.placement === "inline (body content)");
  return fallback ? { ...fallback, src: normalizeAssetUrl(fallback.src) } : undefined;
}

function deriveAuthor(page: SiteInventoryPage): { name: string; avatar?: string } | null {
  // Gravatar avatars from the crawled record's footer carry the author name in
  // their `alt` field (e.g. "Casey Simmonds", "Justin").
  const avatar = page.images.find(
    (img) => img.placement === "footer" && img.src.includes("gravatar"),
  );
  if (avatar) return { name: avatar.alt, avatar: avatar.src };
  return null;
}

function deriveCategoryForPost(
  page: SiteInventoryPage,
): { slug: string; label: string } | null {
  const cats = getCategoryArchives();
  for (const c of cats) {
    if (c.slug === "blog") continue;
    if (c.internalLinks.some((l) => l.destination.includes(`/${page.slug}/`))) {
      return { slug: c.slug, label: c.title.split(" | ")[0].split(" - ")[0].trim() };
    }
  }
  return null;
}

// ─── Hero ────────────────────────────────────────────────────────────────────

function HeroBand({
  title,
  publishDate,
  lastModified,
  excerpt,
  author,
  category,
}: {
  title: string;
  publishDate: string | null;
  lastModified: string;
  excerpt: string;
  author: { name: string; avatar?: string } | null;
  category: { slug: string; label: string } | null;
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
          <Link href="/" className="transition-colors hover:text-white">
            Home
          </Link>
          <span aria-hidden className="text-white/40">
            /
          </span>
          <Link href="/blog/" className="transition-colors hover:text-white">
            Blog
          </Link>
          {category ? (
            <>
              <span aria-hidden className="text-white/40">
                /
              </span>
              <Link
                href={`/${category.slug}/`}
                className="transition-colors hover:text-white"
              >
                {category.label}
              </Link>
            </>
          ) : null}
        </nav>

        {category ? (
          <Link
            href={`/${category.slug}/`}
            className="reveal mt-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300 transition-colors hover:border-primary-400 hover:bg-primary-500/20"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-400" />
            {category.label}
          </Link>
        ) : null}

        <h1 className="reveal mt-5 font-display text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl">
          {title}
        </h1>

        <p className="reveal mt-5 text-base leading-relaxed text-white/75 sm:text-lg">
          {excerpt}
        </p>

        <div
          className="reveal mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-white/70"
          style={{ "--reveal-delay": "80ms" } as CSSProperties}
        >
          {author ? (
            <div className="flex items-center gap-3">
              {author.avatar ? (
                <span className="relative h-9 w-9 overflow-hidden rounded-full border border-white/20">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    sizes="36px"
                    className="object-cover"
                    unoptimized
                  />
                </span>
              ) : null}
              <span className="font-medium text-white">By {author.name}</span>
            </div>
          ) : null}
          {publishDate ? (
            <time dateTime={publishDate}>{formatDateLong(publishDate)}</time>
          ) : null}
          {lastModified && lastModified.slice(0, 10) !== (publishDate ?? "").slice(0, 10) ? (
            <span className="text-white/50">Updated {formatDateShort(lastModified)}</span>
          ) : null}
        </div>
      </div>
    </section>
  );
}

// ─── Featured image ─────────────────────────────────────────────────────────

function FeaturedImage({ image }: { image: InventoryImage }) {
  return (
    <section className="bg-white px-6 pt-10 lg:px-8 lg:pt-14">
      <figure className="reveal mx-auto max-w-4xl">
        <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-xl">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="(min-width: 1024px) 896px, 100vw"
            className="object-cover"
          />
        </div>
        {image.alt ? <figcaption className="sr-only">{image.alt}</figcaption> : null}
      </figure>
    </section>
  );
}

// ─── Article body ───────────────────────────────────────────────────────────

function ArticleBody({
  intro,
  sections,
  faq,
  inlineImages,
}: {
  intro: BodyBlock[];
  sections: ServiceSection[];
  faq: { question: string; answer: string }[];
  inlineImages: InventoryImage[];
}) {
  // Distribute inline images: first goes after intro, the rest even-spaced
  // across sections.
  const imgAfterSection = new Map<number, InventoryImage>();
  let imgAfterIntro: InventoryImage | undefined;
  if (inlineImages.length > 0) {
    imgAfterIntro = inlineImages[0];
    const rest = inlineImages.slice(1);
    if (rest.length > 0 && sections.length > 0) {
      rest.forEach((img, i) => {
        let t = Math.floor(((i + 1) * sections.length) / (rest.length + 1));
        while (imgAfterSection.has(t) && t < sections.length - 1) t++;
        imgAfterSection.set(t, img);
      });
    }
  }

  return (
    <article className="bg-white px-6 pb-16 pt-10 lg:px-8 lg:pb-20 lg:pt-14">
      <div className="mx-auto max-w-3xl">
        <div className="reveal space-y-5 text-base leading-relaxed text-ink-900 sm:text-lg">
          <RenderBlocks blocks={intro} />
        </div>
        {imgAfterIntro ? <InlineFigure image={imgAfterIntro} /> : null}

        {sections.map((section, i) => (
          <section
            key={`${section.heading}-${i}`}
            className="reveal mt-12 sm:mt-14"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              {section.heading}
            </h2>
            <div className="mt-5 space-y-5 text-base leading-relaxed text-ink-900 sm:text-lg">
              <RenderBlocks blocks={section.blocks} />
            </div>
            {imgAfterSection.get(i) ? (
              <InlineFigure image={imgAfterSection.get(i)!} />
            ) : null}
          </section>
        ))}

        {faq.length > 0 ? (
          <section
            className="reveal mt-12 sm:mt-14"
            style={{ "--reveal-delay": "60ms" } as CSSProperties}
          >
            <h2 className="font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <dl className="mt-5 space-y-6">
              {faq.map((item, i) => (
                <div key={i}>
                  <dt className="font-display text-lg font-semibold text-navy-900">
                    {item.question}
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-ink-900 sm:text-lg">
                    {item.answer}
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        ) : null}
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
          <ul
            key={i}
            className="ml-1 list-disc space-y-2 pl-5 marker:text-primary-500"
          >
            {b.items.map((item, j) => (
              <li key={j}>{item}</li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

function InlineFigure({ image }: { image: InventoryImage }) {
  return (
    <figure className="reveal mt-10">
      <div className="relative aspect-[16/10] overflow-hidden rounded-2xl shadow-xl">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes="(min-width: 1024px) 768px, 100vw"
          className="object-cover"
        />
      </div>
      {image.alt ? (
        <figcaption className="mt-3 text-sm italic text-ink-700">{image.alt}</figcaption>
      ) : null}
    </figure>
  );
}

// ─── Footer / CTA ───────────────────────────────────────────────────────────

function PostFooter({
  author,
  publishDate,
  lastModified,
  phone,
  telHref,
}: {
  author: { name: string; avatar?: string } | null;
  publishDate: string | null;
  lastModified: string;
  phone: string;
  telHref: string;
}) {
  const recent = getBlogPosts()
    .filter((p) => p.publishDate)
    .sort((a, b) => (b.publishDate ?? "").localeCompare(a.publishDate ?? ""))
    .slice(0, 3);
  return (
    <>
      {author ? (
        <section className="bg-white px-6 pb-4 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <div className="reveal flex flex-col items-start gap-4 rounded-2xl border border-navy-900/5 bg-gray-50 p-6 sm:flex-row sm:items-center sm:gap-6">
              {author.avatar ? (
                <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full border border-navy-900/10">
                  <Image
                    src={author.avatar}
                    alt={author.name}
                    fill
                    sizes="56px"
                    className="object-cover"
                    unoptimized
                  />
                </span>
              ) : null}
              <div className="text-sm">
                <p className="font-semibold text-navy-900">Written by {author.name}</p>
                <p className="mt-1 text-ink-700">
                  {publishDate ? `Published ${formatDateShort(publishDate)}` : null}
                  {lastModified && lastModified.slice(0, 10) !== (publishDate ?? "").slice(0, 10)
                    ? ` · Updated ${formatDateShort(lastModified)}`
                    : null}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
        <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-navy-900 px-8 py-12 shadow-2xl sm:px-12 lg:px-14 lg:py-14">
          <div className="reveal relative">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
              <span aria-hidden className="h-px w-8 bg-primary-500/60" />
              Ready to feel better?
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Book a visit with our team
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/80">
              Whether the topic in this post applies to you or you&rsquo;re dealing with something
              else, our chiropractors in Bountiful and Clinton are ready to help.
            </p>
            <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
              <a
                href={BOOKING_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
              >
                Schedule Online
              </a>
              <a
                href={telHref}
                className="rounded-full border border-white/25 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/10"
              >
                Call {phone}
              </a>
            </div>
          </div>
        </div>
      </section>

      {recent.length > 0 ? (
        <section className="bg-gray-50 px-6 py-14 lg:px-8 lg:py-24">
          <div className="mx-auto max-w-[1180px]">
            <div className="reveal flex items-end justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
                  Keep Reading
                </p>
                <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
                  Latest from the blog
                </h2>
              </div>
              <Link
                href="/blog/"
                className="hidden text-sm font-semibold text-primary-700 hover:underline sm:inline"
              >
                All posts &rarr;
              </Link>
            </div>
            <ul className="reveal mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {recent.map((post) => (
                <RecentCard key={post.slug} post={post} />
              ))}
            </ul>
          </div>
        </section>
      ) : null}
    </>
  );
}

function RecentCard({ post }: { post: SiteInventoryPage }) {
  const raw =
    post.openGraph?.image ??
    post.images.find((i) => i.placement === "inline (body content)")?.src;
  const img = raw ? normalizeAssetUrl(raw) : undefined;
  const title = post.title.split(" | ")[0].split(" - ")[0].trim();
  return (
    <li className="group flex flex-col overflow-hidden rounded-2xl border border-navy-900/5 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl">
      <Link href={`/${post.slug}/`} className="flex h-full flex-col">
        {img ? (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={img}
              alt={title}
              fill
              sizes="(min-width: 1024px) 380px, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-3 p-5">
          {post.publishDate ? (
            <time className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700" dateTime={post.publishDate}>
              {formatDateShort(post.publishDate)}
            </time>
          ) : null}
          <h3 className="font-display text-lg font-bold leading-snug text-navy-900 group-hover:text-primary-700">
            {title}
          </h3>
        </div>
      </Link>
    </li>
  );
}

// ─── Formatting ─────────────────────────────────────────────────────────────

function formatDateLong(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });
}

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

// ─── JSON-LD ────────────────────────────────────────────────────────────────

function BlogPostingJsonLd({
  page,
  displayTitle,
  featured,
  author,
}: {
  page: SiteInventoryPage;
  displayTitle: string;
  featured?: InventoryImage;
  author: { name: string; avatar?: string } | null;
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: PRACTICE_URL },
        { "@type": "ListItem", position: 2, name: "Blog", item: `${PRACTICE_URL}blog/` },
        { "@type": "ListItem", position: 3, name: displayTitle, item: page.canonicalUrl },
      ],
    },
    {
      "@type": "BlogPosting",
      headline: displayTitle,
      description: page.openGraph?.description ?? page.metaDescription,
      url: page.canonicalUrl,
      mainEntityOfPage: page.canonicalUrl,
      datePublished: page.publishDate,
      dateModified: page.lastModified,
      image: featured ? featured.src : undefined,
      author: author
        ? { "@type": "Person", name: author.name }
        : { "@type": "Organization", name: PRACTICE_NAME },
      publisher: {
        "@type": "Organization",
        name: PRACTICE_NAME,
        url: PRACTICE_URL,
      },
    },
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };
  return <JsonLd id={`blog-jsonld-${page.slug}`} data={jsonLd} />;
}
