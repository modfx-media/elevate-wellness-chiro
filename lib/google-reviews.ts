import { cache } from "react";
import {
  fiveStarReviews,
  googleReviewsMeta,
  isFiveStarReview,
  type GoogleReview,
  type GoogleReviewsMeta,
} from "./reviews";

const REVIEWS_REVALIDATE_SECONDS = 60 * 60 * 24;
const PLACES_FIELD_MASK = "id,rating,userRatingCount,googleMapsUri,reviews";

export type GoogleReviewsPayload = {
  reviews: GoogleReview[];
  meta: GoogleReviewsMeta;
};

type PlacesReview = {
  rating?: number;
  relativePublishTimeDescription?: string;
  text?: { text?: string };
  originalText?: { text?: string };
  authorAttribution?: { displayName?: string };
};

type PlacesDetailsResponse = {
  rating?: number;
  userRatingCount?: number;
  googleMapsUri?: string;
  reviews?: PlacesReview[];
  error?: { message?: string; status?: string };
};

function reviewKey(review: GoogleReview): string {
  return review.name.trim().toLowerCase();
}

function mergeFiveStarReviews(
  primary: GoogleReview[],
  extra: GoogleReview[],
): GoogleReview[] {
  const merged: GoogleReview[] = [];
  const seen = new Set<string>();

  for (const review of [...primary, ...extra].filter(isFiveStarReview)) {
    const key = reviewKey(review);
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(review);
  }

  return merged;
}

function fallbackPayload(): GoogleReviewsPayload {
  return {
    reviews: fiveStarReviews,
    meta: { ...googleReviewsMeta, fiveStarCount: fiveStarReviews.length },
  };
}

function mapPlaceReview(review: PlacesReview): GoogleReview | null {
  const quote = (review.text?.text ?? review.originalText?.text ?? "").trim();
  const name = review.authorAttribution?.displayName?.trim() ?? "";
  const rating = review.rating ?? 0;

  // Exact 5 only. Drop 4, 4.5, empty text, and nameless authors here.
  if (rating !== 5 || !quote || !name) return null;

  return {
    quote,
    name,
    rating: 5,
    relativeTime: review.relativePublishTimeDescription,
  };
}

function placesApiKey(): string | undefined {
  return process.env.GOOGLE_PLACES_API_KEY?.trim() || process.env.GOOGLE_API_KEY?.trim();
}

/**
 * Places API (New), then 5-star reviews with text only.
 * Google returns at most 5 most-relevant reviews. Filter that set.
 */
export const getDisplayedGoogleReviews = cache(
  async (): Promise<GoogleReviewsPayload> => {
    const apiKey = placesApiKey();
    const placeId =
      process.env.GOOGLE_PLACE_ID?.trim() || googleReviewsMeta.placeId;

    if (!apiKey || placeId.startsWith("REPLACE_")) return fallbackPayload();

    try {
      const response = await fetch(
        `https://places.googleapis.com/v1/places/${encodeURIComponent(placeId)}`,
        {
          headers: {
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": PLACES_FIELD_MASK,
          },
          next: {
            revalidate: REVIEWS_REVALIDATE_SECONDS,
            tags: ["google-reviews"],
          },
        },
      );

      const data = (await response.json()) as PlacesDetailsResponse;

      if (!response.ok || data.error) {
        console.error(
          "Google Places reviews request failed:",
          data.error?.message ?? response.statusText,
        );
        return fallbackPayload();
      }

      const liveReviews = (data.reviews ?? [])
        .map(mapPlaceReview)
        .filter((review): review is GoogleReview => review !== null)
        .filter(isFiveStarReview);

      const reviews = mergeFiveStarReviews(liveReviews, fiveStarReviews);
      if (reviews.length === 0) return fallbackPayload();

      return {
        reviews,
        meta: {
          rating: data.rating ?? googleReviewsMeta.rating,
          reviewCount: data.userRatingCount ?? googleReviewsMeta.reviewCount,
          fiveStarCount: reviews.length,
          placeId,
          reviewsUrl: data.googleMapsUri ?? googleReviewsMeta.reviewsUrl,
        },
      };
    } catch (error) {
      console.error("Google Places reviews fetch error:", error);
      return fallbackPayload();
    }
  },
);

export function formatGoogleRating(rating: number): string {
  return Number.isFinite(rating) ? rating.toFixed(1) : "";
}
