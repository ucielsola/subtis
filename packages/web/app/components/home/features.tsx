import { useAnimation } from "motion/react";

// icons
import { AudioLinesIcon } from "~/components/icons/audio-lines";
import { CircleCheckIcon } from "~/components/icons/circle-check";
import { LanguagesIcon } from "~/components/icons/languages";
import { SquareStackIcon } from "~/components/icons/square-stack";
import { TimerIcon } from "~/components/icons/timer";
import { TrendingUpIcon } from "~/components/icons/trending-up";

export function HomeFeatures() {
  const audiolinesControls = useAnimation();
  const timerControls = useAnimation();
  const trendingUpControls = useAnimation();
  const circleCheckControls = useAnimation();
  const squareStackControls = useAnimation();

  const svgControls = useAnimation();
  const pathControls = useAnimation();

  const onAnimationStart = () => {
    svgControls.start("animate");
    pathControls.start("animate");
  };

  const onAnimationEnd = () => {
    svgControls.start("initial");
    pathControls.start("initial");
  };

  return (
    <section className="py-16 flex flex-col gap-16 items-center justify-center">
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-950 dark:text-zinc-50 text-4xl font-bold text-balance">Las Mejores Features</h2>
        <h3 className="text-zinc-600 dark:text-zinc-400 text-balance max-w-[624px]">
          Subtis está pensada y armada para que siempre encuentres el subtítulo perfecto para tu película de una manera
          rápida y efectiva.
        </h3>
      </div>
      <div className="grid sm:grid-cols-3 gap-x-32 gap-y-6 tracking-tight sm:max-w-screen-lg grid-cols-1">
        <div
          className="flex flex-col justify-center items-center text-center gap-2"
          onMouseEnter={() => audiolinesControls.start("animate")}
          onMouseLeave={() => audiolinesControls.start("normal")}
        >
          <AudioLinesIcon size={72} controls={audiolinesControls} />
          <span className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">Sincronización perfecta</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2"
          onMouseEnter={onAnimationStart}
          onMouseLeave={onAnimationEnd}
        >
          <LanguagesIcon size={72} svgControls={svgControls} pathControls={pathControls} />
          <span className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">Español latino</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2"
          onMouseEnter={() => timerControls.start("animate")}
          onMouseLeave={() => timerControls.start("normal")}
        >
          <TimerIcon size={72} controls={timerControls} />
          <span className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">Búsqueda en tiempo real</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2"
          onMouseEnter={() => trendingUpControls.start("animate")}
          onMouseLeave={() => trendingUpControls.start("normal")}
        >
          <TrendingUpIcon size={72} controls={trendingUpControls} />
          <span className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">+9 mil subtítulos</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2"
          onMouseEnter={() => squareStackControls.start("animate")}
          onMouseLeave={() => squareStackControls.start("normal")}
        >
          <SquareStackIcon size={72} controls={squareStackControls} />
          <span className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">Múltiples clientes</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2"
          onMouseEnter={() => circleCheckControls.start("animate")}
          onMouseLeave={() => circleCheckControls.start("normal")}
        >
          <CircleCheckIcon size={72} controls={circleCheckControls} />
          <span className="text-3xl font-bold text-zinc-950 dark:text-zinc-50">SRT spec compliant</span>
        </div>
      </div>
    </section>
  );
}
