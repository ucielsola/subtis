import { Link } from "@remix-run/react";
import { AnimatePresence, motion } from "motion/react";
import { useMediaQuery } from "usehooks-ts";

// lib
import { apiClient } from "~/lib/api";

// ui
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "~/components/ui/carousel";

// features
import { ThumbHashTrendingImage } from "~/features/home/thumbhash-trending-image";

type Result = {
  value: string;
  label: string;
  optimizedPoster: string | null;
  posterThumbHash: string | null;
};

type SliderProps = {
  isLoading: boolean;
  data: { results: Result[]; statusCode: number } | undefined;
};

function Slider({ data, isLoading }: SliderProps) {
  // ts hooks
  const isMobile = useMediaQuery("(max-width: 768px)");
  const isTablet = useMediaQuery("(max-width: 1366px)");
  const slidesToScroll = isMobile ? 1 : isTablet ? 2 : 3;

  // handlers
  async function handleUpdateSearchMetrics(slug: string) {
    await apiClient.v1.title.metrics.search.$patch({
      json: { slug },
    });
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!data) {
    return null;
  }

  return (
    <Carousel
      className="w-full"
      opts={{
        slidesToScroll,
      }}
    >
      <CarouselContent className="p-4">
        {data.results.map((title) => {
          if (!title.optimizedPoster) {
            return null;
          }

          return (
            <CarouselItem key={title.value} className="basis-auto pl-3 select-none">
              <Link
                to={`/subtitles/movie/${title.value}`}
                onClick={() => handleUpdateSearchMetrics(title.value)}
                className="flex flex-none rounded-sm overflow-hidden cursor-pointer lg:hover:scale-105 transition-all ease-in-out duration-300 group will-change-transform"
              >
                <ThumbHashTrendingImage src={title.optimizedPoster} hashUrl={title.posterThumbHash} alt={title.label} />
              </Link>
            </CarouselItem>
          );
        })}
      </CarouselContent>

      {data.results.length > 2 ? (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      ) : null}
    </Carousel>
  );
}

type Props = {
  isLoading: boolean;
  data: { results: Result[]; statusCode: number } | undefined;
};

export function PosterTitles({ data, isLoading }: Props) {
  return (
    <section className="py-16 flex flex-col gap-32 min-h-[550px]">
      <AnimatePresence>
        {data && data.results.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex flex-col gap-2"
          >
            <div className="flex flex-col gap-2">
              <h3 className="text-zinc-50 text-3xl font-semibold">Películas encontradas</h3>
            </div>
            <Slider data={data} isLoading={isLoading} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
