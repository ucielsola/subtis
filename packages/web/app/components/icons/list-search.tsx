import type { SVGProps } from "react";

type Props = {
  size: number;
} & SVGProps<SVGSVGElement>;

export function ListSearch({ size = 32, ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" {...props}>
      <title>Español latino</title>
      <path d="M32 64a8 8 0 0 1 8-8h176a8 8 0 0 1 0 16H40a8 8 0 0 1-8-8Zm8 72h72a8 8 0 0 0 0-16H40a8 8 0 0 0 0 16Zm88 48H40a8 8 0 0 0 0 16h88a8 8 0 0 0 0-16Zm109.66 13.66a8 8 0 0 1-11.32 0L206 177.36A40 40 0 1 1 217.36 166l20.3 20.3a8 8 0 0 1 0 11.36ZM184 168a24 24 0 1 0-24-24 24 24 0 0 0 24 24Z" />
    </svg>
  );
}
