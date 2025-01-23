import { zodResolver } from "@hookform/resolvers/zod";
import type { LoaderFunctionArgs, MetaFunction } from "@remix-run/cloudflare";
import { useLoaderData, useParams } from "@remix-run/react";
import { Link } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { AnimatePresence, motion, useAnimation } from "motion/react";
import { useForm } from "react-hook-form";
import { z } from "zod";

// api
import type { SubtitleNormalized } from "@subtis/api";

// shared external
import { getApiClient, getIsCinemaRecording } from "@subtis/shared";

// shared internal
import { VideoDropzone } from "~/components/shared/video-dropzone";

// icons
import { AirplaneIcon } from "~/components/icons/airplane";
import { BadgeAlertIcon } from "~/components/icons/badge-alert";
import { DownloadIcon } from "~/components/icons/download";

// lib
import { cn } from "~/lib/utils";

// ui
import { Button } from "~/components/ui/button";
import { DataTable } from "~/components/ui/data-table";
import DotPattern from "~/components/ui/dot-pattern";
import { Form, FormControl, FormField, FormItem } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Separator } from "~/components/ui/separator";
import { ToastAction } from "~/components/ui/toast";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

// hooks
import { useToast } from "~/hooks/use-toast";

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
      return <div className="w-2">{row.index + 1}</div>;
    },
    enableSorting: false,
  },
  {
    accessorKey: "subtitle.resolution",
    header: "Resolución",
    enableSorting: false,
  },
  {
    accessorKey: "release_group.release_group_name",
    header: "Publicador",
    enableSorting: false,
    cell: ({ row }) => {
      return (
        <Tooltip>
          <TooltipTrigger className="truncate w-20 cursor-default text-left">
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
    enableSorting: false,
  },
  {
    accessorKey: "subtitle.queried_times",
    header: "Descargas",
    enableSorting: false,
  },
  {
    accessorKey: "",
    header: "Acciones",
    enableSorting: false,
    cell: ({ row }) => {
      // motion hooks
      const controls = useAnimation();

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
          title: "Disfruta de tu subtítulo!",
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
        <Tooltip>
          <TooltipTrigger>
            <a
              href={row.original.subtitle.subtitle_link}
              download
              className="inline-flex items-center gap-1 p-1"
              onMouseEnter={() => controls.start("animate")}
              onMouseLeave={() => controls.start("normal")}
              onClick={handleDownloadSubtitle}
            >
              <DownloadIcon size={16} controls={controls} />
            </a>
          </TooltipTrigger>
          <TooltipContent side="bottom">Descargar subtítulo</TooltipContent>
        </Tooltip>
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
      { name: "description", content: "Subtítutlos para todas tus películas" },
    ];
  }

  return [
    { title: `Subtis | Subtitulos Alternativos para ${data.title.title_name} (${data.title.year})` },
    { name: "description", content: "Subtítutlos para todas tus películas" },
  ];
};

export default function NotFoundSubtitlePage() {
  // remix hooks
  const data = useLoaderData<typeof loader>();

  // navigation hooks
  const { bytes, fileName } = useParams();

  // form hooks
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  });

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

  // constants
  const isCinemaRecording = getIsCinemaRecording(fileName as string);

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-xl w-full">
        <section className="flex flex-col gap-12">
          {"message" in data ? (
            <div className="flex flex-col gap-4">
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold">Lo sentimos :(</h1>
              <div className="flex flex-col gap-1">
                <h2 className="text-zinc-50 text-sm md:text-base">
                  No encontramos el subtítulo específico para tu versión.
                </h2>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <h1 className="text-zinc-50 text-3xl md:text-4xl font-bold">Lo sentimos :(</h1>
              <div className="flex flex-col gap-1">
                <h2 className="text-zinc-50 text-sm md:text-base">
                  No encontramos el subtítulo específico para tu versión.
                </h2>
                <p className="text-zinc-300 text-xs md:text-sm">
                  Probá con la siguiente versión de{" "}
                  <Link to={`/subtitles/movie/${data.title.imdb_id}`} className="hover:underline text-zinc-50">
                    {data.title.title_name} ({data.title.year})
                  </Link>
                  .
                </p>
              </div>
            </div>
          )}

          {"message" in data ? null : <DataTable columns={columns} data={[data]} />}

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
                    Podés dejarnos tu e-mail y te enviamos el subtítulo apenas lo encontremos.
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
                              className="w-full bg-zinc-950 border border-zinc-700 placeholder:text-zinc-400 focus:border-zinc-400 focus-visible:ring-0 rounded-sm"
                              {...field}
                            />
                          </FormControl>
                          {form.formState.errors.email ? (
                            <div className="flex flex-row items-center gap-2 ">
                              <BadgeAlertIcon size={16} className="text-zinc-400" />
                              <p className="text-zinc-400 text-sm">Por favor ingresa un correo electrónico válido.</p>
                            </div>
                          ) : (
                            <p className="text-zinc-400 text-sm">
                              Ingresa una dirección de correo válida para recibir tu subtítulo.
                            </p>
                          )}
                        </FormItem>
                      )}
                    />
                    <Button
                      type="submit"
                      disabled={form.formState.isSubmitting}
                      className="w-36 flex-shrink-0 rounded-sm"
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
                <span className="text-zinc-400 text-sm">Te haremos saber cuando tengamos tu subtítulo disponible.</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <Separator className="my-16 bg-zinc-700" />

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar nuevo subtítulo por archivo</h3>
            <h4 className="text-zinc-50 text-sm md:text-base">
              ¿Querés buscar un subtítulo nuevo? Arrastrá el archivo debajo.
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
      </article>
      <figure className="flex-1 hidden lg:flex justify-center">
        <img src="/broken-logo.webp" alt="Cargando" className="size-64" />
      </figure>
    </div>
  );
}
