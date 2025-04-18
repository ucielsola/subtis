import { P, match } from "ts-pattern";
import { z } from "zod";

import type { ReleaseGroup } from "@subtis/db";
import { RELEASE_GROUPS } from "@subtis/indexer/release-groups";

import { VIDEO_FILE_EXTENSIONS } from "../../files";
import { getTitleFileNameWithoutExtension } from "../../titles";

// types
export type TvShowData = {
  resolution: string;
  fileNameWithoutExtension: string;
  releaseGroup: ReleaseGroup | undefined;
  searchableQuery: string;
  name: string;
};

export function getTvShowMetadata(
  tvShowFileName: string,
  tvShowQuery: string,
  tvShowTitle: string,
): {
  name: string;
  fileNameWithoutExtension: string;
  releaseGroup: ReleaseGroup;
  resolution: string;
  searchableQuery: string;
} {
  const [_tvShowNameWithYear, rawAttributes] = tvShowFileName.split(/s\d{2}e\d{2}/gi);

  const lowerCaseRawAttributes = rawAttributes.toLowerCase();
  const parsedRawAttributes = lowerCaseRawAttributes.includes("YTS")
    ? lowerCaseRawAttributes.replace("AAC", "")
    : lowerCaseRawAttributes;

  const videoFileExtension = VIDEO_FILE_EXTENSIONS.find((videoFileExtension) => {
    return rawAttributes.includes(videoFileExtension);
  });

  const videoFileExtensionParsed = z
    .string({ message: `Video file extension not supported: ${tvShowFileName}` })
    .parse(videoFileExtension);

  const resolution = match(rawAttributes)
    .with(P.string.includes("480"), () => "480")
    .with(P.string.includes("576"), () => "576")
    .with(P.string.includes("1080"), () => "1080")
    .with(P.string.includes("720"), () => "720")
    .with(P.string.includes("2160"), () => "2160")
    .with(P.string.includes("3D"), () => "3D")
    .run();

  const fileNameWithoutExtension = getTitleFileNameWithoutExtension(tvShowFileName);

  const releaseGroup = Object.values(RELEASE_GROUPS).find((releaseGroupInternal) => {
    return releaseGroupInternal.matches.some((attribute) => {
      return parsedRawAttributes.includes(attribute.toLowerCase());
    });
  });

  if (!releaseGroup) {
    const unsupportedReleaseGroup = rawAttributes
      .split(videoFileExtensionParsed)
      .at(0)
      ?.split(/\.|\s/g)
      .at(-1)
      ?.replace("x264-", "") as string;

    console.error(`🛑 Release group ${unsupportedReleaseGroup} no soportado 🛑`);
  }

  return {
    name: tvShowTitle,
    fileNameWithoutExtension,
    releaseGroup: releaseGroup as unknown as ReleaseGroup,
    resolution,
    searchableQuery: tvShowQuery,
  };
}
