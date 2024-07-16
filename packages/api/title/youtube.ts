import type { Context } from "hono";
import { z } from "zod";

// internals
import type { AppVariables } from "../shared/types";

// constants
export const YOUTUBE_SEARCH_URL = "https://www.googleapis.com/youtube/v3/search";

// helpers
export function getYoutubeApiKey(context: Context<{ Variables: AppVariables }>) {
  const env = z.object({ YOUTUBE_API_KEY: z.string() }).parse(context.env);
  return env.YOUTUBE_API_KEY;
}
