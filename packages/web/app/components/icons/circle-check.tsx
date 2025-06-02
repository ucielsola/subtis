import { type AnimationControls, type Variants, motion } from "motion/react";

const pathVariants: Variants = {
  normal: {
    opacity: 1,
    pathLength: 1,
    transition: {
      duration: 0.3,
      opacity: { duration: 0.1 },
    },
  },
  animate: {
    opacity: [0, 1],
    pathLength: [0, 1],
    transition: {
      duration: 0.4,
      opacity: { duration: 0.1 },
    },
  },
};

export function CircleCheckIcon({ size, controls }: { size: number; controls: AnimationControls }) {
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
    >
      <title>Círculo de verificación</title>
      <circle cx="12" cy="12" r="10" />
      <motion.path variants={pathVariants} initial="normal" animate={controls} d="m9 12 2 2 4-4" />
    </svg>
  );
}
