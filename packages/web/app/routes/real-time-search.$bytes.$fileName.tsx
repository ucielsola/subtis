import { useEffectOnce } from "@custom-react-hooks/use-effect-once";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useEffect, useRef, useState } from "react";
import { z } from "zod";

// api
import { titleTeaserFileNameResponseSchema } from "@subtis/api/controllers/title/schemas";

// lib
import { apiClient } from "~/lib/api";

// ui
import { TextShimmerWave } from "~/components/ui/text-shimmer-wave";

// hooks
import { useToast } from "~/hooks/use-toast";

// features
import beep from "~/features/real-time-search/beep.mp3";

// schemas
const wsMessageSchema = z.object({
  total: z.number(),
  message: z.string(),
});

const wsOkSchema = z.object({
  ok: z.boolean(),
});

// types
type WsOk = z.infer<typeof wsOkSchema>;

// custom hooks
function useWithSound(audioSource: string) {
  const soundRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    soundRef.current = new Audio(audioSource);
  }, [audioSource]);

  function play(): void {
    if (!soundRef.current) {
      return;
    }

    soundRef.current.play();
  }

  return { play };
}

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { bytes, fileName } = params;

  if (!bytes || !fileName) {
    throw new Error("Missing bytes or fileName");
  }

  const titleTeaserResponse = await apiClient.v1.providers.youtube.teaser[":fileName"].$get({
    param: { fileName },
  });

  if (!titleTeaserResponse.ok) {
    const titleTeaserData = await titleTeaserResponse.json();
    const titleTeaserError = z.object({ message: z.string() }).safeParse(titleTeaserData);

    if (titleTeaserError.error) {
      throw new Error("Invalid title teaser data");
    }

    return titleTeaserError.data;
  }

  const titleTeaserData = await titleTeaserResponse.json();
  const titleTeaserParsedData = titleTeaserFileNameResponseSchema.safeParse(titleTeaserData);

  if (titleTeaserParsedData.error) {
    throw new Error("Invalid title teaser data");
  }

  return titleTeaserParsedData.data;
};

// meta
export const meta: MetaFunction<typeof loader> = () => {
  return [
    { title: "Subtis | Buscando subtítulo en tiempo real" },
    { name: "description", content: "Subtítutlos para todas tus películas" },
  ];
};
export default function RealTimeSearchPage() {
  // remix hooks
  const teaser = useLoaderData<typeof loader>();

  // sound hooks
  const { play } = useWithSound(beep);

  // toast hooks
  const { toast } = useToast();

  // navigation hooks
  const navigate = useNavigate();
  const { bytes, fileName } = useParams();

  // react hooks
  const [total, setTotal] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // effects
  useEffectOnce(() => {
    async function searchSubtitleInRealTime() {
      if (!bytes || !fileName) {
        return;
      }

      setTotal(0);
      setMessage("Chequeando si el subtítulo ya existe");

      const primarySubtitleResponse = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
        param: {
          bytes,
          fileName,
        },
      });

      if (primarySubtitleResponse.status === 200) {
        return navigate(`/subtitle/file/name/${bytes}/${fileName}`);
      }

      const websocketData = await new Promise<WsOk>((resolve) => {
        const ws = new WebSocket("https://real-time-indexer.fly.dev");
        // const ws = new WebSocket("ws://localhost:3000");

        ws.addEventListener("open", () => {
          setMessage("🔎 Buscando subtítulo en tiempo real");

          const message = {
            subtitle: {
              bytes: Number(bytes),
              titleFileName: fileName,
            },
          };

          ws.send(JSON.stringify(message));
        });

        ws.addEventListener(
          "message",
          (messageEvent: {
            data: string;
          }) => {
            const parsedData = JSON.parse(messageEvent.data);

            const okSafeParsed = wsOkSchema.safeParse(parsedData);
            const messageSafeParsed = wsMessageSchema.safeParse(parsedData);

            if (okSafeParsed.success && okSafeParsed.data.ok === true) {
              resolve(okSafeParsed.data);
            }

            if (okSafeParsed.success && okSafeParsed.data.ok === false) {
              setMessage("No pudimos encontrar el subtítulo en tiempo real.");
              resolve(okSafeParsed.data);
            }

            if (messageSafeParsed.success) {
              setTotal(messageSafeParsed.data.total);
              setMessage(messageSafeParsed.data.message);
            }
          },
        );

        ws.addEventListener("error", () => {
          resolve({ ok: false });
        });
      });

      if (websocketData.ok === true) {
        play();

        toast({
          title: "¡Subtítulo encontrado!",
          description: "Te redireccionaremos en 3 segundos...",
        });

        setTimeout(() => {
          navigate(`/subtitle/file/name/${bytes}/${fileName}`);
        }, 3000);
        return;
      }

      const alternativeSubtitleResponse = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
        param: {
          fileName,
        },
      });

      if (alternativeSubtitleResponse.status === 200) {
        play();

        toast({
          title: "¡Subtítulo alternativo encontrado!",
          description: "Te redireccionaremos en 3 segundos...",
        });

        setTimeout(() => {
          navigate(`/not-found/${bytes}/${fileName}`);
        }, 3000);
        return;
      }

      navigate(`/not-found/${bytes}/${fileName}`);
      return;
    }

    searchSubtitleInRealTime();
  });

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-xl w-full">
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <TextShimmerWave as="h1" className="text-3xl md:text-4xl font-bold" duration={3}>
              Buscando subtítulo...
            </TextShimmerWave>
            <div className="flex flex-col gap-1">
              <h2 className="text-zinc-50 text-sm md:text-base">Este proceso puede durar hasta 30 segundos.</h2>
              {message ? (
                <p className="text-zinc-300 text-xs md:text-sm">
                  {total === 0 ? "0% " : ""}
                  {total ? `${total * 100}% ` : ""}
                  {message}
                </p>
              ) : null}
            </div>
          </div>
          {"message" in teaser ? null : (
            <div className="flex flex-col gap-2">
              <iframe
                src={`https://www.youtube.com/embed/${teaser.youTubeVideoId}?autoplay=1&mute=1`}
                title={teaser.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-md shadow-sm shadow-zinc-900 w-[320px] h-[180px] md:w-[560px] md:h-[315px]"
              />{" "}
              <span className="text-zinc-400 text-sm text-center">
                {teaser.name} ({teaser.year})
              </span>
            </div>
          )}
        </section>
      </article>
      <figure className="flex-1 hidden lg:flex justify-center">
        <img src="/loading-logo.webp" alt="Cargando" className="size-64" />
      </figure>
    </div>
  );
}
