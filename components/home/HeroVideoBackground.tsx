"use client";

import { useEffect, useRef } from "react";
import { useReducedMotion } from "motion/react";

// Full-bleed muted chiropractic clip with a navy duotone treatment so the
// hero copy stays legible: brightness filter + diagonal scrim + multiply tint.
export function HeroVideoBackground() {
  const reduceMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  // Control playback via effect so the SSR/client markup stays identical
  // (setting autoPlay from reduceMotion would cause a hydration mismatch).
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (reduceMotion) {
      video.pause();
    } else {
      void video.play().catch(() => {});
    }
  }, [reduceMotion]);

  return (
    <div aria-hidden className="absolute inset-0 z-0 overflow-hidden bg-navy-900">
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ filter: "brightness(0.85) saturate(1.1)" }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/hero-chiropractic-poster.jpg"
      >
        <source src="/videos/hero-chiropractic.mp4" type="video/mp4" />
      </video>

      {/* Light navy multiply tint for on-brand cohesion — kept subtle so the
          video itself stays visible instead of reading as a solid color. */}
      <div className="absolute inset-0 bg-navy-900/30 mix-blend-multiply" />

      {/* Gentle bottom-up scrim only, for stat-strip legibility — no longer a
          heavy diagonal wash so the video reads clearly across the frame.
          Text legibility is instead handled by a glass panel in HeroEntrance. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(18,59,78,0.25) 0%, rgba(18,59,78,0.15) 35%, rgba(18,59,78,0.45) 100%)",
        }}
      />

      {/* Seamless fade into the section below */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy-900" />
    </div>
  );
}
