"use client";

import type { Variants } from "motion/react";
import { motion, useAnimation } from "motion/react";

const pathVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
  },
};

export function XIcon({ size = 24, className, onClick }: { size?: number; className?: string; onClick?: () => void }) {
  const controls = useAnimation();

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
      className={className}
      onClick={onClick}
    >
      <title>Limpiar</title>
      <motion.path variants={pathVariants} animate={controls} d="M18 6 6 18" />
      <motion.path transition={{ delay: 0.2 }} variants={pathVariants} animate={controls} d="m6 6 12 12" />
    </svg>
  );
}
