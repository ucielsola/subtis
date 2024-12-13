import { Link } from "@remix-run/react";
import { useAnimation } from "motion/react";

// icons
import { SearchIcon } from "~/components/icons/search";

// ui
import { Button } from "~/components/ui/button";

export function SearchButton() {
  const controls = useAnimation();

  return (
    <Link to="/search">
      <Button
        variant="ghost"
        className="backdrop-blur-[8px] hover:bg-zinc-950 border border-transparent hover:border-zinc-700 transition-all ease-in-out rounded-md"
        onMouseEnter={() => controls.start("animate")}
        onMouseLeave={() => controls.start("normal")}
      >
        <SearchIcon controls={controls} />
        <span className="pr-1">Buscar por película</span>
      </Button>
    </Link>
  );
}
