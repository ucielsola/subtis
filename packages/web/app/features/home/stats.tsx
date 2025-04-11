import NumberFlow from "@number-flow/react";
import { Suspense, use } from "react";
import { useLoaderData } from "react-router";
import { useIntersectionObserver } from "usehooks-ts";

// internals
import type { loader } from "~/routes/home";
import { Screen } from "./screen";

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
  const { isIntersecting, ref } = useIntersectionObserver({ threshold: 0.8, freezeOnceVisible: true });

  return (
    <section className="py-32 flex flex-col gap-16 items-center justify-center" ref={ref}>
      <Screen isGlowing={isIntersecting} />
      <div className="flex flex-col gap-8">
        <div className="flex flex-col gap-4 text-center">
          <h2 className="text-zinc-50 text-4xl font-bold text-balance">Estadísticas</h2>
          <h3 className="text-zinc-400 text-base">
            <NumberFlow
              className="text-purple-500"
              value={isIntersecting ? stats.total_titles : 0}
              format={{ signDisplay: "always" }}
              locales="es-AR"
              animated={isIntersecting}
            />{" "}
            peliculas catalogadas,{" "}
            <NumberFlow
              className="text-yellow-500"
              value={isIntersecting ? stats.total_subtitles : 0}
              format={{ signDisplay: "always" }}
              locales="es-AR"
              animated={isIntersecting}
            />{" "}
            subtítulos subidos,{" "}
            <NumberFlow
              className="text-emerald-500"
              value={isIntersecting ? stats.total_queried_times : 0}
              format={{ signDisplay: "always" }}
              locales="es-AR"
              animated={isIntersecting}
            />{" "}
            descargas totales
          </h3>
        </div>
        <div className="flex flex-row gap-6 items-center justify-center">
          <div className="flex flex-row gap-2 items-center">
            <div className="size-2 rounded-full bg-purple-500" />
            <span className="text-zinc-50">Películas</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="size-2 rounded-full bg-yellow-500" />
            <span className="text-zinc-50">Subtítulos</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="size-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-50">Descargas</span>
          </div>
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
          <Screen isGlowing={false} />
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-zinc-50 text-4xl font-bold text-balance">Estadísticas</h2>
              <div className="text-zinc-400 text-base flex flex-row gap-1">
                <Skeleton className="w-[40px] h-[19.5px] rounded-sm" /> peliculas catalogadas,{" "}
                <Skeleton className="w-[40px] h-[19.5px] rounded-sm" /> subtítulos subidos,{" "}
                <Skeleton className="w-[40px] h-[19.5px] rounded-sm" /> descargas totales
              </div>
            </div>
            <div className="flex flex-row gap-6 items-center justify-center">
              <div className="flex flex-row gap-2 items-center">
                <div className="size-2 rounded-full bg-purple-500" />
                <span className="text-zinc-50">Películas</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="size-2 rounded-full bg-yellow-500" />
                <span className="text-zinc-50">Subtítulos</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="size-2 rounded-full bg-emerald-500" />
                <span className="text-zinc-50">Descargas</span>
              </div>
            </div>
          </div>
        </section>
      }
    >
      {/* <NeverResolve /> */}
      <StatsContainer statsPromise={statsPromise} />
    </Suspense>
  );
}
