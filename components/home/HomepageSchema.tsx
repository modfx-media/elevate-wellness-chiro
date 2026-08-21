import napAndHours from "@/seo-audit/nap-and-hours.json";
import { SITE_URL } from "@/lib/site-content";
import { faqItems } from "./homepage-data";

const [bountiful, clinton] = napAndHours.locations;

function localBusiness(
  location: (typeof napAndHours.locations)[number],
  shifts: { opens: string; closes: string }[],
  geo?: { latitude: string; longitude: string },
) {
  return {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    name: "Elevate Wellness Chiropractic",
    url: SITE_URL,
    telephone: location.phone,
    address: {
      "@type": "PostalAddress",
      streetAddress: location.address.streetAddress,
      addressLocality: location.address.addressLocality,
      addressRegion: location.address.addressRegion,
      postalCode: location.address.postalCode,
      addressCountry: location.address.addressCountry,
    },
    ...(geo && {
      geo: {
        "@type": "GeoCoordinates",
        latitude: geo.latitude,
        longitude: geo.longitude,
      },
    }),
    openingHoursSpecification: shifts.map((shift) => ({
      "@type": "OpeningHoursSpecification",
      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
      ].map((day) => `https://schema.org/${day}`),
      opens: shift.opens,
      closes: shift.closes,
    })),
  };
}

// Geo coordinates aren't in nap-and-hours.json; the Bountiful pair below comes
// from the homepage's own crawled structuredData in site-inventory.json.
// No equivalent was found for Clinton, so it's omitted rather than invented.
const bountifulSchema = localBusiness(
  bountiful,
  [
    { opens: "09:00", closes: "12:00" },
    { opens: "14:00", closes: "17:45" },
  ],
  { latitude: "40.8886118", longitude: "-111.8878658" },
);

const clintonSchema = localBusiness(clinton, [
  { opens: "08:30", closes: "12:00" },
  { opens: "13:30", closes: "17:45" },
]);

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

export function HomepageSchema() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(bountifulSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(clintonSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
