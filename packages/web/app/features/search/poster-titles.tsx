import { Link } from "@remix-run/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "motion/react";
import { AnimatePresence } from "motion/react";
import { useEffect, useRef, useState } from "react";

// shared external
import { getApiClient } from "@subtis/shared";

// features
import { ThumbHashTrendingImage } from "~/features/home/thumbhash-trending-image";

type Result = {
  value: string;
  label: string;
  poster: string | null;
  posterThumbHash: string | null;
};

type SliderProps = {
  isLoading: boolean;
  data: { results: Result[]; statusCode: number } | undefined;
};

function Slider({ data, isLoading }: SliderProps) {
  // react hooks
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // effects
  useEffect(function toggleButtons() {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    function handleScroll() {
      const container = scrollContainerRef.current;
      if (!container) return;

      const isStart = container.scrollLeft === 0;
      const isEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth;

      setIsAtStart(isStart);
      setIsAtEnd(isEnd);
    }

    handleScroll();
    container.addEventListener("scroll", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // helpers
  function scroll(direction: "left" | "right") {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = direction === "left" ? -1200 : 1200;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }

  // handlers
  async function handleUpdateSearchMetrics(imdbId: string) {
    const apiClient = getApiClient({
      apiBaseUrl: "https://api.subt.is" as string,
    });

    await apiClient.v1.title.metrics.search.$patch({
      json: {
        imdbId,
      },
    });
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="relative w-full px-11 lg:px-0">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-scroll [scroll-snap-type:x_mandatory] [scroll-behavior:smooth] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-md gap-3 py-3 w-full"
      >
        {data?.results.map((title) => {
          if (!title.poster) return null;

          return (
            <Link
              key={title.value}
              to={`/subtitles/movie/${title.value}`}
              onClick={() => handleUpdateSearchMetrics(title.value)}
              className="box-content flex flex-none [scroll-snap-align:start] rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-zinc-700 hover:scale-105 transition-all ease-in-out will-change-transform"
            >
              <ThumbHashTrendingImage src={title.poster} hashUrl={title.posterThumbHash} alt={title.label} />
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll("left")}
        className={`z-50 absolute left-0 top-1/2 -translate-y-1/2 h-[336px] w-8 flex items-center justify-center ${
          isAtStart ? "opacity-0" : "opacity-100"
        } hidden lg:block bg-zinc-950/50 hover:bg-zinc-950/70 transition-colors`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="size-6 text-zinc-50" />
      </button>

      <button
        type="button"
        onClick={() => scroll("right")}
        className={`z-50 absolute right-0 top-1/2 -translate-y-1/2 h-[336px] w-8 flex items-center justify-center ${
          isAtEnd ? "opacity-0" : "opacity-100"
        } hidden lg:block bg-zinc-950/50 hover:bg-zinc-950/70 transition-colors`}
        aria-label="Scroll right"
      >
        <ChevronRight className="size-6 text-zinc-50" />
      </button>
    </div>
  );
}

type Props = {
  isLoading: boolean;
  data: { results: Result[]; statusCode: number } | undefined;
};

export function PosterTitles({ data, isLoading }: Props) {
  return (
    <section className="py-16 flex flex-col gap-32">
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
              <h3 className="text-zinc-50 text-3xl font-semibold">Títulos encontrados</h3>
            </div>
            <Slider data={data} isLoading={isLoading} />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
