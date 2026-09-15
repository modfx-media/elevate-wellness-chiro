import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { SITE_URL, toSitePath } from "@/lib/constants";
import type { SiteInventoryPage } from "@/lib/site-content";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getBlogPostsSortedByDate,
  getPostsLinkedFromCategory,
  normalizeAssetUrl,
} from "@/lib/site-content";
import { BOOKING_URL } from "@/components/site/nav-data";
import { locations } from "@/components/site/footer-data";

const PRACTICE_NAME = "Elevate Wellness Chiropractic";
const BLOG_HUB_SLUG = "blog";

export function CategoryArchiveTemplate({ page }: { page: SiteInventoryPage }) {
  const bountiful = locations[0];
  const isBlogHub = page.slug === BLOG_HUB_SLUG;
  const displayTitle = deriveCategoryDisplayTitle(page.title, isBlogHub);

  const posts = isBlogHub
    ? getBlogPostsSortedByDate()
    : sortByDateDesc(getPostsLinkedFromCategory(page.slug));

  return (
    <main className="flex flex-1 flex-col bg-white">
      <BlogArchiveJsonLd
        page={page}
        displayTitle={displayTitle}
        posts={posts}
      />

      <HeroBand
        title={displayTitle}
        description={page.metaDescription}
        postCount={posts.length}
        isBlogHub={isBlogHub}
      />

      {posts.length > 0 ? (
        <PostGrid posts={posts} />
      ) : (
        <EmptyState blogHref={toSitePath("/blog/")} />
      )}

      {!isBlogHub ? <MoreFromBlogLink /> : null}

      <ArchiveCta phone={bountiful.phone} telHref={bountiful.telHref} />
    </main>
  );
}

function deriveCategoryDisplayTitle(rawTitle: string, isBlogHub: boolean): string {
  const stripped = rawTitle.split(" | ")[0].split(" - ")[0].trim();
  if (isBlogHub) return "The Blog";
  return stripped || rawTitle;
}

function sortByDateDesc(posts: SiteInventoryPage[]): SiteInventoryPage[] {
  return [...posts].sort((a, b) => (b.publishDate ?? "").localeCompare(a.publishDate ?? ""));
}

// ─── Hero ───────────────────────────────────────────────────────────────────

