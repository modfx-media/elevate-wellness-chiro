import Link from "next/link";
import type { SiteInventoryPage } from "@/lib/site-content";
import { SITE_URL, toSiteUrl } from "@/lib/constants";
import { JsonLd } from "@/components/seo/JsonLd";

/**
 * Fallback shell for noindexed utility and author-archive routes
 * that are not part of the public content model yet.
 */
export function PagePlaceholder({
  page,
  typeLabel,
}: {
  page: SiteInventoryPage;
  typeLabel: string;
}) {
  const title = page.title.replace(/\s+\|.+$/, "");

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 px-6 py-24">
      <JsonLd
        id={`placeholder-jsonld-${page.slug || "page"}`}
        data={{
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: title,
          url: page.canonicalUrl || `${SITE_URL}${page.path}`,
        }}
      />
      <span className="w-fit rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-900">
        {typeLabel}
      </span>
      <h1 className="text-3xl font-bold text-ink-900">{title}</h1>
      <p className="text-ink-700">
        This page is not part of our current chiropractic service directory. Visit the blog or homepage
        for care information in Bountiful and Clinton, Utah.
      </p>
      <Link href={toSiteUrl("/")} className="mt-4 w-fit text-sm font-semibold text-primary-700 hover:underline">
        Return to the homepage
      </Link>
    </main>
  );
}
