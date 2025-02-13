import { Link } from "@remix-run/react";

// components
import { AnimatedLogo } from "~/components/shared/animated-logo";

export function Header() {
  return (
    <header className="absolute z-40 top-6 left-0 right-0 container mx-auto px-4">
      <nav className="flex items-center justify-between w-full">
        <Link to="/" className="cursor-pointer group">
          <AnimatedLogo />
        </Link>
        <Link
          to="/search"
          className="text-zinc-50 text-sm font-medium px-4 py-1.5 bg-zinc-50/10 backdrop-blur-md rounded-full hover:bg-zinc-50/20 transition-all ease-in-out duration-300"
        >
          Buscar por título
        </Link>
      </nav>
    </header>
  );
}
