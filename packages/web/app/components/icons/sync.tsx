import type { SVGProps } from "react";

type Props = {
  size: number;
} & SVGProps<SVGSVGElement>;

export function SyncIcon({ size = 32, ...props }: Props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 256 256" {...props}>
      <path d="M224 48v48a8 8 0 0 1-8 8h-48a8 8 0 0 1 0-16h28.69l-14.63-14.63a79.56 79.56 0 0 0-56.13-23.43h-.45a79.52 79.52 0 0 0-55.89 22.77 8 8 0 0 1-11.18-11.44 96 96 0 0 1 135 .79L208 76.69V48a8 8 0 0 1 16 0Zm-37.59 135.29a80 80 0 0 1-112.47-.66L59.31 168H88a8 8 0 0 0 0-16H40a8 8 0 0 0-8 8v48a8 8 0 0 0 16 0v-28.69l14.63 14.63A95.43 95.43 0 0 0 130 222.06h.53a95.36 95.36 0 0 0 67.07-27.33 8 8 0 0 0-11.18-11.44Z" />
    </svg>
  );
}
