import NumberFlow from "@number-flow/react";
import { useLoaderData } from "react-router";
import { useEffect, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

// internals
import type { loader } from "~/routes/home";

export function HomeStats() {
  // remix hooks
  const loaderData = useLoaderData<typeof loader>();

  // react hooks
  const [isAnimatingTitlesStats, setIsAnimatingTitlesStats] = useState<boolean>(false);

  // ts hooks
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 0.4,
  });

  // effects
  useEffect(
    function handleIntersection() {
      if (isIntersecting) {
        setIsAnimatingTitlesStats(true);
      }
    },
    [isIntersecting],
  );
  if ("message" in loaderData) {
    return null;
  }

  return (
    <section className="py-32 flex flex-col gap-16 items-center justify-center" ref={ref}>
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-50 text-4xl font-bold text-balance">Estadísticas</h2>
        <h3 className="text-zinc-400 text-balance max-w-[624px]">
          Explorá algunas de nuestras estadísticas y descubrí lo que hemos logrado hasta el momento.
        </h3>
      </div>
      <div className="flex flex-col md:flex-row flex-wrap gap-12 md:gap-4 max-w-screen-xl items-center justify-evenly w-full">
        <div className="flex flex-col items-center justify-center min-w-56">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isAnimatingTitlesStats ? loaderData.stats.total_titles : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isAnimatingTitlesStats}
          />
          <span className="text-zinc-400 text-xl pl-2.5">Películas</span>
        </div>
        <div className="flex flex-col items-center justify-center min-w-56">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isAnimatingTitlesStats ? loaderData.stats.total_subtitles : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isAnimatingTitlesStats}
          />
          <span className="text-zinc-400 text-xl pl-2.5">Subtítulos</span>
        </div>
        <div className="flex flex-col items-center justify-center min-w-56">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isAnimatingTitlesStats ? loaderData.stats.total_queried_times : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isAnimatingTitlesStats}
          />
          <span className="text-zinc-400 text-xl pl-2.5">Descargas</span>
        </div>
      </div>
    </section>
  );
}
