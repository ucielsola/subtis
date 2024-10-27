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

type ResultsWithLength<T> = {
  results: T[];
  total: number;
};

export function getSubtitleNormalized(subtisSubtitle: SubtisSubtitle): SubtitleNormalized {
  const { title, releaseGroup, subtitleGroup, ...subtitle } = subtisSubtitle;

  return {
    title,
    releaseGroup,
    subtitleGroup,
    subtitle: { ...subtitle, subtitle_link: getSubtitleShortLink(subtitle.id) },
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
