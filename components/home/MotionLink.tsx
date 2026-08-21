"use client";

import Link from "next/link";
import { motion } from "motion/react";
import type { CSSProperties } from "react";

const MotionNextLink = motion.create(Link);

export function MotionLink({
  href,
  className,
  style,
  children,
}: {
  href: string;
  className?: string;
  style?: CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <MotionNextLink
      href={href}
      className={className}
      style={style}
      whileHover={{ y: -8 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 22 }}
    >
      {children}
    </MotionNextLink>
  );
}
