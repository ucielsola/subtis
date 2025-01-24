import { useNavigate } from "@remix-run/react";
import { useAnimation } from "motion/react";

// icons
import { SearchIcon } from "~/components/icons/search";

// ui
import { Button } from "~/components/ui/button";

export function SearchButton() {
  // motion hooks
  const controls = useAnimation();

  // navigation hooks
  const navigate = useNavigate();

  // handlers
  function handleNavigate(): void {
    navigate("/search");
  }

  return (
    <Button
      variant="ghost"
      className="backdrop-blur-[8px] hover:bg-zinc-950/80 bg-zinc-950/30 transition-all ease-in-out rounded-sm"
      onClick={handleNavigate}
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <SearchIcon controls={controls} />
      <span className="pr-1">Buscar por película</span>
    </Button>
  );
}
