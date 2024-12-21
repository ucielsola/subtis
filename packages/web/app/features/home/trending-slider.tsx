import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// routes
import type { loader } from "~/routes/_index";

// internals
import { ThumbHashTrendingImage } from "./thumbhash-trending-image";

export function TrendingSlider() {
  // remix hooks
  const { trendingDownloadedTitles } = useLoaderData<typeof loader>();

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

  if ("message" in trendingDownloadedTitles) {
    return null;
  }

  return (
    <div className="relative w-full px-11 lg:px-0">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-scroll [scroll-snap-type:x_mandatory] [scroll-behavior:smooth] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-md gap-3 py-3 w-full"
      >
        {trendingDownloadedTitles.results.map((title) => {
          if (!title.poster) return null;

          return (
            <Link
              key={title.id}
              to={`/subtitles/movie/${title.imdb_id}`}
              className="box-content flex flex-none [scroll-snap-align:start] rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-zinc-700 hover:scale-105 transition-all ease-in-out will-change-transform"
            >
              <ThumbHashTrendingImage src={title.poster} hashUrl={title.poster_thumbhash} alt={title.title_name} />
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
