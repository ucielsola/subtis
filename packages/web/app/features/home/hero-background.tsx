import { Suspense, use, useEffect, useState } from "react";
import { useLoaderData } from "react-router";

// lib
import { cn } from "~/lib/utils";

// api
import { trendingSubtitlesResponseSchema } from "@subtis/api/routers/titles/schemas";

// shared internal
import { Marquee } from "~/components/shared/marquee";

// ui
import { AspectRatio } from "~/components/ui/aspect-ratio";

// types
import type { loader } from "~/routes/home";

// constants
const IMAGE_WIDTH = 19.3;
const BASE_VELOCITIES = [20, 25, 15, 30]; // Velocidades base más altas porque ahora el factor de velocidad es más pequeño

type PropsContainer = {
  className?: string;
  recentDownloadedTitlesPromise: ReturnType<typeof loader>["recentDownloadedTitlesPromise"];
};

function HeroBackgroundContainer({ className, recentDownloadedTitlesPromise }: PropsContainer) {
  // react hooks
  const recentDownloadedTitlesData = use(recentDownloadedTitlesPromise);
  const [allImagesAreLoaded, setAllImagesAreLoaded] = useState<boolean>(false);

  // constants
  const recent = trendingSubtitlesResponseSchema.parse(recentDownloadedTitlesData);

  // constants
  const images = recent.results
    .map(({ optimized_backdrop, title_name, slug }) => ({
      id: slug,
      alt: title_name,
      src: optimized_backdrop,
    }))
    .filter((img): img is { src: string; alt: string; id: string } => Boolean(img.src));

  // effects
  useEffect(() => {
    let imagesLoaded = 0;
    for (const image of images) {
      const img = new Image();
      img.src = image.src;
      img.onload = () => {
        imagesLoaded++;
        if (imagesLoaded === images.length) {
          setAllImagesAreLoaded(true);
        }
      };
    }
  }, [images]);

  if (images.length === 0) {
    return null;
  }

  const rows = Array.from({ length: Math.ceil(images.length / 4) }, (_, i) => images.slice(i * 4, i * 4 + 4));

  return (
    <div
      className={cn("w-full h-full opacity-0 transition-opacity duration-300 ease-in-out select-none", className, {
        "opacity-60": allImagesAreLoaded,
      })}
    >
      <div className="flex flex-col gap-4 w-[120%] [mask-image:radial-gradient(circle_at_top_right,black_30%,transparent_70%)]">
        {rows.map((row, i) => (
          <Marquee
            key={row.map((img) => img.id).join("-")}
            inverted={i % 2 === 0}
            baseVelocity={BASE_VELOCITIES[i % BASE_VELOCITIES.length]}
            className="flex gap-4 whitespace-nowrap"
          >
            <div className="flex gap-4 mr-4">
              {row.map((image) => (
                <div key={image.id} className="inline-block shrink-0" style={{ width: `${IMAGE_WIDTH}vw` }}>
                  <AspectRatio ratio={1.78}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover rounded-[8px] hover:brightness-105 transition-all duration-300 ease-in-out"
                      loading="lazy"
                    />
                  </AspectRatio>
                </div>
              ))}
            </div>
          </Marquee>
        ))}
      </div>
    </div>
  );
}

type Props = {
  className?: string;
};

export function HeroBackground({ className }: Props) {
  // remix hooks
  const { recentDownloadedTitlesPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense fallback={null}>
      <HeroBackgroundContainer recentDownloadedTitlesPromise={recentDownloadedTitlesPromise} className={className} />
    </Suspense>
  );
}
