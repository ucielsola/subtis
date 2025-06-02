import { type AnimationControls, type Variants, motion } from "motion/react";

// lib
import { cn } from "~/lib/utils";

// types
type Props = {
  controls: AnimationControls;
  className: string;
  size: number;
};

const pathVariants: Variants = {
  normal: { d: "m5 12 7-7 7 7", translateY: 0 },
  animate: {
    d: "m5 12 7-7 7 7",
    translateY: [0, 3, 0],
    transition: {
      duration: 0.4,
    },
  },
};

const secondPathVariants: Variants = {
  normal: { d: "M12 19V5" },
  animate: {
    d: ["M12 19V5", "M12 19V10", "M12 19V5"],
    transition: {
      duration: 0.4,
    },
  },
};

export function Arrow({ controls, className, size = 28 }: Props) {
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
      className={cn("rotate-45", className)}
    >
      <title>Enlace externo</title>
      <motion.path d="m5 12 7-7 7 7" variants={pathVariants} animate={controls} />
      <motion.path d="M12 19V5" variants={secondPathVariants} animate={controls} />
    </svg>
  );
}
