import { JSDOM } from "jsdom";
import slugify from "slugify";
import invariant from "tiny-invariant";

import { getIsLinkAlive } from "./utils";
import { SUBTITLE_GROUPS } from "./subtitle-groups";
import { ReleaseGroupNames } from "./release-groups";

const SUBDIVX_BASE_URL = "https://subdivx.com" as const;

export function getSubDivXSearchParams(movieName: string, page = "1") {
  return {
    pg: page,
    buscar2: movieName,
    accion: "5",
    masdesc: "",
    realiza_b: "1",
    subtitulos: "1",
  };
}

export async function getSubDivXSearchPageHtml(
  movieName: string,
  page = "1",
): Promise<string> {
  const searchParams = getSubDivXSearchParams(movieName, page);
  const urlSearchParams = new URLSearchParams(searchParams);

  const response = await fetch(`${SUBDIVX_BASE_URL}/index.php`, {
    method: "POST",
    body: urlSearchParams,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });

  const html = await response.text();
  return html;
}

export async function getSubDivXSubtitleDownloadLink(
  subtitlePage: string,
): Promise<string> {
  const response = await fetch(subtitlePage);
  const html = await response.text();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const anchor = document.querySelector(".link1");
  invariant(anchor, "Link should be defined");

  const href = anchor.getAttribute("href");
  const subtitleLink = `${SUBDIVX_BASE_URL}/${href}`;

  return subtitleLink;
}

export async function getSubDivXSubtitleLink(
  movieData: {
    name: string;
    year: number;
    resolution: string;
    searchableMovieName: string;
    searchableSubDivXName: string;
    searchableArgenteamName: string;
    releaseGroup: ReleaseGroupNames;
  },
  page = "1",
): Promise<{
  subtitleLink: string;
  subtitleGroup: string;
  subtitleSrtFileName: string;
  subtitleCompressedFileName: string;
  subtitleFileNameWithoutExtension: string;
  fileExtension: "zip" | "rar";
}> {
  const {
    name,
    searchableMovieName,
    resolution,
    releaseGroup,
    searchableSubDivXName,
  } = movieData;

  const subtitlePageHtml = await getSubDivXSearchPageHtml(
    searchableMovieName,
    page,
  );

  const dom = new JSDOM(subtitlePageHtml);
  const document = dom.window.document;

  const allSubtitlesElements = [
    ...document.querySelectorAll("#buscador_detalle"),
  ];
  invariant(
    allSubtitlesElements.length > 0,
    "There should be at least one subtitle",
  );

  const value = allSubtitlesElements.find((element) => {
    const movieDetail = element.textContent?.toLowerCase();
    return movieDetail?.includes(searchableSubDivXName.toLowerCase());
  });

  const previousSibling = value?.previousSibling as Element;
  invariant(previousSibling, "Subtitle Element should exist");

  if (allSubtitlesElements.length > 90) {
    // Iterate to next pages until find the subtitle or no more results
    // The recursion will break loop on line 185
    return getSubDivXSubtitleLink(movieData, String(Number(page) + 1));
  }

  const hrefElement = previousSibling.querySelector(".titulo_menu_izq");
  invariant(hrefElement, "Anchor element should be defined");

  const subtitleHref = hrefElement.getAttribute("href");
  invariant(subtitleHref, "Subtitle page link should be defined");

  const subtitleDownloadLink = await getSubDivXSubtitleDownloadLink(
    subtitleHref,
  );

  // compressed file link
  const subtitleId = new URL(subtitleDownloadLink).searchParams.get("id");

  const subtitleRarLink = `${SUBDIVX_BASE_URL}/sub9/${subtitleId}.rar`;
  const subtitleZipLink = `${SUBDIVX_BASE_URL}/sub9/${subtitleId}.zip`;

  const isRarLinkAlive = await getIsLinkAlive(subtitleRarLink);
  const isZipLinkAlive = await getIsLinkAlive(subtitleZipLink);

  invariant(isRarLinkAlive || isZipLinkAlive, "Subtitle link should be alive");

  const fileExtension = isRarLinkAlive ? "rar" : "zip";
  const subtitleLink = isRarLinkAlive ? subtitleRarLink : subtitleZipLink;

  const subtitleSrtFileName = slugify(
    `${name}-${resolution}-${releaseGroup}-subdivx.srt`,
  ).toLowerCase();
  const subtitleFileNameWithoutExtension = slugify(
    `${name}-${resolution}-${releaseGroup}-subdivx`,
  ).toLowerCase();
  const subtitleCompressedFileName = slugify(
    `${name}-${resolution}-${releaseGroup}-subdivx.${fileExtension}`,
  ).toLowerCase();

  const subtitleGroup = SUBTITLE_GROUPS.SUBDIVX.name;

  return {
    fileExtension,
    subtitleLink,
    subtitleGroup,
    subtitleSrtFileName,
    subtitleCompressedFileName,
    subtitleFileNameWithoutExtension,
  };
}
