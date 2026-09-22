/**
 * Per-client Google review types + fallback.
 * Fallback quotes must be real 5-star Google reviews for THIS business.
 * Leave googleReviews empty if none are on file.
 */
export const googleReviewsMeta = {
  rating: 5, // Google's published overall for Elevate Wellness Chiropractic
  reviewCount: 327, // Google's total, all stars
  fiveStarCount: 10,
  placeId: "ChIJoQDpV-s6kFQRHC4xN3cY9GA",
  reviewsUrl: "https://www.google.com/maps",
} as const;

export type GoogleReview = {
  quote: string;
  name: string;
  rating: number;
  relativeTime?: string;
};

export type GoogleReviewsMeta = {
  rating: number;
  reviewCount: number;
  fiveStarCount: number;
  placeId: string;
  reviewsUrl: string;
};

export const googleReviews: GoogleReview[] = [
  {
    name: "Lance Tilley",
    relativeTime: "4 August 2026",
    rating: 5,
    quote:
      "The doctors are competent and confident. They are great to work with and are fun to be around. They are great.",
  },
  {
    name: "Hector dehesa",
    relativeTime: "10 July 2026",
    rating: 5,
    quote:
      "I started going here after my accident last year. I’ve started to feel better right away. Last week I had to use another service in an emergency and my regular chiropractor was on vacation. I called Elevate and they got me in the next morning.",
  },
  {
    name: "Jeny Petersen",
    relativeTime: "9 July 2026",
    rating: 5,
    quote:
      "Everyone is pleasant and eager to help you. The doctors are very personable, kind, and helpful. He explained my condition to me and answered all my questions.",
  },
  {
    name: "Brian puff",
    relativeTime: "10 June 2026",
    rating: 5,
    quote:
      "I had a rib popped out with pain, I got adjusted with other treatment. I feel better after this and will make this a stop whenever I pass through the area.",
  },
  {
    name: "Juan Pablo Flores",
    relativeTime: "18 May 2026",
    rating: 5,
    quote:
      "Los mejores en todo, atención, recepción, asesoramiento, y claro que salimos de allí, como nuevos.",
  },
  {
    name: "Audri Ence",
    relativeTime: "26 February 2026",
    rating: 5,
    quote: "Honest and helpful, highly recommend.",
  },
  {
    name: "Matt Hauck",
    relativeTime: "26 February 2026",
    rating: 5,
    quote: "Kaden rocks! Super helpful and I’m getting better each visit.",
  },
  {
    name: "Blair Stratton",
    relativeTime: "25 February 2026",
    rating: 5,
    quote:
      "Casey and Kaden are the best. I’ve been dealing with issues from a car wreck a couple years ago and they’ve been able to take away the pain and help me feel like myself again.",
  },
  {
    name: "Crystal Walker",
    relativeTime: "17 February 2026",
    rating: 5,
    quote:
      "Best chiropractor experience I’ve ever had! Professional, friendly, and incredibly effective. I felt relief almost immediately and continue to see improvement with every visit.",
  },
  {
    name: "Emily J",
    relativeTime: "26 January 2026",
    rating: 5,
    quote:
      "I had an excellent experience at Elevate Wellness following a car accident. After the accident, I struggled with limited neck mobility and daily headaches. The team was thorough and got me back to feeling normal again.",
  },
];

/** The only acceptance test for a card or a JSON-LD review. */
export function isFiveStarReview(review: GoogleReview): boolean {
  return review.rating === 5 && review.quote.trim().length > 0 && review.name.trim().length > 0;
}

export const fiveStarReviews = googleReviews.filter(isFiveStarReview);
