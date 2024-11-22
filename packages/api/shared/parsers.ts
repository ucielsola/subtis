import { z } from "zod";

// internals
import { getSubtitleShortLink } from "./links";
import { type SubtisSubtitle, releaseGroupSchema, subtitleGroupSchema, subtitleSchema, titleSchema } from "./schemas";

// types
type SubtitleNormalized = {
  title: SubtisSubtitle["title"];
  releaseGroup: SubtisSubtitle["releaseGroup"];
  subtitleGroup: SubtisSubtitle["subtitleGroup"];
  subtitle: Omit<SubtisSubtitle, "title" | "releaseGroup" | "subtitleGroup">;
};

type SubtitlesNormalized = {
  releaseGroup: SubtisSubtitle["releaseGroup"];
  subtitleGroup: SubtisSubtitle["subtitleGroup"];
  subtitle: Omit<SubtisSubtitle, "title" | "releaseGroup" | "subtitleGroup">;
};

type ResultsWithLength<T> = {
  results: T[];
  total: number;
};

function getParsedRipType(ripType: string | null) {
  if (!ripType) {
    return null;
  }

  if (ripType === "bluray") {
    return "BluRay";
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

  if (ripType === "repack") {
    return "REPACK";
  }

  return ripType;
}

export function getSubtitleNormalized(subtisSubtitle: SubtisSubtitle): SubtitleNormalized {
  const { title, releaseGroup, subtitleGroup, ...subtitle } = subtisSubtitle;

  const { rip_type: rawRipType, ...rest } = subtitle;
  const rip_type = getParsedRipType(rawRipType);
  const subtitle_link = getSubtitleShortLink(subtitle.id);

  return {
    title,
    releaseGroup,
    subtitleGroup,
    subtitle: {
      ...rest,
      rip_type,
      subtitle_link,
    },
  };
}

export function getSubtitlesNormalized(subtisSubtitle: SubtisSubtitle): SubtitlesNormalized {
  const { title: _title, releaseGroup, subtitleGroup, ...subtitle } = subtisSubtitle;

  const { rip_type: rawRipType, ...rest } = subtitle;
  const rip_type = getParsedRipType(rawRipType);
  const subtitle_link = getSubtitleShortLink(subtitle.id);

  return {
    releaseGroup,
    subtitleGroup,
    subtitle: {
      ...rest,
      rip_type,
      subtitle_link,
    },
  };
}

export const subtitleNormalizedSchema = z.object({
  title: titleSchema,
  releaseGroup: releaseGroupSchema,
  subtitleGroup: subtitleGroupSchema,
  subtitle: subtitleSchema.omit({ title: true, releaseGroup: true, subtitleGroup: true }),
});

export type SubtisSubtitleNormalized = z.infer<typeof subtitleNormalizedSchema>;

export function getResultsWithLength<T>(results: T[]): ResultsWithLength<T> {
  return {
    total: results.length,
    results,
  };
}
