import { zodResolver } from "@hookform/resolvers/zod";
import { parseMedia } from "@remotion/media-parser";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import type { LoaderFunctionArgs, MetaFunction } from "react-router";
import { Link, useLoaderData, useParams } from "react-router";
import { toast } from "sonner";
import { transformSrtTracks } from "srt-support-for-html5-videos";
import { z } from "zod";

// api
import { subtitleNormalizedSchema } from "@subtis/api/lib/parsers";

// shared external
import { getIsCinemaRecording, getMessageFromStatusCode } from "@subtis/shared";

// shared internal
import { VideoDropzone } from "~/components/shared/video-dropzone";

// icons
import { AirplaneIcon } from "~/components/icons/airplane";
import { BadgeAlertIcon } from "~/components/icons/badge-alert";
import { DownloadIcon } from "~/components/icons/download";
import { Play } from "~/components/icons/play";

// lib
import { apiClient } from "~/lib/api";
import { getUiCertification } from "~/lib/certifications";

// ui
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { LogoBroken } from "~/components/ui/logo-broken";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

// schemas
const formSchema = z.object({
  email: z.string().email({ message: "Ingresá una dirección de correo válida." }),
});

// meta
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || "message" in data) {
    return [
      { title: "Subtis | Subtítulos no encontrados" },
      {
        name: "description",
        content:
          "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
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
          "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
      },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "Subtis" },
      { property: "og:url", content: "https://subtis.io/not-found" },
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
          "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
      },
      { name: "twitter:image", content: "https://subtis.io/twitter.png" },
    ];
  }

  return [
    {
      title: `Subtis | Subtítulos alternativos para ${data.title.title_name} (${data.title.year})`,
    },
    {
      name: "description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    {
      name: "keywords",
      content: "subtítulos, películas, subtis, descargar subtítulos, subtítulos español, subtítulos sincronizados",
    },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Subtis" },
    { property: "og:title", content: "Subtis | Subtítulos para tus películas" },
    {
      property: "og:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Subtis" },
    {
      property: "og:url",
      content: `https://subtis.io/not-found/${data.subtitle.bytes}/${data.subtitle.title_file_name}`,
    },
    { property: "og:image", content: "https://subtis.io/og.png" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@subt_is" },
    {
      name: "twitter:title",
      content: `Subtis | Subtítulos alternativos para ${data.title.title_name} (${data.title.year})`,
    },
    {
      name: "twitter:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { name: "twitter:image", content: "https://subtis.io/twitter.png" },
  ];
};

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { bytes, fileName } = params;

  if (!bytes || !fileName) {
    throw new Error("Missing bytes or fileName");
  }

  const alternativeSubtitleResponse = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
    param: {
      fileName,
    },
  });

  const alternativeSubtitleData = await alternativeSubtitleResponse.json();

  const alternativeSubtitleError = z.object({ message: z.string() }).safeParse(alternativeSubtitleData);

  if (alternativeSubtitleError.success) {
    return {
      ...alternativeSubtitleError.data,
      status: alternativeSubtitleResponse.status as number,
    };
  }

  const alternativeSubtitleParsedData = subtitleNormalizedSchema.safeParse(alternativeSubtitleData);

  if (alternativeSubtitleParsedData.error) {
    throw new Error("Invalid subtitle data");
  }

  return {
    ...alternativeSubtitleParsedData.data,
    status: alternativeSubtitleResponse.status as number,
  };
};

