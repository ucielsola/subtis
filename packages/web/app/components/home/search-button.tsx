import { Link } from "@remix-run/react";
import { useAnimation } from "framer-motion";

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
        className="backdrop-blur-sm hover:bg-white transition-colors duration-300"
        onMouseEnter={() => controls.start("animate")}
        onMouseLeave={() => controls.start("normal")}
      >
        <SearchIcon controls={controls} />
        Buscar por película
      </Button>
    </Link>
  );
}
