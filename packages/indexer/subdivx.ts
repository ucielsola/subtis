import invariant from "tiny-invariant";
import { z } from "zod";

// shared
import type { MovieData } from "@subtis/shared";

import { generateSubtitleFileNames } from "./subtitle-filenames";
// internals
import { SUBTITLE_GROUPS } from "./subtitle-groups";
import type { FileExtension, SubtitleData } from "./types";
import { getIsLinkAlive } from "./utils";

// constants
const SUBDIVX_BASE_URL = "https://subdivx.com" as const;
const SUBDIVX_BREADCRUMB_ERROR = "SUBDIVX_ERROR" as const;

// schemas
const subdivxSubtitleSchema = z.object({
  calificacion: z.string().optional(),
  cds: z.number(),
  comentarios: z.number(),
  descargas: z.number(),
  descripcion: z.string(),
  eliminado: z.union([z.literal(0), z.literal(1)]),
  fecha: z.string().optional(),
  formato: z.string(),
  fotos: z.string(),
  framerate: z.string(),
  id: z.number(),
  idmoderador: z.number(),
  nick: z.string(),
  promedio: z.string(),
  titulo: z.string(),
});

const subdivxSchema = z.object({
  aaData: z.array(subdivxSubtitleSchema),
  iTotalDisplayRecords: z.number(),
  iTotalRecords: z.number(),
  sEcho: z.string(),
});

// core
export async function getSubDivXSubtitle({
  movieData,
}: {
  movieData: MovieData;
  page?: string;
}): Promise<SubtitleData> {
  const { fileNameWithoutExtension, name, releaseGroup, resolution, searchableMovieName } = movieData;

  if (!releaseGroup) {
    throw new Error("release group undefined");
  }

  const response = await fetch(`${SUBDIVX_BASE_URL}/inc/ajax.php`, {
    body: `tabla=resultados&filtros=&buscar=${searchableMovieName}`,
    headers: {
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    method: "POST",
  });

  const data = await response.json();
  const subtitles = subdivxSchema.parse(data);

  const subtitle = subtitles.aaData.find((subtitle) => {
    const movieDescription = subtitle.descripcion.toLowerCase();

    const hasMovieResolution = movieDescription.includes(resolution);
    const hasReleaseGroup = releaseGroup.searchable_subdivx_name.some((searchableSubDivXName) => {
      return movieDescription.includes(searchableSubDivXName.toLowerCase());
    });

    return hasMovieResolution && hasReleaseGroup;
  });

  invariant(subtitle, `[${SUBDIVX_BREADCRUMB_ERROR}]: Subtitle doesn't exists`);

  let subtitleLink = "";
  let fileExtension: FileExtension | null = null;
  const pathIds = [9, 8, 7, 6, 5, 4, 3, 2, 1];

  for await (const pathId of pathIds) {
    const subtitleRarLink = `${SUBDIVX_BASE_URL}/sub${pathId}/${subtitle.id}.rar`;
    const subtitleZipLink = `${SUBDIVX_BASE_URL}/sub${pathId}/${subtitle.id}.zip`;

    const isRarLinkAlive = await getIsLinkAlive(subtitleRarLink);
    const isZipLinkAlive = await getIsLinkAlive(subtitleZipLink);

    if (isRarLinkAlive || isZipLinkAlive) {
      fileExtension = isRarLinkAlive ? "rar" : "zip";
      subtitleLink = isRarLinkAlive ? subtitleRarLink : subtitleZipLink;
      break;
    }
  }

  invariant(subtitleLink, `[${SUBDIVX_BREADCRUMB_ERROR}]: Subtitle link should be alive`);
  invariant(fileExtension, `[${SUBDIVX_BREADCRUMB_ERROR}]: Subtitle file extension should be defined`);

  const subtitleGroup = SUBTITLE_GROUPS.SUBDIVX.name;

  const subtitleFileNames = generateSubtitleFileNames({
    name,
    resolution,
    subtitleGroup,
    fileExtension,
    fileNameWithoutExtension,
    releaseGroupName: releaseGroup.name,
  });

  return {
    lang: "es",
    subtitleLink,
    fileExtension,
    subtitleGroup,
    ...subtitleFileNames,
  };
}
