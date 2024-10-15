// api
import { subtitleSchema } from "@subtis/api/shared/schemas";

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
) {
  const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
    param: { bytes, fileName },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch original subtitle", { cause: response.status });
  }

  const data = await response.json();
  const subtitleByFileName = subtitleSchema.parse(data);

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { bytes: subtitleByFileName.bytes, titleFileName: subtitleByFileName.title_file_name },
  });

  return subtitleByFileName;
}

export async function getAlternativeSubtitle(apiClient: ApiClient, { fileName }: { fileName: string }) {
  const response = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
    param: { fileName },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch alternative subtitle", { cause: response.status });
  }

  const data = await response.json();
  const subtitleByFileName = subtitleSchema.parse(data);

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { bytes: subtitleByFileName.bytes, titleFileName: subtitleByFileName.title_file_name },
  });

  return subtitleByFileName;
}
