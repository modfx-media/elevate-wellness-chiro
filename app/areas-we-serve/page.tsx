import type { Metadata } from "next";
import Link from "next/link";
import { pseoPages } from "@/lib/pseo-pages";
import { pseoTopics } from "@/data/pseo-topics";

export const metadata: Metadata = {
  title: "Areas We Serve | Elevate Wellness Chiropractic",
  description:
    "Explore chiropractic services and care options available throughout Davis, Weber, and nearby Northern Utah communities.",
  alternates: { canonical: "/areas-we-serve/" },
};

export default function AreasWeServePage() {
  return (
    <main className="flex-1 bg-white">
      <section className="bg-navy-900 px-6 py-16 text-white sm:py-20 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary-300">
            Northern Utah Care
          </p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            Areas We Serve
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
                        href={`/${page.slug}/`}
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