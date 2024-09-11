import querystring from "querystring";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { unescape as htmlUnescape } from "html-escaper";
import replaceSpecialCharacters from "replace-special-characters";
import { z } from "zod";

// shared
import {
  OFFICIAL_SUBTIS_CHANNELS,
  type TitleFileNameMetadata,
  YOUTUBE_SEARCH_URL,
  getTitleFileNameMetadata,
  videoFileNameSchema,
  youTubeSchema,
} from "@subtis/shared";

// internals
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";
import { getYoutubeApiKey } from "./youtube";

// schemas
const teaserSchema = z.object({
  teaser: z.string(),
});

// core
export const title = new Hono<{ Variables: AppVariables }>()
  .get("/teaser/:fileName", zValidator("param", z.object({ fileName: z.string() })), async (context) => {
    const { fileName } = context.req.valid("param");

    const videoFileName = videoFileNameSchema.safeParse(fileName);
    if (!videoFileName.success) {
      context.status(415);
      return context.json({ message: videoFileName.error.issues[0].message });
    }

    let titleFileNameMetadata: TitleFileNameMetadata | null = null;
    try {
      titleFileNameMetadata = getTitleFileNameMetadata({ titleFileName: videoFileName.data });
    } catch (error) {
      context.status(415);
      return context.json({ message: "File name is not supported" });
    }

    const { name, year, currentSeason } = titleFileNameMetadata;

    const { data: titleData, error } = await getSupabaseClient(context)
      .from("Titles")
      .select("teaser")
      .or(`title_name_without_special_chars.ilike.%${name}%`)
      .match({ year })
      .single();

    if (error && error.code !== "PGRST116") {
      context.status(500);
      return context.json({ message: "An error occurred", error: error.message });
    }

    const { success, data } = teaserSchema.safeParse(titleData);

    if (success) {
      return context.json({
        name,
        year,
        url: data.teaser,
      });
    }

    const query = currentSeason ? `${name} season ${currentSeason} teaser` : `${name} ${year} teaser`;

    const params = {
      q: query,
      maxResults: 12,
      part: "snippet",
      key: getYoutubeApiKey(context),
    };

    const queryParams = querystring.stringify(params);

    const youtubeResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${queryParams}`);
    const youtubeData = await youtubeResponse.json();

    const youtubeParsedData = youTubeSchema.safeParse(youtubeData);

    if (youtubeParsedData.error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: youtubeParsedData.error.message });
    }

    const filteredTeasers = youtubeParsedData.data.items.filter(({ snippet }) => {
      const unescapedTitle = htmlUnescape(snippet.title);
      const youtubeTitle = replaceSpecialCharacters(unescapedTitle.toLowerCase())
        .replaceAll(":", "")
        .replaceAll("'", "");

      return (
        youtubeTitle.includes(name.toLowerCase()) &&
        (youtubeTitle.includes("teaser") || youtubeTitle.includes("trailer"))
      );
    });

    if (filteredTeasers.length === 0) {
      context.status(404);
      return context.json({ message: "No teaser found" });
    }

    const curatedYouTubeTeaser = filteredTeasers.find(({ snippet }) => {
      return OFFICIAL_SUBTIS_CHANNELS.some((curatedChannelsInLowerCase) =>
        curatedChannelsInLowerCase.ids.includes(snippet.channelId.toLowerCase()),
      );
    });

    const youTubeTeaser = curatedYouTubeTeaser ?? filteredTeasers[0];
    const teaser = `https://www.youtube.com/watch?v=${youTubeTeaser?.id.videoId}`;

    return context.json({
      name,
      year,
      url: teaser,
    });
  })
  .patch("/metrics/click", zValidator("json", z.object({ id: z.number() })), async (context) => {
    const { id: _id } = context.req.valid("json");

    if (_id < 1) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a positive integer number" });
    }

    const { data, error } = await getSupabaseClient(context).rpc("update_title_info", { _id });

    if (error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: error.message });
    }

    if (typeof data === "boolean" && data === false) {
      context.status(404);
      return context.json({ message: "Title not found" });
    }

    return context.json({ ok: true });
  });
