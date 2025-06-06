import { type Variants, motion, useAnimation } from "motion/react";
import { useEffect } from "react";

// lib
import { cn } from "~/lib/utils";

const iconVariants: Variants = {
  normal: { scale: 1, rotate: 0 },
  animate: {
    scale: [1, 1.1, 1.1, 1.1, 1],
    rotate: [0, -3, 3, -2, 2, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.2, 0.4, 0.6, 1],
      ease: "easeInOut",
    },
  },
};
export function BadgeAlertIcon({ size, className }: { size: number; className?: string }) {
  // motion hooks
  const controls = useAnimation();

  // effects
  useEffect(() => {
    setTimeout(() => {
      controls.start("animate");
    }, 400);
  }, [controls]);

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <motion.svg
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={controls}
        variants={iconVariants}
      >
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z" />
        <line x1="12" x2="12" y1="8" y2="12" />
        <line x1="12" x2="12.01" y1="16" y2="16" />
      </motion.svg>
    </div>
  );
}
