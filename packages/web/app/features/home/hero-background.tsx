"use client";

import { useQuery } from "@tanstack/react-query";
import { getApiClient } from "@subtis/shared";
import { cn } from "~/lib/utils";
import { AspectRatio } from "~/components/ui/aspect-ratio";
import { Marquee } from "~/components/shared/marquee";

const IMAGE_WIDTH = 19.3;
const BASE_VELOCITIES = [20, 25, 15, 30]; // Velocidades base más altas porque ahora el factor de velocidad es más pequeño

interface ApiTitle {
  id: number;
  type: string;
  queried_times: number | null;
  imdb_id: string;
  backdrop_thumbhash: string | null;
  optimized_backdrop: string | null;
  optimized_logo: string | null;
  optimized_poster: string | null;
  poster_thumbhash: string | null;
  title_name: string;
  year: number;
}

interface ApiResponse {
  results: ApiTitle[];
  total: number;
}

type Props = {
  className?: string;
};

export function HeroBackground({ className }: Props) {
  const { data } = useQuery<ApiResponse>({
    queryKey: ["titles", "recent"],
    queryFn: async () => {
      const apiClient = getApiClient({
        apiBaseUrl: "https://api.subt.is",
      });

      const response = await apiClient.v1.titles.recent[":limit"].$get({
        param: {
          limit: "30",
        },
      });

      const data = await response.json();
      if ("message" in data) return { results: [], total: 0 };
      return data;
    },
  });

  const images =
    data?.results
      .map(({ optimized_backdrop, title_name, id }) => ({
        src: optimized_backdrop,
        alt: title_name,
        id: String(id),
      }))
      .filter((img): img is { src: string; alt: string; id: string } => Boolean(img.src)) || [];

  if (images.length === 0) return null;

  // Split images into rows
  const rows = [];
  for (let i = 0; i < images.length; i += 4) {
    rows.push(images.slice(i, i + 4));
  }

  return (
    <div className={cn("w-full h-full opacity-[64%]", className)}>
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
                <div
                  key={image.id}
                  className="inline-block shrink-0"
                  style={{ width: `${IMAGE_WIDTH}vw` }}
                >
                  <AspectRatio ratio={1.78}>
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-full object-cover rounded-[8px]"
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
