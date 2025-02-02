import { Link, useLoaderData } from "@remix-run/react";

// routes
import type { loader } from "~/routes/_index";

// internals
import { ThumbHashNewsImage } from "./thumbhash-news-image";

// ui
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";

export function NewsSlider() {
  const loaderData = useLoaderData<typeof loader>();

  if ("message" in loaderData) {
    return null;
  }

  return (
    <Carousel className="w-full">
      <CarouselContent className="p-4">
        {loaderData.recentDownloadedTitles.results.map((title) => {
          if (!title.optimized_backdrop) {
            return null;
          }

          if (title.type !== "movie") {
            return null;
          }

          return (
            <CarouselItem key={`news-slider-${title.slug}`} className="basis-auto pl-3 select-none">
              <Link
                to={`/subtitles/movie/${title.slug}`}
                className="flex flex-none rounded-sm overflow-hidden cursor-pointer lg:hover:scale-105 transition-all ease-in-out duration-300 group will-change-transform"
              >
                <ThumbHashNewsImage
                  src={title.optimized_backdrop}
                  hashUrl={title.backdrop_thumbhash}
                  alt={title.title_name}
                />
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
}
