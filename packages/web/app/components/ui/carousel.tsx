import * as React from "react";
import useEmblaCarousel, { type UseEmblaCarouselType } from "embla-carousel-react";
import { ArrowLeft, ArrowRight } from "lucide-react";

// lib
import { cn } from "~/lib/utils";

type CarouselApi = UseEmblaCarouselType[1];
type UseCarouselParameters = Parameters<typeof useEmblaCarousel>;
type CarouselOptions = UseCarouselParameters[0];
type CarouselPlugin = UseCarouselParameters[1];

type CarouselProps = {
  opts?: CarouselOptions;
  plugins?: CarouselPlugin;
  orientation?: "horizontal" | "vertical";
  setApi?: (api: CarouselApi) => void;
};

type CarouselContextProps = {
  carouselRef: ReturnType<typeof useEmblaCarousel>[0];
  api: ReturnType<typeof useEmblaCarousel>[1];
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);

  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }

  return context;
}

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & CarouselProps
>(({ orientation = "horizontal", opts, setApi, plugins, className, children, ...props }, ref) => {
  const [carouselRef, api] = useEmblaCarousel(
    {
      ...opts,
      axis: orientation === "horizontal" ? "x" : "y",
    },
    plugins
  );
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(false);

  const onSelect = React.useCallback((api: CarouselApi) => {
    if (!api) {
      return;
    }

    setCanScrollPrev(api.canScrollPrev());
    setCanScrollNext(api.canScrollNext());
  }, []);

  const scrollPrev = React.useCallback(() => {
    api?.scrollPrev();
  }, [api]);

  const scrollNext = React.useCallback(() => {
    api?.scrollNext();
  }, [api]);

  const handleKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        scrollPrev();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        scrollNext();
      }
    },
    [scrollPrev, scrollNext]
  );

  React.useEffect(() => {
    if (!api || !setApi) {
      return;
    }

    setApi(api);
  }, [api, setApi]);

  React.useEffect(() => {
    if (!api) {
      return;
    }

    onSelect(api);
    api.on("reInit", onSelect);
    api.on("select", onSelect);

    return () => {
      api?.off("select", onSelect);
    };
  }, [api, onSelect]);

  return (
    <CarouselContext.Provider
      value={{
        carouselRef,
        api: api,
        opts,
        orientation: orientation || (opts?.axis === "y" ? "vertical" : "horizontal"),
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
      }}
    >
      <div
        ref={ref}
        onKeyDownCapture={handleKeyDown}
        className={cn("relative group/carousel", className)}
        role="region"
        aria-roledescription="carousel"
        {...props}
      >
        {children}
      </div>
    </CarouselContext.Provider>
  );
});
Carousel.displayName = "Carousel";

const CarouselContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { carouselRef, orientation } = useCarousel();

    return (
      <div ref={carouselRef} className="overflow-hidden">
        <div
          ref={ref}
          className={cn(
            "flex",
            orientation === "horizontal" ? "-ml-4" : "-mt-4 flex-col",
            className
          )}
          {...props}
        />
      </div>
    );
  }
);
CarouselContent.displayName = "CarouselContent";

const CarouselItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const { orientation } = useCarousel();

    return (
      <div
        ref={ref}
        role="group"
        aria-roledescription="slide"
        className={cn(
          "min-w-0 shrink-0 grow-0 basis-full",
          orientation === "horizontal" ? "pl-4" : "pt-4",
          className
        )}
        {...props}
      />
    );
  }
);
CarouselItem.displayName = "CarouselItem";

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.HTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const { orientation, scrollPrev, canScrollPrev } = useCarousel();

  return (
    <button
      ref={ref}
      type="button"
      className={cn(
        "absolute flex items-center justify-center isolate group rounded-[6px] hover:cursor-pointer opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 z-10",
        orientation === "horizontal"
          ? "left-[-100px] group-hover/carousel:left-2 top-[10px] bottom-[10px] w-30"
          : "bottom-2 left-[10px] right-[10px] h-30 rotate-90",
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      {...props}
    >
      <div
        className={cn(
          " absolute inset-0 outline-[2px] rounded-[6px] overflow-hidden outline-black/10 outline-offset-[-2px] transition-all ease-in-out duration-300 group-hover:outline-white/60",
          orientation === "horizontal" ? "progressive-blur-left" : "progressive-blur-top"
        )}
      />
      <ArrowLeft
        className={cn(
          "h-4 w-4 stroke-zinc-300 relative z-10 transition-all ease-in-out duration-300 group-hover:stroke-white",
          orientation === "horizontal"
            ? "-translate-x-5 group-hover:-translate-x-6"
            : "translate-y-5 group-hover:translate-y-6"
        )}
      />
      <span className="sr-only">Diapositiva anterior</span>
    </button>
  );
});
CarouselPrevious.displayName = "CarouselPrevious";

const CarouselNext = React.forwardRef<HTMLButtonElement, React.HTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    const { orientation, scrollNext, canScrollNext } = useCarousel();

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "absolute flex items-center justify-center isolate group rounded-[6px] hover:cursor-pointer opacity-0 group-hover/carousel:opacity-100 transition-all duration-200 z-10",
          orientation === "horizontal"
            ? "right-[-100px] group-hover/carousel:right-2 top-[10px] bottom-[10px] w-30"
            : "top-2 left-[10px] right-[10px] h-30 rotate-90",
          className
        )}
        disabled={!canScrollNext}
        onClick={scrollNext}
        {...props}
      >
        <div
          className={cn(
            " absolute inset-0 outline-[2px] rounded-[6px] overflow-hidden outline-black/10 outline-offset-[-2px] transition-all ease-in-out duration-300 group-hover:outline-white/60",
            orientation === "horizontal" ? "progressive-blur-right" : "progressive-blur-bottom"
          )}
        />
        <ArrowRight
          className={cn(
            "h-4 w-4 stroke-zinc-300 relative z-10 transition-all ease-in-out duration-300 group-hover:stroke-white",
            orientation === "horizontal"
              ? "translate-x-5 group-hover:translate-x-6"
              : "-translate-y-5 group-hover:-translate-y-6"
          )}
        />
        <span className="sr-only">Siguiente diapositiva</span>
      </button>
    );
  }
);
CarouselNext.displayName = "CarouselNext";

export {
  type CarouselApi,
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
