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
    <section className="pt-20 pb-24 isolate relative flex flex-col gap-10">
      <HeroBackground className="absolute top-40 right-0 h-fit translate-y-[-30%] translate-x-[50%] 2xl:translate-x-[40%] 2xl:translate-y-[-50%] -z-10 -rotate-[25deg]" />
      <div className="flex flex-col gap-4 text-center max-w-[720px] mx-auto">
        <h1 className="text-[56px] font-semibold text-zinc-100 leading-16">
          El buscador de subtítulos más completo de la web
        </h1>
        <h2 className="text-2xl text-[#6E6E6E]">Encontrá el subtítulo perfecto para cualquier película</h2>
      </div>
      <div className="flex flex-col gap-4 max-w-2xl mx-auto items-center">
        <div className="flex flex-row gap-4">
          <StremioButton />
          {/* <VlcButton /> */}
        </div>
        <div className="text-zinc-400 text-sm flex flex-row items-center">
          <span>También en tu terminal</span>
          <TerminalButton />
        </div>
      </div>
    </section>
  );
}
