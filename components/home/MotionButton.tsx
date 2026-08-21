"use client";

import { motion } from "motion/react";

export function MotionButton({
  href,
  className,
  children,
  external,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
  external?: boolean;
}) {
  return (
    <motion.a
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className={className}
      whileHover={{ scale: 1.04 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
    >
      {children}
    </motion.a>
  );
}
