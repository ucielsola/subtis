// api
import { subtitleSchema } from "@subtis/api/shared/schemas";

// internals
import { apiClient } from "../ui";

// helpers
export async function getPrimarySubtitle({
  bytes,
  fileName,
}: {
  bytes: string;
  fileName: string;
}) {
  const response = await apiClient.v1.subtitle.file.name[":bytes"][":fileName"].$get({
    param: { bytes, fileName },
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error("Failed to fetch original subtitle");
  }

  const data = await response.json();
  const subtitleByFileName = subtitleSchema.parse(data);

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { bytes: subtitleByFileName.bytes, titleFileName: subtitleByFileName.title_file_name },
  });

  return subtitleByFileName;
}

export async function getAlternativeSubtitle({
  fileName,
}: {
  fileName: string;
}) {
  const response = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
    param: { fileName },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch alternative subtitle");
  }

  const data = await response.json();
  const subtitleByFileName = subtitleSchema.parse(data);

  await apiClient.v1.subtitle.metrics.download.$patch({
    json: { bytes: subtitleByFileName.bytes, titleFileName: subtitleByFileName.title_file_name },
  });

  return subtitleByFileName;
}
