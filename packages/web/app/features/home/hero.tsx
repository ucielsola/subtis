import { useAnimation } from "motion/react";

// shared
import { VideoDropzone } from "~/components/shared/video-dropzone";

// home
import { BadgeTvShows } from "~/features/home/badge-tv-shows";
import { StremioButton } from "~/features/home/stremio-button";
import { VlcButton } from "~/features/home/vlc-button";

// ui
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { DotPattern } from "~/components/ui/dot-pattern";

// lib
import { cn } from "~/lib/utils";

// icons
import { Terminal } from "~/components/icons/terminal";

export function HomeHero() {
  // motion hooks
  const controls = useAnimation();

  return (
    <section className="py-16  lg:pt-24 lg:pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-center flex-1 gap-8 lg:gap-4">
        <div className="flex flex-col gap-3 lg:max-w-[624px]">
          <BadgeTvShows />

          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-50 text-3xl md:text-5xl font-bold text-balance leading-[1.075]">
              El mejor buscador de subtítulos en internet
            </h1>
            <h2 className="text-zinc-50 text-balance">
              Encontrá el subtítulo para tu película o serie perfectamente sincronizado.
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 mt-5">
              <StremioButton />
              <VlcButton />
            </div>
            <span className="text-zinc-400 text-sm flex flex-row items-center">
              También disponible para tu
              <span
                onMouseEnter={() => controls.start("hover")}
                onMouseLeave={() => controls.start("normal")}
                className="inline-flex flex-row items-center gap-1 px-1.5 text-zinc-300 group/cli cursor-pointer"
              >
                <Terminal
                  controls={controls}
                  size={16}
                  className="fill-transparent stroke-zinc-300 transition-all ease-in-out group-hover/cli:stroke-zinc-50"
                />
                <span className="group-hover/cli:text-zinc-50">Terminal</span>
              </span>
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-end justify-center w-full  lg:pt-4">
          <div className="lg:max-w-[540px] w-full h-full flex flex-col gap-2">
            <AspectRatio
              ratio={16 / 9}
              className="bg-zinc-950 border border-zinc-700 hover:border-zinc-600 transition-all ease-in-out duration-300 rounded-md group/video overflow-hidden"
            >
              <VideoDropzone />
              <DotPattern
                className={cn(
                  "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)] opacity-40 backdrop-blur-md group-hover/video:opacity-60 group-hover/video:scale-105 transition-all ease-in-out",
                )}
              />
            </AspectRatio>
            <p className="text-sm text-zinc-400 text-center px-4 hidden lg:block">
              Si contás con el archivo de video podés arrastrarlo acá.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
