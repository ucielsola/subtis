import { zodResolver } from "@hookform/resolvers/zod";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { type MetaFunction, useLoaderData, useParams } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useForm } from "react-hook-form";
import { Fragment } from "react/jsx-runtime";
import { z } from "zod";

// api
import type { SubtitleNormalized } from "@subtis/api";

// shared external
import { getApiClient } from "@subtis/shared";

// shared internal
import { VideoDropzone } from "~/components/shared/video-dropzone";

// icons
import { CheckIcon } from "~/components/icons/check";
import { DownloadIcon } from "~/components/icons/download";

// lib
import { cn } from "~/lib/utils";

import { AirplaneIcon } from "~/components/icons/airplane";
// ui
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import DotPattern from "~/components/ui/dot-pattern";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";

// schemas
const formSchema = z.object({
  email: z.string().email({ message: "Ingresa una dirección de correo válida." }),
});

// constants
export const columns: ColumnDef<SubtitleNormalized>[] = [
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
      const controls = useAnimation();

      // handlers
      async function handleDownloadSubtitle() {
        const apiClient = getApiClient({
          apiBaseUrl: "https://api.subt.is" as string,
        });

        await apiClient.v1.subtitle.metrics.download.$patch({
          json: { imdbId: row.original.title.imdb_id, subtitleId: row.original.subtitle.id },
        });
      }

      return (
        <a
          href={row.original.subtitle.subtitle_link}
          download
          className="inline-flex items-center gap-1"
          onMouseEnter={() => controls.start("animate")}
          onMouseLeave={() => controls.start("normal")}
          onClick={handleDownloadSubtitle}
        >
          <DownloadIcon size={16} controls={controls} />
        </a>
      );
    },
  },
];

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { fileName } = params;

  if (!fileName) {
    throw new Error("Missing fileName");
  }

  const apiClient = getApiClient({
    apiBaseUrl: "https://api.subt.is" as string,
  });

  const alternativeSubtitleResponse = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
    param: {
      fileName,
    },
  });

  const alternativeSubtitle = await alternativeSubtitleResponse.json();

  return alternativeSubtitle;
};

// meta
export const meta: MetaFunction<typeof loader> = ({ data }) => {
  if (!data || "message" in data) {
    return [
      { title: "Subtis | Subtitulos No Encontrados" },
      { name: "description", content: "Subtitulos No Encontrados" },
    ];
  }

  return [
    { title: `Subtis | Subtitulos Alternativos para ${data.title.title_name}` },
    { name: "description", content: `Subtitulos Alternativos para ${data.title.title_name}` },
  ];
};

export default function NotFoundSubtitlePage() {
  // remix hooks
  const data = useLoaderData<typeof loader>();

  // navigation hooks
  const { bytes, fileName } = useParams();

  // motion hooks
  const videoTipControl = useAnimation();
  const stremioTipControl = useAnimation();

  // form hooks
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

  console.log("form submitted", form.formState);

  // handlers
  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!bytes || !fileName) {
      return;
    }

    const apiClient = getApiClient({
      apiBaseUrl: "https://api.subt.is" as string,
    });

    await apiClient.v1.subtitle["not-found"].$post({
      json: { email: values.email, bytes: Number(bytes), titleFileName: fileName },
    });
  }

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-xl w-full">
        {"message" in data ? (
          <section className="flex flex-col gap-12">
            <div className="flex flex-col gap-2">
              <h1 className="text-zinc-50 text-5xl font-bold">Lo sentimos :(</h1>
              <h2 className="text-zinc-400 text-balance">
                No encontramos ningún subtítulo para este archivo. Podes dejarnos tu email y te avisaremos cuando
                subamos un subtítulo para este archivo.
              </h2>
            </div>
            <AnimatePresence mode="wait">
              {!form.formState.isSubmitSuccessful ? (
                <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
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
                                className="w-full bg-zinc-950 border border-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus-visible:ring-0"
                                {...field}
                              />
                            </FormControl>
                            {form.formState.errors.email ? (
                              <p className="text-zinc-400 text-sm">Por favor ingresa un correo electrónico válido.</p>
                            ) : (
                              <p className="text-zinc-400 text-sm">
                                Ingresa una dirección de correo válida para recibir tu subtítulo.
                              </p>
                            )}
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={form.formState.isSubmitting} className="w-36 flex-shrink-0">
                        {form.formState.isSubmitting ? "Enviando..." : "Recibir subtítulo"}
                      </Button>
                    </form>
                  </Form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex flex-row items-center gap-2 h-[68px]"
                >
                  <AirplaneIcon size={24} className="text-zinc-400" />
                  <span className="text-zinc-400 text-sm">
                    Te haremos saber cuando tengamos tu subtítulo disponible.
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </section>
        ) : (
          <section className="flex flex-col gap-12">
            <div className="flex flex-col gap-2">
              <h1 className="text-zinc-50 text-5xl font-bold">Lo sentimos :(</h1>
              <h2 className="text-zinc-400 text-balance">
                No encontramos ningún subtítulo para este archivo. Te recomendamos que pruebes el siguiente subtítulo
                alternativo.
              </h2>
            </div>
            <DataTable columns={columns} data={[data]} />
          </section>
        )}

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar nuevo subtítulo por archivo</h3>
            <h4 className="text-zinc-400">Querés buscar un subtítulo nuevo? Arrastra el archivo debajo.</h4>
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

        {"message" in data ? null : (
          <Fragment>
            <Separator className="my-16 bg-zinc-700" />

            <section className="flex flex-col gap-12 mt-16">
              <div className="flex flex-col gap-2">
                <h3 className="text-2xl font-semibold text-zinc-50">SubTips</h3>
                <h4 className="text-zinc-400">Te recomendamos algunos tips para una mejor experiencia</h4>
              </div>
              <Tabs defaultValue="play-subtitle">
                <TabsList>
                  <TabsTrigger value="play-subtitle" className="text-sm">
                    ¿Cómo reproduzco un subtítulo?
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="play-subtitle" className="mt-6 flex flex-col gap-4">
                  <Alert
                    className="bg-zinc-950 border border-zinc-800 flex items-start gap-4"
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
                    className="bg-zinc-950 border border-zinc-800 flex items-start gap-4"
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
          </Fragment>
        )}
      </article>
      {"message" in data ? null : data.title.poster ? (
        <figure className="max-w-sm pt-12 hidden lg:flex flex-col items-center gap-2">
          <img
            alt={data.title.title_name}
            src={data.title.poster}
            className="object-cover rounded-md border border-zinc-700/80"
          />
          <figcaption className="text-zinc-400 text-sm">
            {data.title.title_name} ({data.title.year})
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}
