import { useLocation, useNavigate } from "@remix-run/react";
import { useAnimation } from "motion/react";

// lib
import { cn } from "~/lib/utils";

// icons
import { SearchIcon } from "~/components/icons/search";

// ui
import { Button } from "~/components/ui/button";

export function SearchButton() {
  // motion hooks
  const controls = useAnimation();

  // navigation hooks
  const navigate = useNavigate();
  const { pathname } = useLocation();

  // handlers
  function handleNavigate(): void {
    navigate("/search");
  }

  // constants
  const isNotHome = pathname !== "/";

  return (
    <Button
      variant="ghost"
      className={cn(
        "backdrop-blur-[8px] hover:bg-zinc-950/80 bg-zinc-950/30 transition-all ease-in-out rounded-sm",
        isNotHome && "bg-zinc-900/80 hover:bg-zinc-900",
      )}
      onClick={handleNavigate}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <SearchIcon controls={controls} />
      <span className="pr-1">Buscar por película</span>
    </Button>
  );
}
