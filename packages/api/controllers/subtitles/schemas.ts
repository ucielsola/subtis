import z from "zod";

// lib
import { releaseGroupSchema, subtitleGroupSchema, subtitleSchema, titleSchema } from "../../lib/schemas";

// schemas
export const subtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Subtitles not found for title" })
  .min(1, { message: "Subtitles not found for title" });

const subtitlesResultsSchema = z
  .array(
    z.object({
      subtitle: subtitleSchema.omit({ title: true, release_group: true, subtitle_group: true }),
      release_group: releaseGroupSchema,
      subtitle_group: subtitleGroupSchema,
    }),
    {
      invalid_type_error: "Subtitles not found for title",
    },
  )
  .min(1, { message: "Subtitles not found for title" });

export const subtitlesResponseSchema = z.object({
  total: z.number(),
  title: titleSchema,
  results: subtitlesResultsSchema,
});
