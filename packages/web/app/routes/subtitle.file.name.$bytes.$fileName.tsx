import { parseMedia } from "@remotion/media-parser";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useEffect, useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect, useLoaderData, useParams } from "react-router";
import { toast } from "sonner";
import { transformSrtTracks } from "srt-support-for-html5-videos";

// api
import { subtitleNormalizedSchema } from "@subtis/api/lib/parsers";

// shared
import { VideoDropzone } from "~/components/shared/video-dropzone";

// features
import { MoviePlatforms } from "~/features/movie/platforms";
import { PosterDisclosure } from "~/features/movie/poster-disclosure";

// icons
import { CheckIcon } from "~/components/icons/check";
import { DownloadIcon } from "~/components/icons/download";
import { Play } from "~/components/icons/play";

// lib
import { apiClient } from "~/lib/api";
import { getUiCertification } from "~/lib/certifications";
import { getTotalTime } from "~/lib/duration";

// ui
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
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
export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
  const { bytes, fileName } = params;

  if (!data || "message" in data) {
    return [
      { title: "Subtis" },
      { name: "description", content: "¡Encontrá tus subtítulos rápidamente!" },
      {
        name: "description",
        content:
          "Subtítulos para todas tus películas. Buscador de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
      },
      {
        name: "keywords",
        content: "subtítulos, películas, subtis, descargar subtítulos, subtítulos español, subtítulos sincronizados",
      },
      { name: "robots", content: "index, follow" },
      { name: "author", content: "Subtis" },
      {
        property: "og:title",
        content: "Subtis | Subtítulos para tus películas",
      },
      {
        property: "og:description",
        content:
          "Subtítulos para todas tus películas. Buscador de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Subtis" },
      {
        property: "og:url",
        content: `https://subtis.io/subtitle/file/name/${bytes}/${fileName}`,
      },
      { property: "og:image", content: "https://subtis.io/og.png" },
      { name: "twitter:card", content: "summary" },
      { name: "twitter:site", content: "@subt_is" },
      {
        name: "twitter:title",
        content: "Subtis | Subtítulos para tus películas",
      },
      {
        name: "twitter:description",
        content:
          "Subtítulos para todas tus películas. Buscador de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
      },
      { name: "twitter:image", content: "https://subtis.io/twitter.png" },
    ];
  }

  return [
    {
      title: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year}) | ${data.subtitle.title_file_name}`,
    },
    {
      name: "description",
      content:
        "Subtítulos para todas tus películas. Buscador de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    {
      name: "keywords",
      content: "subtítulos, películas, subtis, descargar subtítulos, subtítulos español, subtítulos sincronizados",
    },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Subtis" },
    {
      property: "og:title",
      content: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year}) | ${data.subtitle.title_file_name}`,
    },
    {
      property: "og:description",
      content:
        "Subtítulos para todas tus películas. Buscador de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Subtis" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@subt_is" },
    {
      name: "twitter:title",
      content: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year}) | ${data.subtitle.title_file_name}`,
    },
    {
      name: "twitter:description",
      content:
        "Subtítulos para todas tus películas. Buscador de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { name: "twitter:image", content: "https://subtis.io/twitter.png" },
  ];
};

export default function SubtitlePage() {
  // remix hooks
  const { fileName } = useParams();
  const loaderData = useLoaderData<typeof loader>();

  // react hooks
  const [playerElement, setPlayerElement] = useState<HTMLVideoElement | null>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);
  const [captionBlobUrl, setCaptionBlobUrl] = useState<string | null>(null);

  // motion hooks
  const playControls = useAnimation();
  const downloadControls = useAnimation();

  const stremioTipControl = useAnimation();
  const internalVideoPlayerTipControl = useAnimation();
  const externalVideoPlayerTipControl = useAnimation();

  // effects
  useEffect(
    function fetchSubtitle() {
      async function fetchCaptions(subtitleUrl: string): Promise<void> {
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
      }

      if ("message" in loaderData) {
        return;
      }

      fetchCaptions(loaderData.subtitle.subtitle_link);
    },
    [loaderData],
  );

  useEffect(
    function transformSrtTracksToVtt() {
      if (playerElement && captionBlobUrl) {
        const hasTransformed = playerElement.dataset.transformed;

        if (!hasTransformed) {
          transformSrtTracks(playerElement);
          playerElement.dataset.transformed = "true";
        }
      }
    },
    [captionBlobUrl, playerElement],
  );

  useEffect(
    function listenFullscreenChange() {
      function handleFullscreenChange(): void {
        if (document.fullscreenElement) {
          setIsFullscreen(true);
        } else {
          setIsFullscreen(false);
          playerElement?.pause();
        }
      }

      document.addEventListener("fullscreenchange", handleFullscreenChange);

      return () => {
        document.removeEventListener("fullscreenchange", handleFullscreenChange);
      };
    },
    [playerElement],
  );

  useEffect(
    function handleVideoPlay() {
      if (!playerElement) {
        return;
      }

      async function enterFullscreenOnPlay() {
        if (!playerElement) {
          return;
        }

        if (!document.fullscreenElement) {
          await playerElement.requestFullscreen();
        }
      }

      playerElement.addEventListener("play", enterFullscreenOnPlay);

      return () => {
        if (playerElement) {
          playerElement.removeEventListener("play", enterFullscreenOnPlay);
        }
      };
    },
    [playerElement],
  );

  useEffect(
    function throwErrorIfAudioCodecIsUnsupported() {
      async function throwErrorOnUnsupportedAudioCodec(): Promise<void> {
        const videoSource = typeof window !== "undefined" && fileName ? localStorage.getItem(fileName) : null;

        if (!videoSource) {
          return;
        }

        try {
          const { audioCodec, videoCodec } = await parseMedia({
            src: videoSource,
            fields: { audioCodec: true, videoCodec: true },
          });

          const videoCodecsUnsupported = ["h265"];
          const isVideoCodecUnsupported = videoCodec ? videoCodecsUnsupported.includes(videoCodec) : false;

          if (!audioCodec || isVideoCodecUnsupported) {
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
          className="cursor-pointer"
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
  async function handleDownloadSubtitle(): Promise<void> {
    if ("message" in loaderData) {
      return;
    }

    await fetch("/api/download", {
      method: "PATCH",
      body: JSON.stringify({
        titleSlug: loaderData.title.slug,
        subtitleId: loaderData.subtitle.id,
      }),
    });

    triggerShareToast();
  }

  function handlePlaySubtitle(): void {
    if (playerElement) {
      playerElement.play();
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
  const { uiText } = getTotalTime(runtime);

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4 relative">
      {loaderData.title.optimized_backdrop_main ? (
        <div className="absolute -top-[417px] -right-[700px] max-w-[1920px] opacity-40 hidden">
          <img
            src={loaderData.title.optimized_backdrop_main ?? ""}
            alt={loaderData.title.title_name}
            className="w-full h-full object-cover rounded-full"
          />
        </div>
      ) : null}
      <article className="max-w-[630px] w-full z-10">
        <section className="flex flex-col gap-12">
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
            <h2 className="text-zinc-300 text-sm md:text-base text-center md:text-left">
              🍿 Acomodate y disfrutá tu película subtitulada.
            </h2>
          </div>
          <article className="flex flex-row gap-4 justify-center md:justify-start">
            <Button asChild size="sm">
              <a
                download
                onClick={handleDownloadSubtitle}
                href={loaderData.subtitle.subtitle_link}
                onMouseEnter={() => downloadControls.start("animate")}
                onMouseLeave={() => downloadControls.start("normal")}
                className={"transition-all ease-in-out rounded-sm bg-zinc-100 text-zinc-900 hover:bg-zinc-50"}
              >
                <DownloadIcon size={18} controls={downloadControls} />
                Descargar subtítulo
              </a>
            </Button>
            {displayVideoElements ? (
              <Button
                size="sm"
                onClick={handlePlaySubtitle}
                onMouseEnter={() => playControls.start("animate")}
                onMouseLeave={() => playControls.start("normal")}
                className={
                  "transition-all ease-in-out rounded-sm bg-zinc-900 text-zinc-50 hover:bg-zinc-800 cursor-pointer"
                }
              >
                <Play size={18} controls={playControls} isWrapped={false} />
                Reproducir video
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
                    className={
                      "transition-all ease-in-out rounded-sm bg-zinc-900 text-zinc-50 hover:bg-zinc-800 cursor-not-allowed"
                    }
                  >
                    <Play size={18} controls={playControls} isWrapped={false} />
                    Reproducir video
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {hasVideoError ? "No podemos reproducir el video" : ""}
                  {!hasVideoError && !videoSource ? "No hay video disponible" : ""}
                </TooltipContent>
              </Tooltip>
            )}
          </article>
        </section>

        {displayVideoElements ? (
          <video
            controls
            ref={setPlayerElement}
            className="w-0 h-0"
            onError={handleVideoError}
            style={{ opacity: isFullscreen ? 1 : 0 }}
          >
            <source src={videoSource} type={videoType} />
            <track kind="subtitles" src={captionBlobUrl} srcLang="es" label="Español latino" default />
          </video>
        ) : null}

        <section className="flex flex-col gap-12 mt-[74px]">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Subtips</h3>
            <h4 className="text-zinc-400 text-sm md:text-base">Para una mejor experiencia, seguí estos consejos.</h4>
          </div>
          <Tabs defaultValue="play-subtitle">
            <TabsList>
              <TabsTrigger value="play-subtitle" className="text-sm">
                ¿Cómo uso el subtítulo?
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
                      className="bg-[#161616] border border-[#232323] flex items-start gap-4"
                      onMouseEnter={() => internalVideoPlayerTipControl.start("animate")}
                      onMouseLeave={() => internalVideoPlayerTipControl.start("normal")}
                    >
                      <div>
                        <CheckIcon size={24} controls={internalVideoPlayerTipControl} className="stroke-zinc-50" />
                      </div>
                      <div className="pt-1">
                        <AlertTitle className="text-zinc-50">Probá el reproductor de video de Subtis...</AlertTitle>
                        <AlertDescription className="text-zinc-400 text-sm font-normal">
                          Hacé clic en el botón de reproducir y disfrutá tu película con el subtítulo ya integrado, sin
                          hacer más nada.
                        </AlertDescription>
                      </div>
                    </Alert>
                  </motion.div>
                )}
              </AnimatePresence>
              <Alert
                className="bg-[#161616] border border-[#232323] flex items-start gap-4"
                onMouseEnter={() => externalVideoPlayerTipControl.start("animate")}
                onMouseLeave={() => externalVideoPlayerTipControl.start("normal")}
              >
                <div>
                  <CheckIcon size={24} controls={externalVideoPlayerTipControl} className="stroke-zinc-50" />
                </div>
                <div className="pt-1">
                  <AlertTitle className="text-zinc-50">Si vas a usar otro reproductor de video...</AlertTitle>
                  <AlertDescription className="text-zinc-400 text-sm font-normal">
                    Recordá mover el archivo del subtítulo a la carpeta donde esté la película o, si preferís, reproducí
                    la película y arrastrá el subtítulo al reproductor.
                  </AlertDescription>
                </div>
              </Alert>
              <Alert
                className="bg-[#161616] border border-[#232323] flex items-start gap-4"
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
                      href="https://stremio.subt.is"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#E1FB00] hover:underline"
                    >
                      add-on
                    </a>{" "}
                    oficial. Si no querés usar el add-on de Subtis, también podés arrastrar el subtítulo al reproductor
                    de Stremio.
                  </AlertDescription>
                </div>
              </Alert>
            </TabsContent>
          </Tabs>
        </section>

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar otro subtítulo</h3>
            <h4 className="text-zinc-400 text-sm md:text-base">Arrastra el archivo para buscar un nuevo subtítulo</h4>
          </div>
          <div className="h-[338px] rounded-sm border border-dashed border-[#232323] hover:border-zinc-700 overflow-hidden">
            <VideoDropzone withMacbook={false} />
          </div>
        </section>

        <MoviePlatforms />
      </article>

      {loaderData.title.optimized_poster ? (
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
          </div>
        </aside>
      ) : null}
    </div>
  );
}
