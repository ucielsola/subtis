import { useLoaderData } from "@remix-run/react";
import { Link } from "@remix-run/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

// routes
import type { loader } from "~/routes/_index";

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
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="inline-flex overflow-x-scroll [scroll-snap-type:x_mandatory] [scroll-behavior:smooth] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-md gap-3 py-3"
      >
        {trendingDownloadedTitles.results.map((title) => {
          if (!title.poster) return null;

          return (
            <Link
              key={title.id}
              to={`/subtitles/movie/${title.imdb_id}`}
              className="box-content flex flex-none [scroll-snap-align:start] rounded-md overflow-hidden cursor-pointer group/trending-card transition-all ease-in-out border-2 border-transparent hover:border-zinc-800"
            >
              <img
                alt={title.title_name}
                src={title.poster}
                className="w-56 h-[336px] object-cover group-hover/trending-card:scale-110 transition-all ease-in-out will-change-transform"
              />
            </Link>
          );
        })}
      </div>

      <button
        type="button"
        onClick={() => scroll("left")}
        className={`absolute -left-11 top-1/2 -translate-y-1/2 rounded-md h-[336px] w-8 flex items-center justify-center ${isAtStart ? "opacity-0" : "opacity-100"} hidden lg:block`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="size-6 text-zinc-50" />
      </button>

      <button
        type="button"
        onClick={() => scroll("right")}
        className={`absolute -right-11 top-1/2 -translate-y-1/2 rounded-md h-[336px] w-8 flex items-center justify-center ${isAtEnd ? "opacity-0" : "opacity-100"} hidden lg:block`}
        aria-label="Scroll right"
      >
        <ChevronRight className="size-6 text-zinc-50" />
      </button>
    </div>
  );
}
