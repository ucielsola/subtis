import { useAnimation } from "motion/react";

// ui
import { Badge } from "~/components/ui/badge";

// icons
import { RocketIcon } from "~/components/icons/rocket";

export function BadgeTvShows() {
  const controls = useAnimation();

  return (
    <Badge
      variant="outline"
      className="w-fit bg-zinc-900/80 border-zinc-700"
      onMouseEnter={() => controls.start("animate")}
      onMouseLeave={() => controls.start("normal")}
    >
      <RocketIcon controls={controls} size={14} />
      <span className="ml-[4px] text-xs">Próximamente soporte para Series!</span>
    </Badge>
  );
}
