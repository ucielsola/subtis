import { Link } from "@remix-run/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Result = {
  value: string;
  label: string;
  poster: string | null;
};

type SliderProps = {
  isLoading: boolean;
  data: { results: Result[]; statusCode: number } | undefined;
};

function Slider({ data, isLoading }: SliderProps) {
  // react hooks
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // effects
  useEffect(function checkOverflowAndButtons() {
    const container = scrollContainerRef.current;
    if (!container) return;

    function handleScroll() {
      const container = scrollContainerRef.current;
      if (!container) return;

      const hasHorizontalOverflow = container.scrollWidth > container.clientWidth;
      const isStart = container.scrollLeft === 0;
      const isEnd = container.scrollLeft + container.clientWidth >= container.scrollWidth;

      setHasOverflow(hasHorizontalOverflow);
      setIsAtStart(isStart);
      setIsAtEnd(isEnd);
    }

    handleScroll();
    container.addEventListener("scroll", handleScroll);
    // Also check on window resize
    window.addEventListener("resize", handleScroll);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, []);

  // helpers
  function scroll(direction: "left" | "right") {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = direction === "left" ? -1200 : 1200;
    container.scrollBy({ left: scrollAmount, behavior: "smooth" });
  }

  if (isLoading) {
    return <span>Loading...</span>;
  }

  if (!data) {
    return null;
  }

  return (
    <div className="relative">
      <div
        ref={scrollContainerRef}
        className="inline-flex overflow-x-scroll [scroll-snap-type:x_mandatory] [scroll-behavior:smooth] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-md gap-3 py-3"
      >
        {data.results.map((title) => {
          if (!title.poster) return null;

          return (
            <Link
              key={title.label}
              to={`/subtitles/movie/${title.value}`}
              className="box-content flex flex-none [scroll-snap-align:start] rounded-md overflow-hidden cursor-pointer group/trending-card transition-all ease-in-out border-2 border-transparent hover:border-zinc-700"
            >
              <img
                alt={title.label}
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
        className={`absolute -left-11 top-1/2 -translate-y-1/2 rounded-md h-[336px] w-8 flex items-center justify-center ${
          !hasOverflow || isAtStart ? "opacity-0" : "opacity-100"
        } hidden lg:block`}
        aria-label="Scroll left"
      >
        <ChevronLeft className="size-6 text-zinc-50" />
      </button>

      <button
        type="button"
        onClick={() => scroll("right")}
        className={`absolute -right-11 top-1/2 -translate-y-1/2 rounded-md h-[336px] w-8 flex items-center justify-center ${
          !hasOverflow || isAtEnd ? "opacity-0" : "opacity-100"
        } hidden lg:block`}
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
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-zinc-50 text-3xl font-semibold">Títulos encontrados</h3>
        </div>
        <Slider data={data} isLoading={isLoading} />
      </div>
    </section>
  );
}
