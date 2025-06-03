import type { SVGProps } from "react";

type Props = {
  size: number;
} & SVGProps<SVGSVGElement>;

export function Robot({ size = 32, ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" {...props}>
      <title>Generación por AI</title>
      <path d="M200 48h-64V16a8 8 0 0 0-16 0v32H56a32 32 0 0 0-32 32v112a32 32 0 0 0 32 32h144a32 32 0 0 0 32-32V80a32 32 0 0 0-32-32Zm16 144a16 16 0 0 1-16 16H56a16 16 0 0 1-16-16V80a16 16 0 0 1 16-16h144a16 16 0 0 1 16 16Zm-52-56H92a28 28 0 0 0 0 56h72a28 28 0 0 0 0-56Zm-24 16v24h-24v-24Zm-60 12a12 12 0 0 1 12-12h8v24h-8a12 12 0 0 1-12-12Zm84 12h-8v-24h8a12 12 0 0 1 0 24Zm-92-68a12 12 0 1 1 12 12 12 12 0 0 1-12-12Zm88 0a12 12 0 1 1 12 12 12 12 0 0 1-12-12Z" />
    </svg>
  );
}
