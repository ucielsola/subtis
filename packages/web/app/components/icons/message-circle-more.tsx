import type { AnimationControls, Variants } from "framer-motion";
import { motion } from "framer-motion";

const dotVariants: Variants = {
  normal: {
    opacity: 1,
  },
  animate: (custom: number) => ({
    opacity: [1, 0, 0, 1, 1, 0, 0, 1],
    transition: {
      opacity: {
        times: [
          0,
          0.1,
          0.1 + custom * 0.1,
          0.1 + custom * 0.1 + 0.1,
          0.5,
          0.6,
          0.6 + custom * 0.1,
          0.6 + custom * 0.1 + 0.1,
        ],
        duration: 1.5,
      },
    },
  }),
};

export function MessageCircleMoreIcon({ size, controls }: { size: number; controls: AnimationControls }) {
  return (
    <div className="cursor-pointer select-none inline-flex items-center justify-center overflow-hidden">
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
        <title>Mensajes</title>
        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
        <motion.path d="M8 12h.01" variants={dotVariants} animate={controls} custom={0} />
        <motion.path d="M12 12h.01" variants={dotVariants} animate={controls} custom={1} />
        <motion.path d="M16 12h.01" variants={dotVariants} animate={controls} custom={2} />
      </svg>
    </div>
  );
}
