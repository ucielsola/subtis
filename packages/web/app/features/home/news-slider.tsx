import { Link, useLoaderData } from "@remix-run/react";

// routes
import type { loader } from "~/routes/_index";

// internals
import { ThumbHashNewsImage } from "./thumbhash-news-image";

// ui
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";

export function NewsSlider() {
  const { recentDownloadedTitles } = useLoaderData<typeof loader>();

  if ("message" in recentDownloadedTitles) {
    return null;
  }

  return (
    <Carousel className="w-full">
      <CarouselContent className="p-4">
        {recentDownloadedTitles.results.map((title) => {
          if (!title.backdrop) {
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
                <ThumbHashNewsImage src={title.backdrop} hashUrl={title.backdrop_thumbhash} alt={title.title_name} />
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
