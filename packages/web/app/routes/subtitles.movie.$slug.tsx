import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import numeral from "numeral";
import { useQueryState } from "nuqs";
import { useState } from "react";
import Highlighter from "react-highlight-words";
import { type LoaderFunctionArgs, type MetaFunction, useLoaderData } from "react-router";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";
import { z } from "zod";

// api
import type { SubtitlesNormalized } from "@subtis/api/lib/parsers";
import { subtitlesResponseSchema } from "@subtis/api/routers/subtitles/schemas";

// shared
import { VideoDropzone } from "~/components/shared/video-dropzone";

// icons
import { Arrow } from "~/components/icons/arrow";
import { CheckIcon } from "~/components/icons/check";
import { CopyIcon } from "~/components/icons/copy";
import { DownloadIcon } from "~/components/icons/download";

// lib
import { apiClient } from "~/lib/api";
import { getUiCertification } from "~/lib/certifications";
import { getTotalTime } from "~/lib/duration";
import { cn } from "~/lib/utils";

// ui
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

// features
import { MoviePlatforms } from "~/features/movie/platforms";
import { PosterDisclosure } from "~/features/movie/poster-disclosure";
import { MovieProviders } from "~/features/movie/providers";

// helpers
function getResolutionRank(resolution: string): number {
  const ranks = {
    "480p": 1,
    "576p": 2,
    "720p": 3,
    "1080p": 4,
    "1440p": 5,
    "2160p": 6,
  };

  return ranks[resolution as keyof typeof ranks] ?? 0;
}

