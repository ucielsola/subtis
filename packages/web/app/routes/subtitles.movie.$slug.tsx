import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAnimation } from "motion/react";
import numeral from "numeral";
import { useQueryState } from "nuqs";
import { Fragment } from "react";
import Highlighter from "react-highlight-words";

// api
import type { SubtitlesNormalized } from "@subtis/api";

// shared internal
import { VideoDropzone } from "~/components/shared/video-dropzone";

// icons
import { CheckIcon } from "~/components/icons/check";
import { DownloadIcon } from "~/components/icons/download";

// lib
import { apiClient } from "~/lib/api";
import { cn } from "~/lib/utils";

// hooks
import { useToast } from "~/hooks/use-toast";

// ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import DotPattern from "~/components/ui/dot-pattern";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ToastAction } from "~/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

// features
import { PosterDisclosure } from "~/features/movie/poster-disclosure";

// hooks
import { useCinemas } from "~/hooks/use-cinemas";
import { usePlatforms } from "~/hooks/use-platforms";

// helpers
function getResolutionRank(resolution: string): number {
  const ranks = {
    "480p": 1,
    "720p": 2,
    "1080p": 3,
    "2160p": 4,
  };

  return ranks[resolution as keyof typeof ranks] ?? 0;
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { slug } = params;

  if (!slug) {
    throw new Error("Missing slug");
  }

  const primarySubtitleResponse = await apiClient.v1.subtitles.movie[":slug"].$get({
    param: { slug },
  });

  if (!primarySubtitleResponse.ok) {
    throw new Error("Failed to fetch primary subtitle");
  }

  const primarySubtitle = await primarySubtitleResponse.json();

  return primarySubtitle;
};

// meta
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || "message" in data) {
    return [{ title: "Subtis" }, { name: "description", content: "Encontrá tus subtítulos rápidamente!" }];
  }

  return [
    { title: `Subtis | Subtítutlos para ${data.title.title_name} (${data.title.year})` },
    { name: "description", content: "Subtítutlos para todas tus películas" },
  ];
};

