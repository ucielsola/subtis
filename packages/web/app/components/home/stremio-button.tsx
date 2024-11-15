import type { SVGProps } from "react";

// ui
import { Button } from "~/components/ui/button";

function StremioWhiteLogo({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" {...props}>
      <title>Stremio</title>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="m12.338.338 10.37 10.37c.45.45.45 1.18 0 1.63l-10.37 10.37c-.45.45-1.18.45-1.63 0L.337 12.337c-.45-.45-.45-1.18 0-1.63L10.708.337c.45-.45 1.18-.45 1.63 0Zm3.205 11.03a.192.192 0 0 1 0 .31l-5.502 4.046a.192.192 0 0 1-.306-.155V7.476a.192.192 0 0 1 .306-.155l5.502 4.047Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StremioColouredLogo({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <title>Stremio</title>
      <path
        fill="url(#stremio-gradient)"
        d="M23.184 11.185 12.814.815c-.45-.45-1.18-.45-1.63 0L.814 11.185c-.45.45-.45 1.18 0 1.63l10.37 10.37c.45.45 1.18.45 1.63 0l10.37-10.37c.45-.45.45-1.18 0-1.63Z"
      />
      <path
        fill="#fff"
        d="M16.02 11.845a.193.193 0 0 1 .058.242.193.193 0 0 1-.058.068L10.518 16.2a.191.191 0 0 1-.277-.054.192.192 0 0 1-.029-.1V7.953a.192.192 0 0 1 .306-.155l5.502 4.047Z"
      />
      <defs>
        <linearGradient id="stremio-gradient" x1={11.999} x2={11.999} y1={24} y2={7.104} gradientUnits="userSpaceOnUse">
          <stop stopColor="#1155D9" />
          <stop offset={1} stopColor="#7B5BF5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function StremioButton() {
  return (
    <Button className="bg-slate-950 group border-[#1155D9] border relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#1155D9] to-[#7B5BF5] transition-transform duration-300 -translate-y-full group-hover:translate-y-0" />
      <div className="relative flex items-center gap-2">
        <div className="relative size-6">
          <StremioColouredLogo
            size={24}
            className="!size-auto absolute transition-opacity duration-300 group-hover:opacity-0"
          />
          <StremioWhiteLogo
            size={24}
            className="!size-auto absolute transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          />
        </div>
        Stremio
      </div>
    </Button>
  );
}
