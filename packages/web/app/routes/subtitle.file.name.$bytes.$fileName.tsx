import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { redirect, useLoaderData, useParams } from "@remix-run/react";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, useAnimation } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { transformSrtTracks } from "srt-support-for-html5-videos";

// api
import type { SubtitleNormalized } from "@subtis/api";

// shared external
import { getApiClient } from "@subtis/shared";

// shared internal
import { VideoDropzone } from "~/components/shared/video-dropzone";

// icons
import { CheckIcon } from "~/components/icons/check";
import { DownloadIcon } from "~/components/icons/download";
import { Play } from "~/components/icons/play";

// lib
import { cn } from "~/lib/utils";

// hooks
import { useToast } from "~/hooks/use-toast";

// ui
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { DataTable } from "~/components/ui/data-table";
import DotPattern from "~/components/ui/dot-pattern";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ToastAction } from "~/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

// features
import { PosterDisclosure } from "~/features/movie/poster-disclosure";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { bytes, fileName } = params;

  if (!bytes || !fileName) {
    throw new Error("Missing bytes or fileName");
  }

  const apiClient = getApiClient({
    apiBaseUrl: "https://api.subt.is" as string,
  });

  const primarySubtitleResponse = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
    param: {
      bytes,
      fileName,
    },
  });

  if (primarySubtitleResponse.status === 404) {
    return redirect(`/real-time-search/${bytes}/${fileName}`);
  }

  if (!primarySubtitleResponse.ok) {
    return redirect(`/not-found/${bytes}/${fileName}`);
  }

  const primarySubtitle = await primarySubtitleResponse.json();

  return primarySubtitle;
};

