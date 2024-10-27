// internals
import { getSubtitleShortLink } from "./links";
import type { SubtisSubtitle } from "./schemas";

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

export function getResultsWithLength<T>(results: T[]): ResultsWithLength<T> {
  return {
    total: results.length,
    results,
  };
}
