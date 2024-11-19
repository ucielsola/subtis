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
    <div className="pt-24 pb-48 flex flex-row justify-between gap-4">
      <div>
        <div className="flex flex-col gap-7">
          <div className="flex flex-col gap-4">
            <h1 className="text-slate-950 text-5xl font-bold ">Subtítulo encontrado!</h1>
            <h2 className="text-slate-600">Descarga el siguiente subtítulo para disfrutar de tu película.</h2>
          </div>
          <div className="bg-white rounded-sm border border-slate-200 p-2">
            <Table className="rounded-sm overflow-hidden">
              <TableHeader className="bg-slate-100">
                <TableRow>
                  <TableHead className="text-slate-700 h-8 text-sm">#</TableHead>
                  <TableHead className="text-slate-700 h-8 text-sm">Resolución</TableHead>
                  <TableHead className="text-slate-700 h-8 text-sm">Publicador</TableHead>
                  <TableHead className="text-slate-700 h-8 text-sm">Descargas</TableHead>
                  <TableHead className="text-center text-slate-700 h-8 text-sm">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="text-slate-950 text-xs">1</TableCell>
                  <TableCell className="text-slate-950 text-xs">{data.subtitle.resolution}</TableCell>
                  <TableCell className="text-slate-950 text-xs">{data.releaseGroup.release_group_name}</TableCell>
                  <TableCell className="text-slate-950 text-xs">{data.subtitle.queried_times}</TableCell>
                  <TableCell className="text-center text-slate-950 text-xs">
                    <a href={data.subtitle.subtitle_link}>
                      <DownloadIcon />
                    </a>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>

        <div className="flex flex-col gap-4 mt-16">
          <h3 className="text-slate-950 text-2xl font-semibold ">Buscar nuevo subtítulo por archivo</h3>
          <h4 className="text-slate-600">
            Querés buscar un subtítulo nuevo? Arrastra el archivo de tu película debajo
          </h4>
        </div>
      </div>
      {data.title.poster ? (
        <div className="w-56 h-[336px] pt-[118px]">
          <img alt={data.title.title_name} src={data.title.poster} className="object-cover rounded-sm" />
        </div>
      ) : null}
    </div>
  );
}