// meta
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || "message" in data) {
    return [
      { title: "Subtis" },
      { name: "description", content: "¡Encontrá tus subtítulos rápidamente!" },
      {
        name: "keywords",
        content: "subtítulos, películas, subtis, descargar subtítulos, subtítulos español, subtítulos sincronizados",
      },
      { name: "robots", content: "index, follow" },
      { name: "author", content: "Subtis" },
      {
        property: "og:title",
        content: "Subtis | Búsqueda por nombre de película",
      },
      {
        property: "og:description",
        content:
          "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Subtis" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@subt_is" },
      {
        name: "twitter:title",
        content: "Subtis | Búsqueda por nombre de película",
      },
      {
        name: "twitter:description",
        content:
          "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
      },
      { name: "twitter:image", content: "https://subtis.io/twitter.png" },
    ];
  }

  return [
    {
      title: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year})`,
    },
    {
      name: "description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    {
      name: "keywords",
      content: "subtítulos, películas, subtis, descargar subtítulos, subtítulos español, subtítulos sincronizados",
    },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Subtis" },
    {
      property: "og:title",
      content: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year})`,
    },
    {
      property: "og:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Subtis" },
    {
      property: "og:url",
      content: `https://subtis.io/subtitles/movie/${data.title.slug}`,
    },
    { property: "og:image", content: "https://subtis.io/og.png" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@subt_is" },
    {
      name: "twitter:title",
      content: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year})`,
    },
    {
      name: "twitter:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { name: "twitter:image", content: "https://subtis.io/twitter.png" },
  ];
};

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

export default function SubtitlesPage() {
  // remix hooks
  const loaderData = useLoaderData<typeof loader>();

  // react hooks
  const [isHoveringResolutionTip, setIsHoveringResolutionTip] = useState<boolean>(false);
  const [isHoveringFormatTip, setIsHoveringFormatTip] = useState<boolean>(false);
  const [isHoveringPublisherTip, setIsHoveringPublisherTip] = useState<boolean>(false);

  const [isAdvancedModeEnabled, setIsAdvancedModeEnabled] = useState<boolean>(
    typeof window !== "undefined" ? window.localStorage.getItem("advanced-mode") === "true" : false,
  );

  // nuqs hooks
  const [subtip, setSubtip] = useQueryState("subtip", {
    defaultValue: "message" in loaderData ? "" : loaderData.results.length > 1 ? "choose-subtitle" : "play-subtitle",
  });

  // ts hooks
  const [_copiedText, copy] = useCopyToClipboard();

  // helpers
  function triggerShareToast(): void {
    if ("message" in loaderData) {
      return;
    }

    toast("¡Disfrutá de tu subtítulo!", {
      description: (
        <p className="flex flex-row items-center gap-1">
          Compartí tu experiencia en <img src="/x.svg" alt="X" className="w-3 h-3" />
        </p>
      ),
      action: (
        <Button
          variant="outline"
          className="ml-3"
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
        </Button>
      ),
    });
  }

  // handlers
  async function handleCopyEmailToClipboard(): Promise<void> {
    await copy("soporte@subtis.io");

    toast.success("¡Email copiado al portapapeles!", {
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
    await fetch("/api/download", {
      method: "PATCH",
      body: JSON.stringify({ titleSlug, subtitleId }),
    });

    triggerShareToast();
  }

  function handleToggleAdvancedMode(): void {
    setIsAdvancedModeEnabled((previousIsAdvancedModeEnabled) => {
      window.localStorage.setItem("advanced-mode", previousIsAdvancedModeEnabled === true ? "false" : "true");
      return !previousIsAdvancedModeEnabled;
    });
  }

  // motion hooks
  const videoTipControl = useAnimation();
  const stremioTipControl = useAnimation();
  const downloadControls = useAnimation();
  const internalVideoPlayerTipControl = useAnimation();

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
      cell: ({ row, table }) => {
        const { resolution } = row.original.subtitle;
        const isFirstRow = table.getSortedRowModel().flatRows.findIndex((r) => r.id === row.id) === 0;

        if (resolution === "480p") {
          return (
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  "truncate cursor-default text-left",
                  isFirstRow && isHoveringResolutionTip && "text-amber-400",
                )}
              >
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">SD</TooltipContent>
            </Tooltip>
          );
        }

        if (resolution === "720p") {
          return (
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  "truncate cursor-default text-left",
                  isFirstRow && isHoveringResolutionTip && "text-amber-400",
                )}
              >
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">HD</TooltipContent>
            </Tooltip>
          );
        }

        if (resolution === "1080p") {
          return (
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  "truncate cursor-default text-left",
                  isFirstRow && isHoveringResolutionTip && "text-amber-400",
                )}
              >
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">Full HD</TooltipContent>
            </Tooltip>
          );
        }

        if (resolution === "1440p") {
          return (
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  "truncate cursor-default text-left",
                  isFirstRow && isHoveringResolutionTip && "text-amber-400",
                )}
              >
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">2K</TooltipContent>
            </Tooltip>
          );
        }

        if (resolution === "2160p") {
          return (
            <Tooltip>
              <TooltipTrigger
                className={cn(
                  "truncate cursor-default text-left",
                  isFirstRow && isHoveringResolutionTip && "text-amber-400",
                )}
              >
                {row.original.subtitle.resolution}
              </TooltipTrigger>
              <TooltipContent side="right">4K</TooltipContent>
            </Tooltip>
          );
        }

        return resolution;
      },
    },
    {
      accessorKey: "release_group.release_group_name",
      header: "Publicador",
      cell: ({ row, table }) => {
        const isFirstRow = table.getSortedRowModel().flatRows.findIndex((r) => r.id === row.id) === 0;

        return (
          <Tooltip>
            <TooltipTrigger
              className={cn(
                "truncate cursor-default text-left max-w-24",
                isFirstRow && isHoveringPublisherTip && "text-emerald-400",
              )}
            >
              {row.original.release_group.release_group_name}
            </TooltipTrigger>
            <TooltipContent side="right">{row.original.release_group.release_group_name}</TooltipContent>
          </Tooltip>
        );
      },
      enableSorting: false,
    },
    {
      accessorKey: "subtitle.rip_type",
      header: "Formato",
      enableSorting: false,
      cell: ({ row, table }) => {
        const { rip_type } = row.original.subtitle;
        const isFirstRow = table.getSortedRowModel().flatRows.findIndex((r) => r.id === row.id) === 0;

        return (
          <span className={cn("text-zinc-50", isFirstRow && isHoveringFormatTip && "text-indigo-400")}>
            {rip_type ?? "-"}
          </span>
        );
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
        // react hooks
        const [isCopied, setIsCopied] = useState<boolean>(false);

        // motion hooks
        const copyControls = useAnimation();
        const arrowControls = useAnimation();
        const checkControls = useAnimation();
        const downloadControls = useAnimation();

        if ("message" in loaderData) {
          return null;
        }

        // constants
        const { external_id, bytes, title_file_name } = row.original.subtitle;
        const { subtitle_group_name, website } = row.original.subtitle_group;

        const subDivXLink = `${website}/${external_id}`;
        const subDLLink = `${website}/s/info/${external_id}`;
        const opensubtitlesLink = `${website}/es/subtitles/legacy/${external_id}`;

        const externalLink =
          subtitle_group_name === "SubDivX"
            ? subDivXLink
            : subtitle_group_name === "SUBDL"
              ? subDLLink
              : subtitle_group_name === "OpenSubtitles"
                ? opensubtitlesLink
                : undefined;

        const internalLink = `https://subtis.io/subtitle/file/name/${bytes}/${title_file_name}`;

        // handlers
        async function handleCopyLinkToClipboard(): Promise<void> {
          setIsCopied(true);
          await navigator.clipboard.writeText(internalLink);

          setTimeout(() => {
            setIsCopied(false);
          }, 800);
        }

        function handleMouseEnterCopyLink(): void {
          if (isCopied) {
            return;
          }

          copyControls.start("animate");
        }

        function handleMouseLeaveCopyLink(): void {
          if (isCopied) {
            return;
          }

          copyControls.start("normal");
        }

        return (
          <div className="flex flex-row gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="secondary"
                  size="sm"
                  className="p-2 h-7"
                  onMouseEnter={() => downloadControls.start("animate")}
                  onMouseLeave={() => downloadControls.start("normal")}
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
                  >
                    <DownloadIcon size={18} controls={downloadControls} className="stroke-zinc-950" />
                  </a>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Descargar</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="secondary"
                  size="sm"
                  className="p-2 h-7 hover:bg-zinc-800 bg-zinc-800 hover:text-zinc-50 cursor-pointer"
                  onMouseEnter={handleMouseEnterCopyLink}
                  onMouseLeave={handleMouseLeaveCopyLink}
                  onClick={handleCopyLinkToClipboard}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {isCopied ? (
                      <motion.div
                        key="check"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CheckIcon controls={checkControls} size={18} className="stroke-zinc-100" />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="copy"
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <CopyIcon controls={copyControls} size={18} className="stroke-zinc-100" />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">Copiar enlace</TooltipContent>
            </Tooltip>
            {external_id ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="secondary"
                    size="sm"
                    className="p-2 h-7 hover:bg-zinc-800 bg-zinc-800 hover:text-zinc-50"
                    onMouseEnter={() => arrowControls.start("animate")}
                    onMouseLeave={() => arrowControls.start("normal")}
                  >
                    <a target="_blank" rel="noopener noreferrer" href={externalLink}>
                      <Arrow controls={arrowControls} size={18} className="stroke-zinc-100" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Ver en {subtitle_group_name}</TooltipContent>
              </Tooltip>
            ) : null}
          </div>
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
  const { uiText } = getTotalTime(runtime);

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

  return (
    <div className="pt-24 pb-44 flex flex-col lg:flex-row justify-between gap-4 relative">
      {loaderData.title.optimized_backdrop_main ? (
        <div className="absolute -top-[417px] -right-[700px] max-w-[1920px] opacity-40">
          <img
            src={loaderData.title.optimized_backdrop_main ?? ""}
            alt={loaderData.title.title_name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      ) : null}
      <article className="z-10">
        <section className="flex flex-col gap-12 max-w-screen-md">
          <div className="flex flex-col gap-4">
            {loaderData.title.optimized_logo ? (
              <img
                src={loaderData.title.optimized_logo}
                alt={loaderData.title.title_name}
                className="w-full max-h-32 object-contain md:hidden"
              />
            ) : null}
            <div className="flex flex-col gap-2">
              <div className="flex flex-row gap-2 justify-center md:justify-start">
                <Badge variant="outline">{loaderData.title.year}</Badge>
                {uiText ? <Badge variant="outline">{uiText}</Badge> : null}
                {loaderData.title.certification ? (
                  <Badge variant="outline">{getUiCertification(loaderData.title.certification)}</Badge>
                ) : null}
              </div>
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold text-balance hidden md:block">
                {loaderData.title.title_name}
              </h1>
            </div>
            <h2 className="text-zinc-300 text-balance text-sm md:text-base text-center md:text-left">
              🍿 Acomodate y disfrutá tu película subtitulada.
            </h2>
          </div>
          <div>
            <div className="flex flex-row items-center gap-4 justify-center md:justify-start">
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-4 justify-center md:justify-start">
                {isAdvancedModeEnabled ? (
                  <Tooltip>
                    <TooltipTrigger className=" cursor-not-allowed">
                      <Button size="sm" disabled className="transition-all ease-in-out duration-300 opacity-30">
                        <DownloadIcon size={18} controls={downloadControls} />
                        Descargar subtítulo
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">Desactivá el modo experto para habilitar</TooltipContent>
                  </Tooltip>
                ) : (
                  <Button asChild size="sm">
                    <a
                      download
                      href={loaderData.results[0].subtitle.subtitle_link}
                      onMouseEnter={() => downloadControls.start("animate")}
                      onMouseLeave={() => downloadControls.start("normal")}
                      className="transition-all ease-in-out duration-300 opacity-100"
                      onClick={() =>
                        handleDownloadSubtitle({
                          titleSlug: loaderData.title.slug,
                          subtitleId: loaderData.results[0].subtitle.id,
                        })
                      }
                    >
                      <DownloadIcon size={18} controls={downloadControls} />
                      Descargar subtítulo
                    </a>
                  </Button>
                )}
                <div className="flex items-center space-x-2">
                  <Switch
                    id="advanced-mode"
                    checked={isAdvancedModeEnabled}
                    onCheckedChange={handleToggleAdvancedMode}
                  />
                  <Label htmlFor="advanced-mode" className="cursor-pointer">
                    Modo experto
                  </Label>
                </div>
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
            <h4 className="text-zinc-300 text-sm md:text-base">Para una mejor experiencia, seguí estos consejos.</h4>
          </div>
          <Tabs
            onValueChange={setSubtip}
            value={loaderData.results.length > 1 && isAdvancedModeEnabled ? subtip : "play-subtitle"}
          >
            <TabsList className="mb-6">
              <TabsTrigger value="play-subtitle" className="text-sm">
                ¿Cómo uso el subtítulo?
              </TabsTrigger>
              {loaderData.results.length > 1 && isAdvancedModeEnabled ? (
                <TabsTrigger value="choose-subtitle" className="text-sm">
                  ¿Cómo elijo un subtítulo?
                </TabsTrigger>
              ) : null}
            </TabsList>

            <TabsContent value="choose-subtitle" className="mt-0">
              <div className="flex flex-col gap-4">
                <div
                  onMouseEnter={() => setIsHoveringResolutionTip(true)}
                  onMouseLeave={() => setIsHoveringResolutionTip(false)}
                >
                  <Alert className="bg-zinc-950 border border-zinc-800 flex items-start gap-6">
                    <span className="text-zinc-50 text-lg font-bold font-mono size-6">1</span>
                    <div className="pt-1">
                      <AlertTitle className="text-zinc-50">
                        Verificá que la resolución del subtítulo coincida con la del video
                      </AlertTitle>
                      <AlertDescription className="text-zinc-400 text-sm font-normal">
                        Por ejemplo, para el archivo{" "}
                        <Highlighter
                          highlightClassName={cn(
                            "bg-zinc-950 text-zinc-50 font-medium",
                            isHoveringResolutionTip && "text-amber-400",
                          )}
                          className="break-all"
                          searchWords={[resolution]}
                          autoEscape={true}
                          textToHighlight={`"${title_file_name}"`}
                        />{" "}
                        seleccioná en la tabla el subtítulo cuya resolución sea{" "}
                        <span className={cn("font-medium text-zinc-50", isHoveringResolutionTip && "text-amber-400")}>
                          {resolution}
                        </span>
                        .
                      </AlertDescription>
                    </div>
                  </Alert>
                </div>

                <div
                  onMouseEnter={() => setIsHoveringPublisherTip(true)}
                  onMouseLeave={() => setIsHoveringPublisherTip(false)}
                >
                  <Alert className="bg-zinc-950 border border-zinc-800 flex items-start gap-6">
                    <span className="text-zinc-50 text-lg font-bold font-mono size-6">2</span>
                    <div className="pt-1">
                      <AlertTitle className="text-zinc-50">Asegurate de que el publicador coincida</AlertTitle>
                      <AlertDescription className="text-zinc-400 text-sm font-normal">
                        Por ejemplo, para el archivo{" "}
                        <Highlighter
                          highlightClassName={cn(
                            "bg-zinc-950 text-zinc-50 font-medium",
                            isHoveringPublisherTip && "text-emerald-400",
                          )}
                          className="break-all"
                          searchWords={[release_group_name]}
                          autoEscape={true}
                          textToHighlight={`"${title_file_name}"`}
                        />{" "}
                        seleccioná en la tabla el subtítulo cuyo publicador sea{" "}
                        <span className={cn("font-medium text-zinc-50", isHoveringPublisherTip && "text-emerald-400")}>
                          {release_group_name}
                        </span>
                        .
                      </AlertDescription>
                    </div>
                  </Alert>
                </div>

                <div
                  onMouseEnter={() => setIsHoveringFormatTip(true)}
                  onMouseLeave={() => setIsHoveringFormatTip(false)}
                >
                  <Alert className="bg-zinc-950 border border-zinc-800 flex items-start gap-6">
                    <span className="text-zinc-50 text-lg font-bold font-mono size-6">3</span>
                    <div className="pt-1">
                      <AlertTitle className="text-zinc-50">
                        Revisá que el formato del subtítulo coincida con el del video
                      </AlertTitle>
                      <AlertDescription className="text-zinc-400 text-sm font-normal">
                        Por ejemplo, para el archivo{" "}
                        <Highlighter
                          highlightClassName={cn(
                            "bg-zinc-950 text-zinc-50 font-medium",
                            isHoveringFormatTip && "text-indigo-400",
                          )}
                          className="break-all"
                          searchWords={[rip_type ?? ""]}
                          autoEscape={true}
                          textToHighlight={`"${title_file_name}"`}
                        />{" "}
                        seleccioná en la tabla el subtítulo cuyo formato sea{" "}
                        <span className={cn("font-medium text-zinc-50", isHoveringFormatTip && "text-indigo-400")}>
                          {rip_type}
                        </span>
                        .
                      </AlertDescription>
                    </div>
                  </Alert>
                </div>
              </div>

              <p className="text-sm mt-2 text-zinc-400">
                Poné el cursor sobre los tips para ver qué parámetros afectan en la tabla.
              </p>
            </TabsContent>

            <TabsContent value="play-subtitle" className="flex flex-col gap-4 mt-0">
              <Alert
                className="bg-zinc-950 border border-zinc-800 flex items-start gap-3"
                onMouseEnter={() => videoTipControl.start("animate")}
                onMouseLeave={() => videoTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={22} controls={videoTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar otro reproductor de video</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Recordá mover el archivo del subtítulo a la carpeta donde esté la película o, si preferís, reproducí
                    la película y arrastrá el subtítulo al reproductor.
                  </AlertDescription>
                </div>
              </Alert>
              <Alert
                className="bg-zinc-950 border border-zinc-800 flex items-start gap-3"
                onMouseEnter={() => stremioTipControl.start("animate")}
                onMouseLeave={() => stremioTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={22} controls={stremioTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar Stremio</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Te recomendamos usar el{" "}
                    <a
                      href="https://stremio.subt.is"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:underline"
                    >
                      add-on
                    </a>{" "}
                    oficial. Si no querés usar el add-on de Subtis, también podés arrastrar el subtítulo al reproductor
                    de Stremio.
                  </AlertDescription>
                </div>
              </Alert>{" "}
              <Alert
                className="bg-zinc-950 border border-zinc-800 flex items-start gap-4"
                onMouseEnter={() => internalVideoPlayerTipControl.start("animate")}
                onMouseLeave={() => internalVideoPlayerTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={22} controls={internalVideoPlayerTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Probá el reproductor de video de Subtis...</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Si querés usar el reproductor de video de Subtis y tenés el archivo, arrastralo en la sección de acá
                    abajo.
                  </AlertDescription>
                </div>
              </Alert>
            </TabsContent>
          </Tabs>
        </section>

        <Separator className="my-16 bg-zinc-800  max-w-[630px]" />

        <section className="flex flex-col gap-12  max-w-[630px]">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar otro subtítulo por archivo</h3>
            <h4 className="text-zinc-300 text-sm md:text-base">
              ¿Querés buscar otro subtítulo? Arrastrá el archivo de video acá abajo.
            </h4>
          </div>
          <VideoDropzone />
        </section>

        <MoviePlatforms />
      </article>
      {loaderData.title.poster_thumbhash ? (
        <aside className="hidden lg:flex flex-1 flex-col items-center max-w-2xl z-10">
          <div>
            <PosterDisclosure
              src={loaderData.title.optimized_poster}
              alt={loaderData.title.title_name}
              hashUrl={loaderData.title.poster_thumbhash}
              title={loaderData.title.title_name}
              overview={loaderData.title.overview}
              rating={loaderData.title.rating}
              slug={loaderData.title.slug}
            />
            <MovieProviders />
          </div>
        </aside>
      ) : null}
    </div>
  );
}
