import { useAnimation } from "motion/react";

// icons
import { AudioLinesIcon } from "~/components/icons/audio-lines";
import { CircleCheckIcon } from "~/components/icons/circle-check";
import { Cpu } from "~/components/icons/cpu";
import { Earth } from "~/components/icons/earth";
import { LanguagesIcon } from "~/components/icons/languages";
import { Play } from "~/components/icons/play";
import { SquareStackIcon } from "~/components/icons/square-stack";
import { TimerIcon } from "~/components/icons/timer";

export function HomeFeatures() {
  const audiolinesControls = useAnimation();
  const timerControls = useAnimation();
  const circleCheckControls = useAnimation();
  const squareStackControls = useAnimation();
  const earthControls = useAnimation();
  const cpuControls = useAnimation();
  const svgControls = useAnimation();
  const pathControls = useAnimation();
  const playControls = useAnimation();

  const onAnimationStart = () => {
    svgControls.start("animate");
    pathControls.start("animate");
  };

  const onAnimationEnd = () => {
    svgControls.start("initial");
    pathControls.start("initial");
  };

  return (
    <section className="py-32 flex flex-col gap-16 items-center justify-center">
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-50 text-4xl font-bold text-balance">Todo lo que necesitas</h2>
      </div>

      <div className="flex flex-row gap-8">
        <div className="flex flex-col gap-8">
          <div
            className="flex flex-row gap-3 items-start"
            onMouseEnter={() => audiolinesControls.start("animate")}
            onMouseLeave={() => audiolinesControls.start("normal")}
          >
            <div className="pt-[2.5px]">
              <AudioLinesIcon size={16} controls={audiolinesControls} />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-widest">Sincronización perfecta</p>
              <p className="text-zinc-400 text-sm">El subtítulo correcto, siempre.</p>
            </div>
          </div>
          <div
            className="flex flex-row gap-3 items-start"
            onMouseEnter={() => timerControls.start("animate")}
            onMouseLeave={() => timerControls.start("normal")}
          >
            <div className="pt-[2.5px]">
              <TimerIcon size={16} controls={timerControls} />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-widest">Búsqueda en tiempo real</p>
              <p className="text-zinc-400 text-sm">Nuestro index siempre activo.</p>
            </div>
          </div>

          <div
            className="flex flex-row gap-3 items-start"
            onMouseEnter={() => circleCheckControls.start("animate")}
            onMouseLeave={() => circleCheckControls.start("normal")}
          >
            <div className="pt-[2.5px]">
              <CircleCheckIcon size={16} controls={circleCheckControls} />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-widest">SRT estándar compatible</p>
              <p className="text-zinc-400 text-sm">Cumplimos con el standard.</p>
            </div>
          </div>

          <div
            className="flex flex-row gap-3 items-start"
            onMouseEnter={() => cpuControls.start("animate")}
            onMouseLeave={() => cpuControls.start("normal")}
          >
            <div className="pt-[2.5px]">
              <Cpu size={16} controls={cpuControls} />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-widest">Generación por AI</p>
              <p className="text-zinc-400 text-sm">Genera subtítulos con IA.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div
            className="flex flex-row gap-3 items-start"
            onMouseEnter={() => earthControls.start("animate")}
            onMouseLeave={() => earthControls.start("normal")}
          >
            <div className="pt-[2.5px]">
              <Earth size={16} controls={earthControls} />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-widest">Español latino</p>
              <p className="text-zinc-400 text-sm">Claridad en todos los diálogos.</p>
            </div>
          </div>

          <div
            className="flex flex-row gap-3 items-start"
            onMouseEnter={() => squareStackControls.start("animate")}
            onMouseLeave={() => squareStackControls.start("normal")}
          >
            <div className="pt-[2.5px]">
              <SquareStackIcon size={16} controls={squareStackControls} />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-widest">Múltiples clientes</p>
              <p className="text-zinc-400 text-sm">Variedad de integraciones.</p>
            </div>
          </div>

          <div
            className="flex flex-row gap-3 items-start"
            onMouseEnter={onAnimationStart}
            onMouseLeave={onAnimationEnd}
          >
            <div className="pt-[2.5px]">
              <LanguagesIcon size={16} svgControls={svgControls} pathControls={pathControls} />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-widest">Búsqueda multi-idioma</p>
              <p className="text-zinc-400 text-sm">Busca películas en cualquier idioma.</p>
            </div>
          </div>

          <div
            className="flex flex-row gap-3 items-start"
            onMouseEnter={() => playControls.start("animate")}
            onMouseLeave={() => playControls.start("normal")}
          >
            <div className="pt-[2.5px]">
              <Play size={16} controls={playControls} isWrapped />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-widest">Reproductor de video</p>
              <p className="text-zinc-400 text-sm">Reproducí directo desde Subtis.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