export default function SubtitlesPage() {
  // remix hooks
  const data = useLoaderData<typeof loader>();

  // nuqs hooks
  const [subtip, setSubtip] = useQueryState("subtip", {
    defaultValue: "message" in data ? "" : data.results.length > 1 ? "choose-subtitle" : "play-subtitle",
  });

  // toast hooks
  const { toast } = useToast();

  // handlers
  function handleCopyEmailToClipboard() {
    navigator.clipboard.writeText("soporte@subtis.io");

    toast({
      title: "¡Email copiado a tu clipboard!",
      description: "Escribinos y te responderemos lo antes posible.",
    });
  }

  // handlers
  async function handleDownloadSubtitle({
    imdbId,
    subtitleId,
    titleName,
  }: {
    imdbId: string;
    subtitleId: number;
    titleName: string;
  }) {
    if ("message" in data) {
      return;
    }

    await apiClient.v1.subtitle.metrics.download.$patch({
      json: { imdbId, subtitleId },
    });

    toast({
      title: "¡Disfruta de tu subtítulo!",
      description: (
        <p className="flex flex-row items-center gap-1">
          Compartí tu experiencia en <img src="/x.svg" alt="X" className="w-3 h-3" />
        </p>
      ),
      action: (
        <ToastAction
          altText="Compartir"
          onClick={() => {
            window.open(
              `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                `Encontré mis subtítulos para "${titleName}" en @subt_is.`,
              )}`,
              "_blank",
            );
          }}
        >
          Compartir
        </ToastAction>
      ),
    });
  }

  // query hooks
  const { data: titleCinemas } = useCinemas("message" in data ? undefined : data.title.imdb_id);
  const { data: titlePlatforms } = usePlatforms("message" in data ? undefined : data.title.imdb_id);

  // motion hooks
  const videoTipControl = useAnimation();
  const stremioTipControl = useAnimation();
  const internalVideoPlayerTipControl = useAnimation();

  const formatTipControl = useAnimation();
  const resolutionTipControl = useAnimation();
  const publisherTipControl = useAnimation();

  const downloadControls = useAnimation();

  // constants
  const columns: ColumnDef<SubtitlesNormalized>[] = [
    {
      accessorKey: "index",
      header: () => <th>#</th>,
      cell: ({ row, table }) => {
        const rowNumber = table.getSortedRowModel().flatRows.findIndex((r) => r.id === row.id) + 1;
        return <div className="w-2">{rowNumber}</div>;
      },
      enableSorting: false,
    },
    {
      accessorKey: "subtitle.resolution",
      header: "Resolución",
      enableSorting: true,
      sortingFn: (rowA, rowB) => {
        const resA = getResolutionRank(rowA.original.subtitle.resolution);
        const resB = getResolutionRank(rowB.original.subtitle.resolution);
        return resA - resB;
      },
      cell: ({ row }) => {
        if (row.original.subtitle.resolution === "480p") {
          return (
            <Tooltip>
              <TooltipTrigger className="truncate cursor-default text-left">
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">SD</TooltipContent>
            </Tooltip>
          );
        }

        if (row.original.subtitle.resolution === "720p") {
          return (
            <Tooltip>
              <TooltipTrigger className="truncate cursor-default text-left">
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">HD</TooltipContent>
            </Tooltip>
          );
        }

        if (row.original.subtitle.resolution === "1080p") {
          return (
            <Tooltip>
              <TooltipTrigger className="truncate cursor-default text-left">
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">Full HD</TooltipContent>
            </Tooltip>
          );
        }

        if (row.original.subtitle.resolution === "2160p") {
          return (
            <Tooltip>
              <TooltipTrigger className="truncate cursor-default text-left">
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">4K</TooltipContent>
            </Tooltip>
          );
        }

        return row.original.subtitle.resolution;
      },
    },
    {
      accessorKey: "release_group.release_group_name",
      header: "Publicador",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger className="truncate w-20 cursor-default text-left">
              {row.original.release_group.release_group_name}
            </TooltipTrigger>
            <TooltipContent side="bottom">{row.original.release_group.release_group_name}</TooltipContent>
          </Tooltip>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "subtitle.rip_type",
      header: "Formato",
      enableSorting: false,
    },
    {
      accessorKey: "subtitle.queried_times",
      header: "Descargas",
      enableSorting: false,
      cell: ({ row }) => {
        const { queried_times } = row.original.subtitle;

        if (typeof queried_times !== "number") {
          return null;
        }

        if (queried_times < 1000) {
          return queried_times;
        }

        return numeral(queried_times).format("0.0a");
      },
    },
    {
      accessorKey: "",
      header: "Acciones",
      enableSorting: false,
      cell: ({ row }) => {
        // motion hooks
        const controls = useAnimation();

        if ("message" in data) {
          return null;
        }

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <a
                href={row.original.subtitle.subtitle_link}
                download
                className="inline-flex items-center p-1"
                onMouseEnter={() => controls.start("animate")}
                onMouseLeave={() => controls.start("normal")}
                onClick={() =>
                  handleDownloadSubtitle({
                    imdbId: data.title.imdb_id,
                    titleName: data.title.title_name,
                    subtitleId: row.original.subtitle.id,
                  })
                }
                aria-label="Descargar subtítulo"
              >
                <DownloadIcon size={18} controls={controls} />
              </a>
            </TooltipTrigger>
            <TooltipContent side="right">Descargar subtítulo</TooltipContent>
          </Tooltip>
        );
      },
    },
  ];

  const [mostDownloadedSubtitle] = "message" in data ? [] : data.results;
  const { release_group_name } = mostDownloadedSubtitle.release_group;
  const { rip_type, resolution, title_file_name } = mostDownloadedSubtitle.subtitle;

  return (
    <div className="pt-24 pb-44 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-xl w-full">
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            {"message" in data ? null : data.title.optimized_logo ? (
              <img
                src={data.title.optimized_logo}
                alt={data.title.title_name}
                className="w-full max-h-32 object-contain md:hidden mb-4"
              />
            ) : null}
            {"message" in data ? null : (
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold text-balance">
                {data.title.title_name} ({data.title.year})
              </h1>
            )}
            {"message" in data ? null : (
              <h2 className="text-zinc-50 text-balance text-sm md:text-base">
                Encontrá tu subtítulo en la siguiente tabla debajo.
              </h2>
            )}
          </div>
          {"message" in data ? null : data.results.length > 1 ? (
            <div>
              <DataTable columns={columns} data={data.results} />
              <p className="text-sm mt-2 text-zinc-400">
                Si no encontrás tu subtítulo acá, podés escribirnos a{" "}
                <button
                  type="button"
                  onClick={handleCopyEmailToClipboard}
                  className="underline hover:text-zinc-50 transition-all ease-in-out text-zinc-300"
                >
                  soporte@subtis.io
                </button>
              </p>
            </div>
          ) : (
            <Button asChild variant="ghost" size="sm">
              <a
                download
                href={data.results[0].subtitle.subtitle_link}
                onMouseEnter={() => downloadControls.start("animate")}
                onMouseLeave={() => downloadControls.start("normal")}
                onClick={() =>
                  handleDownloadSubtitle({
                    imdbId: data.title.imdb_id,
                    titleName: data.title.title_name,
                    subtitleId: data.results[0].subtitle.id,
                  })
                }
                className="hover:bg-zinc-800 bg-zinc-900 transition-all ease-in-out rounded-sm w-fit"
              >
                <DownloadIcon size={18} controls={downloadControls} />
                Descargar Subtítulo
              </a>
            </Button>
          )}
        </section>

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">SubTips</h3>
            <h4 className="text-zinc-50 text-sm md:text-base">Para vivir una experiencia óptima, seguí estos tips.</h4>
          </div>
          <Tabs value={subtip ?? undefined} onValueChange={setSubtip}>
            <TabsList className="mb-6">
              {"message" in data ? null : data.results.length > 1 ? (
                <TabsTrigger value="choose-subtitle" className="text-sm">
                  ¿Cómo elijo un subtítulo?
                </TabsTrigger>
              ) : null}
              <TabsTrigger value="play-subtitle" className="text-sm">
                ¿Cómo utilizo un subtítulo?
              </TabsTrigger>
            </TabsList>

            <TabsContent value="choose-subtitle" className="flex flex-col gap-4 mt-0">
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-6"
                onMouseEnter={() => resolutionTipControl.start("animate")}
                onMouseLeave={() => resolutionTipControl.start("normal")}
              >
                <span className="text-zinc-50 text-lg font-bold font-mono size-6">1</span>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">
                    Verificá que la resolución del subtítulo coincida con la del video
                  </AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Por ejemplo para el archivo{" "}
                    <Highlighter
                      highlightClassName="bg-zinc-950 text-zinc-50 font-medium"
                      className="break-all"
                      searchWords={[resolution]}
                      autoEscape={true}
                      textToHighlight={`"${title_file_name}"`}
                    />{" "}
                    seleccioná en la tabla el subtítulo cuya resolución sea{" "}
                    <span className="font-medium text-zinc-50">{resolution}</span>.
                  </AlertDescription>
                </div>
              </Alert>
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-6"
                onMouseEnter={() => formatTipControl.start("animate")}
                onMouseLeave={() => formatTipControl.start("normal")}
              >
                <span className="text-zinc-50 text-lg font-bold font-mono size-6">2</span>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">
                    Revisá que el formato del subtítulo coincida con el del video
                  </AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Por ejemplo para el archivo{" "}
                    <Highlighter
                      highlightClassName="bg-zinc-950 text-zinc-50 font-medium"
                      className="break-all"
                      searchWords={[rip_type ?? ""]}
                      autoEscape={true}
                      textToHighlight={`"${title_file_name}"`}
                    />{" "}
                    seleccioná en la tabla el subtítulo cuyo formato sea{" "}
                    <span className="font-medium text-zinc-50">{rip_type}</span>.
                  </AlertDescription>
                </div>
              </Alert>
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-6"
                onMouseEnter={() => publisherTipControl.start("animate")}
                onMouseLeave={() => publisherTipControl.start("normal")}
              >
                <span className="text-zinc-50 text-lg font-bold font-mono size-6">3</span>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Asegurate que el publicador coincida correctamente</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Por ejemplo para el archivo{" "}
                    <Highlighter
                      highlightClassName="bg-zinc-950 text-zinc-50 font-medium"
                      className="break-all"
                      searchWords={[release_group_name]}
                      autoEscape={true}
                      textToHighlight={`"${title_file_name}"`}
                    />{" "}
                    seleccioná en la tabla el subtítulo cuyo publicador sea{" "}
                    <span className="font-medium text-zinc-50">{release_group_name}</span>.
                  </AlertDescription>
                </div>
              </Alert>
            </TabsContent>

            <TabsContent value="play-subtitle" className="flex flex-col gap-4 mt-0">
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-3"
                onMouseEnter={() => videoTipControl.start("animate")}
                onMouseLeave={() => videoTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={24} controls={videoTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar un reproductor de video</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Recordá mover el archivo del subtítulo a donde esté tu carpeta o bien reproducir la película y
                    arrastrar el subtítulo al reproductor.
                  </AlertDescription>
                </div>
              </Alert>
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-3"
                onMouseEnter={() => stremioTipControl.start("animate")}
                onMouseLeave={() => stremioTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={24} controls={stremioTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar Stremio</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Te recomendamos usar el{" "}
                    <a
                      href="stremio://stremio.subt.is/manifest.json
"
                      target="_blank"
                      className="text-zinc-300 hover:text-zinc-50 hover:underline"
                      rel="noreferrer"
                    >
                      add-on
                    </a>{" "}
                    oficial, y en caso que no quieras utilizar el add-on de Subtis, también podés arrastrar el subtítulo
                    al reproductor de Stremio.
                  </AlertDescription>
                </div>
              </Alert>{" "}
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-4"
                onMouseEnter={() => internalVideoPlayerTipControl.start("animate")}
                onMouseLeave={() => internalVideoPlayerTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={24} controls={internalVideoPlayerTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Probá con el reproductor de video de Subtis...</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Si quisieras utilizar el reproductor de video de Subtis, y contas con el archivo de video,
                    arrastralo en la sección debajo.
                  </AlertDescription>
                </div>
              </Alert>
            </TabsContent>
          </Tabs>
        </section>

        <Separator className="my-16 bg-zinc-700" />

        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar nuevo subtítulo por archivo</h3>
            <h4 className="text-zinc-50 text-sm md:text-base">
              ¿Querés buscar un subtítulo nuevo? Arrastrá el archivo de video debajo.
            </h4>
          </div>
          <div className="bg-zinc-950 border border-zinc-700 hover:border-zinc-600 transition-all ease-in-out duration-300 rounded-sm group/video overflow-hidden h-64 relative">
            <VideoDropzone />
            <DotPattern
              className={cn(
                "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)] opacity-40 backdrop-blur-md group-hover/video:opacity-60 group-hover/video:scale-105 transition-all ease-in-out",
              )}
            />
          </div>
        </section>

        {titleCinemas ? (
          <Fragment>
            <Separator className="my-16 bg-zinc-700" />
            <section className="flex flex-col gap-12 mt-16">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold text-zinc-50">Cines</h3>
                <h4 className="text-zinc-50 text-sm md:text-base">
                  Mirá en que cines se está proyectando la película.
                </h4>
              </div>
              <div className="flex flex-col gap-4">
                {Object.entries(titleCinemas.cinemas).map(([city, cinemas]) => {
                  return (
                    <Accordion key={city} type="single" collapsible className="w-full">
                      <AccordionItem value={city}>
                        <AccordionTrigger>{city}</AccordionTrigger>
                        <AccordionContent>
                          <ul className="flex flex-col list-disc list-inside pl-4 pt-1 gap-1">
                            {cinemas.map((cinema) => (
                              <li key={cinema.name}>
                                <a
                                  href={titleCinemas.link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-zinc-50 text-sm hover:underline"
                                >
                                  {cinema.name}
                                </a>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  );
                })}
              </div>
            </section>
          </Fragment>
        ) : null}

        {titlePlatforms && titlePlatforms.platforms.length > 0 ? (
          <Fragment>
            <Separator className="my-16 bg-zinc-700" />
            <section className="flex flex-col gap-12 mt-16">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold text-zinc-50">Plataformas</h3>
                <h4 className="text-zinc-50 text-sm md:text-base">
                  También podés disfrutar de la película en las siguientes plataformas.
                </h4>
              </div>
              <ul className="flex flex-col list-disc list-inside">
                {titlePlatforms.platforms.map((platform) => (
                  <li key={platform.name}>
                    <a
                      href={platform.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-50 text-sm hover:underline"
                    >
                      {platform.name}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </Fragment>
        ) : null}
      </article>
      {"message" in data ? null : data.title.poster_thumbhash ? (
        <aside className="hidden lg:flex flex-1 justify-center">
          <PosterDisclosure
            src={data.title.optimized_poster}
            alt={data.title.title_name}
            hashUrl={data.title.poster_thumbhash}
            title={data.title.title_name}
            year={data.title.year}
            imdbId={data.title.imdb_id}
            overview={data.title.overview}
            rating={data.title.rating}
            runtime={data.title.runtime}
          />
        </aside>
      ) : null}
    </div>
  );
}
