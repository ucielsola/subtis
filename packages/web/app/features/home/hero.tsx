import { useEffect } from "react";

// home
import { StremioButton } from "~/features/home/stremio-button";

// internals
import { HeroBackground } from "./hero-background";
import { TerminalButton } from "./terminal-button";

export function HomeHero() {
  // effects
  useEffect(function preloadStremioImages() {
    const images = ["/stremio-1.webp", "/stremio-2.webp", "/stremio-3.webp", "/stremio-4.webp"];

    images.forEach((image) => {
      const newImage = new Image();
      newImage.src = image;
    });
  }, []);

  return (
    <section className="pt-20 pb-28 isolate relative flex flex-col gap-10">
      <HeroBackground className="absolute w-[100%] h-full top-40 right-0 translate-y-[-40%] translate-x-[0%] 2xl:translate-x-[10%] 2xl:translate-y-[-60%] -z-10 -rotate-[25deg]" />
      <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
        <h1 className="text-6xl font-semibold text-zinc-100 leading-16">El mejor buscador de subtítulos en internet</h1>
        <h2 className="text-2xl text-zinc-400">Encontrá el subtítulo perfecto para tu película</h2>
      </div>
      <div className="flex flex-col gap-4 max-w-2xl mx-auto items-center">
        <div className="flex flex-row gap-4">
          <StremioButton />
          {/* <VlcButton /> */}
        </div>
        <div className="text-zinc-400 text-sm flex flex-row items-center">
          <span>También en tu</span>
          <TerminalButton />
        </div>
      </div>
    </section>
  );
}
