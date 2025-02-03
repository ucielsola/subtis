import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { redirect, useLoaderData, useParams } from "@remix-run/react";
import { parseMedia } from "@remotion/media-parser";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { transformSrtTracks } from "srt-support-for-html5-videos";

// api
import { subtitleNormalizedSchema } from "@subtis/api/lib/parsers";

// shared
import { VideoDropzone } from "~/components/shared/video-dropzone";

// features
import { PosterDisclosure } from "~/features/movie/poster-disclosure";

// icons
import { CheckIcon } from "~/components/icons/check";
import { DownloadIcon } from "~/components/icons/download";
import { Play } from "~/components/icons/play";

// lib
import { apiClient } from "~/lib/api";
import { cn } from "~/lib/utils";

// hooks
import { useCinemas } from "~/hooks/use-cinemas";
import { usePlatforms } from "~/hooks/use-platforms";
import { useToast } from "~/hooks/use-toast";
import { useTeaser } from "~/hooks/use-teaser";

// ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import DotPattern from "~/components/ui/dot-pattern";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { ToastAction } from "~/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { bytes, fileName } = params;

  if (!bytes || !fileName) {
    throw new Error("Missing bytes or fileName");
  }

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

  const primarySubtitleData = await primarySubtitleResponse.json();

  const primarySubtitleParsedData = subtitleNormalizedSchema.safeParse(primarySubtitleData);

  if (primarySubtitleParsedData.error) {
    throw new Error("Invalid primary subtitle data");
  }

  return primarySubtitleParsedData.data;
};

