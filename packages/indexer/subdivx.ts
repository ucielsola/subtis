import invariant from "tiny-invariant";
import { z } from "zod";

// shared
import type { TitleFileNameMetadata } from "@subtis/shared";

// internals
import { generateSubtitleFileNames } from "./subtitle-filenames";
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

const subdivxSubtitlesSchema = z.object({
  aaData: z.array(subdivxSubtitleSchema),
  iTotalDisplayRecords: z.number(),
  iTotalRecords: z.number(),
  sEcho: z.string(),
});

const subdivxTokenSchema = z.object({
  token: z.string(),
});

type SubDivXSubtitles = z.infer<typeof subdivxSubtitlesSchema>;
type SubDivXToken = z.infer<typeof subdivxTokenSchema>;

// helpers
export async function getSubDivXToken(): Promise<SubDivXToken & { cookie: string | null }> {
  const response = await fetch(`${SUBDIVX_BASE_URL}/inc/gt.php?gt=1`);
  const data = await response.json();

  const { token } = subdivxTokenSchema.parse(data);
  return { token, cookie: response.headers.get("Set-Cookie") };
}

// core
export async function getSubtitlesFromSubDivXForTitle({
  subdivxToken,
  subdivxCookie,
  titleProviderQuery,
  hasBeenExecutedOnce,
}: {
  subdivxToken: string;
  subdivxCookie: string | null;
  titleProviderQuery: string;
  hasBeenExecutedOnce: boolean;
}): Promise<SubDivXSubtitles> {
  const response = await fetch(`${SUBDIVX_BASE_URL}/inc/ajax.php`, {
    headers: {
      Cookie: subdivxCookie ?? "",
      "X-Requested-With": "XMLHttpRequest",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    method: "POST",
    body: `tabla=resultados&filtros=&buscar393=${encodeURIComponent(titleProviderQuery)}&token=${subdivxToken}`,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch subtitles from SubDivX");
  }

  const data = await response.json();

  if (data === null) {
    return { aaData: [], iTotalDisplayRecords: 0, iTotalRecords: 0, sEcho: "" };
  }

  const subtitles = subdivxSubtitlesSchema.parse(data);

  if (subtitles.aaData.length === 0 && hasBeenExecutedOnce === false) {
    const lastCharacter = titleProviderQuery.at(-1);
    const newTitleProviderQuery = `${titleProviderQuery.slice(0, -1)}${Number(lastCharacter) - 1}`;
    await Bun.sleep(6000);

    return getSubtitlesFromSubDivXForTitle({
      subdivxToken,
      subdivxCookie,
      hasBeenExecutedOnce: true,
      titleProviderQuery: newTitleProviderQuery,
    });
  }

  // Filter similar titles
  const filteredSubtitles = subtitles.aaData.filter((subtitle) => {
    if (subtitle.titulo.length > titleProviderQuery.length + 10) {
      return false;
    }

    return true;
  });

  const result = {
    ...subtitles,
    aaData: filteredSubtitles,
  };

  return result;
}

export async function filterSubDivXSubtitlesForTorrent({
  episode,
  subtitles,
  titleFileNameMetadata,
}: {
  episode: string | null;
  subtitles: SubDivXSubtitles;
  titleFileNameMetadata: TitleFileNameMetadata;
}): Promise<SubtitleData> {
  const { fileNameWithoutExtension, name, releaseGroup, resolution } = titleFileNameMetadata;

  if (!releaseGroup) {
    throw new Error("release group undefined");
  }

  const subtitle = subtitles.aaData.find((subtitle) => {
    const movieDescription = subtitle.descripcion.toLowerCase();

    const hasMovieResolution = movieDescription.includes(resolution);
    const hasReleaseGroup = releaseGroup.query_matches.some((searchableSubDivXName) => {
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

  const subtitleGroupName = SUBTITLE_GROUPS.SUBDIVX.subtitle_group_name;

  const subtitleFileNames = generateSubtitleFileNames({
    name,
    resolution,
    subtitleGroupName,
    fileExtension,
    fileNameWithoutExtension,
    episode,
    releaseGroupName: releaseGroup.release_group_name,
  });

  return {
    lang: "es",
    subtitleLink,
    fileExtension,
    subtitleGroupName,
    ...subtitleFileNames,
  };
}
