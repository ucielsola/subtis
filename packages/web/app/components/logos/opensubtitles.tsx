import type { SVGProps } from "react";

export function OpenSubtitlesLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={40} height={40} fill="none" {...props}>
      <title>OpenSubtitles</title>
      <circle cx={20} cy={20} r={20} fill="#fff" />
      <path
        fill="#000"
        fillRule="evenodd"
        d="M12.5 9.026a8.253 8.253 0 0 0-8.252 8.253v5.441a8.253 8.253 0 0 0 8.253 8.253h14.998a8.253 8.253 0 0 0 8.253-8.253v-5.44A8.253 8.253 0 0 0 27.5 9.025H12.501ZM8.408 23.894a.531.531 0 0 0-.53.53v.355c0 .293.237.53.53.53h23.186a.531.531 0 0 0 .53-.53v-.354a.531.531 0 0 0-.53-.531H8.407Zm3.982 2.832a.531.531 0 0 0-.53.53v.354c0 .294.237.531.53.531h15.222a.531.531 0 0 0 .53-.53v-.355a.531.531 0 0 0-.53-.53H12.389Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
