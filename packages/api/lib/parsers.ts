import { z } from "zod";

// internals
import { getSubtitleShortLink } from "./links";
import { type SubtisSubtitle, releaseGroupSchema, subtitleGroupSchema, subtitleSchema, titleSchema } from "./schemas";

// parsed rip types
type RipTypeOutput = "BluRay" | "HDRip" | "Theater" | "BrRip" | "WEBRip" | "Web-DL" | "WEB" | "DV" | null;

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

  if (ripType === "dv") {
    return "DV";
  }

  throw new Error(`Unknown rip type: ${ripType}`);
}

// subtitle normalized
export const subtitleNormalizedSchema = z.object({
  title: titleSchema,
  release_group: releaseGroupSchema,
  subtitle_group: subtitleGroupSchema,
  subtitle: subtitleSchema.omit({ title: true, release_group: true, subtitle_group: true }),
});

export type SubtitleNormalized = z.infer<typeof subtitleNormalizedSchema>;

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

// subtitles normalized
const subtitlesNormalizedSchema = z.object({
  release_group: releaseGroupSchema,
  subtitle_group: subtitleGroupSchema,
  subtitle: subtitleSchema.omit({ title: true, release_group: true, subtitle_group: true }),
});

export type SubtitlesNormalized = z.infer<typeof subtitlesNormalizedSchema>;

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

// results with length
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
