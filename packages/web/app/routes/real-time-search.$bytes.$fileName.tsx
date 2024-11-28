import { useEffectOnce } from "@custom-react-hooks/use-effect-once";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { type MetaFunction, useLoaderData, useNavigate, useParams } from "@remix-run/react";
import { useState } from "react";
import { z } from "zod";

// shared external
import { getApiClient } from "@subtis/shared";

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
    { name: "description", content: "Buscando subtítulo en tiempo real" },
  ];
};
export default function RealTimeSearchPage() {
  // remix hooks
  const teaser = useLoaderData<typeof loader>();

  // navigation hooks
  const { bytes, fileName } = useParams();
  const navigate = useNavigate();

  // react hooks
  const [message, setMessage] = useState<string | null>(null);

  // effects
  useEffectOnce(() => {
    async function searchSubtitleInRealTime() {
      if (!bytes || !fileName) {
        return;
      }
      console.log("entered once");

      setMessage("Chequeando si el subtítulo ya existe...");

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
            console.log("\n ~ websocketData ~ parsedData:", parsedData);

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
        console.log("navigate");
        navigate(`/subtitle/file/name/${bytes}/${fileName}`);
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
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-50 text-5xl font-bold">Buscando subtítulo...</h1>
            <h2 className="text-zinc-400 text-balance">{message ?? "Este proceso puede durar hasta 20 segundos."}</h2>
          </div>
          {!teaser || "message" in teaser ? null : (
            <div className="flex flex-col items-center gap-2">
              <iframe
                width="560"
                height="315"
                src={`https://www.youtube.com/embed/${teaser.id}?autoplay=1&mute=1`}
                title={teaser.name}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="rounded-md shadow-sm shadow-zinc-900"
              />{" "}
              <span className="text-zinc-400 text-sm">
                {teaser.name} ({teaser.year})
              </span>
            </div>
          )}
        </section>
      </article>
      <figure className="flex-1 hidden lg:flex justify-center">
        <img src="/loading.png" alt="Cargando" className="w-[136.44px] h-[144px]" />
      </figure>
    </div>
  );
}
