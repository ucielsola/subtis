import { type AnimationControls, type Variants, motion } from "motion/react";

// constants
const lineVariants: Variants = {
  normal: { opacity: 1 },
  hover: {
    opacity: [1, 0, 1],
    transition: {
      duration: 0.8,
      repeat: Number.POSITIVE_INFINITY,
      ease: "linear",
    },
  },
};

export function Terminal({
  controls,
  size,
  className,
}: { controls: AnimationControls; size: number; className: string }) {
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
      className={className}
    >
      <title>Terminal</title>
      <polyline points="4 17 10 11 4 5" />
      <motion.line x1="12" x2="20" y1="19" y2="19" variants={lineVariants} animate={controls} initial="normal" />
    </svg>
  );
}
