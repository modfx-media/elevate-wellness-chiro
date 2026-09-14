import type { PseoPage } from "@/lib/pseo-pages";
import { SITE_URL } from "@/lib/constants";
import { getPseoContent } from "@/lib/pseo-content";
import { pseoCities } from "@/data/pseo-cities";
import { locations } from "@/components/site/footer-data";
import { FaqAccordion } from "@/components/home/FaqAccordion";
import napAndHours from "@/seo-audit/nap-and-hours.json";
import { CtaBand } from "./ConditionTemplate";
import { AreasWeServeBand, HeroBand } from "./LocationTemplate";
import { JsonLd } from "@/components/seo/JsonLd";

export function PseoLocationTemplate({ page }: { page: PseoPage }) {
  const officeIndex = page.city.county === "Davis" || page.city.county === "Salt Lake" ? 0 : 1;
  const office = locations[officeIndex];
  const content = getPseoContent(page);
  const title = content.h1;

  return (
    <main className="flex flex-1 flex-col bg-white">
      <PseoJsonLd page={page} />

      <HeroBand
        title={title}
        breadcrumb={`Home - ${title}`}
        lead={null}
        bountiful={{ phone: office.phone, telHref: office.telHref }}
      />

      <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary-600">
            Local Care
          </p>
          <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {content.introHeading}
          </h2>
          <div className="mt-8 space-y-5 text-base leading-relaxed text-ink-900">
            {content.introParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-6 py-14 lg:px-8 lg:py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
            {content.whyHeading}
          </h2>
          <div className="mt-6 space-y-5 text-base leading-relaxed text-ink-900">
            {content.whyParagraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white px-6 py-14 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-[1180px] grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-600">
              Local Questions
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-navy-900 sm:text-4xl">
              Chiropractic Care FAQ for {page.city.name}
            </h2>
          </div>
          <FaqAccordion items={content.faqs} />
        </div>
      </section>

      <AreasWeServeBand
        heading={`${page.topic.name} Areas We Serve`}
        areas={pseoCities.map((city) => city.name)}
        activeSlug={page.slug}
        hrefForArea={(area) => {
          const city = pseoCities.find((candidate) => candidate.name === area);
          return city ? `/${page.topic.slug}-in-${city.slug}/` : null;
        }}
      />

      <CtaBand
        eyebrow={`Care Near ${page.city.name}`}
        heading={content.ctaHeading}
        body={content.ctaBody}
        phone={office.phone}
        telHref={office.telHref}
      />
    </main>
  );
}

function PseoJsonLd({ page }: { page: PseoPage }) {
  const officeIndex = page.city.county === "Davis" || page.city.county === "Salt Lake" ? 0 : 1;
  const nap = napAndHours.locations[officeIndex];
  const name = `${page.topic.name} in ${page.city.name}, UT`;
  const url = `${SITE_URL}/${page.slug}/`;
  const providerId = `${SITE_URL}/#${officeIndex === 0 ? "bountiful" : "clinton"}-office`;
  const faqs = getPseoContent(page).faqs;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name, item: url },
        ],
      },
      {
        "@type": "LocalBusiness",
        "@id": providerId,
        name: nap.name,
        url: SITE_URL,
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
      {
        "@type": "Service",
        name,
        url,
        areaServed: {
          "@type": "City",
          name: page.city.name,
          containedInPlace: {
            "@type": "AdministrativeArea",
            name: `${page.city.county} County, Utah`,
          },
        },
        provider: { "@id": providerId },
      },
      ...(faqs.length
        ? [
            {
              "@type": "FAQPage",
              mainEntity: faqs.map((faq) => ({
                "@type": "Question",
                name: faq.question,
                acceptedAnswer: { "@type": "Answer", text: faq.answer },
              })),
            },
          ]
        : []),
    ],
  };

  return <JsonLd id={`pseo-jsonld-${page.slug}`} data={jsonLd} />;
}
