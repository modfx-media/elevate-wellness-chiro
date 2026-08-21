"use client";

import { useState, type MouseEvent, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useReducedMotion } from "motion/react";
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

// Magnetic hover: CTA nudges toward the cursor, then springs back on leave.
function MagneticLink({
  href,
  external,
  className,
  children,
}: {
  href: string;
  external?: boolean;
  className: string;
  children: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 300, damping: 20, mass: 0.5 });
  const springY = useSpring(y, { stiffness: 300, damping: 20, mass: 0.5 });

  function handleMouseMove(event: MouseEvent<HTMLAnchorElement>) {
    if (reduceMotion) return;
    const rect = event.currentTarget.getBoundingClientRect();
    x.set((event.clientX - rect.left - rect.width / 2) * 0.25);
    y.set((event.clientY - rect.top - rect.height / 2) * 0.25);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.96 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}

export function HeroEntrance({
  eyebrow,
  headline,
  subheadline,
  ctaLabel,
  ctaHref,
  phoneLabel,
  phoneHref,
  topSlot,
}: {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
  ctaHref: string;
  phoneLabel?: string;
  phoneHref?: string;
  topSlot?: ReactNode;
}) {
  const reduceMotion = useReducedMotion();
  const initial = reduceMotion ? false : "hidden";
  const [words] = useState(() => headline.split(" "));

  return (
    <div className="relative flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
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
        <span className="flex flex-wrap justify-center gap-x-[0.28em] lg:justify-start">
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

      <motion.div
        custom={0.85}
        variants={fadeUp}
        initial={initial}
        animate="visible"
        className="mt-7 flex flex-col items-center justify-center gap-4 sm:flex-row lg:justify-start"
      >
        <MagneticLink
          href={ctaHref}
          external
          className="rounded-full bg-primary-500 px-8 py-4 text-base font-semibold text-ink-900 transition-colors hover:bg-primary-600"
        >
          {ctaLabel}
        </MagneticLink>
        {phoneHref ? (
          <MagneticLink
            href={phoneHref}
            className="rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
          >
            {phoneLabel}
          </MagneticLink>
        ) : null}
      </motion.div>
    </div>
  );
}

