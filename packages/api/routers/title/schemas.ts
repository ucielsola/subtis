import z from "zod";

// lib
import { titleMetadataSchema } from "../../lib/schemas";

// schemas
export const titleMetadataSlugResponseSchema = titleMetadataSchema
  .omit({ subtitles: true })
  .extend({ total_subtitles: z.number(), subtitle_ids: z.array(z.number()) });

export const titleTeaserFileNameResponseSchema = z.object({
  year: z.number(),
  name: z.string(),
  youTubeVideoId: z.string(),
});

export const titlePlatformsSlugResponseSchema = z.object({
  name: z.string(),
  platforms: z.array(
    z.object({
      name: z.string(),
      type: z.string().optional(),
      url: z.string().optional(),
    }),
  ),
});

export const titleMetricsSearchResponseSchema = z.object({
  ok: z.boolean(),
});
