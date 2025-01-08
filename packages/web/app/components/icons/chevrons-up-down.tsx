import { type AnimationControls, type Transition, motion } from "motion/react";

// constants
const defaultTransition: Transition = {
  type: "spring",
  stiffness: 250,
  damping: 25,
};

export function ChevronsUpDownIcon({
  controls,
  size,
  className,
}: { controls: AnimationControls; size: number; className?: string }) {
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
      <title>Expandir</title>
      <motion.path
        variants={{
          normal: { translateY: "0%" },
          animate: { translateY: "2px" },
        }}
        transition={defaultTransition}
        animate={controls}
        initial="normal"
        d="m7 15 5 5 5-5"
      />
      <motion.path
        variants={{
          normal: { translateY: "0%" },
          animate: { translateY: "-2px" },
        }}
        transition={defaultTransition}
        animate={controls}
        initial="normal"
        d="m7 9 5-5 5 5"
      />
    </svg>
  );
}
