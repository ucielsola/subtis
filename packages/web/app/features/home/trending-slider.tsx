import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";

// ui
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";

// routes
import type { loader } from "~/routes/_index";

// internals
import { ThumbHashTrendingImage } from "./thumbhash-trending-image";

export function TrendingSlider() {
  // remix hooks
  const { trendingDownloadedTitles } = useLoaderData<typeof loader>();

  if ("message" in trendingDownloadedTitles) {
    return null;
  }

  return (
    <Carousel className="w-full">
      <CarouselContent className="p-4">
        {trendingDownloadedTitles.results.map((title) => {
          if (!title.poster) {
            return null;
          }

          if (title.type !== "movie") {
            return null;
          }

          return (
            <CarouselItem key={title.id} className="basis-auto pl-3 select-none">
              <Link
                to={`/subtitles/movie/${title.imdb_id}`}
                className="flex flex-none rounded-sm overflow-hidden cursor-pointer lg:hover:scale-105 transition-all ease-in-out duration-300 group will-change-transform"
              >
                <ThumbHashTrendingImage src={title.poster} hashUrl={title.poster_thumbhash} alt={title.title_name} />
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>
      <CarouselPrevious className="border-zinc-300 hover:bg-zinc-800 lg:inline-flex hidden" />
      <CarouselNext className="border-zinc-300 hover:bg-zinc-800 lg:inline-flex hidden" />
    </Carousel>
  );
}
