import { Link } from "@remix-run/react";

// components
import { AnimatedLogo } from "~/components/shared/animated-logo";

// internals
import { SearchButton } from "./search-button";

export function Header() {
  return (
    <header className="absolute z-40 top-0 left-0 right-0 container mx-auto">
      <nav className="flex items-center justify-between py-4 px-4 w-full">
        <Link to="/" className="cursor-pointer group">
          <AnimatedLogo />
        </Link>
        <SearchButton />
      </nav>
    </header>
  );
}
