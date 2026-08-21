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
        style={{ filter: "brightness(0.55) saturate(1.05)" }}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/videos/hero-chiropractic-poster.jpg"
      >
        <source src="/videos/hero-chiropractic.mp4" type="video/mp4" />
      </video>

      {/* Navy multiply tint — caps peak luminance of any bright frame */}
      <div className="absolute inset-0 bg-navy-900/70 mix-blend-multiply" />

      {/* Diagonal scrim — darkest over the left text column */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(105deg, rgba(24,62,83,0.95) 0%, rgba(24,62,83,0.86) 42%, rgba(24,62,83,0.55) 72%, rgba(24,62,83,0.35) 100%)",
        }}
      />

      {/* Seamless fade into the section below */}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-navy-900" />
    </div>
  );
}
