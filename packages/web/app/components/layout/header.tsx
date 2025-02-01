import { Link } from "@remix-run/react";

// components
import { AnimatedLogo } from "~/components/shared/animated-logo";

export function Header() {
  return (
    <header className="absolute z-40 top-4 left-0 right-0 container mx-auto">
      <nav className="flex items-center justify-between px-5 py-3.5 w-full bg-zinc-950/60 backdrop-blur-md rounded-full">
        <Link to="/" className="cursor-pointer group">
          <AnimatedLogo />
        </Link>
        <div className="flex items-center gap-2">
          <Link to="/search" className="text-sm text-zinc-50 font-medium hover:underline">
            Buscar por película
          </Link>
        </div>
      </nav>
    </header>
  );
}
