"use client";

import Image from "next/image";
import Link from "next/link";
import { toSitePath } from "@/lib/constants";
import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;
const AUTOPLAY_MS = 5000;

// Card-flip transition: the new slide rotates in on the Y axis from the
// direction it's arriving from, the old one rotates out the opposite way.
const flipVariants = {
  enter: (direction: number) => ({ rotateY: direction > 0 ? 90 : -90, opacity: 0 }),
  center: { rotateY: 0, opacity: 1 },
  exit: (direction: number) => ({ rotateY: direction > 0 ? -90 : 90, opacity: 0 }),
};

export type HeroServiceSlide = {
  title: string;
  href: string;
  image: string;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className={`h-5 w-5 ${direction === "left" ? "" : "rotate-180"}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// Autoplaying showcase of every service, replacing the old static diptych so
// the hero itself sells the full range of care instead of just two photos.
export function HeroServicesSlideshow({
  slides,
  ratingValue,
  ratingLabel,
}: {
  slides: HeroServiceSlide[];
  ratingValue: string;
  ratingLabel: string;
}) {
  const reduceMotion = useReducedMotion();
  const [[index, direction], setSlide] = useState<[number, number]>([0, 1]);
  const [paused, setPaused] = useState(false);

  const goTo = useCallback(
    (next: number, dir: number) => {
      setSlide([((next % slides.length) + slides.length) % slides.length, dir]);
    },
    [slides.length],
  );

  // Re-armed on every index change (including manual nav) so a click always
  // gives the viewer a full AUTOPLAY_MS before the next auto-advance.
  useEffect(() => {
    if (reduceMotion || paused) return;
    const id = setTimeout(
      () => setSlide(([i]) => [(i + 1) % slides.length, 1]),
      AUTOPLAY_MS,
    );
    return () => clearTimeout(id);
  }, [reduceMotion, paused, slides.length, index]);

  const active = slides[index];

  return (
    <div
      className="relative mx-auto w-full max-w-md lg:mx-0"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
    >
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-white/15 shadow-2xl [perspective:1600px]"
      >
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={active.href}
            custom={direction}
            variants={flipVariants}
            initial={reduceMotion ? false : "enter"}
            animate="center"
            exit={reduceMotion ? undefined : "exit"}
            transition={{ duration: 0.7, ease: EASE }}
            style={{ transformStyle: "preserve-3d", backfaceVisibility: "hidden" }}
            className="absolute inset-0"
          >
            <Image
              src={active.image}
              alt={`${active.title} at Elevate Wellness Chiropractic`}
              fill
              priority={index === 0}
              sizes="(min-width: 1024px) 24rem, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-900/90 via-navy-900/10 to-transparent" />

            <div className="absolute inset-x-0 bottom-0 p-6">
              <span className="inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-[0.65rem] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
                Featured Service
              </span>
              <p className="mt-3 font-display text-2xl font-bold leading-tight text-white">
                {active.title}
              </p>
              <Link
                href={toSitePath(active.href)}
                className="mt-2 inline-flex items-center gap-1.5 text-sm font-semibold text-white/85 transition-colors hover:text-white"
              >
                Learn more
                <span aria-hidden>→</span>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Service count badge */}
        <div className="absolute left-4 top-4 rounded-full bg-navy-900/60 px-3 py-1.5 text-[0.65rem] font-semibold uppercase tracking-wide text-white backdrop-blur-md">
          {slides.length} Services We Offer
        </div>

        {/* Prev / next controls */}
        <button
          type="button"
          onClick={() => goTo(index - 1, -1)}
          aria-label="Previous service"
          className="group absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white text-navy-900 shadow-lg ring-1 ring-black/5 transition-all hover:scale-110 hover:bg-primary-500 hover:text-white active:scale-95"
        >
          <ArrowIcon direction="left" />
        </button>
        <button
          type="button"
          onClick={() => goTo(index + 1, 1)}
          aria-label="Next service"
          className="group absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/40 bg-white text-navy-900 shadow-lg ring-1 ring-black/5 transition-all hover:scale-110 hover:bg-primary-500 hover:text-white active:scale-95"
        >
          <ArrowIcon direction="right" />
        </button>
      </motion.div>

      {/* Rating badge */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, scale: 0.7, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 16, delay: 0.75 }}
        className="absolute -right-3 -top-4 flex items-center gap-1.5 rounded-full bg-white px-4 py-2 shadow-xl"
      >
        <span className="font-display text-base font-bold text-navy-900">{ratingValue} ★</span>
        <span className="max-w-[5.5rem] text-[0.6rem] font-semibold uppercase leading-tight tracking-wide text-ink-700">
          {ratingLabel}
        </span>
      </motion.div>

      {/* Slide progress dots */}
      <div className="mt-4 flex items-center justify-center gap-2 lg:justify-start">
        {slides.map((slide, i) => (
          <button
            key={slide.href}
            type="button"
            onClick={() => goTo(i, i >= index ? 1 : -1)}
            aria-label={`Show ${slide.title}`}
            aria-current={i === index}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-6 bg-primary-500" : "w-1.5 bg-white/30 hover:bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
