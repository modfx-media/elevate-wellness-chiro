"use client";

import { useEffect, useRef } from "react";
import { animate, motion, useReducedMotion } from "motion/react";

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as const;

function Star({ index }: { index: number }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className="h-9 w-9 text-primary-300 drop-shadow-[0_0_10px_rgba(125,211,252,0.35)] sm:h-11 sm:w-11"
      initial={reduceMotion ? false : { opacity: 0, scale: 0.3, rotate: -30 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.15 + index * 0.1 }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </motion.svg>
  );
}

function ReviewCount({ target, label }: { target: number; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduceMotion) {
      el.textContent = String(target);
      return;
    }
    const controls = animate(0, target, {
      duration: 1.6,
      delay: 0.6,
      ease: EASE_OUT_EXPO,
      onUpdate: (latest) => {
        el.textContent = String(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [target, reduceMotion]);

  return (
    <p className="mt-4 text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
      <span ref={ref}>{target}</span> {label}
    </p>
  );
}

export function ReviewsBand({
  eyebrow,
  heading,
  ratingValue,
  starCount,
  reviewCount,
  reviewCountLabel,
  body,
  googleLabel,
  googleHref,
  bookLabel,
  bookHref,
}: {
  eyebrow: string;
  heading: string;
  ratingValue: string;
  starCount: number;
  reviewCount: number;
  reviewCountLabel: string;
  body: string;
  googleLabel: string;
  googleHref: string;
  bookLabel: string;
  bookHref: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center">
      <div className="flex items-center justify-center gap-3">
        <span aria-hidden className="h-px w-10 bg-primary-500/60" />
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary-300">
          {eyebrow}
        </span>
        <span aria-hidden className="h-px w-10 bg-primary-500/60" />
      </div>

      <h2 className="mt-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
        {heading}
      </h2>

      <div className="mt-8 flex items-center justify-center gap-4">
        <span className="font-display text-5xl font-bold text-white sm:text-6xl">{ratingValue}</span>
        <div className="flex gap-1" role="img" aria-label={`${ratingValue} out of 5 stars`}>
          {Array.from({ length: starCount }).map((_, i) => (
            <Star key={i} index={i} />
          ))}
        </div>
      </div>

      <ReviewCount target={reviewCount} label={reviewCountLabel.replace(/^\d+\s*/, "")} />

      <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70">{body}</p>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <motion.a
          href={googleHref}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="rounded-full bg-white px-8 py-4 text-base font-semibold text-navy-900 transition-colors hover:bg-primary-100"
        >
          {googleLabel}
        </motion.a>
        <motion.a
          href={bookHref}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 24 }}
          className="rounded-full border border-white/25 px-8 py-4 text-base font-semibold text-white transition-colors hover:bg-white/10"
        >
          {bookLabel}
        </motion.a>
      </div>
    </div>
  );
}
