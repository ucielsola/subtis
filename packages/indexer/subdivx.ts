import * as cheerio from "cheerio";
import phpurlencode from "phpurlencode";
import invariant from "tiny-invariant";
import { z } from "zod";

// shared
import { type TitleFileNameMetadata, getIsCinemaRecording, getStringWithoutSpecialCharacters } from "@subtis/shared";

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
  imdb: z.string().nullable(),
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
  id_subido_por: z.number(),
  fecha_subida: z.string(),
  pais: z.number(),
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
type SubDivXSubtitle = z.infer<typeof subdivxSubtitleSchema>;
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
  fullImdbId,
  subdivxToken,
  subdivxCookie,
  subdivxParameter,
  titleProviderQuery,
  hasBeenExecutedOnce,
}: {
  fullImdbId: string;
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

  if (data === null) {
    return { aaData: [], iTotalDisplayRecords: 0, iTotalRecords: 0, sEcho: "" };
  }

  const subtitles = subdivxSubtitlesSchema.parse(data);

  if (subtitles.aaData.length === 0 && hasBeenExecutedOnce === false && titleProviderQuery.includes("&")) {
    const parsedTitleProviderQuery = titleProviderQuery.replace(" & ", " and ");
    await Bun.sleep(6000);

    return getSubtitlesFromSubDivXForTitleByQuery({
      fullImdbId,
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
      fullImdbId,
      subdivxToken,
      subdivxCookie,
      subdivxParameter,
      hasBeenExecutedOnce: true,
      titleProviderQuery: newTitleProviderQuery,
    });
  }

  // Filter similar titles
  const filteredSubtitles = subtitles.aaData.filter((subtitle) => {
    const parsedSubtitleTitle = subtitle.titulo.toLowerCase();
    const parsedSubtitleTitleWithoutSpecialCharacters = getStringWithoutSpecialCharacters(parsedSubtitleTitle);

    // const akaIndex = parsedSubtitleTitle.indexOf("aka");
    // const directorsCutIndex = parsedSubtitleTitle.indexOf("director");

    // if (akaIndex !== -1) {
    //   parsedSubtitleTitle = parsedSubtitleTitle.slice(0, akaIndex);
    // }

    // if (directorsCutIndex !== -1) {
    //   parsedSubtitleTitle = parsedSubtitleTitle.slice(0, directorsCutIndex);
    // }

    // TODO: Check if we need to check if the imdb is a string
    // if (typeof subtitle.imdb === "string" && subtitle.imdb !== fullImdbId) {
    if (subtitle.imdb !== fullImdbId) {
      return false;
    }

    if (!parsedSubtitleTitleWithoutSpecialCharacters.includes(titleOnlyWithoutYear)) {
      return false;
    }

    // TODO: Check if this is needed since sometimes filters more than 30 characters
    if (parsedSubtitleTitle.length > titleProviderQuery.length + 30) {
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
  fullImdbId,
  subdivxToken,
  subdivxCookie,
  subdivxParameter,
}: {
  fullImdbId: string;
  subdivxToken: string;
  subdivxCookie: string | null;
  subdivxParameter: string;
}): Promise<SubDivXSubtitles> {
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
  try {
    const fullImdbId = getFullImdbId(imdbId);

    const subtitlesByQuery = await getSubtitlesFromSubDivXForTitleByQuery({
      fullImdbId,
      subdivxToken,
      subdivxCookie,
      subdivxParameter,
      titleProviderQuery,
      hasBeenExecutedOnce: false,
    });

    if (subtitlesByQuery.aaData.length > 0) {
      return subtitlesByQuery;
    }

    await Bun.sleep(6000);
    const subtitlesByImdbId = await getSubtitlesFromSubDivXForTitleByImdbId({
      fullImdbId,
      subdivxToken,
      subdivxCookie,
      subdivxParameter,
    });

    return subtitlesByImdbId;
  } catch (error) {
    console.log("Couldn't get subtitles from SubDivX");
    console.log("\n ~ getSubtitlesFromSubDivXForTitle ~ error:", error);
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

  const sortedSubtitlesByDownloads = subtitles.aaData.toSorted((a, b) => (a.descargas < b.descargas ? 1 : -1));

  let subtitle: SubDivXSubtitle | undefined;

  const subtitlesWithoutCinemaRecordings = sortedSubtitlesByDownloads.filter((subtitle) => {
    return !getIsCinemaRecording(subtitle.descripcion);
  });

  subtitle = subtitlesWithoutCinemaRecordings.find((subtitle) => {
    const movieDescription = subtitle.descripcion.toLowerCase();

    let matchesResolution = false;

    if (resolution === "2160p") {
      matchesResolution = movieDescription.includes(resolution) || movieDescription.includes("4k");
    } else {
      matchesResolution = movieDescription.includes(resolution);
    }

    const matchesReleaseGroup = releaseGroup.matches.some((match) => {
      return movieDescription.includes(match.toLowerCase());
    });

    const matchesRipType = titleFileNameMetadata.ripType
      ? movieDescription.includes(titleFileNameMetadata.ripType)
      : false;

    const matchesFileName = movieDescription.includes(fileNameWithoutExtension.toLowerCase());

    return matchesFileName || (matchesResolution && matchesReleaseGroup && matchesRipType);
  });

  if (!subtitle) {
    subtitle = sortedSubtitlesByDownloads.find((subtitle) => {
      const movieDescription = subtitle.descripcion.toLowerCase();

      let matchesResolution = false;

      if (resolution === "2160p") {
        matchesResolution = movieDescription.includes(resolution) || movieDescription.includes("4k");
      } else {
        matchesResolution = movieDescription.includes(resolution);
      }

      const matchesReleaseGroup = releaseGroup.matches.some((match) => {
        return movieDescription.includes(match.toLowerCase());
      });

      const matchesFileName = movieDescription.includes(fileNameWithoutExtension.toLowerCase());

      return matchesFileName || (matchesResolution && matchesReleaseGroup);
    });
  }

  if (!subtitle) {
    subtitle = sortedSubtitlesByDownloads.find((subtitle) => {
      const movieDescription = subtitle.descripcion.toLowerCase();

      let matchesResolution = false;

      if (resolution === "2160p") {
        matchesResolution = movieDescription.includes(resolution) || movieDescription.includes("4k");
      } else {
        matchesResolution = movieDescription.includes(resolution);
      }

      const matchesReleaseGroup = releaseGroup.matches.some((match) => {
        return movieDescription.includes(match.toLowerCase());
      });

      const matchesRipType = titleFileNameMetadata.ripType
        ? movieDescription.includes(titleFileNameMetadata.ripType)
        : false;
      const matchesFileName = movieDescription.includes(fileNameWithoutExtension.toLowerCase());

      return matchesFileName || (matchesResolution && matchesReleaseGroup && matchesRipType);
    });

    if (!subtitle) {
      subtitle = sortedSubtitlesByDownloads.find((subtitle) => {
        const movieDescription = subtitle.descripcion.toLowerCase();

        let matchesResolution = false;

        if (resolution === "2160p") {
          matchesResolution = movieDescription.includes(resolution) || movieDescription.includes("4k");
        } else {
          matchesResolution = movieDescription.includes(resolution);
        }

        const matchesReleaseGroup = releaseGroup.matches.some((match) => {
          return movieDescription.includes(match.toLowerCase());
        });

        const matchesFileName = movieDescription.includes(fileNameWithoutExtension.toLowerCase());

        return matchesFileName || (matchesResolution && matchesReleaseGroup);
      });
    }
  }

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
    externalId: String(subtitle.id),
    ...subtitleFileNames,
  };
}
