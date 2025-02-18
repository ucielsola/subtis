import NumberFlow from "@number-flow/react";
import { useLoaderData } from "@remix-run/react";
import { useEffect, useState } from "react";
import { useIntersectionObserver } from "usehooks-ts";

// internals
import type { loader } from "~/routes/_index";

export function HomeStats() {
  // remix hooks
  const loaderData = useLoaderData<typeof loader>();

  // react hooks
  const [isAnimatingTitlesStats, setIsAnimatingTitlesStats] = useState<boolean>(false);
  const [isAnimatingSubtitlesStats, setIsAnimatingSubtitlesStats] = useState<boolean>(false);
  const [isAnimatingQueriedTimesStats, setIsAnimatingQueriedTimesStats] = useState<boolean>(false);

  // ts hooks
  const { isIntersecting, ref } = useIntersectionObserver({
    threshold: 1,
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
    <section className="py-16 flex flex-col gap-16 items-center justify-center" ref={ref}>
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-50 text-4xl font-bold text-balance">Estadísticas</h2>
        <h3 className="text-zinc-400 text-balance max-w-[624px]">Mira algunas de las estadísticas de Subtis.</h3>
      </div>
      <div className="flex flex-row flex-wrap gap-4 max-w-screen-xl items-center justify-evenly w-full">
        <div className="flex flex-col items-center justify-center min-w-56c">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isAnimatingTitlesStats ? loaderData.stats.total_titles : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isAnimatingTitlesStats}
            onAnimationsFinish={() => setIsAnimatingSubtitlesStats(true)}
          />
          <span className="text-zinc-400 text-lg">Títulos</span>
        </div>
        <div className="flex flex-col items-center justify-center min-w-56c">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isAnimatingSubtitlesStats ? loaderData.stats.total_subtitles : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isAnimatingSubtitlesStats}
            onAnimationsFinish={() => setIsAnimatingQueriedTimesStats(true)}
          />
          <span className="text-zinc-400 text-lg">Subtítulos</span>
        </div>
        <div className="flex flex-col items-center justify-center min-w-56c">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isAnimatingQueriedTimesStats ? loaderData.stats.total_queried_times : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isAnimatingQueriedTimesStats}
          />
          <span className="text-zinc-400 text-lg">Descargas</span>
        </div>
      </div>
    </section>
  );
}
