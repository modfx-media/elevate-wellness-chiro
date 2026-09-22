import napAndHours from "@/seo-audit/nap-and-hours.json";
import { SITE_URL } from "@/lib/constants";
import { getDisplayedGoogleReviews } from "@/lib/google-reviews";
import { isFiveStarReview } from "@/lib/reviews";
import { faqItems } from "./homepage-data";
import { JsonLd } from "@/components/seo/JsonLd";

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

export async function HomepageSchema() {
  const { reviews, meta } = await getDisplayedGoogleReviews();
  const visible = reviews.filter(isFiveStarReview);
  const bountifulWithReviews = {
    ...bountifulSchema,
    ...(meta.rating > 0 && meta.reviewCount > 0
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: String(meta.rating),
            reviewCount: String(meta.reviewCount),
            bestRating: "5",
          },
        }
      : {}),
    ...(visible.length
      ? {
          review: visible.map((review) => ({
            "@type": "Review",
            author: { "@type": "Person", name: review.name },
            reviewRating: {
              "@type": "Rating",
              ratingValue: "5",
              bestRating: "5",
            },
            reviewBody: review.quote,
          })),
        }
      : {}),
  };

  return (
    <>
      <JsonLd id="homepage-bountiful-business" data={bountifulWithReviews} />
      <JsonLd id="homepage-clinton-business" data={clintonSchema} />
      <JsonLd id="homepage-faq" data={faqSchema} />
    </>
  );
}
