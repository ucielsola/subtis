// api
import { type SubtisSubtitle, subtitleSchema } from "@subtis/api/shared/schemas";

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
): Promise<SubtisSubtitle | null> {
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
  const primarySubtitle = subtitleSchema.parse(data);

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { bytes: primarySubtitle.bytes, titleFileName: primarySubtitle.title_file_name },
  });

  return primarySubtitle;
}

export async function getAlternativeSubtitle(
  apiClient: ApiClient,
  { fileName }: { fileName: string },
): Promise<SubtisSubtitle> {
  const response = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
    param: { fileName },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch alternative subtitle", { cause: response.status });
  }

  const data = await response.json();
  const alternativeSubtitle = subtitleSchema.parse(data);

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { bytes: alternativeSubtitle.bytes, titleFileName: alternativeSubtitle.title_file_name },
  });

  return alternativeSubtitle;
}
