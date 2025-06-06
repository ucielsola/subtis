import { motion } from "framer-motion";

// ui
import { cn } from "~/lib/utils";

// types
type Props = {
  isGlowing?: boolean;
  className?: string;
};

export function Screen({ isGlowing = false, className }: Props) {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width={593}
      height={67}
      fill="none"
      className={cn("transition-all duration-300 ease-in-out", className)}
      animate={{
        filter: isGlowing ? "drop-shadow(0 0 15px rgba(245, 245, 245, 0.5))" : "none",
      }}
      transition={{ duration: 0.6, ease: "easeInOut" }}
    >
      <motion.path stroke="#F5F5F5" strokeWidth={2} d="M16 50.688c220.15-46 334.9-46.5 561 0" />
      <g filter="url(#a)">
        <motion.path stroke="#F5F5F5" strokeWidth={2} d="M16 50.688c220.15-46 334.9-46.5 561 0" />
      </g>
      <defs>
        <filter
          id="a"
          width={591.406}
          height={66.667}
          x={0.795}
          y={0}
          colorInterpolationFilters="sRGB"
          filterUnits="userSpaceOnUse"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur result="effect1_foregroundBlur_5_821" stdDeviation={7.5} />
        </filter>
      </defs>
    </motion.svg>
  );
}
