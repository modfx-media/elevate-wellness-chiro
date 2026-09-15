import type { Metadata } from "next";
import Link from "next/link";
import { pseoTopics } from "@/data/pseo-topics";
import { pseoPages } from "@/lib/pseo-pages";
import { SITE_URL, toSitePath } from "@/lib/constants";
import { getAllPages, type SiteInventoryPage } from "@/lib/site-content";
import { isNoindexPath, socialMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const TITLE = "Sitemap | Elevate Wellness Chiropractic";
const DESCRIPTION =
  "Browse every chiropractic service, condition, location, provider, article, and patient resource on the Elevate Wellness Chiropractic website.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/sitemap/` },
  ...socialMetadata({ title: TITLE, description: DESCRIPTION, url: `${SITE_URL}/sitemap/` }),
};

const GROUPS: { label: string; types: SiteInventoryPage["pageType"][] }[] = [
  { label: "Services", types: ["service"] },
  { label: "Conditions", types: ["injury-condition"] },
  { label: "Locations", types: ["service-location/geo page"] },
  { label: "Providers", types: ["provider bio"] },
  { label: "Resources", types: ["category archive", "utility page"] },
  { label: "Articles", types: ["blog post"] },
  { label: "Legal", types: ["legal page"] },
];

function pageLabel(page: SiteInventoryPage): string {
  return page.headings.find((heading) => heading.level === "h1")?.text || page.title;
}

export default function SitemapPage() {
  const inventoryPages = getAllPages();
  const pseoPaths = new Set(pseoPages.map((page) => `/${page.slug}/`));
  const groupedPages = GROUPS.map((group) => ({
    ...group,
    pages: inventoryPages
      .filter(
        (page) =>
          group.types.includes(page.pageType) &&
          !pseoPaths.has(page.path) &&
          !isNoindexPath(page.path),
      )
      .sort((a, b) => pageLabel(a).localeCompare(pageLabel(b))),
  }));
  const totalUrls = new Set([
    ...inventoryPages.filter((page) => !isNoindexPath(page.path)).map((page) => page.path),
    ...pseoPages.map((page) => `/${page.slug}/`),
    "/areas-we-serve/",
  ]).size;

  return (
    <main className="flex-1 bg-white">
      <JsonLd
        id="html-sitemap-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${SITE_URL}/sitemap/`,
        }}
      />
      <section className="relative overflow-hidden bg-navy-900 px-6 py-16 text-white sm:py-20 lg:px-8">
        <div aria-hidden className="absolute inset-x-0 bottom-0 h-px bg-primary-500/50" />
        <div className="relative mx-auto max-w-[1180px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
            Explore Elevate Wellness
          </p>
          <div className="mt-4 grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
                Chiropractic Website Sitemap
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                A complete directory of our chiropractic services, health information, local care pages, and patient resources.
              </p>
            </div>
            <div className="border-l-2 border-primary-500 pl-5">
              <p className="font-display text-4xl font-bold text-white">{totalUrls}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.15em] text-white/55">
                Pages to explore
              </p>
            </div>
          </div>
        </div>
      </section>

      <nav aria-label="Sitemap sections" className="border-b border-navy-900/10 bg-primary-50 px-6 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] gap-6 overflow-x-auto py-4 text-sm font-semibold text-navy-900">
          <a href="#main-pages" className="shrink-0 border-b-2 border-transparent py-1 hover:border-primary-500">Main Pages</a>
          {groupedPages.map((group) => (
            <a key={group.label} href={`#${group.label.toLowerCase()}`} className="shrink-0 border-b-2 border-transparent py-1 hover:border-primary-500">
              {group.label}
            </a>
          ))}
          <a href="#local-care" className="shrink-0 border-b-2 border-transparent py-1 hover:border-primary-500">Local Care</a>
        </div>
      </nav>

      <section id="main-pages" className="scroll-mt-24 px-6 py-14 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <SectionHeading eyebrow="Start Here" title="Main Pages" />
          <ul className="mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
            <DirectoryLink href="/" label="Home" />
            <DirectoryLink href="/areas-we-serve/" label="Areas We Serve" />
            <DirectoryLink href="/sitemap/" label="Sitemap" />
          </ul>
        </div>
      </section>

      {groupedPages.map((group, index) => (
        <section
          key={group.label}
          id={group.label.toLowerCase()}
          className={`scroll-mt-24 px-6 py-14 lg:px-8 ${index % 2 === 0 ? "bg-primary-50/60" : "bg-white"}`}
        >
          <div className="mx-auto max-w-[1180px]">
            <SectionHeading eyebrow={`${group.pages.length} pages`} title={group.label} />
            <ul className={`mt-7 grid gap-x-8 gap-y-3 sm:grid-cols-2 ${group.label === "Articles" ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
              {group.pages.map((page) => (
                <DirectoryLink key={page.path} href={page.path} label={pageLabel(page)} />
              ))}
            </ul>
          </div>
        </section>
      ))}

      <section id="local-care" className="scroll-mt-24 bg-navy-900 px-6 py-16 text-white lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">500 local pages</p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">Care by City</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-white/65">
            Browse services and condition information for communities near our Bountiful and Clinton offices.
          </p>

          <div className="mt-12 space-y-12">
            {pseoTopics.map((topic) => {
              const topicPages = pseoPages.filter((page) => page.topic.slug === topic.slug);
              return (
                <section key={topic.slug} aria-labelledby={`sitemap-${topic.slug}`}>
                  <div className="flex items-baseline justify-between gap-4 border-b border-white/15 pb-3">
                    <h3 id={`sitemap-${topic.slug}`} className="font-display text-xl font-bold text-white sm:text-2xl">
                      {topic.name}
                    </h3>
                    <span className="shrink-0 text-xs font-semibold uppercase tracking-[0.12em] text-primary-300">25 cities</span>
                  </div>
                  <ul className="mt-5 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {topicPages.map((page) => (
                      <li key={page.slug}>
                        <Link href={toSitePath(`/${page.slug}/`)} className="text-sm font-medium text-white/65 transition-colors hover:text-primary-300">
                          {topic.name} in {page.city.name}, UT
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}

function SectionHeading({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="border-b border-navy-900/10 pb-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">{eyebrow}</p>
      <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-navy-900">{title}</h2>
    </div>
  );
}

function DirectoryLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link href={toSitePath(href)} className="group inline-flex items-start gap-2 text-sm font-semibold leading-relaxed text-ink-700 transition-colors hover:text-primary-700">
        <span aria-hidden className="mt-px text-primary-500 transition-transform group-hover:translate-x-0.5">&rarr;</span>
        <span>{label}</span>
      </Link>
    </li>
  );
}