export default function NotFoundSubtitlePage() {
  // remix hooks
  const loaderData = useLoaderData<typeof loader>();

  // react hooks
  const player = useRef<HTMLVideoElement>(null);

  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [hasVideoError, setHasVideoError] = useState<boolean>(false);
  const [captionBlobUrl, setCaptionBlobUrl] = useState<string | null>(null);

  // navigation hooks
  const { bytes, fileName } = useParams();

  // motion hooks
  const playControls = useAnimation();
  const downloadControls = useAnimation();

  // form hooks
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

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
          size="sm"
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
  async function onSubmit(values: z.infer<typeof formSchema>): Promise<void> {
    if (!bytes || !fileName) {
      return;
    }

    await fetch("https://subtis.io/api/not-found", {
      method: "POST",
      body: JSON.stringify({
        email: values.email,
        bytes: Number(bytes),
        titleFileName: fileName,
      }),
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

  const isCinemaRecording = getIsCinemaRecording(fileName as string);

  const { runtime } = "message" in loaderData ? { runtime: null } : loaderData.title;
  const totalHours = runtime ? Math.floor(runtime / 60) : null;
  const totalMinutes = runtime ? runtime % 60 : null;

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-xl w-full">
        <section className="flex flex-col gap-12">
          {"message" in loaderData ? (
            <div className="flex flex-col gap-4">
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold">Lo sentimos :(</h1>
              <div className="flex flex-col gap-1">
                <h2 className="text-zinc-50 text-sm md:text-base">
                  No encontramos el subtítulo específico para tu versión.
                </h2>
                {[400, 415].includes(loaderData.status) ? (
                  <h3 className="text-zinc-50 text-sm md:text-base">
                    {getMessageFromStatusCode(loaderData.status).description}
                  </h3>
                ) : null}
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <div className="flex flex-row gap-2">
                  <Badge variant="outline">{loaderData.title.year}</Badge>
                  {totalHours ? <Badge variant="outline">{`${`${totalHours}h `}${`${totalMinutes}m`}`}</Badge> : null}
                  {loaderData.title.certification ? (
                    <Badge variant="outline">{getUiCertification(loaderData.title.certification)}</Badge>
                  ) : null}
                </div>
                <Link prefetch="viewport" to={`/subtitles/movie/${loaderData.title.slug}`}>
                  <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold text-balance">
                    {loaderData.title.title_name}
                  </h1>
                </Link>
              </div>
              <div className="flex flex-col gap-1">
                <h2 className="text-zinc-50 text-sm md:text-base">
                  No encontramos el subtítulo exacto para tu versión.
                </h2>
                <p className="text-zinc-300 text-xs md:text-sm">
                  Probá con este subtítulo alternativo para tu película:
                </p>
              </div>
            </div>
          )}

          {"message" in loaderData ? null : (
            <article className="flex flex-row gap-4">
              <Button asChild size="sm">
                <a
                  download
                  onClick={triggerShareToast}
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
                  className={"transition-all ease-in-out rounded-sm bg-zinc-900 text-zinc-50 hover:bg-zinc-800"}
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
                      className={"transition-all ease-in-out rounded-sm bg-zinc-900 text-zinc-50 hover:bg-zinc-800"}
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
          )}

          {displayVideoElements ? (
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

          <AnimatePresence mode="wait">
            {!form.formState.isSubmitSuccessful && !isCinemaRecording ? (
              <motion.div
                key="form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <div className="flex flex-col gap-2 mb-12">
                  <p className="text-zinc-50 text-3xl font-semibold">¿Querés que te avisemos?</p>
                  <p className="text-zinc-50 text-balance">
                    Dejanos tu email y te enviamos el subtítulo apenas lo encontremos.
                  </p>
                </div>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-row gap-2">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem className="w-full">
                          <FormControl>
                            <Input
                              placeholder="tom@cruise.com"
                              className="w-full bg-[#141414] border border-[#232323] placeholder:text-zinc-400 focus:border-zinc-400 focus-visible:ring-0 rounded-sm h-9"
                              {...field}
                            />
                          </FormControl>
                          {form.formState.errors.email ? (
                            <div className="flex flex-row items-center gap-2 ">
                              <BadgeAlertIcon size={16} className="text-zinc-400" />
                              <p className="text-zinc-400 text-sm">Por favor, ingresá un correo electrónico válido.</p>
                            </div>
                          ) : null}
                        </FormItem>
                      )}
                    />
                    <Button
                      size="sm"
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-36 flex-shrink-0 rounded-sm cursor-pointer"
                    >
                      {form.formState.isSubmitting ? "Enviando..." : "Recibir subtítulo"}
                    </Button>
                  </form>
                </Form>
              </motion.div>
            ) : null}

            {form.formState.isSubmitSuccessful && !isCinemaRecording ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-row items-center gap-2 h-[68px]"
              >
                <AirplaneIcon size={24} className="text-zinc-400" />
                <span className="text-zinc-400 text-sm">Te avisaremos cuando tengamos tu subtítulo disponible.</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar otro subtítulo</h3>
            <h4 className="text-zinc-400 text-sm md:text-base">Arrastra el archivo para buscar un nuevo subtítulo</h4>
          </div>
          <div className="h-[338px] rounded-sm border border-dashed border-zinc-800 hover:border-zinc-700 overflow-hidden">
            <VideoDropzone withMacbook={false} />
          </div>
        </section>
      </article>
      <div className="flex-1 hidden lg:flex justify-center">
        <LogoBroken className="w-[136px] h-[144px]" />
      </div>
    </div>
  );
}