// meta
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || "message" in data) {
    return [{ title: "Subtis" }, { name: "description", content: "¡Encontrá tus subtítulos rápidamente!" }];
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
  const loaderData = useLoaderData<typeof loader>();

  // react hooks
  const player = useRef<HTMLVideoElement>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);
  const [captionBlobUrl, setCaptionBlobUrl] = useState<string | null>(null);

  // query hooks
  const { data: titleTeaser } = useTeaser(fileName);
  const { data: titleCinemas } = useCinemas("message" in loaderData ? "" : loaderData.title.imdb_id);
  const { data: titlePlatforms } = usePlatforms("message" in loaderData ? "" : loaderData.title.imdb_id);

  // motion hooks
  const playControls = useAnimation();
  const downloadControls = useAnimation();

  const stremioTipControl = useAnimation();
  const internalVideoPlayerTipControl = useAnimation();
  const externalVideoPlayerTipControl = useAnimation();

  // toast hooks
  const { toast } = useToast();

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

      if ("message" in loaderData) {
        return;
      }

      fetchCaptions(loaderData.subtitle.subtitle_link);
    },
    [loaderData],
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

  useEffect(
    function throwErrorIfAudioCodecIsUnsupported() {
      async function throwErrorOnUnsupportedAudioCodec() {
        const videoSource = typeof window !== "undefined" && fileName ? localStorage.getItem(fileName) : null;

        if (!videoSource) {
          return;
        }

        try {
          const { audioCodec } = await parseMedia({
            src: videoSource,
            fields: { audioCodec: true },
          });

          if (!audioCodec) {
            setHasVideoError(true);
          }
        } catch (error) {
          setHasVideoError(true);
          console.error("Error parsing video:", error);
        }
      }

      throwErrorOnUnsupportedAudioCodec();
    },
    [fileName],
  );

  // handlers
  async function handleDownloadSubtitle() {
    if ("message" in loaderData) {
      return;
    }

    await apiClient.v1.subtitle.metrics.download.$patch({
      json: { titleSlug: loaderData.title.slug, subtitleId: loaderData.subtitle.id },
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
                `Encontré mis subtítulos para "${loaderData.title.title_name}" en @subt_is.`,
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
  const isAviFile = fileName?.endsWith(".avi");
  const isMkvFile = fileName?.endsWith(".mkv");
  const isMp4File = fileName?.endsWith(".mp4");
  const isSupportedFileExtension = isMp4File || isMkvFile || isAviFile;
  const videoType = isAviFile ? "video/avi" : "video/mp4";

  const videoSource = typeof window !== "undefined" && fileName ? localStorage.getItem(fileName) : null;
  const displayVideoElements = videoSource && captionBlobUrl && isSupportedFileExtension && !hasVideoError;

  if ("message" in loaderData) {
    return null;
  }

  // constants
  const { runtime } = loaderData.title;
  const totalHours = runtime ? Math.floor(runtime / 60) : null;
  const totalMinutes = runtime ? runtime % 60 : null;

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-xl w-full">
        <section className="flex flex-col gap-12">
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
              Descargá el siguiente subtítulo para disfrutar tu película subtitulada.
            </h2>
          </div>

          <article className="flex flex-row gap-4">
            {displayVideoElements ? (
              <Button
                size="sm"
                onClick={handlePlaySubtitle}
                onMouseEnter={() => playControls.start("animate")}
                onMouseLeave={() => playControls.start("normal")}
              >
                <Play size={18} controls={playControls} isWrapped={false} />
                Reproducir Video
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger className="cursor-not-allowed">
                  <Button
                    size="sm"
                    disabled
                    onClick={handlePlaySubtitle}
                    onMouseEnter={() => playControls.start("animate")}
                    onMouseLeave={() => playControls.start("normal")}
                  >
                    <Play size={18} controls={playControls} isWrapped={false} />
                    Reproducir Video
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">Tu navegador no soporta el video</TooltipContent>
              </Tooltip>
            )}
            <Button asChild variant="ghost" size="sm">
              <a
                download
                onClick={handleDownloadSubtitle}
                href={loaderData.subtitle.subtitle_link}
                onMouseEnter={() => downloadControls.start("animate")}
                onMouseLeave={() => downloadControls.start("normal")}
                className="hover:bg-zinc-800 bg-zinc-900 transition-all ease-in-out rounded-sm"
              >
                <DownloadIcon size={18} controls={downloadControls} />
                Descargar Subtítulo
              </a>
            </Button>
          </article>
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
            <source src={videoSource} type={videoType} />
            <track kind="subtitles" src={captionBlobUrl} srcLang="es" label="Español latino" default />
          </video>
        ) : null}

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">SubTips</h3>
            <h4 className="text-zinc-50 text-sm md:text-base">Para vivir una experiencia óptima, seguí estos tips.</h4>
          </div>
          <Tabs defaultValue="play-subtitle">
            <TabsList>
              <TabsTrigger value="play-subtitle" className="text-sm">
                ¿Cómo utilizo un subtítulo?
              </TabsTrigger>
            </TabsList>
            <TabsContent value="play-subtitle" className="mt-6 flex flex-col gap-4">
              <AnimatePresence>
                {displayVideoElements && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
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
                          Haz click en el botón de reproducir y disfrutá de tu película con el subtítulo ya integrado
                          sin hacer más nada.
                        </AlertDescription>
                      </div>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-4"
                onMouseEnter={() => externalVideoPlayerTipControl.start("animate")}
                onMouseLeave={() => externalVideoPlayerTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={24} controls={externalVideoPlayerTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar un reproductor de video...</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Recordá mover el archivo de subtítulo a la carpeta donde esté la película o, si prefieres,
                    reproducir la película y arrastrar el subtítulo al reproductor.
                  </AlertDescription>
                </div>
              </Alert>
              <Alert
                className="bg-zinc-950 border border-zinc-700 flex items-start gap-4"
                onMouseEnter={() => stremioTipControl.start("animate")}
                onMouseLeave={() => stremioTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={24} controls={stremioTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar Stremio...</AlertTitle>
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
                    oficial. En caso de que no quieras utilizar el add-on de Subtis, también podés arrastrar el
                    subtítulo al reproductor de Stremio.
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

      {loaderData.title.optimized_poster ? (
        <aside className="hidden lg:flex flex-1 justify-center">
          <PosterDisclosure
            src={loaderData.title.optimized_poster}
            alt={loaderData.title.title_name}
            hashUrl={loaderData.title.poster_thumbhash}
            title={loaderData.title.title_name}
            imdbId={loaderData.title.imdb_id}
            overview={loaderData.title.overview}
            rating={loaderData.title.rating}
            youtubeId={titleTeaser && !("message" in titleTeaser) ? titleTeaser.youTubeVideoId : null}
          />
        </aside>
      ) : null}
    </div>
  );
}
