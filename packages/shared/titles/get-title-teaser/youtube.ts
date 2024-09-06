import { z } from "zod";

// schemas
export const youTubeSchema = z.object({
  kind: z.string(),
  etag: z.string(),
  nextPageToken: z.string(),
  regionCode: z.string(),
  pageInfo: z.object({ totalResults: z.number(), resultsPerPage: z.number() }),
  items: z.array(
    z.object({
      kind: z.string(),
      etag: z.string(),
      id: z.object({ kind: z.string(), videoId: z.string().optional() }),
      snippet: z.object({
        publishedAt: z.string(),
        channelId: z.string(),
        title: z.string(),
        description: z.string(),
        thumbnails: z.object({
          default: z.object({
            url: z.string(),
            width: z.number(),
            height: z.number(),
          }),
          medium: z.object({
            url: z.string(),
            width: z.number(),
            height: z.number(),
          }),
          high: z.object({
            url: z.string(),
            width: z.number(),
            height: z.number(),
          }),
        }),
        channelTitle: z.string(),
        liveBroadcastContent: z.string(),
        publishTime: z.string(),
      }),
    }),
  ),
});

// constants
export const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// helpers
export function getYoutubeApiKey(): string {
  const env = z.object({ YOUTUBE_API_KEY: z.string() }).parse(process.env);
  return env.YOUTUBE_API_KEY;
}
