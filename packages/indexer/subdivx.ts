import * as cheerio from "cheerio";
import phpurlencode from "phpurlencode";
import invariant from "tiny-invariant";
import { z } from "zod";

// shared
import { type TitleFileNameMetadata, getStringWithoutSpecialCharacters } from "@subtis/shared";

// internals
import { getFullImdbId } from "./imdb";
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

export type SubDivXSubtitles = z.infer<typeof subdivxSubtitlesSchema>;
type SubDivXToken = z.infer<typeof subdivxTokenSchema>;

// helpers
export async function getSubDivXParameter(): Promise<string> {
  const response = await fetch(SUBDIVX_BASE_URL);
  const html = await response.text();

  const $ = cheerio.load(html);
  const versionElement = $("#vs");

  if (!versionElement) {
    throw new Error("Version not found");
  }

  const version = versionElement.text();
  const parsedVersion = version?.replace(".", "").replace("v", "");

  return `buscar${parsedVersion}`;
}

export async function getSubDivXToken(): Promise<SubDivXToken & { cookie: string | null }> {
  const response = await fetch(`${SUBDIVX_BASE_URL}/inc/gt.php?gt=1`);
  const data = await response.json();

  const { token } = subdivxTokenSchema.parse(data);
  return { token, cookie: response.headers.get("Set-Cookie") };
}

