import { type AnimationControls, type Variants, motion } from "motion/react";

const pathVariants: Variants = {
  normal: {
    x: 0,
    rotate: 0,
  },
  animate: {
    x: [0, -1, 2, 0],
    rotate: [0, -10, 0, 0],
    transition: {
      duration: 0.5,
      times: [0, 0.2, 0.5, 1],
      stiffness: 260,
      damping: 20,
    },
  },
};

export function Play({ size, controls, isWrapped }: { size: number; controls: AnimationControls; isWrapped: boolean }) {
  if (isWrapped) {
    return (
      <div className="select-none p-2 flex items-center justify-center">
        {/* biome-ignore lint/a11y/noSvgWithoutTitle: is being used as a tooltip */}
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
        >
          <motion.polygon points="6 3 20 12 6 21 6 3" variants={pathVariants} animate={controls} />
        </motion.svg>
      </div>
    );
  }

  return (
    // biome-ignore lint/a11y/noSvgWithoutTitle: is being used as a tooltip
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
    >
      <motion.polygon points="6 3 20 12 6 21 6 3" variants={pathVariants} animate={controls} />
    </motion.svg>
  );
}
