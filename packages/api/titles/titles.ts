import querystring from "querystring";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// shared
import { getTitleFileNameMetadata, videoFileNameSchema } from "@subtis/shared";

// db
import { titlesRowSchema } from "@subtis/db/schemas";

// internals
import { MAX_LIMIT } from "../shared/constants";
import { youTubeSchema } from "../shared/schemas";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";
import { getYoutubeApiKey } from "../shared/youtube";

// schemas
const searchTitleSchema = titlesRowSchema.pick({ id: true, type: true, title_name: true, year: true, backdrop: true });
const searchTitlesSchema = z.array(searchTitleSchema).min(1);

const recentTitleSchema = titlesRowSchema.pick({
  id: true,
  title_name: true,
  type: true,
  year: true,
  rating: true,
  release_date: true,
});

const recentTitlesSchema = z
  .array(recentTitleSchema, { invalid_type_error: "Recent movies not found" })
  .min(1, { message: "Recent movies not found" });

const teaserSchema = titlesRowSchema.pick({ teaser: true });

// queries
const recentTitlesQuery = `
  id,
  year,
  type,
  rating,
  title_name,
  release_date
`;

// core
export const titles = new Hono<{ Variables: AppVariables }>()
  .get("/search/:query", zValidator("param", z.object({ query: z.string() })), async (context) => {
    const { query } = context.req.valid("param");

    if (query.length < 3) {
      context.status(400);
      return context.json({ message: "Query must be at least 3 characters" });
    }

    const { data } = await getSupabaseClient(context).rpc("fuzzy_search_title", { query });

    const titles = searchTitlesSchema.safeParse(data);
    if (!titles.success) {
      context.status(404);
      return context.json({ message: `Titles not found for query ${query}` });
    }

    return context.json(titles.data);
  })
  .get("/recent/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
    const { limit } = context.req.valid("param");

    if (Number(limit) > MAX_LIMIT) {
      context.status(400);
      return context.json({ message: `Limit must be less than or equal to ${MAX_LIMIT}` });
    }

    const { data } = await getSupabaseClient(context)
      .from("Titles")
      .select(recentTitlesQuery)
      .order("release_date", { ascending: false })
      .limit(Number(limit));

    const recentSubtitles = recentTitlesSchema.safeParse(data);
    if (!recentSubtitles.success) {
      context.status(404);
      return context.json({ message: "No recent movies found" });
    }

    return context.json(recentSubtitles.data);
  })
  .get("/teaser/:fileName", zValidator("param", z.object({ fileName: z.string() })), async (context) => {
    const { fileName } = context.req.valid("param");

    const videoFileName = videoFileNameSchema.safeParse(fileName);
    if (!videoFileName.success) {
      context.status(415);
      return context.json({ message: videoFileName.error.issues[0].message });
    }

    const { name, year } = getTitleFileNameMetadata({
      titleFileName: videoFileName.data,
    });

    const { data: titleData } = await getSupabaseClient(context)
      .from("Titles")
      .select("teaser")
      .or(`title_name_without_special_chars.ilike.%${name}%`)
      .match({ year })
      .single();

    const { success, data } = teaserSchema.safeParse(titleData);

    if (!success) {
      const query = `${name} ${year} teaser`;
      const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

      const params = {
        q: query,
        maxResults: 8,
        part: "snippet",
        key: getYoutubeApiKey(context),
      };

      const queryParams = querystring.stringify(params);

      const response = await fetch(`${BASE_URL}?${queryParams}`);
      const data = await response.json();

      const parsedData = youTubeSchema.safeParse(data);

      if (!parsedData.success) {
        context.status(404);
        return context.json({ message: "No teaser found" });
      }

      const CURATED_CHANNELS = [
        {
          id: "UCjmJDM5pRKbUlVIzDYYWb6g",
          name: "Warner Bros. Pictures",
        },
      ];

      const curatedYouTubeTeaser = parsedData.data.items.find((item) => {
        return CURATED_CHANNELS.some((channel) => item.snippet.channelId.toLowerCase() === channel.id.toLowerCase());
      });

      const youTubeTeaser = curatedYouTubeTeaser ?? parsedData.data.items[0];
      const teaser = `https://www.youtube.com/watch?v=${youTubeTeaser?.id.videoId}`;

      return context.json({ teaser });
    }

    return context.json(data);
  });
