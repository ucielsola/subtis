import { z } from "zod";

export const buscalaSchema = z.object({
  results: z.array(
    z.object({
      id: z.number(),
      contentType: z.string(),
      name: z.string(),
      poster: z.string(),
      platforms: z.array(
        z.object({
          name: z.string().optional(),
          url: z.string().optional(),
          type: z.string().optional(),
        }),
      ),
      releaseYear: z.number(),
      description: z.string(),
    }),
  ),
  resultsLocale: z.string(),
});
