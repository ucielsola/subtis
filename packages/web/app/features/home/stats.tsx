import NumberFlow from "@number-flow/react";
import { Suspense, use } from "react";
import { useLoaderData } from "react-router";
import { useIntersectionObserver } from "usehooks-ts";

// internals
import type { loader } from "~/routes/home";

// api
import { statsSchema } from "@subtis/api/controllers/stats/schemas";

// ui
import { Skeleton } from "~/components/ui/skeleton";

// types
type Props = {
  statsPromise: ReturnType<typeof loader>["statsPromise"];
};

function StatsContainer({ statsPromise }: Props) {
  // react hooks
  const statsData = use(statsPromise);

  // constants
  const stats = statsSchema.parse(statsData);

  // ts hooks
  const { isIntersecting, ref } = useIntersectionObserver({ threshold: 0.3 });

  return (
    <section className="py-32 flex flex-col gap-16 items-center justify-center" ref={ref}>
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-50 text-4xl font-bold text-balance">Estadísticas</h2>
        <h3 className="text-zinc-400 text-balance max-w-[624px]">
          Explorá algunas de nuestras estadísticas y descubrí lo que hemos logrado hasta el momento.
        </h3>
      </div>
      <div className="flex flex-col md:flex-row flex-wrap gap-12 md:gap-4 max-w-screen-xl items-center justify-evenly w-full">
        <div className="flex flex-col items-center justify-center min-w-56 text-center">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isIntersecting ? stats.total_titles : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isIntersecting}
          />
          <span className="text-zinc-400 text-xl">Películas</span>
        </div>
        <div className="flex flex-col items-center justify-center min-w-56 text-center">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isIntersecting ? stats.total_subtitles : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isIntersecting}
          />
          <span className="text-zinc-400 text-xl">Subtítulos</span>
        </div>
        <div className="flex flex-col items-center justify-center min-w-56 text-center">
          <NumberFlow
            className="text-zinc-50 text-4xl font-bold text-balance"
            value={isIntersecting ? stats.total_queried_times : 0}
            format={{ signDisplay: "always" }}
            locales="es-AR"
            animated={isIntersecting}
          />
          <span className="text-zinc-400 text-xl">Descargas</span>
        </div>
      </div>
    </section>
  );
}

export function HomeStats() {
  // remix hooks
  const { statsPromise } = useLoaderData<typeof loader>();

  return (
    <Suspense
      fallback={
        <section className="py-32 flex flex-col gap-16 items-center justify-center">
          <div className="flex flex-col gap-4 items-center justify-center text-center">
            <h2 className="text-zinc-50 text-4xl font-bold text-balance">Estadísticas</h2>
            <h3 className="text-zinc-400 text-balance max-w-[624px]">
              Explorá algunas de nuestras estadísticas y descubrí lo que hemos logrado hasta el momento.
            </h3>
          </div>
          <div className="flex flex-col md:flex-row flex-wrap gap-12 md:gap-4 max-w-screen-xl items-center justify-evenly w-full">
            <div className="flex flex-col items-center justify-center min-w-56 text-center">
              <Skeleton className="w-[94px] h-[54px] rounded-sm" />
              <span className="text-zinc-400 text-xl">Películas</span>
            </div>
            <div className="flex flex-col items-center justify-center min-w-56 text-center">
              <Skeleton className="w-[94px] h-[54px] rounded-sm" />
              <span className="text-zinc-400 text-xl">Subtítulos</span>
            </div>
            <div className="flex flex-col items-center justify-center min-w-56 text-center">
              <Skeleton className="w-[94px] h-[54px] rounded-sm" />
              <span className="text-zinc-400 text-xl">Descargas</span>
            </div>
          </div>
        </section>
      }
    >
      <StatsContainer statsPromise={statsPromise} />
    </Suspense>
  );
}
