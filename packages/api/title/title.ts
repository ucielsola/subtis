import querystring from "querystring";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// shared
import { getTitleFileNameMetadata, videoFileNameSchema } from "@subtis/shared";

// db
import { titlesRowSchema } from "@subtis/db/schemas";

// internals
import { youTubeSchema } from "../shared/schemas";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";
import { OFFICIAL_SUBTIS_CHANNELS } from "./constants";
import { getYoutubeApiKey } from "./youtube";

// schemas
const teaserSchema = titlesRowSchema.pick({ teaser: true });

// core
export const title = new Hono<{ Variables: AppVariables }>().get(
  "/teaser/:fileName",
  zValidator("param", z.object({ fileName: z.string() })),
  async (context) => {
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

    if (success) {
      return context.json(data);
    }

    const query = `${name} ${year} teaser`;
    const BASE_URL = "https://www.googleapis.com/youtube/v3/search";

    const params = {
      q: query,
      maxResults: 12,
      part: "snippet",
      key: getYoutubeApiKey(context),
    };

    const queryParams = querystring.stringify(params);

    const youtubeResponse = await fetch(`${BASE_URL}?${queryParams}`);
    const youtubeData = await youtubeResponse.json();

    const parsedData = youTubeSchema.safeParse(youtubeData);

    if (!parsedData.success) {
      context.status(404);
      return context.json({ message: "No teaser found" });
    }

    const curatedYouTubeTeaser = parsedData.data.items.find((item) => {
      return OFFICIAL_SUBTIS_CHANNELS.some((curatedChannelsInLowerCase) =>
        curatedChannelsInLowerCase.ids.includes(item.snippet.channelId.toLowerCase()),
      );
    });

    const youTubeTeaser = curatedYouTubeTeaser ?? parsedData.data.items[0];
    const teaser = `https://www.youtube.com/watch?v=${youTubeTeaser?.id.videoId}`;

    return context.json({ teaser });
  },
);
