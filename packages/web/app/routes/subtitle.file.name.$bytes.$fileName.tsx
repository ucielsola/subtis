import { parseMedia } from "@remotion/media-parser";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { Fragment, useEffect, useRef, useState } from "react";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { redirect, useLoaderData, useParams } from "react-router";
import { toast } from "sonner";
import { transformSrtTracks } from "srt-support-for-html5-videos";

// api
import { subtitleNormalizedSchema } from "@subtis/api/lib/parsers";

// indexer
import { getImdbLink } from "@subtis/indexer/imdb";

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
import { getUiCertification } from "~/lib/certifications";
import { cn } from "~/lib/utils";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
// ui
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import DotPattern from "~/components/ui/dot-pattern";
import { Separator } from "~/components/ui/separator";
import { Skeleton } from "~/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

// logos
import { IMDbLogo } from "~/components/logos/imdb";
import { JustWatchLogo } from "~/components/logos/justwatch";
import { LetterboxdLogo } from "~/components/logos/letterboxd";
import { RottenTomatoesLogo } from "~/components/logos/rottentomatoes";
import { SpotifyLogo } from "~/components/logos/spotify";
import { YouTubeLogo } from "~/components/logos/youtube";

// hooks
import { useCinemas } from "~/hooks/use-cinemas";
import { useJustWatch } from "~/hooks/use-justwatch";
import { useLetterboxd } from "~/hooks/use-letterboxd";
import { usePlatforms } from "~/hooks/use-platforms";
import { useRottenTomatoes } from "~/hooks/use-rottentomatoes";
import { useSpotify } from "~/hooks/use-spotify";
import { useTeaser } from "~/hooks/use-teaser";

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
        content: "Subtis | Subtítulos para tus películas",
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
          "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
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
      content: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year}) | ${data.subtitle.title_file_name}`,
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
      content: `Subtis | Subtítulo para ${data.title.title_name} (${data.title.year}) | ${data.subtitle.title_file_name}`,
    },
    {
      name: "twitter:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { name: "twitter:image", content: "https://subtis.io/twitter.png" },
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
  const { data: titleTeaser, isLoading: isLoadingTeaser } = useTeaser(fileName);

  const { data: titleCinemas } = useCinemas(loaderData.title.imdb_id);
  const { data: titlePlatforms } = usePlatforms(loaderData.title.imdb_id);

  const { data: titleSpotify, isLoading: isLoadingSpotify } = useSpotify(loaderData.title.slug);
  const { data: titleJustWatch, isLoading: isLoadingJustWatch } = useJustWatch(loaderData.title.slug);
  const { data: titleLetterboxd, isLoading: isLoadingLetterboxd } = useLetterboxd(loaderData.title.slug);
  const { data: titleRottenTomatoes, isLoading: isLoadingRottenTomatoes } = useRottenTomatoes(loaderData.title.slug);

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
    function pauseVideoOnExitFullscreen(): void {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
        player.current?.pause();
      }
    }

    document.addEventListener("fullscreenchange", pauseVideoOnExitFullscreen);

    return () => {
      document.removeEventListener("fullscreenchange", pauseVideoOnExitFullscreen);
    };
  }, []);

  useEffect(
    function throwErrorIfAudioCodecIsUnsupported() {
      async function throwErrorOnUnsupportedAudioCodec(): Promise<void> {
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

  // helpers
  function triggerShareToast(): void {
    if ("message" in loaderData) {
      return;
    }

    toast.success("¡Disfruta de tu subtítulo!", {
      description: (
        <p className="flex flex-row items-center gap-1">
          Compartí tu experiencia en <img src="/x.svg" alt="X" className="w-3 h-3" />
        </p>
      ),
      action: (
        <Button
          variant="outline"
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

  const isLoadingProviders =
    isLoadingTeaser || isLoadingJustWatch || isLoadingLetterboxd || isLoadingRottenTomatoes || isLoadingSpotify;

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-[630px] w-full">
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
                {totalHours ? <Badge variant="outline">{`${`${totalHours}h `}${`${totalMinutes}m`}`}</Badge> : null}
                {loaderData.title.certification ? (
                  <Badge variant="outline">{getUiCertification(loaderData.title.certification)}</Badge>
                ) : null}
              </div>
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold text-balance hidden md:block">
                {loaderData.title.title_name}
              </h1>
            </div>
            <h2 className="text-zinc-50 text-sm md:text-base text-center md:text-left">
              🍿 Acomódate y disfrutá tu película subtitulada.
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
                Descargar Subtítulo
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
                    className={
                      "transition-all ease-in-out rounded-sm bg-zinc-900 text-zinc-50 hover:bg-zinc-800 cursor-not-allowed"
                    }
                  >
                    <Play size={18} controls={playControls} isWrapped={false} />
                    Reproducir Video
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

        <section className="flex flex-col gap-12 mt-[74px]">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Sugerencias</h3>
            <h4 className="text-zinc-50 text-sm md:text-base">
              Para vivir una experiencia óptima, seguí estos consejos.
            </h4>
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
                      href="https://stremio.subt.is"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-yellow-300 hover:underline"
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
        <aside className="hidden lg:flex flex-1 flex-col items-center">
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
            <div className="pt-1 px-2 flex flex-row items-center gap-6">
              {isLoadingProviders ? (
                <Skeleton className="w-full h-5 rounded-sm" />
              ) : (
                <Fragment>
                  {loaderData.title.imdb_id ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <a
                          href={getImdbLink(loaderData.title.imdb_id)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/imdb"
                        >
                          <IMDbLogo
                            size={32}
                            className="fill-zinc-300 group-hover/imdb:fill-[#F5C518] transition-all ease-in-out duration-300"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>IMDb</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  {titleTeaser && !("message" in titleTeaser) ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <a
                          href={`https://www.youtube.com/watch?v=${titleTeaser.youTubeVideoId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/trailer"
                        >
                          <YouTubeLogo
                            size={24}
                            className="fill-zinc-300 group-hover/trailer:fill-[#F03] transition-all ease-in-out duration-300"
                            playerClassName="fill-zinc-950 group-hover/trailer:fill-white"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Trailer</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  {titleSpotify ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <a href={titleSpotify.link} target="_blank" rel="noopener noreferrer" className="group/spotify">
                          <SpotifyLogo
                            size={22}
                            className="fill-zinc-300 group-hover/spotify:fill-[#1CD760] transition-all ease-in-out duration-300"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>
                          Soundtrack{" "}
                          {titleSpotify.type === "album"
                            ? "(Oficial)"
                            : titleSpotify.type === "playlist"
                              ? "(No Oficial)"
                              : ""}
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  {titleRottenTomatoes ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <a
                          href={titleRottenTomatoes.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/rottentomatoes"
                        >
                          <RottenTomatoesLogo
                            size={22}
                            className="fill-zinc-300 group-hover/rottentomatoes:fill-[#F9310A] transition-all ease-in-out duration-300"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Rotten Tomatoes</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  {titleJustWatch ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <a
                          href={titleJustWatch.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/justwatch"
                        >
                          <JustWatchLogo
                            size={18}
                            className="fill-zinc-300 group-hover/justwatch:fill-[#E5B817] transition-all ease-in-out duration-300"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>JustWatch</p>
                      </TooltipContent>
                    </Tooltip>
                  ) : null}
                  {titleLetterboxd ? (
                    <Tooltip>
                      <TooltipTrigger>
                        <a
                          href={titleLetterboxd.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group/letterboxd"
                        >
                          <LetterboxdLogo
                            size={26}
                            firstDotClassName="fill-zinc-300 group-hover/letterboxd:fill-[#00E054] transition-all ease-in-out duration-300"
                            secondDotClassName="fill-zinc-300 group-hover/letterboxd:fill-[#40BCF4] transition-all ease-in-out duration-300"
                            thirdDotClassName="fill-zinc-300 group-hover/letterboxd:fill-[#FF8000] transition-all ease-in-out duration-300"
                          />
                        </a>
                      </TooltipTrigger>
                      <TooltipContent side="bottom">
                        <p>Letterboxd</p>
                      </TooltipContent>
                    </Tooltip>
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
