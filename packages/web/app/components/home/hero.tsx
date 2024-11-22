// home
import { BadgeTvShows } from "~/components/home/badge-tv-shows";
import { RaycastLogo } from "~/components/home/raycast-logo";
import { StremioButton } from "~/components/home/stremio-button";
import { VideoDropzone } from "~/components/home/video-dropzone";
import { VlcButton } from "~/components/home/vlc-button";

// ui
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { DotPattern } from "~/components/ui/dot-pattern";

// lib
import { cn } from "~/lib/utils";

// internals
import { TerminalLogo } from "./terminal-logo";

export function HomeHero() {
  return (
    <section className="py-16">
      <div className="flex flex-col lg:flex-row justify-between items-center flex-1 gap-8 lg:gap-4">
        <div className="flex flex-col gap-3 lg:max-w-[624px]">
          <BadgeTvShows />

          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-950 dark:text-zinc-50 text-5xl font-bold text-balance leading-[1.075]">
              El mejor buscador de subtítulos en internet
            </h1>
            <h2 className="text-zinc-600 dark:text-zinc-200 text-balance">
              Encontra el subtítulo para tu película o serie perfectamente sincronizado.
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 mt-5">
              <StremioButton />
              <VlcButton />
            </div>
            <span className="text-zinc-600 dark:text-zinc-400 text-sm flex flex-row items-center">
              También disponible en{" "}
              <span className="inline-flex flex-row items-center gap-1 px-1.5 text-zinc-700 dark:text-zinc-50 group/raycast cursor-pointer">
                <RaycastLogo size={16} className="fill-zinc-700 dark:fill-zinc-50 transition-all ease-in-out" />
                <span className="group-hover/raycast:underline">Raycast</span>
              </span>{" "}
              y
              <span className="inline-flex flex-row items-center gap-1 px-1.5 text-zinc-700 dark:text-zinc-50 group/cli cursor-pointer">
                <TerminalLogo
                  size={16}
                  className="stroke-zinc-700 fill-transparent dark:stroke-zinc-50 transition-all ease-in-out"
                />
                <span className="group-hover/cli:underline">CLI</span>
              </span>
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-end justify-center lg:pt-8 xl:pt-20 w-full">
          <div className="lg:max-w-[488px] w-full h-full flex flex-col gap-2">
            <AspectRatio
              ratio={16 / 9}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-md group/video overflow-hidden"
            >
              <VideoDropzone />
              <DotPattern
                className={cn(
                  "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)] opacity-40 group-hover/video:opacity-60 group-hover/video:scale-105 transition-all ease-in-out",
                )}
              />
            </AspectRatio>
            <p className="text-sm text-zinc-600 dark:text-zinc-400 text-center px-4">
              Si contas con el archivo de video podes arrastrarlo acá
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
