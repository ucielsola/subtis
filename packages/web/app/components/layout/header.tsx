import { Link } from "@remix-run/react";

// components
import { AnimatedLogo } from "~/components/shared/animated-logo";

export function Header() {
  return (
    <header className="absolute z-40 top-6 left-0 right-0 container mx-auto">
      <nav className="flex items-center justify-between w-full">
        <Link to="/" className="cursor-pointer group">
          <AnimatedLogo />
        </Link>
        <Link
          to="/search"
          className="text-sm text-zinc-50 font-medium px-4 py-1.5 bg-zinc-950/40 backdrop-blur-md rounded-full hover:bg-zinc-950/60 transition-all ease-in-out duration-300"
        >
          Buscar por película
        </Link>
      </nav>
    </header>
  );
}