async function getSubtitlesFromSubDivXForTitleByQuery({
  subdivxToken,
  subdivxCookie,
  subdivxParameter,
  titleProviderQuery,
  hasBeenExecutedOnce,
}: {
  subdivxToken: string;
  subdivxCookie: string | null;
  subdivxParameter: string;
  titleProviderQuery: string;
  hasBeenExecutedOnce: boolean;
}): Promise<SubDivXSubtitles> {
  const encodedTitleProviderQuery = phpurlencode(titleProviderQuery);
  const titleOnlyWithoutYear = titleProviderQuery.replace(/\d{4}/gi, "").trim().toLowerCase();

  const bodyURL = `tabla=resultados&filtros=&${subdivxParameter}=${encodedTitleProviderQuery}&token=${subdivxToken}`;

  const response = await fetch(`${SUBDIVX_BASE_URL}/inc/ajax.php`, {
    headers: {
      Cookie: subdivxCookie ?? "",
      "X-Requested-With": "XMLHttpRequest",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    method: "POST",
    body: bodyURL,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch subtitles from SubDivX");
  }

  const data = await response.json();
  console.log("\n ~ data:", data);

  if (data === null) {
    return { aaData: [], iTotalDisplayRecords: 0, iTotalRecords: 0, sEcho: "" };
  }

  const subtitles = subdivxSubtitlesSchema.parse(data);
  console.log("\n ~ subtitles:", subtitles);

  if (subtitles.aaData.length === 0 && hasBeenExecutedOnce === false && titleProviderQuery.includes("&")) {
    const parsedTitleProviderQuery = titleProviderQuery.replace(" & ", " and ");
    await Bun.sleep(6000);

    return getSubtitlesFromSubDivXForTitleByQuery({
      subdivxToken,
      subdivxCookie,
      subdivxParameter,
      hasBeenExecutedOnce: true,
      titleProviderQuery: parsedTitleProviderQuery,
    });
  }

  if (subtitles.aaData.length === 0 && hasBeenExecutedOnce === false) {
    const lastCharacter = titleProviderQuery.at(-1);
    const newTitleProviderQuery = `${titleProviderQuery.slice(0, -1)}${Number(lastCharacter) - 1}`;
    await Bun.sleep(6000);

    return getSubtitlesFromSubDivXForTitleByQuery({
      subdivxToken,
      subdivxCookie,
      subdivxParameter,
      hasBeenExecutedOnce: true,
      titleProviderQuery: newTitleProviderQuery,
    });
  }

  // Filter similar titles
  const filteredSubtitles = subtitles.aaData.filter((subtitle) => {
    let parsedSubtitleTitle = subtitle.titulo.toLowerCase();

    const akaIndex = parsedSubtitleTitle.indexOf("aka");
    const directorsCutIndex = parsedSubtitleTitle.indexOf("director");

    if (akaIndex !== -1) {
      console.log("a");
      parsedSubtitleTitle = parsedSubtitleTitle.slice(0, akaIndex);
    }

    if (directorsCutIndex !== -1) {
      console.log("b");
      parsedSubtitleTitle = parsedSubtitleTitle.slice(0, directorsCutIndex);
    }

    if (!getStringWithoutSpecialCharacters(parsedSubtitleTitle).startsWith(`${titleOnlyWithoutYear} `)) {
      console.log("c");
      return false;
    }

    if (parsedSubtitleTitle.length > titleProviderQuery.length + 16) {
      console.log("d");
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

async function getSubtitlesFromSubDivXForTitleByImdbId({
  imdbId,
  subdivxToken,
  subdivxCookie,
  subdivxParameter,
}: {
  imdbId: string;
  subdivxToken: string;
  subdivxCookie: string | null;
  subdivxParameter: string;
}): Promise<SubDivXSubtitles> {
  const fullImdbId = getFullImdbId(imdbId);
  const bodyURL = `tabla=resultados&filtros=&${subdivxParameter}=${fullImdbId}&token=${subdivxToken}`;

  const response = await fetch(`${SUBDIVX_BASE_URL}/inc/ajax.php`, {
    headers: {
      Cookie: subdivxCookie ?? "",
      "X-Requested-With": "XMLHttpRequest",
      "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    method: "POST",
    body: bodyURL,
  });

  if (!response.ok) {
    throw new Error("Failed to fetch subtitles from SubDivX");
  }

  const data = await response.json();

  if (data === null) {
    return { aaData: [], iTotalDisplayRecords: 0, iTotalRecords: 0, sEcho: "" };
  }

  const subtitles = subdivxSubtitlesSchema.parse(data);

  return {
    ...subtitles,
  };
}
// core
export async function getSubtitlesFromSubDivXForTitle({
  imdbId,
  subdivxToken,
  subdivxCookie,
  subdivxParameter,
  titleProviderQuery,
}: {
  imdbId: string;
  subdivxToken: string;
  subdivxCookie: string | null;
  subdivxParameter: string;
  titleProviderQuery: string;
}): Promise<SubDivXSubtitles | null> {
  console.log("\n ~ subdivxToken:", subdivxToken);
  console.log("\n ~ subdivxParameter:", subdivxParameter);
  try {
    const subtitlesByQuery = await getSubtitlesFromSubDivXForTitleByQuery({
      subdivxToken,
      subdivxCookie,
      subdivxParameter,
      titleProviderQuery,
      hasBeenExecutedOnce: false,
    });
    console.log("\n ~ subtitlesByQuery:", subtitlesByQuery);

    if (subtitlesByQuery.aaData.length > 0) {
      return subtitlesByQuery;
    }

    await Bun.sleep(6000);
    const subtitlesByImdbId = await getSubtitlesFromSubDivXForTitleByImdbId({
      imdbId,
      subdivxToken,
      subdivxCookie,
      subdivxParameter,
    });

    return subtitlesByImdbId;
  } catch (error) {
    console.log("Couldn't get subtitles from OpenSubtitles");
    console.log("\n ~ getSubtitlesFromOpenSubtitlesForTitle ~ error:", error);
    return null;
  }
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

    let hasMovieResolution = false;

    if (resolution === "2160p") {
      hasMovieResolution = movieDescription.includes(resolution) || movieDescription.includes("4k");
    } else {
      hasMovieResolution = movieDescription.includes(resolution);
    }

    const hasReleaseGroup = releaseGroup.query_matches.some((searchableSubDivXName) => {
      return movieDescription.includes(searchableSubDivXName.toLowerCase());
    });

    const hasFileName = movieDescription.includes(fileNameWithoutExtension.toLowerCase());

    return hasFileName || (hasMovieResolution && hasReleaseGroup);
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
