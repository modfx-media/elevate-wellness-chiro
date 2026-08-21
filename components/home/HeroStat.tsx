"use client";

import { useEffect, useRef } from "react";
import { animate, useReducedMotion } from "motion/react";

// Glass stat pill with a count-up animation for numeric values.
export function HeroStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = /^([\d.]+)(.*)$/.exec(value);
    if (!match || reduceMotion) {
      el.textContent = value;
      return;
    }

    const [, numeric, suffix] = match;
    const target = parseFloat(numeric);
    const decimals = numeric.includes(".") ? numeric.split(".")[1].length : 0;

    const controls = animate(0, target, {
      duration: 1.4,
      delay: 1,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        el.textContent = `${latest.toFixed(decimals)}${suffix}`;
      },
    });

    return () => controls.stop();
  }, [value, reduceMotion]);

  return (
    <div className="flex items-center gap-3">
      <span ref={ref} className="font-display text-2xl font-bold text-primary-300">
        {value}
      </span>
      <span className="max-w-[7rem] text-left text-[0.65rem] font-semibold uppercase leading-tight tracking-wide text-white/60">
        {label}
      </span>
    </div>
  );
}
