// api
import { type SubtisSubtitleNormalized, subtitleNormalizedSchema } from "@subtis/api/shared/parsers";

// internals
import type { ApiClient } from "../ui/client";

// helpers
export async function getPrimarySubtitle(
  apiClient: ApiClient,
  {
    bytes,
    fileName,
  }: {
    bytes: string;
    fileName: string;
  },
): Promise<SubtisSubtitleNormalized | null> {
  const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
    param: { bytes, fileName },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch primary subtitle", { cause: response.status });
  }

  const data = await response.json();
  const primarySubtitle = subtitleNormalizedSchema.parse(data);

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { imdbId: primarySubtitle.title.imdb_id, subtitleId: primarySubtitle.subtitle.id },
  });

  return primarySubtitle;
}

export async function getAlternativeSubtitle(
  apiClient: ApiClient,
  { fileName }: { fileName: string },
): Promise<SubtisSubtitleNormalized> {
  const response = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
    param: { fileName },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch alternative subtitle", { cause: response.status });
  }

  const data = await response.json();
  const alternativeSubtitle = subtitleNormalizedSchema.parse(data);

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { imdbId: alternativeSubtitle.title.imdb_id, subtitleId: alternativeSubtitle.subtitle.id },
  });

  return alternativeSubtitle;
}
