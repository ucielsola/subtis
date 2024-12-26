import { z } from "zod";

// internals
import { getSubtitleShortLink } from "./links";
import { type SubtisSubtitle, releaseGroupSchema, subtitleGroupSchema, subtitleSchema, titleSchema } from "./schemas";

type RipTypeOutput = "BluRay" | "HDRip" | "Theater" | "BrRip" | "WEBRip" | "Web-DL" | "WEB" | null;

export function getParsedRipType(ripType: string | null): RipTypeOutput {
  if (!ripType) {
    return null;
  }

  if (ripType === "bluray") {
    return "BluRay";
  }

  if (ripType === "blu-ray") {
    return "BluRay";
  }

  if (ripType === "hdrip") {
    return "HDRip";
  }

  if (ripType === "theater") {
    return "Theater";
  }

  if (ripType === "brrip") {
    return "BrRip";
  }

  if (ripType === "webrip") {
    return "WEBRip";
  }

  if (ripType === "web-dl") {
    return "Web-DL";
  }

  if (ripType === "web") {
    return "WEB";
  }

  throw new Error(`Unknown rip type: ${ripType}`);
}

export type SubtitleNormalized = {
  title: SubtisSubtitle["title"];
  release_group: SubtisSubtitle["release_group"];
  subtitle_group: SubtisSubtitle["subtitle_group"];
  subtitle: Omit<SubtisSubtitle, "title" | "release_group" | "subtitle_group">;
};

export function getSubtitleNormalized(subtisSubtitle: SubtisSubtitle): SubtitleNormalized {
  const { title, release_group, subtitle_group, ...subtitle } = subtisSubtitle;

  const { rip_type: rawRipType, ...rest } = subtitle;

  const rip_type = getParsedRipType(rawRipType);
  const subtitle_link = getSubtitleShortLink(subtitle.id);
  const resolution = `${subtitle.resolution}p`;

  return {
    title,
    release_group,
    subtitle_group,
    subtitle: {
      ...rest,
      rip_type,
      resolution,
      subtitle_link,
    },
  };
}

export type SubtitlesNormalized = {
  release_group: SubtisSubtitle["release_group"];
  subtitle_group: SubtisSubtitle["subtitle_group"];
  subtitle: Omit<SubtisSubtitle, "title" | "release_group" | "subtitle_group">;
};

export function getSubtitlesNormalized(subtisSubtitle: SubtisSubtitle): SubtitlesNormalized {
  const { title: _title, release_group, subtitle_group, ...subtitle } = subtisSubtitle;

  const { rip_type: rawRipType, ...rest } = subtitle;

  const rip_type = getParsedRipType(rawRipType);
  const subtitle_link = getSubtitleShortLink(subtitle.id);
  const resolution = `${subtitle.resolution}p`;

  return {
    release_group,
    subtitle_group,
    subtitle: {
      ...rest,
      rip_type,
      resolution,
      subtitle_link,
    },
  };
}

export const subtitleNormalizedSchema = z.object({
  title: titleSchema,
  release_group: releaseGroupSchema,
  subtitle_group: subtitleGroupSchema,
  subtitle: subtitleSchema.omit({ title: true, release_group: true, subtitle_group: true }),
});

export type SubtisSubtitleNormalized = z.infer<typeof subtitleNormalizedSchema>;

type ResultsWithLength<T> = {
  results: T[];
  total: number;
};

export function getResultsWithLength<T>(results: T[]): ResultsWithLength<T> {
  return {
    total: results.length,
    results,
  };
}
