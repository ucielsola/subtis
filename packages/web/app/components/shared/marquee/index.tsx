"use client";

import { useIntersectionObserver } from "@studio-freight/hamo";
import { motion, useAnimationFrame, useMotionValue } from "motion/react";
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

  const directionFactor = inverted ? -1 : 1;
  const baseVelocityFactor = baseVelocity * directionFactor;

  useAnimationFrame((_: number, delta: number) => {
    if (!intersection?.isIntersecting) return;

    let moveBy = baseVelocityFactor * (delta / 1000);

    // Reset when out of view
    if (containerRef.current) {
      const containerWidth = containerRef.current.clientWidth;
      const baseDelta = baseX.get() + moveBy;

      if (baseDelta <= -containerWidth) {
        moveBy = containerWidth + baseDelta;
      } else if (baseDelta >= 0) {
        moveBy = baseDelta - containerWidth;
    }

    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div
      ref={setIntersectionRef}
      className={cn("flex overflow-hidden relative", className)}
      {...props}
    >
      <motion.div ref={containerRef} className="flex whitespace-nowrap gap-4" style={{ x: baseX }}>
        {new Array(repeat).fill(children).map((_, i) => (
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
