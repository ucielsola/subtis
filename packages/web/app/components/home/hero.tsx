// home
import { BadgeTvShows } from "~/components/home/badge-tv-shows";
import { RaycastLogo } from "~/components/home/raycast-logo";
import { StremioButton } from "~/components/home/stremio-button";
import { TerminalLogo } from "~/components/home/terminal-logo";
import { VideoDropzone } from "~/components/home/video-dropzone";
import { VlcButton } from "~/components/home/vlc-button";

// ui
import { AspectRatio } from "~/components/ui/aspect-ratio";

export function HomeHero() {
  return (
    <section className="py-16">
      <div className="flex flex-col lg:flex-row justify-between items-center flex-1 gap-8 lg:gap-4">
        <div className="flex flex-col gap-3 lg:max-w-[624px]">
          <BadgeTvShows />

          <div className="flex flex-col gap-4">
            <h1 className="text-slate-950 text-5xl font-bold text-balance">
              El buscador de subtítulos que necesitabas
            </h1>
            <h2 className="text-slate-600 text-balance">
              Encontra los subtítulos en español latino que sincronizan perfectamente con todas tus películas favoritas.
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 mt-5">
              <StremioButton />
              <VlcButton />
            </div>
            <span className="text-slate-600 text-sm flex flex-row items-center">
              También disponible en{" "}
              <span className="inline-flex flex-row items-center gap-1 px-1.5 text-slate-700 hover:text-slate-950 transition-colors duration-300 group/raycast cursor-pointer">
                <RaycastLogo
                  size={16}
                  className="group-hover/raycast:fill-slate-950 fill-slate-700 transition-colors duration-300"
                />
                Raycast
              </span>{" "}
              y
              <span className="inline-flex flex-row items-center gap-1 px-1.5 text-slate-700  hover:text-slate-950 transition-colors duration-300 group/cli cursor-pointer  ">
                <TerminalLogo
                  size={16}
                  className="group-hover/cli:fill-slate-950 group-hover/cli:stroke-transparent fill-transparent stroke-slate-700 transition-colors duration-300"
                />
                CLI
              </span>
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col items-end justify-center lg:pt-8 xl:pt-20 w-full">
          <div className="lg:max-w-[488px] w-full h-full flex flex-col gap-2">
            <AspectRatio ratio={16 / 9} className="bg-white rounded-md border-slate-200 border-dashed border-2">
              <VideoDropzone />
            </AspectRatio>
            <p className="text-sm text-slate-600 text-center px-4">
              Si contas con el archivo de video podes arrastrarlo acá
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
