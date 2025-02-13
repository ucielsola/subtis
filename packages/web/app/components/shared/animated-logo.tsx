// components
import { Logo } from "~/components/layout/logo";

export function AnimatedLogo() {
  return (
    <div className="relative w-fit h-fit isolate">
      <div className="border-2 relative z-10 border-[#0E0C14] w-[91.2px] h-[34.8px] flex items-center justify-center rounded-[6px] bg-zinc-50 text-[#0E0C14] transition-all duration-300 ease-in-out group-active:-translate-x-[1.5px] group-active:-translate-y-[1.5px] group-hover:-translate-x-[3px] group-hover:-translate-y-[3px]">
        <Logo size={71.2} />
      </div>
      <div className="absolute inset-0 rounded-[6px] bg-zinc-50" />
    </div>
  );
}
