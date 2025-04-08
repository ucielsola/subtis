import { Suspense, use } from "react";
import { Link, useLoaderData } from "react-router";
import { useMediaQuery } from "usehooks-ts";

// api
import { trendingSubtitlesResponseSchema } from "@subtis/api/controllers/titles/schemas";

// routes
import type { loader } from "~/routes/home";

// internals
import { ThumbHashNewsImage } from "./thumbhash-news-image";

// ui
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
import { Skeleton } from "~/components/ui/skeleton";

type PropsContainer = {
  slidesToScroll: number;
  recentDownloadedTitlesPromise: ReturnType<typeof loader>["recentDownloadedTitlesPromise"];
};

function CarouselContainer({ recentDownloadedTitlesPromise, slidesToScroll }: PropsContainer) {
  // react hooks
  const recentDownloadedTitlesData = use(recentDownloadedTitlesPromise);

  // constants
  const recent = trendingSubtitlesResponseSchema.parse(recentDownloadedTitlesData);

  return (
    <Carousel
      className="w-full"
      opts={{
        slidesToScroll,
      }}
    >
      <CarouselContent className="p-4">
        {recent.results.map((title) => {
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

export function NewsSlider() {
  // remix hooks
  const loaderData = useLoaderData<typeof loader>();

  // ts hooks
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1366px)");
  const slidesToScroll = isMobile ? 1 : isTablet ? 2 : 3;

  if ("message" in loaderData) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <Carousel className="w-full" opts={{ slidesToScroll }}>
          <CarouselContent className="p-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <CarouselItem key={`news-slider-skeleton-${index}`} className="basis-auto pl-3 select-none">
                <Skeleton className="w-[330px] h-[180px] rounded-sm" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      }
    >
      <CarouselContainer
        recentDownloadedTitlesPromise={loaderData.recentDownloadedTitlesPromise}
        slidesToScroll={slidesToScroll}
      />
    </Suspense>
  );
}
