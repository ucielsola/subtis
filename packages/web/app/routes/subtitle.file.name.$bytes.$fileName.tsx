import type { LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

// shared
import { getApiClient } from "@subtis/shared";

// ui
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";

// icons
import { DownloadIcon } from "~/components/icons/download";

export const loader = async ({ params }: LoaderFunctionArgs) => {
  const { bytes, fileName } = params;

  if (!bytes || !fileName) {
    throw new Error("Missing bytes or fileName");
  }

  const apiClient = getApiClient({
    apiBaseUrl: "https://api.subt.is" as string,
  });

  const subtitleResponse = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
    param: {
      bytes,
      fileName,
    },
  });

  const data = await subtitleResponse.json();

  return data;
};

export default function Subtitle() {
  const data = useLoaderData<typeof loader>();

  if ("message" in data) {
    return null;
  }

  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <div>
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-zinc-950 dark:text-zinc-50 text-5xl font-bold">Subtítulo encontrado!</h1>
            <h2 className="text-zinc-600 dark:text-zinc-400">
              Descarga el siguiente subtítulo para disfrutar de tu película.
            </h2>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-16">
          <h3 className="text-zinc-950 text-2xl font-semibold">Buscar nuevo subtítulo por archivo</h3>
          <h4 className="text-zinc-600">Querés buscar un subtítulo nuevo? Arrastra el archivo de tu película debajo</h4>
        </div>
      </div>
      {data.title.poster ? (
        <div className="max-w-sm max-h-[571px] pt-[118px] hidden lg:block">
          <img alt={data.title.title_name} src={data.title.poster} className="object-cover rounded-sm" />
        </div>
      ) : null}
    </div>
  );
}
