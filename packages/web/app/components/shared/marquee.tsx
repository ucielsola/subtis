"use client";

import { useIntersectionObserver } from "~/hooks/use-intersection-observer";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useVelocity,
} from "motion/react";
import { cn } from "~/lib/utils";
import { ReactNode, useRef } from "react";

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  repeat?: number;
  baseVelocity?: number;
  inverted?: boolean;
  className?: string;
}

function Marquee({
  children,
  repeat = 2,
  baseVelocity = 1,
  inverted = false,
  className,
  ...props
}: MarqueeProps) {
  const baseX = useMotionValue(0);
  const [setIntersectionRef, intersection] = useIntersectionObserver({
    threshold: 0,
  });
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });

  const directionFactor = inverted ? -1 : 1;

  useAnimationFrame((_: number, delta: number) => {
    if (!intersection?.isIntersecting) return;

    const velocityFactor = 1 + Math.abs(smoothVelocity.get() * 0.2);
    const moveBy = baseVelocity * velocityFactor * directionFactor * (delta / 1000);
    let newX = baseX.get() + moveBy;

    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const singleWidth = containerWidth / repeat; // Ancho de una repetición

      // Movimiento circular: cuando sale una repetición, volvemos al inicio
      if (directionFactor < 0) {
        // Moviendo hacia la izquierda
        if (newX < -singleWidth) {
          newX = 0;
        }
      } else {
        // Moviendo hacia la derecha
        if (newX > 0) {
          newX = -singleWidth;
        }
      }
    }

    baseX.set(newX);
  });

  return (
    <div
      ref={setIntersectionRef}
      className={cn("flex overflow-hidden relative", className)}
      {...props}
    >
      <motion.div ref={containerRef} className="flex whitespace-nowrap" style={{ x: baseX }}>
        {new Array(repeat).fill(null).map((_, i) => (
          <div
            key={i}
            className="flex shrink-0"
            aria-hidden={i !== 0}
            data-nosnippet={i !== 0 ? "" : undefined}
          >
            {children}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export { Marquee };
