import { Suspense, use } from "react";
import { Link, useLoaderData } from "react-router";
import { useMediaQuery } from "usehooks-ts";

// routes
import type { loader } from "~/routes/home";

// api
import { trendingSubtitlesResponseSchema } from "@subtis/api/routers/titles/schemas";

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";
// ui
import { Skeleton } from "~/components/ui/skeleton";

// internals
import { ThumbHashTrendingImage } from "./thumbhash-trending-image";

type PropsContainer = {
  slidesToScroll: number;
  trendingDownloadedTitlesPromise: ReturnType<typeof loader>["trendingDownloadedTitlesPromise"];
};

function CarouselContainer({ trendingDownloadedTitlesPromise, slidesToScroll }: PropsContainer) {
  // react hooks
  const trendingDownloadedTitlesData = use(trendingDownloadedTitlesPromise);

  // constants
  const trending = trendingSubtitlesResponseSchema.parse(trendingDownloadedTitlesData);

  return (
    <Carousel className="w-[calc(100%-32px)] absolute left-4 right-4 mt-32" opts={{ slidesToScroll }}>
      <CarouselContent className="p-4">
        {trending.results.map((title) => {
          if (!title.optimized_poster) {
            return null;
          }

          if (title.type !== "movie") {
            return null;
          }

          return (
            <CarouselItem key={`trending-slider-${title.slug}`} className="basis-auto pl-3 select-none">
              <Link
                viewTransition
                prefetch="viewport"
                to={`/subtitles/movie/${title.slug}`}
                className="flex flex-none rounded-sm overflow-hidden cursor-pointer lg:hover:scale-105 transition-all ease-in-out duration-300 group will-change-transform"
              >
                <ThumbHashTrendingImage
                  src={title.optimized_poster}
                  hashUrl={title.poster_thumbhash}
                  alt={title.title_name}
                  slug={title.slug}
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

export function TrendingSlider() {
  // remix hooks
  const { trendingDownloadedTitlesPromise } = useLoaderData<typeof loader>();

  // ts hooks
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1366px)");
  const slidesToScroll = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <Suspense
      fallback={
        <Carousel className="w-[calc(100%-32px)] absolute left-4 right-4 mt-32" opts={{ slidesToScroll }}>
          <CarouselContent className="p-4">
            {Array.from({ length: 22 }).map((_, index) => (
              <CarouselItem key={`trending-slider-skeleton-${index}`} className="basis-auto pl-3 select-none">
                <Skeleton className="w-[280px] h-[420px] rounded-sm" />
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      }
    >
      <CarouselContainer
        trendingDownloadedTitlesPromise={trendingDownloadedTitlesPromise}
        slidesToScroll={slidesToScroll}
      />
    </Suspense>
  );
}
