// components
import { Logo } from "~/components/layout/logo";

export function AnimatedLogo() {
  return (
    <div className="relative w-fit h-fit isolate">
      <div className="border-2 relative z-10 border-[#0E0C14] w-[76px] h-[29px] flex items-center justify-center rounded-[6px] bg-white text-[#0E0C14] transition-all duration-300 ease-in-out group-hover:-translate-x-[3px] group-hover:-translate-y-[3px] group-active:-translate-x-[1.5px] group-active:-translate-y-[1.5px]">
        <Logo />
      </div>
      <div className="absolute inset-0 rounded-[6px] bg-white" />
    </div>
  );
}
