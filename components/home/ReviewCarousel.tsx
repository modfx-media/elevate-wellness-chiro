"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Testimonial } from "./homepage-data";

const AVATAR_PALETTE = [
  "bg-slate-500",
  "bg-amber-700",
  "bg-emerald-600",
  "bg-indigo-500",
  "bg-rose-500",
  "bg-cyan-600",
  "bg-orange-500",
  "bg-purple-600",
];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash + name.charCodeAt(i)) % AVATAR_PALETTE.length;
  return AVATAR_PALETTE[hash];
}

function GoogleGlyph({ className = "h-5 w-5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className={className}>
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1" role="img" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          viewBox="0 0 24 24"
          fill="currentColor"
          className={`h-4 w-4 ${i < rating ? "text-amber-400" : "text-gray-200"}`}
          aria-hidden
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="ml-1 h-4 w-4 text-primary-500">
        <path d="M12 2l1.5 1.7 2.2-.5.6 2.2 2.1.8-.6 2.2 1.5 1.7-1.5 1.7.6 2.2-2.1.8-.6 2.2-2.2-.5L12 18l-1.5-1.7-2.2.5-.6-2.2-2.1-.8.6-2.2L4.7 10l1.5-1.7-.6-2.2 2.1-.8.6-2.2 2.2.5L12 2Z" />
        <path d="M10.5 12.5l1.5 1.5 3-3.5" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function ReviewCard({ review }: { review: Testimonial }) {
  const initial = review.name.trim().charAt(0).toUpperCase();
  const [expanded, setExpanded] = useState(false);
  const bodyRef = useRef<HTMLParagraphElement>(null);
  const [needsClamp, setNeedsClamp] = useState(false);

  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    setNeedsClamp(el.scrollHeight > el.clientHeight + 2);
  }, []);

  return (
    <article className="flex h-full snap-start flex-col rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-base font-bold text-white ${avatarColor(review.name)}`}
          >
            {initial}
          </div>
          <div>
            <p className="font-display text-base font-semibold text-ink-900">{review.name}</p>
            <p className="text-xs text-ink-500">{review.date}</p>
          </div>
        </div>
        <GoogleGlyph className="h-5 w-5 shrink-0" />
      </header>

      <div className="mt-4">
        <StarRow rating={review.rating} />
      </div>

      <p
        ref={bodyRef}
        className={`mt-4 flex-1 text-sm leading-relaxed text-ink-900 ${expanded ? "" : "line-clamp-5"}`}
      >
        {review.text}
      </p>

      {needsClamp && !expanded ? (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-3 w-fit text-sm font-semibold text-ink-500 transition-colors hover:text-navy-900"
        >
          Read more
        </button>
      ) : null}
    </article>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden className="h-5 w-5">
      <path
        d={direction === "left" ? "m15 6-6 6 6 6" : "m9 6 6 6-6 6"}
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function ReviewCarousel({ reviews }: { reviews: Testimonial[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateEdges = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    updateEdges();
    el.addEventListener("scroll", updateEdges, { passive: true });
    window.addEventListener("resize", updateEdges);
    return () => {
      el.removeEventListener("scroll", updateEdges);
      window.removeEventListener("resize", updateEdges);
    };
  }, [updateEdges]);

  function scrollByCard(dir: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const gap = 16;
    const step = (first?.clientWidth ?? 320) + gap;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-1 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {reviews.map((review) => (
          <div
            key={`${review.name}-${review.date}`}
            className="w-[85%] shrink-0 sm:w-[46%] lg:w-[calc((100%-3rem)/4)]"
          >
            <ReviewCard review={review} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByCard(-1)}
        aria-label="Previous reviews"
        disabled={!canPrev}
        className="absolute -left-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg transition-opacity disabled:opacity-30 lg:flex"
      >
        <ChevronIcon direction="left" />
      </button>
      <button
        type="button"
        onClick={() => scrollByCard(1)}
        aria-label="Next reviews"
        disabled={!canNext}
        className="absolute -right-4 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-navy-900 text-white shadow-lg transition-opacity disabled:opacity-30 lg:flex"
      >
        <ChevronIcon direction="right" />
      </button>
    </div>
  );
}
