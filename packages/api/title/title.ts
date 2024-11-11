import querystring from "querystring";
import { zValidator } from "@hono/zod-validator";
import { type Context, Hono } from "hono";
import { unescape as htmlUnescape } from "html-escaper";
import { z } from "zod";
// import { cache } from "hono/cache";
// import timestring from "timestring";

// shared
import {
  OFFICIAL_SUBTIS_CHANNELS,
  type TitleFileNameMetadata,
  YOUTUBE_SEARCH_URL,
  getStringWithoutSpecialCharacters,
  getTitleFileNameMetadata,
  videoFileNameSchema,
  youTubeSchema,
} from "@subtis/shared";

// internals
import { getTmdbApiKey, getYoutubeApiKey } from "../shared/api-keys";
import { titleSchema, titlesQuery } from "../shared/schemas";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";

// schemas
export const tmdbDiscoverMovieSchema = z.object({
  results: z.array(z.object({ original_title: z.string() })),
});

// helpers
function getTmdbHeaders(context: Context): RequestInit {
  return {
    method: "GET",
    headers: { accept: "application/json", Authorization: `Bearer ${getTmdbApiKey(context)}` },
  };
}

function getTmdbMovieSearchUrl(title: string, year?: number): string {
  if (year) {
    return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&primary_release_year=${year}&language=es-ES`;
  }

  return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=es-ES`;
}

// core
export const title = new Hono<{ Variables: AppVariables }>()
  .get(
    "/metadata/:titleId",
    zValidator("param", z.object({ titleId: z.string() })),
    async (context) => {
      const { titleId } = context.req.valid("param");

      const parsedTitleId = Number.parseInt(titleId);

      if (Number.isNaN(parsedTitleId) || parsedTitleId < 1) {
        context.status(400);
        return context.json({ message: "Invalid ID: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Titles")
        .select(titlesQuery)
        .match({ id: parsedTitleId })
        .single();

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const titleById = titleSchema.safeParse(data);

      if (titleById.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: titleById.error.issues[0].message });
      }

      return context.json(titleById.data);
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("2 weeks")}` }),
  )
  .get(
    "/teaser/:fileName",
    zValidator("param", z.object({ fileName: z.string() })),
    async (context) => {
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
      const url = getTmdbMovieSearchUrl(name, year ?? undefined);

      const response = await fetch(url, getTmdbHeaders(context));
      const data = await response.json();
      const { data: tmdbData, success } = tmdbDiscoverMovieSchema.safeParse(data);

      let queryName = name;
      if (success && tmdbData) {
        const [movie] = tmdbData.results;
        queryName = movie.original_title;
      }

      const query = currentSeason ? `${name} season ${currentSeason} teaser` : `${name} ${year} teaser`;
      const queryParams = querystring.stringify({
        q: query,
        maxResults: 12,
        part: "snippet",
        key: getYoutubeApiKey(context),
      });

      const youtubeResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${queryParams}`);
      const youtubeData = await youtubeResponse.json();

      const youtubeParsedData = youTubeSchema.safeParse(youtubeData);

      if (youtubeParsedData.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: youtubeParsedData.error.issues[0].message });
      }

      const filteredTeasers = youtubeParsedData.data.items.filter(({ snippet }) => {
        const unescapedTitle = htmlUnescape(snippet.title);
        const youtubeTitle = getStringWithoutSpecialCharacters(unescapedTitle);

        return (
          youtubeTitle.includes(queryName.toLowerCase()) &&
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
        url: teaser,
        year,
        name: queryName,
      });
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .patch("/metrics/search", zValidator("json", z.object({ titleId: z.number() })), async (context) => {
    const { titleId } = context.req.valid("json");

    if (Number.isNaN(titleId) || titleId < 1) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a positive integer number" });
    }

    const { data, error } = await getSupabaseClient(context).rpc("update_title_search_metrics", { _title_id: titleId });

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
