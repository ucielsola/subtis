import { useEffectOnce } from "@custom-react-hooks/use-effect-once";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";

// shared external
import { getApiClient } from "@subtis/shared";

// ui
import { TextShimmerWave } from "~/components/ui/text-shimmer-wave";

// hooks
import { useToast } from "~/hooks/use-toast";

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

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { bytes, fileName } = params;

  if (!bytes || !fileName) {
    throw new Error("Missing bytes or fileName");
  }

  const apiClient = getApiClient({
    apiBaseUrl: "https://api.subt.is" as string,
  });

  const response = await apiClient.v1.title.teaser[":fileName"].$get({
    param: {
      fileName,
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data;
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

  // toast hooks
  const { toast } = useToast();

  // navigation hooks
  const navigate = useNavigate();
  const { bytes, fileName } = useParams();

  // react hooks
  const [message, setMessage] = useState<string | null>(null);

  // effects
  useEffectOnce(() => {
    async function searchSubtitleInRealTime() {
      if (!bytes || !fileName) {
        return;
      }

      setMessage("Chequeando si el subtítulo ya existe");

      const apiClient = getApiClient({
        apiBaseUrl: "https://api.subt.is" as string,
      });

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
        const ws = new WebSocket("https://socketdex.subt.is");
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
              setMessage(`${messageSafeParsed.data.total * 100}% ${messageSafeParsed.data.message}`);
            }
          },
        );

        ws.addEventListener("error", () => {
          resolve({ ok: false });
        });
      });

      if (websocketData.ok === true) {
        toast({
          title: "¡Subtítulo encontrado!",
          description: "Te redireccionaremos en 3 segundos...",
        });

        setTimeout(() => {
          navigate(`/subtitle/file/name/${bytes}/${fileName}`);
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
            <TextShimmerWave className="text-3xl md:text-4xl font-bold" duration={3}>
              Buscando subtítulo...
            </TextShimmerWave>
            <div className="flex flex-col gap-1">
              <h2 className="text-zinc-50 text-sm md:text-base">Este proceso puede durar hasta 30 segundos.</h2>
              {message ? <p className="text-zinc-400 text-xs md:text-sm">{message}</p> : null}
            </div>
          </div>
          {!teaser || "message" in teaser ? null : (
            <div className="flex flex-col items-center gap-2">
              <iframe
                src={`https://www.youtube.com/embed/${teaser.youTubeVideoId}?autoplay=1&mute=1`}
                title={teaser.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-md shadow-sm shadow-zinc-900 w-[320px] h-[180px] md:w-[560px] md:h-[315px]"
              />{" "}
              <span className="text-zinc-400 text-sm">
                {teaser.name} ({teaser.year})
              </span>
            </div>
          )}
        </section>
      </article>
      <figure className="flex-1 hidden lg:flex justify-center">
        <img src="/loading-logo.png" alt="Cargando" className="size-64" />
      </figure>
    </div>
  );
}
