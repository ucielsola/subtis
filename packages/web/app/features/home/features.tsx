import { useAnimation } from "motion/react";

// icons
import { AudioLinesIcon } from "~/components/icons/audio-lines";
import { CircleCheckIcon } from "~/components/icons/circle-check";
import { Clap } from "~/components/icons/clap";
import { Cpu } from "~/components/icons/cpu";
import { Earth } from "~/components/icons/earth";
import { LanguagesIcon } from "~/components/icons/languages";
import { MessageCircle } from "~/components/icons/message-circle";
import { People } from "~/components/icons/people";
import { Play } from "~/components/icons/play";
import { SquareStackIcon } from "~/components/icons/square-stack";
import { TimerIcon } from "~/components/icons/timer";
import { TrendingUpIcon } from "~/components/icons/trending-up";
export function HomeFeatures() {
  const audiolinesControls = useAnimation();
  const timerControls = useAnimation();
  const trendingUpControls = useAnimation();
  const circleCheckControls = useAnimation();
  const squareStackControls = useAnimation();
  const clapControls = useAnimation();
  const earthControls = useAnimation();
  const cpuControls = useAnimation();
  const svgControls = useAnimation();
  const pathControls = useAnimation();
  const playControls = useAnimation();
  const messageCircleControls = useAnimation();
  const peopleControls = useAnimation();

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
        <h2 className="text-zinc-50 text-4xl font-bold text-balance">Las Mejores Features</h2>
        <h3 className="text-zinc-400 text-balance max-w-[624px]">
          Subtis está pensada y armada para que siempre encuentres el subtítulo perfecto para tu película de una manera
          rápida y efectiva.
        </h3>
      </div>
      <div className="flex flex-row flex-wrap gap-4 max-w-screen-xl items-center justify-center">
        <div
          className="flex flex-col justify-center items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => audiolinesControls.start("animate")}
          onMouseLeave={() => audiolinesControls.start("normal")}
        >
          <AudioLinesIcon size={24} controls={audiolinesControls} />
          <span className="text-zinc-50">Sincronización perfecta</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => earthControls.start("animate")}
          onMouseLeave={() => earthControls.start("normal")}
        >
          <Earth size={24} controls={earthControls} />
          <span className="text-zinc-50">Español latino</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => timerControls.start("animate")}
          onMouseLeave={() => timerControls.start("normal")}
        >
          <TimerIcon size={24} controls={timerControls} />
          <span className="text-zinc-50">Búsqueda en tiempo real</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => squareStackControls.start("animate")}
          onMouseLeave={() => squareStackControls.start("normal")}
        >
          <SquareStackIcon size={24} controls={squareStackControls} />
          <span className="text-zinc-50">Múltiples clientes</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => trendingUpControls.start("animate")}
          onMouseLeave={() => trendingUpControls.start("normal")}
        >
          <TrendingUpIcon size={24} controls={trendingUpControls} />
          <span className="text-zinc-50">+9mil subtítulos</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => clapControls.start("animate")}
          onMouseLeave={() => clapControls.start("normal")}
        >
          <Clap size={24} controls={clapControls} />
          <span className="text-zinc-50">+300 títulos</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => circleCheckControls.start("animate")}
          onMouseLeave={() => circleCheckControls.start("normal")}
        >
          <CircleCheckIcon size={24} controls={circleCheckControls} />
          <span className="text-zinc-50">SRT estándar compatible</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={onAnimationStart}
          onMouseLeave={onAnimationEnd}
        >
          <LanguagesIcon size={24} svgControls={svgControls} pathControls={pathControls} />
          <span className="text-zinc-50">Búsqueda multi-idioma</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => cpuControls.start("animate")}
          onMouseLeave={() => cpuControls.start("normal")}
        >
          <Cpu size={24} controls={cpuControls} />
          <span className="text-zinc-50">Generación por AI</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => playControls.start("animate")}
          onMouseLeave={() => playControls.start("normal")}
        >
          <Play size={24} controls={playControls} />
          <span className="text-zinc-50">Reproductor de video</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => messageCircleControls.start("animate")}
          onMouseLeave={() => messageCircleControls.start("normal")}
        >
          <MessageCircle size={24} controls={messageCircleControls} />
          <span className="text-zinc-50">Soporte 24/7</span>
        </div>
        <div
          className="flex flex-col items-center text-center gap-2 bg-zinc-900/80 rounded-sm p-4 w-72 h-28"
          onMouseEnter={() => peopleControls.start("animate")}
          onMouseLeave={() => peopleControls.start("normal")}
        >
          <People size={24} controls={peopleControls} />
          <span className="text-zinc-50">Comunidad cinéfila</span>
        </div>
      </div>
    </section>
  );
}
