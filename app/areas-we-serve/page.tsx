import type { Metadata } from "next";
import Link from "next/link";
import { pseoPages } from "@/lib/pseo-pages";
import { pseoTopics } from "@/data/pseo-topics";
import { SITE_URL, toSiteUrl } from "@/lib/constants";
import { socialMetadata } from "@/lib/seo";
import { JsonLd } from "@/components/seo/JsonLd";

const TITLE = "Chiropractic Care Areas We Serve in Northern Utah";
const DESCRIPTION =
  "Find chiropractic care near Davis, Weber, and Salt Lake County communities. Explore local service pages for Elevate Wellness in Bountiful and Clinton, UT.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: `${TITLE} | Elevate Wellness`,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/areas-we-serve/` },
  ...socialMetadata({
    title: `${TITLE} | Elevate Wellness`,
    description: DESCRIPTION,
    url: `${SITE_URL}/areas-we-serve/`,
  }),
};

export default function AreasWeServePage() {
  return (
    <main className="flex-1 bg-white">
      <JsonLd
        id="areas-we-serve-jsonld"
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: TITLE,
          description: DESCRIPTION,
          url: `${SITE_URL}/areas-we-serve/`,
        }}
      />
      <section className="bg-navy-900 px-6 py-16 text-white sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
            Northern Utah Care
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {TITLE}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
            Find local information about chiropractic services and common conditions we address near our Bountiful and Clinton offices.
          </p>
        </div>
      </section>

      <section className="px-6 py-14 sm:py-18 lg:px-8">
        <div className="mx-auto max-w-[1180px] space-y-14">
          {pseoTopics.map((topic) => {
            const topicPages = pseoPages.filter((page) => page.topic.slug === topic.slug);

            return (
              <section key={topic.slug} aria-labelledby={`${topic.slug}-heading`}>
                <div className="border-b border-navy-900/10 pb-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary-700">
                    {topic.type === "service" ? "Service" : "Condition"}
                  </p>
                  <h2
                    id={`${topic.slug}-heading`}
                    className="mt-2 font-display text-2xl font-bold tracking-tight text-navy-900 sm:text-3xl"
                  >
                    {topic.name}
                  </h2>
                </div>
                <ul className="mt-6 grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {topicPages.map((page) => (
                    <li key={page.slug}>
                      <Link
                        href={toSiteUrl(`/${page.slug}/`)}
                        className="group inline-flex items-center gap-2 text-sm font-semibold text-ink-700 transition-colors hover:text-primary-700"
                      >
                        <span aria-hidden className="text-primary-500 transition-transform group-hover:translate-x-0.5">
                          &rarr;
                        </span>
                        {topic.name} in {page.city.name}, UT
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </section>
    </main>
  );
}