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
  getTitleFileNameMetadata,
  videoFileNameSchema,
  youTubeSchema,
} from "@subtis/shared";

// internals
import { getTmdbApiKey, getYoutubeApiKey } from "../shared/api-keys";
import { titleMetadataQuery, titleMetadataSchema } from "../shared/schemas";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";

// schemas
export const tmdbDiscoverMovieSchema = z.object({
  results: z.array(z.object({ original_title: z.string(), vote_count: z.number() })),
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
    return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&year=${year}&language=es-ES`;
  }

  return `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(title)}&language=es-ES`;
}

// core
export const title = new Hono<{ Variables: AppVariables }>()
  .get("/metadata/:imdbId", zValidator("param", z.object({ imdbId: z.string() })), async (context) => {
    const { imdbId } = context.req.valid("param");

    const { data, error } = await getSupabaseClient(context)
      .from("Titles")
      .select(titleMetadataQuery)
      .match({ imdb_id: imdbId })
      .single();

    if (error && error.code === "PGRST116") {
      context.status(404);
      return context.json({ message: "Title not found" });
    }

    if (error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: error.message });
    }

    const titleById = titleMetadataSchema.safeParse(data);

    if (titleById.error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: titleById.error.issues[0].message });
    }

    const { subtitles, ...rest } = titleById.data;
    const total_subtitles = subtitles.length;

    return context.json({ ...rest, total_subtitles });
  })
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
        const sortedMoviesByVoteCount = tmdbData.results.toSorted((a, b) => (a.vote_count < b.vote_count ? 1 : -1));
        const [movie] = sortedMoviesByVoteCount;

        queryName = movie.original_title;
      }

      const query = currentSeason ? `${queryName} season ${currentSeason} teaser` : `${queryName} ${year} teaser`;
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
        const youtubeTitle = htmlUnescape(snippet.title).toLowerCase();

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
        name: queryName,
        year,
        url: teaser,
        id: youTubeTeaser.id.videoId,
      });
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .patch("/metrics/search", zValidator("json", z.object({ imdbId: z.string() })), async (context) => {
    const { imdbId } = context.req.valid("json");

    const { data, error } = await getSupabaseClient(context).rpc("update_title_search_metrics", {
      _imdb_id: imdbId,
    });

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
