import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAnimation } from "motion/react";
import numeral from "numeral";
import { useQueryState } from "nuqs";
import { Fragment, useState } from "react";
import Highlighter from "react-highlight-words";
import { useCopyToClipboard } from "usehooks-ts";
import { z } from "zod";

// api
import { subtitlesResponseSchema } from "@subtis/api/controllers/subtitles/schemas";
import type { SubtitlesNormalized } from "@subtis/api/lib/parsers";

// indexer
import { getImdbLink } from "@subtis/indexer/imdb";

// shared
import { VideoDropzone } from "~/components/shared/video-dropzone";

// icons
import { CheckIcon } from "~/components/icons/check";
import { DownloadIcon } from "~/components/icons/download";

// lib
import { apiClient } from "~/lib/api";
import { cn } from "~/lib/utils";

// ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import DotPattern from "~/components/ui/dot-pattern";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ToastAction } from "~/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

// logos
import { IMDbLogo } from "~/components/logos/imdb";
import { JustWatchLogo } from "~/components/logos/justwatch";
import { LetterboxdLogo } from "~/components/logos/letterboxd";
import { RottenTomatoesLogo } from "~/components/logos/rottentomatoes";
import { YouTubeLogo } from "~/components/logos/youtube";

// features
import { PosterDisclosure } from "~/features/movie/poster-disclosure";

