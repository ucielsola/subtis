import { sign } from "hono/jwt";
import { z } from "zod";

// api
import { type SubtitleNormalized, subtitleNormalizedSchema } from "@subtis/api/lib/parsers";

// internals
import type { ApiClient } from "../ui/client";

// helpers
function getJwtSecret(): string {
  return z.string().parse(process.env.JWT_SECRET);
}

export async function getPrimarySubtitle(
  apiClient: ApiClient,
  {
    bytes,
    fileName,
  }: {
    bytes: string;
    fileName: string;
  },
): Promise<SubtitleNormalized | null> {
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

  const token = await sign(
    { titleSlug: primarySubtitle.title.slug, subtitleId: primarySubtitle.subtitle.id },
    getJwtSecret(),
  );

  await apiClient.v1.subtitle.metrics.download.$patch(
    { json: { titleSlug: primarySubtitle.title.slug, subtitleId: primarySubtitle.subtitle.id } },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return primarySubtitle;
}

export async function getAlternativeSubtitle(
  apiClient: ApiClient,
  { fileName }: { fileName: string },
): Promise<SubtitleNormalized> {
  const response = await apiClient.v1.subtitle.file.alternative[":fileName"].$get({
    param: { fileName },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch alternative subtitle", { cause: response.status });
  }

  const data = await response.json();
  const alternativeSubtitle = subtitleNormalizedSchema.parse(data);

  const token = await sign(
    { titleSlug: alternativeSubtitle.title.slug, subtitleId: alternativeSubtitle.subtitle.id },
    getJwtSecret(),
  );

  await apiClient.v1.subtitle.metrics.download.$patch(
    { json: { titleSlug: alternativeSubtitle.title.slug, subtitleId: alternativeSubtitle.subtitle.id } },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  return alternativeSubtitle;
}

export async function setSubtitleNotFound(
  apiClient: ApiClient,
  { bytes, fileName, email }: { bytes: string; fileName: string; email?: string },
) {
  const token = await sign({ bytes: Number(bytes), titleFileName: fileName, email }, getJwtSecret());

  await apiClient.v1.subtitle["not-found"].$post(
    { json: { bytes: Number(bytes), titleFileName: fileName, email } },
    { headers: { Authorization: `Bearer ${token}` } },
  );
}
