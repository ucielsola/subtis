import { useAnimation } from "motion/react";
import { Link } from "react-router";

// components
import { SearchIcon } from "~/components/icons/search";
import { AnimatedLogo } from "~/components/shared/animated-logo";

// ui
import { Button } from "~/components/ui/button";

export function Header() {
  // motion hooks
  const controls = useAnimation();

  return (
    <header className="fixed z-40 top-0 left-0 right-0 mx-auto p-4 bg-zinc-950/90 backdrop-blur-md w-full h-16">
      <nav className="flex items-center justify-between w-full relative container mx-auto px-4">
        <Link to="/" prefetch="viewport" className="cursor-pointer group">
          <AnimatedLogo />
        </Link>
        <Button asChild variant="secondary" size="sm">
          <Link
            to="/search"
            prefetch="viewport"
            onMouseEnter={() => controls.start("animate")}
            onMouseLeave={() => controls.start("normal")}
            className={
              "transition-all ease-in-out rounded-sm bg-zinc-950 text-zinc-50 hover:bg-zinc-900 border border-zinc-800"
            }
          >
            <SearchIcon controls={controls} className="size-5" />
            <span>Buscar película</span>
          </Link>
        </Button>
        <div className="border-b border-b-zinc-900/20 absolute left-0 right-0 -bottom-[11.5px] w-3/4 mx-auto h-0.5 bg-gradient-to-r from-transparent via-zinc-200/20 to-transparent" />
      </nav>
    </header>
  );
}