// hooks
import { useCinemas } from "~/hooks/use-cinemas";
import { useJustWatch } from "~/hooks/use-justwatch";
import { useLetterboxd } from "~/hooks/use-letterboxd";
import { usePlatforms } from "~/hooks/use-platforms";
import { useRottenTomatoes } from "~/hooks/use-rottentomatoes";
import { useTeaser } from "~/hooks/use-teaser";
import { useToast } from "~/hooks/use-toast";

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

  const primarySubtitleData = await primarySubtitleResponse.json();

  if (!primarySubtitleResponse.ok) {
    const primarySubtitleError = z.object({ message: z.string() }).safeParse(primarySubtitleData);

    if (primarySubtitleError.error) {
      throw new Error("Invalid primary subtitle data");
    }

    return primarySubtitleError.data;
  }

  const primarySubtitleParsedData = subtitlesResponseSchema.safeParse(primarySubtitleData);

  if (primarySubtitleParsedData.error) {
    throw new Error("Invalid primary subtitle data");
  }

  return primarySubtitleParsedData.data;
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
  const loaderData = useLoaderData<typeof loader>();

  // react hooks
  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useState<boolean>(
    typeof window !== "undefined" ? window.localStorage.getItem("advanced-mode") === "true" : false,
  );

  // nuqs hooks
  const [subtip, setSubtip] = useQueryState("subtip", {
    defaultValue: "message" in loaderData ? "" : loaderData.results.length > 1 ? "choose-subtitle" : "play-subtitle",
  });

  // toast hooks
  const { toast } = useToast();

  // ts hooks
  const [_copiedText, copy] = useCopyToClipboard();

  // helpers
  function triggerShareToast(): void {
    if ("message" in loaderData) {
      return;
    }

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
                `Encontré mis subtítulos para "${loaderData.title.title_name}" en @subt_is - #Subtis`,
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

  // handlers
  async function handleCopyEmailToClipboard(): Promise<void> {
    await copy("soporte@subtis.io");

    toast({
      title: "¡Email copiado a tu clipboard!",
      description: "Escribinos y te responderemos lo antes posible.",
    });
  }

  // handlers
  async function handleDownloadSubtitle({
    titleSlug,
    subtitleId,
  }: {
    titleSlug: string;
    subtitleId: number;
  }) {
    if ("message" in loaderData) {
      return;
    }

    await apiClient.v1.subtitle.metrics.download.$patch({
      json: { titleSlug, subtitleId },
    });

    triggerShareToast();
  }

  function handleToggleAdvancedMode(): void {
    setIsAdvancedModeEnabled((previousIsAdvancedModeEnabled) => {
      window.localStorage.setItem("advanced-mode", previousIsAdvancedModeEnabled === true ? "false" : "true");
      return !previousIsAdvancedModeEnabled;
    });
  }

  // query hooks
  const { data: titleCinemas } = useCinemas("message" in loaderData ? undefined : loaderData.title.slug);
  const { data: titlePlatforms } = usePlatforms("message" in loaderData ? undefined : loaderData.title.slug);

  const { data: titleTeaser, isLoading: isLoadingTeaser } = useTeaser(
    "message" in loaderData ? undefined : loaderData.results[0].subtitle.title_file_name,
  );
  const { data: titleJustWatch, isLoading: isLoadingJustWatch } = useJustWatch(
    "message" in loaderData ? undefined : loaderData.title.slug,
  );
  const { data: titleLetterboxd, isLoading: isLoadingLetterboxd } = useLetterboxd(
    "message" in loaderData ? undefined : loaderData.title.slug,
  );
  const { data: titleRottenTomatoes, isLoading: isLoadingRottenTomatoes } = useRottenTomatoes(
    "message" in loaderData ? undefined : loaderData.title.slug,
  );

  // motion hooks
  const videoTipControl = useAnimation();
  const stremioTipControl = useAnimation();
  const internalVideoPlayerTipControl = useAnimation();

  const formatTipControl = useAnimation();
  const publisherTipControl = useAnimation();
  const resolutionTipControl = useAnimation();

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
      accessorKey: "subtitle.external_id",
      header: "Fuente",
      enableSorting: false,
      cell: ({ row }) => {
        const { external_id } = row.original.subtitle;
        const { subtitle_group_name, website } = row.original.subtitle_group;

        if (subtitle_group_name === "SubDivX") {
          return (
            <div className="w-24">
              <a
                href={`${website}/${external_id}`}
                target="_blank"
                className="hover:underline"
                rel="noopener noreferrer"
              >
                {subtitle_group_name}
              </a>
            </div>
          );
        }

        if (subtitle_group_name === "SUBDL") {
          return (
            <div className="w-24">
              <a
                href={`${website}/s/info/${external_id}`}
                target="_blank"
                className="hover:underline"
                rel="noopener noreferrer"
              >
                {subtitle_group_name}
              </a>
            </div>
          );
        }

        if (subtitle_group_name === "OpenSubtitles") {
          return (
            <div className="w-24">
              <a
                href={`${website}/${external_id}`}
                target="_blank"
                className="hover:underline"
                rel="noopener noreferrer"
              >
                {subtitle_group_name}
              </a>
            </div>
          );
        }

        return external_id;
      },
    },
    {
      accessorKey: "subtitle.queried_times",
      header: "Descargas",
      enableSorting: false,
      cell: ({ row }) => {
        const { queried_times } = row.original.subtitle;

        if (typeof queried_times !== "number") {
          return 0;
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

        if ("message" in loaderData) {
          return null;
        }

        return (
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="h-8"
            onMouseEnter={() => controls.start("animate")}
            onMouseLeave={() => controls.start("normal")}
          >
            <a
              download
              onClick={() =>
                handleDownloadSubtitle({
                  titleSlug: loaderData.title.slug,
                  subtitleId: row.original.subtitle.id,
                })
              }
              href={row.original.subtitle.subtitle_link}
              className="hover:bg-zinc-800 bg-zinc-900 transition-all ease-in-out rounded-sm"
            >
              <DownloadIcon size={14} controls={controls} />
              Descargar
            </a>
          </Button>
        );
      },
    },
  ];

  if ("message" in loaderData) {
    return <div>No se encontraron subtítulos para esta película.</div>;
  }

  // constants
  const [mostDownloadedSubtitle] = loaderData.results;
  const { release_group_name } = mostDownloadedSubtitle.release_group;
  const { rip_type, resolution, title_file_name } = mostDownloadedSubtitle.subtitle;

  const { runtime } = loaderData.title;
  const totalHours = runtime ? Math.floor(runtime / 60) : null;
  const totalMinutes = runtime ? runtime % 60 : null;

  const resultsWithoutDuplication = loaderData.results.filter(
    (result, index, self) =>
      index ===
      self.findIndex(
        (r) =>
          r.subtitle.resolution === result.subtitle.resolution &&
          r.release_group.release_group_name === result.release_group.release_group_name &&
          r.subtitle.rip_type === result.subtitle.rip_type,
      ),
  );

  const isLoadingProviders = isLoadingTeaser || isLoadingJustWatch || isLoadingLetterboxd || isLoadingRottenTomatoes;

  return (
    <div className="pt-24 pb-44 flex flex-col lg:flex-row justify-between gap-4">
      <article>
        <section className={`flex flex-col gap-12 ${isAdvancedModeEnabled ? "max-w-screen-md" : "max-w-[630px]"}`}>
          <div className="flex flex-col gap-4">
            {loaderData.title.optimized_logo ? (
              <img
                src={loaderData.title.optimized_logo}
                alt={loaderData.title.title_name}
                className="w-full max-h-32 object-contain md:hidden mb-4"
              />
            ) : null}
            <div className="flex flex-col gap-2">
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold text-balance">
                {loaderData.title.title_name}
              </h1>
              <div className="flex flex-row gap-2">
                <Badge variant="outline">{loaderData.title.year}</Badge>
                <Badge variant="outline">{`${totalHours ? `${totalHours}h ` : ""}${totalMinutes ? `${totalMinutes}m` : ""}`}</Badge>
              </div>
            </div>
            <h2 className="text-zinc-50 text-balance text-sm md:text-base">
              Acomódate y disfrutá tu película subtitulada 🍿
            </h2>
          </div>
          <div>
            <div className="flex flex-row items-center gap-4">
              <Button asChild size="sm">
                <a
                  download
                  href={loaderData.results[0].subtitle.subtitle_link}
                  onMouseEnter={() => downloadControls.start("animate")}
                  onMouseLeave={() => downloadControls.start("normal")}
                  className={`transition-all ease-in-out duration-300 ${isAdvancedModeEnabled ? "opacity-30 pointer-events-none" : "opacity-100"}`}
                  onClick={triggerShareToast}
                >
                  <DownloadIcon size={18} controls={downloadControls} />
                  Descargar Subtítulo
                </a>
              </Button>
              <div className="flex items-center space-x-2">
                <Switch id="advanced-mode" checked={isAdvancedModeEnabled} onCheckedChange={handleToggleAdvancedMode} />
                <Label htmlFor="advanced-mode">Experto</Label>
              </div>
            </div>
            {isAdvancedModeEnabled ? (
              <div className="pt-12">
                <DataTable columns={columns} data={resultsWithoutDuplication} />
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
            ) : null}
          </div>
        </section>

        <section className="flex flex-col gap-12 mt-[74px] max-w-[630px]">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Sugerencias</h3>
            <h4 className="text-zinc-50 text-sm md:text-base">
              Para vivir una experiencia óptima, seguí estos consejos.
            </h4>
          </div>
          <Tabs
            onValueChange={setSubtip}
            value={loaderData.results.length > 1 && isAdvancedModeEnabled ? subtip : "play-subtitle"}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="play-subtitle" className="text-sm">
                ¿Cómo utilizo un subtítulo?
              </TabsTrigger>
              {loaderData.results.length > 1 && isAdvancedModeEnabled ? (
                <TabsTrigger value="choose-subtitle" className="text-sm">
                  ¿Cómo elijo un subtítulo?
                </TabsTrigger>
              ) : null}
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

        <Separator className="my-16 bg-zinc-700  max-w-[630px]" />

        <section className="flex flex-col gap-12  max-w-[630px]">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar nuevo subtítulo por archivo</h3>
            <h4 className="text-zinc-50 text-sm md:text-base">
              ¿Querés buscar un subtítulo nuevo? Arrastrá el archivo de video debajo.
            </h4>
          </div>
          <div className="bg-zinc-950 border border-zinc-700 hover:border-zinc-600 transition-all ease-in-out duration-300 rounded-sm group/video overflow-hidden h-80 relative">
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
            <Separator className="my-16 bg-zinc-700 max-w-[630px]" />
            <section className="flex flex-col gap-12 mt-16 max-w-[630px]">
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
            <Separator className="my-16 bg-zinc-700 max-w-[630px]" />
            <section className="flex flex-col gap-12 mt-16 max-w-[630px]  ">
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
      {loaderData.title.poster_thumbhash ? (
        <aside className="hidden lg:flex flex-1 flex-col items-center max-w-2xl">
          <div>
            <PosterDisclosure
              src={loaderData.title.optimized_poster}
              alt={loaderData.title.title_name}
              hashUrl={loaderData.title.poster_thumbhash}
              title={loaderData.title.title_name}
              overview={loaderData.title.overview}
              rating={loaderData.title.rating}
            />
            <div className="pt-8 px-2 flex flex-col gap-3">
              {isLoadingProviders ? (
                <Fragment>
                  <Skeleton className="w-[130px] h-5 bg-zinc-900 rounded-sm" />
                  <Skeleton className="w-[130px] h-5 bg-zinc-900 rounded-sm" />
                  <Skeleton className="w-[130px] h-5 bg-zinc-900 rounded-sm" />
                  <Skeleton className="w-[130px] h-5 bg-zinc-900 rounded-sm" />
                </Fragment>
              ) : (
                <Fragment>
                  {loaderData.title.imdb_id ? (
                    <a
                      href={getImdbLink(loaderData.title.imdb_id)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-row items-center gap-2 group/imdb"
                    >
                      <IMDbLogo
                        size={20}
                        className="fill-zinc-50 group-hover/imdb:fill-yellow-500 transition-all ease-in-out"
                      />
                      <span className="text-zinc-50 text-sm group-hover/imdb:text-yellow-500 transition-all ease-in-out">
                        IMDb
                      </span>
                    </a>
                  ) : null}
                  {titleTeaser && !("message" in titleTeaser) ? (
                    <a
                      href={`https://www.youtube.com/watch?v=${titleTeaser.youTubeVideoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-row items-center gap-2 group/trailer"
                    >
                      <YouTubeLogo
                        size={20}
                        className="fill-zinc-50 group-hover/trailer:fill-red-500 transition-all ease-in-out"
                      />
                      <span className="text-zinc-50 text-sm group-hover/trailer:text-red-500 transition-all ease-in-out">
                        Trailer
                      </span>
                    </a>
                  ) : null}
                  {titleJustWatch ? (
                    <a
                      href={titleJustWatch.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-row items-center gap-2 group/justwatch"
                    >
                      <JustWatchLogo
                        size={20}
                        className="fill-zinc-50 group-hover/justwatch:fill-amber-500 transition-all ease-in-out"
                      />
                      <span className="text-zinc-50 text-sm group-hover/justwatch:text-amber-500 transition-all ease-in-out">
                        JustWatch
                      </span>
                    </a>
                  ) : null}
                  {titleLetterboxd ? (
                    <a
                      href={titleLetterboxd.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-row items-center gap-2 group/letterboxd"
                    >
                      <LetterboxdLogo
                        size={20}
                        className="fill-zinc-50 group-hover/letterboxd:fill-blue-500 transition-all ease-in-out"
                      />
                      <span className="text-zinc-50 text-sm group-hover/letterboxd:text-blue-500 transition-all ease-in-out">
                        Letterboxd
                      </span>
                    </a>
                  ) : null}
                  {titleRottenTomatoes ? (
                    <a
                      href={titleRottenTomatoes.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex flex-row items-center gap-2 group/rottentomatoes"
                    >
                      <RottenTomatoesLogo
                        size={20}
                        className="fill-zinc-50 group-hover/rottentomatoes:fill-orange-500 transition-all ease-in-out"
                      />
                      <span className="text-zinc-50 text-sm group-hover/rottentomatoes:text-orange-500 transition-all ease-in-out">
                        Rotten Tomatoes
                      </span>
                    </a>
                  ) : null}
                </Fragment>
              )}
            </div>
          </div>
        </aside>
      ) : null}
    </div>
  );
}
