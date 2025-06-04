import NumberFlow from "@number-flow/react";
import { Suspense, use } from "react";
import { useLoaderData } from "react-router";
import { useIntersectionObserver } from "usehooks-ts";

// internals
import type { loader } from "~/routes/home";
import { Screen } from "./screen";

// api
import { statsSchema } from "@subtis/api/routers/stats/schemas";

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
    <section className="py-32 flex flex-col gap-40 items-center justify-center" ref={ref}>
      <Screen isGlowing={isIntersecting} />
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-10 text-center">
          <h2 className="text-zinc-50 text-xs tracking-[3px] font-medium font-gillsans uppercase">Subtis en números</h2>
          <h3 className="text-zinc-400 text-base">
            <NumberFlow
              className="text-[#754AD6]"
              value={isIntersecting ? stats.total_titles : 0}
              format={{ signDisplay: "always" }}
              locales="es-AR"
              animated={isIntersecting}
            />{" "}
            películas en catálogo,{" "}
            <NumberFlow
              className="text-[#E1FB00]"
              value={isIntersecting ? stats.total_subtitles : 0}
              format={{ signDisplay: "always" }}
              locales="es-AR"
              animated={isIntersecting}
            />{" "}
            subtítulos subidos,{" "}
            <NumberFlow
              className="text-[#3AED61]"
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
            <div className="size-2 rounded-full bg-[#754AD6]" />
            <span className="text-zinc-50 text-xs">Películas</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="size-2 rounded-full bg-[#E1FB00]" />
            <span className="text-zinc-50 text-xs">Subtítulos</span>
          </div>
          <div className="flex flex-row gap-2 items-center">
            <div className="size-2 rounded-full bg-[#3AED61]" />
            <span className="text-zinc-50 text-xs">Descargas</span>
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
        <section className="py-32 flex flex-col gap-40 items-center justify-center">
          <Screen isGlowing={false} />
          <div className="flex flex-col gap-8">
            <div className="flex flex-col gap-4 text-center">
              <h2 className="text-zinc-50 text-xs tracking-[3px] font-medium font-gillsans uppercase">
                Subtis en números
              </h2>
              <div className="text-zinc-400 text-base flex flex-row gap-1">
                <Skeleton className="w-[40px] h-[19.5px] rounded-sm" /> películas en catálogo,{" "}
                <Skeleton className="w-[40px] h-[19.5px] rounded-sm" /> subtítulos cargados,{" "}
                <Skeleton className="w-[40px] h-[19.5px] rounded-sm" /> descargas.
              </div>
            </div>
            <div className="flex flex-row gap-6 items-center justify-center">
              <div className="flex flex-row gap-2 items-center">
                <div className="size-2 rounded-full bg-[#754AD6]" />
                <span className="text-zinc-50 text-xs">Películas</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="size-2 rounded-full bg-[#E1FB00]" />
                <span className="text-zinc-50 text-xs">Subtítulos</span>
              </div>
              <div className="flex flex-row gap-2 items-center">
                <div className="size-2 rounded-full bg-[#3AED61]" />
                <span className="text-zinc-50 text-xs">Descargas</span>
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
