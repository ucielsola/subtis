import type { SVGProps } from "react";

export const Macbook = ({ children, ...props }: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={1008} height={577} fill="none" {...props}>
    <title>Macbook</title>
    <g filter="url(#a)">
      <ellipse cx={504.5} cy={586} fill="#000" rx={452.5} ry={5} />
    </g>
    <path
      fill="#232323"
      stroke="#595959"
      strokeWidth={2}
      d="M126 1h760c14.912 0 27 12.088 27 27v522a3 3 0 0 1-3 3H102a3 3 0 0 1-3-3V28c0-14.912 12.088-27 27-27Z"
    />
    <path fill="#000" d="M103 27c0-12.15 9.85-22 22-22h762c12.15 0 22 9.85 22 22v506H103V27Z" />
    <g clipPath="url(#screen-clip)">
      <foreignObject width={826} height={536} x={91} y={3} className="overflow-hidden">
        {children}
      </foreignObject>
    </g>
    <path fill="url(#d)" d="M0 552a2 2 0 0 1 2-2h1004c1.1 0 2 .895 2 2v16H0v-16Z" />
    <path
      fill="#6F6F6F"
      d="M0 568h1008l-20.354 4.105a400.021 400.021 0 0 1-79.08 7.895H97.909a400.007 400.007 0 0 1-86.772-9.525L0 568Z"
    />
    <path
      fill="url(#e)"
      d="M0 568h1008l-20.354 4.105a400.021 400.021 0 0 1-79.08 7.895H97.909a400.007 400.007 0 0 1-86.772-9.525L0 568Z"
    />
    <path
      fill="#9F9F9F"
      fillRule="evenodd"
      d="M421.033 550c.514 7.818 7.019 14 14.967 14h137c7.948 0 14.453-6.182 14.967-14H421.033Z"
      clipRule="evenodd"
    />
    <path
      fill="url(#f)"
      fillRule="evenodd"
      d="M421.033 550c.514 7.818 7.019 14 14.967 14h137c7.948 0 14.453-6.182 14.967-14H421.033Z"
      clipRule="evenodd"
    />
    <defs>
      <linearGradient id="d" x1={0} x2={1008} y1={559} y2={559} gradientUnits="userSpaceOnUse">
        <stop stopColor="#0D1012" />
        <stop offset={0.03} stopColor="#CAD4DB" />
        <stop offset={0.063} stopColor="#272727" />
        <stop offset={0.134} stopColor="#AAA" />
        <stop offset={0.866} stopColor="#AAA" />
        <stop offset={0.942} stopColor="#272727" />
        <stop offset={0.971} stopColor="#D3D3D3" />
        <stop offset={0.996} stopColor="#101010" />
      </linearGradient>
      <linearGradient id="e" x1={504} x2={504} y1={568} y2={580} gradientUnits="userSpaceOnUse">
        <stop stopColor="#7E7E7E" />
        <stop offset={1} stopColor="#0C0C0C" />
      </linearGradient>
      <linearGradient id="f" x1={437.5} x2={574.5} y1={558.5} y2={558.5} gradientUnits="userSpaceOnUse">
        <stop stopColor="#3C3C3C" />
        <stop offset={0.318} stopColor="#3C3C3C" stopOpacity={0} />
        <stop offset={0.661} stopColor="#3C3C3C" stopOpacity={0} />
        <stop offset={1} stopColor="#444" />
      </linearGradient>
      <filter
        id="a"
        width={993}
        height={98}
        x={8}
        y={537}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feBlend in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
        <feGaussianBlur result="effect1_foregroundBlur_10_1655" stdDeviation={22} />
      </filter>
      <filter
        id="c"
        width={826}
        height={536}
        x={91}
        y={3}
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
        <feOffset dy={2.4} />
        <feGaussianBlur stdDeviation={7.8} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_10_1655" />
        <feColorMatrix in="SourceAlpha" result="hardAlpha" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
        <feOffset dy={1.2} />
        <feGaussianBlur stdDeviation={1.2} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.2 0" />
        <feBlend in2="effect1_dropShadow_10_1655" result="effect2_dropShadow_10_1655" />
        <feBlend in="SourceGraphic" in2="effect2_dropShadow_10_1655" result="shape" />
      </filter>
      <clipPath id="b" transform="translate(-91 -3)">
        <path d="M119 31h770v480H119z" />
      </clipPath>
      <clipPath id="screen-clip">
        <rect x="119" y="31" width="770" height="480" rx="4" />
      </clipPath>
    </defs>
  </svg>
);
