"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

const EASE = [0.16, 1, 0.3, 1] as const;

// Both treatment photos shown together as one framed diptych media card.
export function HeroDiptych({
  topSrc,
  bottomSrc,
  topAlt,
  bottomAlt,
  ratingValue,
  ratingLabel,
}: {
  topSrc: string;
  bottomSrc: string;
  topAlt: string;
  bottomAlt: string;
  ratingValue: string;
  ratingLabel: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="relative mx-auto w-full max-w-md lg:mx-0">
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.35, ease: EASE }}
        className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/15 shadow-2xl"
      >
        <Image
          src={topSrc}
          alt={topAlt}
          fill
          priority
          sizes="(min-width: 1024px) 24rem, 90vw"
          className="object-cover"
        />
      </motion.div>

      {/* Smaller overlapping inset */}
      <motion.div
        initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: -4 }}
        animate={{ opacity: 1, y: 0, rotate: -3 }}
        transition={{ duration: 0.7, delay: 0.55, ease: EASE }}
        whileHover={{ rotate: 0, scale: 1.04 }}
        className="absolute -bottom-6 -left-5 aspect-[4/3] w-32 overflow-hidden rounded-xl border-4 border-white shadow-xl sm:w-36"
      >
        <Image src={bottomSrc} alt={bottomAlt} fill sizes="9rem" className="object-cover" />
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
    </div>
  );
}
