import { z } from "zod";

export const spotifyTokenSchema = z.object({
  access_token: z.string(),
  token_type: z.string(),
  expires_in: z.number(),
});

export const spotifySearchSchema = z.object({
  albums: z.object({
    items: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        release_date: z.string(),
        type: z.literal("album"),
      }),
    ),
  }),
  playlists: z.object({
    items: z.array(
      z.union([
        z.object({
          id: z.string(),
          name: z.string(),
          type: z.literal("playlist"),
        }),
        z.null(),
      ]),
    ),
  }),
});
