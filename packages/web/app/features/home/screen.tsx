import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect } from "react";

// ui
import { cn } from "~/lib/utils";

// types
type Props = {
  isGlowing?: boolean;
  className?: string;
};

export function Screen({ isGlowing = false, className }: Props) {
  // Motion values for mask animation (0 to 100 for percentage)
  const arcProgress = useMotionValue(0);
  const gradientProgress = useMotionValue(0);
  const glowOpacity = useMotionValue(0);

  // Transform progress to mask strings with animated positions
  const arcMask = useTransform(
    arcProgress,
    (value) => `linear-gradient(to bottom, black 0%, black ${value}%, transparent ${value}%, transparent 100%)`,
  );

  const gradientMask = useTransform(
    gradientProgress,
    (value) => `linear-gradient(to bottom, black 0%, black ${value}%, transparent ${value}%, transparent 100%)`,
  );

  useEffect(() => {
    if (isGlowing) {
      // When turning on: animate arc first, then gradient
      animate(arcProgress, 100, {
        duration: 0.3,
        ease: "easeIn",
        onComplete: () => {
          // Arc finished, now animate gradient and glow
          animate(gradientProgress, 100, {
            duration: 0.3,
            ease: "easeOut",
          });
          animate(glowOpacity, 1, {
            duration: 0.3,
            ease: "easeOut",
          });
        },
      });
    } else {
      // When turning off: gradient disappears first, then arc
      animate(glowOpacity, 0, {
        duration: 0.3,
        ease: "easeIn",
      });
      animate(gradientProgress, 0, {
        duration: 0.3,
        ease: "easeIn",
        onComplete: () => {
          // Gradient finished disappearing, now hide arc
          animate(arcProgress, 0, {
            duration: 0.3,
            ease: "easeOut",
          });
        },
      });
    }
  }, [isGlowing, arcProgress, gradientProgress, glowOpacity]);

  return (
    <div className={cn("relative w-[561px] h-[136px] isolate flex flex-col", className)}>
      {/* Arc with border */}
      <div className="w-full h-[32px] relative flex items-center justify-center">
        <div className="w-[588px] h-[32px] absolute flex items-center justify-center">
          <svg viewBox="0 0 587 58" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13 45C233.15 2.56428 347.9 2.10301 574 45"
              stroke="#F5F5F5"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <motion.g filter="url(#filter0_f_4914_2312)" style={{ opacity: glowOpacity }}>
              <path
                d="M13 45C233.15 2.56428 347.9 2.10301 574 45"
                stroke="#F5F5F5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </motion.g>
            <motion.g filter="url(#filter1_f_4914_2312)" style={{ opacity: glowOpacity }}>
              <path
                d="M13 45C233.15 2.56428 347.9 2.10301 574 45"
                stroke="#F5F5F5"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </motion.g>
            <defs>
              <filter
                id="filter0_f_4914_2312"
                x="3.99982"
                y="4"
                width="579"
                height="50.0002"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="4" result="effect1_foregroundBlur_4914_2312" />
              </filter>
              <filter
                id="filter1_f_4914_2312"
                x="-0.000183105"
                y="0"
                width="587"
                height="58.0002"
                filterUnits="userSpaceOnUse"
                colorInterpolationFilters="sRGB"
              >
                <feFlood floodOpacity="0" result="BackgroundImageFix" />
                <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
                <feGaussianBlur stdDeviation="6" result="effect1_foregroundBlur_4914_2312" />
              </filter>
            </defs>
          </svg>
        </div>
        <motion.div className="overflow-hidden absolute inset-0" style={{ maskImage: arcMask }}>
          <motion.div className="absolute left-1/2 -translate-x-1/2 top-[2px] w-[1100px] h-[400px] rounded-[50%] bg-white/16" />
        </motion.div>
      </div>

      {/* Glow gradient background */}
      <motion.div
        className="w-full flex-1 opacity-[0.16] bg-gradient-to-b from-white to-transparent -z-10"
        style={{
          maskImage: gradientMask,
          clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)",
        }}
      />
    </div>
  );
}