function HeroBand({
  title,
  description,
  postCount,
  isBlogHub,
}: {
  title: string;
  description: string;
  postCount: number;
  isBlogHub: boolean;
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

      <div className="relative mx-auto max-w-[1180px] px-6 pb-16 pt-14 lg:px-8 lg:pb-20 lg:pt-20">
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
          {isBlogHub ? (
            <span className="text-white/70">Blog</span>
          ) : (
            <>
              <Link href={toSitePath("/blog/")} className="transition-colors hover:text-white">
                Blog
              </Link>
              <span aria-hidden className="text-white/40">
                /
              </span>
              <span className="text-white/70">{title}</span>
            </>
          )}
        </nav>

        <span className="reveal mt-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-300">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-primary-400" />
          {isBlogHub ? `${postCount} posts` : "Category"}
        </span>

        <h1 className="reveal mt-5 font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
          {title}
        </h1>

        {description ? (
          <p className="reveal mt-5 max-w-2xl text-base leading-relaxed text-white/80 sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

// ─── Post grid ──────────────────────────────────────────────────────────────

function PostGrid({ posts }: { posts: SiteInventoryPage[] }) {
  return (
    <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
      <ul className="mx-auto grid max-w-[1180px] grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, i) => (
          <PostCard key={post.slug} post={post} index={i} />
        ))}
      </ul>
    </section>
  );
}

function PostCard({ post, index }: { post: SiteInventoryPage; index: number }) {
  const raw =
    post.openGraph?.image ??
    post.images.find((i) => i.placement === "inline (body content)")?.src;
  const img = raw ? normalizeAssetUrl(raw) : undefined;
  const title = post.title.split(" | ")[0].split(" - ")[0].trim();
  const excerpt = post.openGraph?.description ?? post.metaDescription;

  return (
    <li
      className="reveal group flex flex-col overflow-hidden rounded-2xl border border-navy-900/5 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
      style={{ "--reveal-delay": `${Math.min(index * 40, 240)}ms` } as CSSProperties}
    >
      <Link href={toSitePath(`/${post.slug}/`)} className="flex h-full flex-col">
        {img ? (
          <div className="relative aspect-[16/10] overflow-hidden">
            <Image
              src={img}
              alt={title}
              fill
              sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : null}
        <div className="flex flex-1 flex-col gap-3 p-6">
          {post.publishDate ? (
            <time
              className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-700"
              dateTime={post.publishDate}
            >
              {formatDateShort(post.publishDate)}
            </time>
          ) : null}
          <h2 className="font-display text-xl font-bold leading-snug text-navy-900 group-hover:text-primary-700">
            {title}
          </h2>
          {excerpt ? (
            <p className="line-clamp-3 text-sm leading-relaxed text-ink-700">{excerpt}</p>
          ) : null}
          <span className="mt-auto inline-flex items-center gap-1 pt-2 text-sm font-semibold text-primary-700">
            Read more &rarr;
          </span>
        </div>
      </Link>
    </li>
  );
}

function EmptyState({ blogHref }: { blogHref: string }) {
  return (
    <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-2xl rounded-3xl border border-navy-900/5 bg-gray-50 px-8 py-14 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
          Coming soon
        </p>
        <h2 className="mt-3 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl">
          No posts to show here yet
        </h2>
        <p className="mt-4 text-base leading-relaxed text-ink-700">
          Browse every article on the main blog.
        </p>
        <Link
          href={blogHref}
          className="mt-6 inline-flex rounded-full bg-primary-500 px-6 py-3 text-sm font-semibold text-ink-900 transition-colors hover:bg-primary-600"
        >
          Go to the blog
        </Link>
      </div>
    </section>
  );
}

function MoreFromBlogLink() {
  return (
    <section className="bg-white px-6 pb-8 lg:px-8">
      <div className="mx-auto max-w-[1180px] text-center">
        <Link
          href={toSitePath("/blog/")}
          className="inline-flex items-center gap-2 rounded-full border border-navy-900/15 px-6 py-3 text-sm font-semibold text-navy-900 transition-colors hover:border-primary-400 hover:bg-primary-50"
        >
          See every post in the blog &rarr;
        </Link>
      </div>
    </section>
  );
}

function ArchiveCta({ phone, telHref }: { phone: string; telHref: string }) {
  return (
    <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
      <div className="relative mx-auto max-w-3xl overflow-hidden rounded-[2rem] bg-navy-900 px-8 py-12 shadow-2xl sm:px-12 lg:px-14 lg:py-14">
        <div className="reveal">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
            <span aria-hidden className="h-px w-8 bg-primary-500/60" />
            Ready to feel better?
          </p>
          <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Book a visit with our team
          </h2>
          <p className="mt-4 text-base leading-relaxed text-white/80">
            Our chiropractors in Bountiful and Clinton are ready to help you address the topics
            covered here.
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
  );
}

// ─── Formatting ─────────────────────────────────────────────────────────────

function formatDateShort(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 10);
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", timeZone: "UTC" });
}

// ─── JSON-LD ────────────────────────────────────────────────────────────────

function BlogArchiveJsonLd({
  page,
  displayTitle,
  posts,
}: {
  page: SiteInventoryPage;
  displayTitle: string;
  posts: SiteInventoryPage[];
}) {
  const graph: Record<string, unknown>[] = [
    {
      "@type": "BreadcrumbList",
      itemListElement:
        page.slug === BLOG_HUB_SLUG
          ? [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: page.canonicalUrl },
            ]
          : [
              { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}/` },
              { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog/` },
              { "@type": "ListItem", position: 3, name: displayTitle, item: page.canonicalUrl },
            ],
    },
    {
      "@type": page.slug === BLOG_HUB_SLUG ? "Blog" : "CollectionPage",
      name: displayTitle,
      description: page.metaDescription,
      url: page.canonicalUrl,
      publisher: {
        "@type": "Organization",
        name: PRACTICE_NAME,
        url: `${SITE_URL}/`,
      },
      mainEntity: {
        "@type": "ItemList",
        itemListOrder: "https://schema.org/ItemListOrderDescending",
        numberOfItems: posts.length,
        itemListElement: posts.slice(0, 30).map((post, i) => ({
          "@type": "ListItem",
          position: i + 1,
          url: post.canonicalUrl,
          name: post.title.split(" | ")[0].split(" - ")[0].trim(),
        })),
      },
    },
  ];
  const jsonLd = { "@context": "https://schema.org", "@graph": graph };
  return <JsonLd id={`archive-jsonld-${page.slug}`} data={jsonLd} />;
}
