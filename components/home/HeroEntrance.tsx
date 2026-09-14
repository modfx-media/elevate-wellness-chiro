"use client";

import { useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 28 },
  visible: (delay: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: EASE_OUT_EXPO },
  }),
};

const wordUp = {
  hidden: { y: "115%" },
  visible: (delay: number) => ({
    y: "0%",
    transition: { duration: 0.65, delay, ease: EASE_OUT_EXPO },
  }),
};

export function HeroEntrance({
  eyebrow,
  headline,
  subheadline,
  scrollTargetId = "services",
  scrollLabel = "Explore Our Care",
  topSlot,
}: {
  eyebrow: string;
  headline: string;
  subheadline: string;
  scrollTargetId?: string;
  scrollLabel?: string;
  topSlot?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : "hidden";
  const [words] = useState(() => headline.split(" "));

  return (
    <div className="relative flex max-w-2xl flex-col items-center rounded-3xl border border-white/10 bg-navy-900/35 p-6 text-center backdrop-blur-md sm:p-8 lg:items-start lg:text-left">
      {topSlot ? <div className="mb-5">{topSlot}</div> : null}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial={initial}
        animate="visible"
        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 backdrop-blur-md"
      >
        <span aria-hidden className="h-2 w-2 rounded-full bg-primary-500" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-white/80">
          {eyebrow}
        </span>
      </motion.div>

      <h1 className="mt-6 font-display text-4xl font-bold leading-[1.03] tracking-tight text-white sm:text-5xl lg:text-6xl">
        <span className="flex flex-wrap justify-center lg:justify-start">
          {words.map((word, i) => (
            <span key={`${word}-${i}`} className="overflow-hidden pb-1">
              <motion.span
                custom={0.18 + i * 0.06}
                variants={wordUp}
                initial={initial}
                animate="visible"
                className="inline-block"
              >
                {word}
                {i < words.length - 1 ? " " : ""}
              </motion.span>
            </span>
          ))}
        </span>
      </h1>

      <motion.p
        custom={0.65}
        variants={fadeUp}
        initial={initial}
        animate="visible"
        className="mt-5 max-w-xl text-lg text-white/70"
      >
        {subheadline}
      </motion.p>

      <motion.a
        href={`#${scrollTargetId}`}
        custom={0.85}
        variants={fadeUp}
        initial={initial}
        animate="visible"
        className="group mt-8 inline-flex items-center gap-2.5 text-sm font-semibold uppercase tracking-[0.15em] text-white/80 transition-colors hover:text-white"
      >
        {scrollLabel}
        <motion.span
          aria-hidden
          animate={reduceMotion ? undefined : { y: [0, 5, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-8 w-8 items-center justify-center rounded-full border border-white/25 transition-colors group-hover:border-white/50"
        >
          ↓
        </motion.span>
      </motion.a>
    </div>
  );
}

