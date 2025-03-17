import { Link } from "@remix-run/react";
import { useAnimation } from "motion/react";

// components
import { SearchIcon } from "~/components/icons/search";
import { AnimatedLogo } from "~/components/shared/animated-logo";

export function Header() {
  // motion hooks
  const controls = useAnimation();

  return (
    <header className="absolute z-40 top-6 left-0 right-0 container mx-auto px-4">
      <nav className="flex items-center justify-between w-full">
        <Link to="/" className="cursor-pointer group">
          <AnimatedLogo />
        </Link>
        <Link
          to="/search"
          className="text-zinc-50 text-sm font-semibold p-2 bg-zinc-50/20 backdrop-blur rounded-full hover:bg-zinc-50/25 transition-all ease-in-out duration-300 mb-[2px]"
          onMouseEnter={() => controls.start("animate")}
          onMouseLeave={() => controls.start("normal")}
        >
          <SearchIcon controls={controls} className="size-5" />
        </Link>
      </nav>
    </header>
  );
}