// meta
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || "message" in data) {
    return [{ title: "Subtis" }, { name: "description", content: "¡Encontra tus subtítulos rápidamente!" }];
  }

  return [
    {
      title: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year}) | ${data.subtitle.title_file_name}`,
    },
    { name: "description", content: "Subtítutlos para todas tus películas" },
  ];
};

export default function SubtitlePage() {
  // remix hooks
  const { fileName } = useParams();
  const data = useLoaderData<typeof loader>();

  // react hooks
  const player = useRef<HTMLVideoElement>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);
  const [captionBlobUrl, setCaptionBlobUrl] = useState<string | null>(null);

  // query hooks
  const { data: titleCinemas } = useQuery({
    queryKey: ["title", "cinemas", fileName],
    queryFn: async () => {
      if ("message" in data) {
        return null;
      }

      const apiClient = getApiClient({
        apiBaseUrl: "https://api.subt.is",
      });

      const response = await apiClient.v1.title.cinemas[":imdbId"].$get({
        param: { imdbId: data.title.imdb_id },
      });

      const cinemas = await response.json();

      if ("message" in cinemas) {
        return null;
      }

      return cinemas;
    },
  });

  // motion hooks
  const videoTipControl = useAnimation();
  const stremioTipControl = useAnimation();

  // effects
  useEffect(
    function fetchSubtitle(): void {
      const fetchCaptions = async (subtitleUrl: string) => {
        try {
          const response = await fetch(subtitleUrl);

          if (!response.ok) {
            throw new Error("Failed to fetch captions");
          }

          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);

          setCaptionBlobUrl(blobUrl);
        } catch (error) {
          console.error("Error fetching captions:", error);
        }
      };

      if ("message" in data) {
        return;
      }

      fetchCaptions(data.subtitle.subtitle_link);
    },
    [data],
  );

  useEffect(
    function transformSrtTracksToVtt(): void {
      if (player.current && captionBlobUrl) {
        const hasTransformed = player.current.dataset.transformed;

        if (!hasTransformed) {
          transformSrtTracks(player.current);
          player.current.dataset.transformed = "true";
        }
      }
    },
    [captionBlobUrl],
  );

  useEffect(function listenFullscreenChange() {
    const pauseVideoOnExitFullscreen = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        player.current?.pause();
      }
    };

    document.addEventListener("fullscreenchange", pauseVideoOnExitFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", pauseVideoOnExitFullscreen);
    };
  }, []);

  // handlers
  async function handlePlaySubtitle(): Promise<void> {
    const videoElement = player.current;

    if (videoElement) {
      videoElement.play();
      await videoElement.requestFullscreen();

      setIsFullscreen(true);
    }
  }

  function handleVideoError(): void {
    setHasVideoError(true);
  }

  // constants
  const isSupportedFileExtension = fileName?.endsWith(".mp4") || fileName?.endsWith(".mkv");
  const videoSource = typeof window !== "undefined" && fileName ? localStorage.getItem(fileName) : null;
  const displayVideoElements = videoSource && captionBlobUrl && isSupportedFileExtension && !hasVideoError;

  const columns: ColumnDef<SubtitleNormalized>[] = [
    {
      accessorKey: "index",
      header: "#",
      cell: ({ row }) => {
        return <div className="w-6">{row.index + 1}</div>;
      },
    },
    {
      accessorKey: "subtitle.resolution",
      header: "Resolución",
    },
    {
      accessorKey: "release_group.release_group_name",
      header: "Publicador",
      cell: ({ row }) => {
        return (
          <Tooltip>
            <TooltipTrigger className="truncate max-w-24">
              {row.original.release_group.release_group_name}
            </TooltipTrigger>
            <TooltipContent>{row.original.release_group.release_group_name}</TooltipContent>
          </Tooltip>
        );
      },
    },
    {
      accessorKey: "subtitle.rip_type",
      header: "Formato",
    },
    {
      accessorKey: "subtitle.queried_times",
      header: "Descargas",
    },
    {
      accessorKey: "",
      header: "Acciones",
      cell: ({ row }) => {
        // motion hooks
        const playControls = useAnimation();
        const downloadControls = useAnimation();

        // toast hooks
        const { toast } = useToast();

        // handlers
        async function handleDownloadSubtitle() {
          const apiClient = getApiClient({
            apiBaseUrl: "https://api.subt.is" as string,
          });

          await apiClient.v1.subtitle.metrics.download.$patch({
            json: { imdbId: row.original.title.imdb_id, subtitleId: row.original.subtitle.id },
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
                      `Encontré mis subtítulos para "${row.original.title.title_name}" en @subt_is.`,
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

        return (
          <div className="flex flex-row items-center gap-1">
            <Tooltip delayDuration={0}>
              <TooltipTrigger className="px-1">
                <a
                  href={row.original.subtitle.subtitle_link}
                  download
                  onMouseEnter={() => downloadControls.start("animate")}
                  onMouseLeave={() => downloadControls.start("normal")}
                  onClick={handleDownloadSubtitle}
                >
                  <DownloadIcon size={16} controls={downloadControls} />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">Descargar subtítulo</TooltipContent>
            </Tooltip>
            <AnimatePresence>
              {displayVideoElements && (
                <Tooltip delayDuration={0}>
                  <TooltipTrigger
                    onClick={handlePlaySubtitle}
                    className="px-1"
                    onMouseEnter={() => playControls.start("animate")}
                    onMouseLeave={() => playControls.start("normal")}
                  >
                    <Play size={16} controls={playControls} isWrapped={false} />
                  </TooltipTrigger>
                  <TooltipContent side="bottom">Reproducir video</TooltipContent>
                </Tooltip>
              )}
            </AnimatePresence>
          </div>
        );
      },
    },
  ];

  if ("message" in data) {
    return null;
  }

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-xl w-full">
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            {"message" in data ? null : data.title.logo ? (
              <img
                src={data.title.logo}
                alt={data.title.title_name}
                className="w-full max-h-32 object-contain md:hidden mb-4"
              />
            ) : null}
            <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold">¡Subtítulo encontrado!</h1>
            <h2 className="text-zinc-50 text-balance text-sm md:text-base">
              Descarga el siguiente subtítulo para disfrutar tu película subtitulada.
            </h2>
          </div>
          <DataTable columns={columns} data={[data]} />
        </section>

        {displayVideoElements ? (
          // biome-ignore lint/a11y/useMediaCaption: track is defined but idk why
          <video
            controls
            ref={player}
            className="w-0 h-0"
            onError={handleVideoError}
            style={{ opacity: isFullscreen ? 1 : 0 }}
          >
            <source src={videoSource} type="video/mp4" />
            <track kind="subtitles" src={captionBlobUrl} srcLang="es" label="Español latino" default />
          </video>
        ) : null}

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar nuevo subtítulo por archivo</h3>
            <h4 className="text-zinc-400 text-sm md:text-base">
              ¿Querés buscar un subtítulo nuevo? Arrastra el archivo debajo.
            </h4>
          </div>
          <div className="bg-zinc-950 border border-zinc-700 rounded-sm group/video overflow-hidden h-64 relative">
            <VideoDropzone />
            <DotPattern
              className={cn(
                "[mask-image:radial-gradient(300px_circle_at_center,white,transparent)] opacity-40 backdrop-blur-md group-hover/video:opacity-60 group-hover/video:scale-105 transition-all ease-in-out",
              )}
            />
          </div>
        </section>

        <Separator className="my-16 bg-zinc-700" />

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">SubTips</h3>
            <h4 className="text-zinc-50 text-sm md:text-base">
              Te recomendamos algunos tips para una mejor experiencia
            </h4>
          </div>
          <Tabs defaultValue="play-subtitle">
            <TabsList>
              <TabsTrigger value="play-subtitle" className="text-xs md:text-sm">
                ¿Cómo utilizo un subtítulo?
              </TabsTrigger>
            </TabsList>
            <TabsContent value="play-subtitle" className="mt-6 flex flex-col gap-4">
              {displayVideoElements ? (
                <Alert
                  className="bg-zinc-950 border border-zinc-700 flex items-start gap-4"
                  onMouseEnter={() => videoTipControl.start("animate")}
                  onMouseLeave={() => videoTipControl.start("normal")}
                >
                  <CheckIcon size={24} controls={videoTipControl} />
                  <div className="pt-1">
                    <AlertTitle className="text-zinc-50">Proba con el reproductor de video de Subtis...</AlertTitle>
                    <AlertDescription className="text-zinc-400 text-sm font-normal">
                      Clickea en el botón de reproducir y disfrutá de tu película con el subtítulo ya integrado sin
                      hacer más nada.
                    </AlertDescription>
                  </div>
                </Alert>
              ) : null}
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-4"
                onMouseEnter={() => videoTipControl.start("animate")}
                onMouseLeave={() => videoTipControl.start("normal")}
              >
                <CheckIcon size={24} controls={videoTipControl} />
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar un reproductor de video...</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Recorda mover el archivo del subtítulo a donde esté tu carpeta o bien reproducir la película y
                    arrastrar el subtítulo al reproductor.
                  </AlertDescription>
                </div>
              </Alert>
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-4"
                onMouseEnter={() => stremioTipControl.start("animate")}
                onMouseLeave={() => stremioTipControl.start("normal")}
              >
                <CheckIcon size={24} controls={stremioTipControl} />
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar Stremio...</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Te recomendamos usar el add-on oficial, y en caso que no quieras utilizar el add-on de Subtis,
                    también podes arrastrar el subtítulo al reproductor de Stremio.
                  </AlertDescription>
                </div>
              </Alert>
            </TabsContent>
          </Tabs>
        </section>

        {titleCinemas ? (
          <Fragment>
            <Separator className="my-16 bg-zinc-700" />
            <section className="flex flex-col gap-12 mt-16">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold text-zinc-50">Cines</h3>
                <h4 className="text-zinc-50 text-sm md:text-base">Mira en que cines se esta proyectando la película</h4>
              </div>
              <ul className="flex flex-col gap-1 list-disc list-inside">
                {titleCinemas.cinemas.map((cinema) => (
                  <li key={cinema}>
                    <a
                      href={titleCinemas.link}
                      target="_blank"
                      rel="noreferrer"
                      className="text-zinc-50 text-sm hover:underline"
                    >
                      {cinema}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          </Fragment>
        ) : null}
      </article>
      {data.title.poster ? (
        <div className="hidden lg:flex flex-1 justify-center fixed">
          <PosterDisclosure
            src={data.title.poster}
            alt={data.title.title_name}
            hashUrl={data.title.poster_thumbhash}
            title={data.title.title_name}
            year={data.title.year}
            imdbId={data.title.imdb_id}
            overview={data.title.overview}
            rating={data.title.rating}
            runtime={data.title.runtime}
          />
        </div>
      ) : null}
    </div>
  );
}
