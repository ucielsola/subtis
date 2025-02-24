import { useAnimation } from "motion/react";
import { useEffect } from "react";

// shared
import { VideoDropzone } from "~/components/shared/video-dropzone";

// home
import { BadgeTvShows } from "~/features/home/badge-tv-shows";
import { StremioButton } from "~/features/home/stremio-button";

// ui
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { DotPattern } from "~/components/ui/dot-pattern";

// lib
import { cn } from "~/lib/utils";

// icons
import { Terminal } from "~/components/icons/terminal";

// internals
import { HeroBackground } from "./hero-background";

export function HomeHero() {
  // motion hooks
  const controls = useAnimation();

  // effects
  useEffect(function preloadStremioImages() {
    const images = ["/stremio-1.webp", "/stremio-2.webp", "/stremio-3.webp", "/stremio-4.webp"];

    images.forEach((image) => {
      const newImage = new Image();
      newImage.src = image;
    });
  }, []);

  return (
    <section className="py-16 lg:pt-24 lg:pb-20 isolate relative">
      <HeroBackground className="absolute w-[100%] h-full top-40 right-0 translate-y-[-40%] translate-x-[0%] 2xl:translate-x-[10%] 2xl:translate-y-[-60%] -z-10 -rotate-[25deg]" />
      <div className="flex flex-col lg:flex-row justify-between items-center flex-1 gap-8 lg:gap-4">
        <div className="flex flex-col gap-3 lg:max-w-[624px]">
          <BadgeTvShows />

          <div className="flex flex-col gap-1">
            <h1 className="text-zinc-50 text-3xl md:text-5xl font-bold text-balance leading-[1.075]">
              El mejor buscador de subtítulos en internet
            </h1>
            <h2 className="text-zinc-50 text-balance">
              Encontrá el subtítulo perfectamente sincronizado para tu película.
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex flex-row gap-4 mt-5">
              <StremioButton />
              {/* <VlcButton /> */}
            </div>
            <span className="text-zinc-400 text-sm flex-row items-center hidden">
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
            <p className="text-sm text-zinc-300 text-center hidden lg:block w-fit container mx-auto">
              Si contás con el archivo de video podés arrastrarlo acá
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
