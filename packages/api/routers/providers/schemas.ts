import z from "zod";

// schemas
export const titleTeaserFileNameResponseSchema = z.object({
  year: z.number(),
  name: z.string(),
  youTubeVideoId: z.string(),
});

export const titleLetterboxdSlugResponseSchema = z.object({
  link: z.string(),
});

export const titleJustWatchSlugResponseSchema = z.object({
  link: z.string(),
});

export const titleRottenTomatoesSlugResponseSchema = z.object({
  link: z.string(),
});

export const titleSpotifySlugResponseSchema = z.object({
  link: z.string(),
  type: z.enum(["album", "playlist"]),
});
