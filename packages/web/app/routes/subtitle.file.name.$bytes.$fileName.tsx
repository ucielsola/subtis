import type { LoaderFunctionArgs } from "@remix-run/node";
import { redirect, useLoaderData } from "@remix-run/react";
import type { ColumnDef } from "@tanstack/react-table";
import { useAnimation } from "motion/react";

// api
import type { SubtitleNormalized } from "@subtis/api";

// shared external
import { getApiClient } from "@subtis/shared";

// shared internal
import { VideoDropzone } from "~/components/shared/video-dropzone";

// icons
import { DownloadIcon } from "~/components/icons/download";

// lib
import { cn } from "~/lib/utils";

// ui
import { DataTable } from "~/components/ui/data-table";
import DotPattern from "~/components/ui/dot-pattern";

// constants
export const columns: ColumnDef<SubtitleNormalized>[] = [
  {
    accessorKey: "index",
    header: "#",
    cell: ({ row }) => {
      return <span>{row.index + 1}</span>;
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
      const controls = useAnimation();

      return (
        <a
          href={row.original.subtitle.subtitle_link}
          download
          className="inline-block"
          onMouseEnter={() => controls.start("animate")}
          onMouseLeave={() => controls.start("normal")}
        >
          <DownloadIcon size={16} controls={controls} />
        </a>
      );
    },
  },
];

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

  const primarySubtitle = await primarySubtitleResponse.json();

  return primarySubtitle;
};

export default function Subtitle() {
  const data = useLoaderData<typeof loader>();

  if ("message" in data) {
    return null;
  }

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article>
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-zinc-50 text-5xl font-bold">Subtítulo encontrado!</h1>
            <h2 className="text-zinc-400">Descarga el siguiente subtítulo para disfrutar de tu película.</h2>
          </div>
          <DataTable columns={columns} data={[data]} />
        </section>

        <section className="flex flex-col gap-12 mt-16">
          <div className="flex flex-col gap-2">
            <h3 className="text-2xl font-semibold text-zinc-50">Buscar nuevo subtítulo por archivo</h3>
            <h4 className="text-zinc-400">Querés buscar un subtítulo nuevo? Arrastra el archivo acá:</h4>
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
      </article>
      {data.title.poster ? (
        <figure className="max-w-sm pt-12 hidden lg:flex flex-col items-center gap-2">
          <img
            alt={data.title.title_name}
            src={data.title.poster}
            className="object-cover rounded-sm border border-zinc-700/80"
          />
          <figcaption className="text-zinc-400 text-sm">
            {data.title.title_name} ({data.title.year})
          </figcaption>
        </figure>
      ) : null}
    </div>
  );
}
