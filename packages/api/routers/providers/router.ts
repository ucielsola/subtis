import querystring from "querystring";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { cache } from "hono/cache";
import timestring from "timestring";
import htmlUnescape from "unescape-js";
import z from "zod";

// indexer
import { FILE_NAME_TO_TMDB_INDEX } from "@subtis/indexer/edge-cases";
import { getTitleSlugifiedName } from "@subtis/indexer/utils/slugify-title";

// shared
import {
  OFFICIAL_SUBTIS_CHANNELS,
  YOUTUBE_SEARCH_URL,
  getStringWithoutSpecialCharacters,
  getTitleFileNameMetadata,
  videoFileNameSchema,
  youTubeSchema,
} from "@subtis/shared";

// lib
import { getSpotifyApiKey, getYoutubeApiKey } from "../../lib/api-keys";
import { spotifySearchSchema, spotifyTokenSchema } from "../../lib/spotify";
import { getSupabaseClient } from "../../lib/supabase";
import { getTmdbMovieSearchUrl, tmdbDiscoverMovieSchema } from "../../lib/tmdb";
import { getTmdbHeaders } from "../../lib/tmdb";
import type { AppVariables } from "../../lib/types";

// internals
import {
  titleJustWatchSlugResponseSchema,
  titleLetterboxdSlugResponseSchema,
  titleRottenTomatoesSlugResponseSchema,
  titleSpotifySlugResponseSchema,
  titleTeaserFileNameResponseSchema,
} from "./schemas";

// constants
const EDGE_CASE_MOVIES = {
  "vhsbeyond-2024": "v-h-s-beyond-2024",
  "faceoff-1997": "face-off-1997",
};

type EdgeCaseMovieKeys = keyof typeof EDGE_CASE_MOVIES;

// router
export const providers = new Hono<{ Variables: AppVariables }>()
  .get(
    "/youtube/teaser/:fileName",
    describeRoute({
      hide: true,
      tags: ["Providers (4)"],
      description: "Get title YouTube teaser from file name",
      responses: {
        200: {
          description: "Successful title teaser response",
          content: {
            "application/json": {
              schema: resolver(titleTeaserFileNameResponseSchema),
            },
          },
        },
        415: {
          description: "Unsupported file name",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Title teaser not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator(
      "param",
      z.object({
        fileName: z.string().openapi({
          example: "Eyes.Wide.Shut.1999.1080p.BluRay.x264.YIFY.mp4",
        }),
      }),
    ),
    async (context) => {
      const { fileName } = context.req.valid("param");

      const videoFileName = videoFileNameSchema.safeParse(fileName);
      if (!videoFileName.success) {
        context.status(415);
        return context.json({ message: videoFileName.error.issues[0].message });
      }

      const titleFileNameMetadata = getTitleFileNameMetadata({
        titleFileName: videoFileName.data,
      });

      if (!titleFileNameMetadata.resolution || !titleFileNameMetadata.year) {
        context.status(415);
        return context.json({ message: "File name is not supported" });
      }

      const { name, year, currentSeason } = titleFileNameMetadata;
      const url = getTmdbMovieSearchUrl(name, year ?? undefined);

      const response = await fetch(url, getTmdbHeaders(context));
      const data = await response.json();
      const { data: tmdbData, success } = tmdbDiscoverMovieSchema.safeParse(data);

      let queryName = name;
      let realYear = year;

      if (success && tmdbData) {
        if (tmdbData.results.length === 0) {
          context.status(404);
          return context.json({ message: "No teaser found" });
        }

        const index = FILE_NAME_TO_TMDB_INDEX[videoFileName.data as keyof typeof FILE_NAME_TO_TMDB_INDEX] ?? 0;
        const movie = tmdbData.results[index];

        queryName = movie.original_title;
        realYear = Number(movie.release_date.split("-")[0]);
      }

      const supabaseClient = getSupabaseClient(context);
      const slug = getTitleSlugifiedName(queryName, realYear ?? 0);
      const { data: foundSlug } = await supabaseClient.from("Titles").select("youtube_id").match({ slug }).single();

      if (foundSlug?.youtube_id) {
        const finalResponse = titleTeaserFileNameResponseSchema.safeParse({
          year,
          youTubeVideoId: foundSlug.youtube_id,
          name: queryName,
        });

        if (finalResponse.error) {
          context.status(500);
          return context.json({
            message: "An error occurred",
            error: finalResponse.error.issues[0].message,
          });
        }

        return context.json(finalResponse.data);
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
        return context.json({
          message: "An error occurred",
          error: youtubeParsedData.error.issues[0].message,
        });
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
      const youTubeVideoId = youTubeTeaser.id.videoId;

      if (!youTubeVideoId) {
        context.status(404);
        return context.json({ message: "No teaser found" });
      }

      const finalResponse = titleTeaserFileNameResponseSchema.safeParse({
        year,
        youTubeVideoId,
        name: queryName,
      });

      if (finalResponse.error) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: finalResponse.error.issues[0].message,
        });
      }

      await supabaseClient.from("Titles").update({ youtube_id: youTubeVideoId }).match({ slug });

      return context.json(finalResponse.data);
    },
    cache({
      cacheName: "subtis-api-providers",
      cacheControl: `max-age=${timestring("1 month")}`,
    }),
  )
  .get(
    "/spotify/soundtrack/:slug",
    describeRoute({
      tags: ["Providers (4)"],
      description: "Get title Spotify soundtrack from slug",
      responses: {
        200: {
          description: "Successful Spotify soundtrack response",
          content: {
            "application/json": {
              schema: resolver(titleSpotifySlugResponseSchema),
            },
          },
        },
        404: {
          description: "Title Spotify soundtrack not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator("param", z.object({ slug: z.string().openapi({ example: "nosferatu-2024" }) })),
    async (context) => {
      const { slug } = context.req.valid("param");

      const SPOTIFY_URL = "https://open.spotify.com";
      const SPOTIFY_ALBUM_URL = `${SPOTIFY_URL}/album`;
      const SPOTIFY_PLAYLIST_URL = `${SPOTIFY_URL}/playlist`;

      const supabaseClient = getSupabaseClient(context);
      const { data: title } = await supabaseClient
        .from("Titles")
        .select("title_name, year, spotify_id, spotify_type")
        .match({ slug })
        .single();

      if (!title) {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      if (title.spotify_id) {
        return context.json({
          type: title.spotify_type,
          link: `${SPOTIFY_URL}/${title.spotify_type}/${title.spotify_id}`,
        });
      }

      const { clientId, clientSecret } = getSpotifyApiKey(context);
      const tokenResponse = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          grant_type: "client_credentials",
        }),
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      });

      const tokenData = await tokenResponse.json();

      const {
        data: spotifyTokenData,
        error: spotifyTokenError,
        success: spotifyTokenSuccess,
      } = spotifyTokenSchema.safeParse(tokenData);

      if (!spotifyTokenSuccess) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: spotifyTokenError.issues[0].message,
        });
      }

      const spotifyQuery = `${title.title_name} ${title.year} soundtrack`;

      const queryParams = querystring.stringify({
        limit: 30,
        market: "US",
        q: spotifyQuery,
        type: "album,playlist",
      });
      const searchEndpoint = `https://api.spotify.com/v1/search?${queryParams}`;

      const searchResponse = await fetch(searchEndpoint, {
        headers: { Authorization: `Bearer ${spotifyTokenData.access_token}` },
      });

      const searchData = await searchResponse.json();

      const {
        data: spotifySearchData,
        error: spotifySearchError,
        success: spotifySearchSuccess,
      } = spotifySearchSchema.safeParse(searchData);

      if (!spotifySearchSuccess) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: spotifySearchError.issues[0].message,
        });
      }

      const parsedTitle = getStringWithoutSpecialCharacters(title.title_name);

      if ("albums" in spotifySearchData && spotifySearchData.albums.items.length > 0) {
        const soundtracksWithoutGamesSoundtracks = spotifySearchData.albums.items.filter(({ name }) => {
          const parsedName = getStringWithoutSpecialCharacters(name);
          return !parsedName.includes("game soundtrack");
        });

        const soundtrack = soundtracksWithoutGamesSoundtracks.find(({ name, release_date }) => {
          const parsedName = getStringWithoutSpecialCharacters(name);

          return (
            parsedName.startsWith(parsedTitle) &&
            release_date.includes(String(title.year)) &&
            /soundtrack|motion/gi.test(parsedName)
          );
        });

        if (soundtrack) {
          const { id: soundtrackId } = soundtrack;
          await supabaseClient
            .from("Titles")
            .update({
              spotify_type: "album",
              spotify_id: soundtrackId,
            })
            .match({ slug });

          return context.json({
            type: "album",
            link: `${SPOTIFY_ALBUM_URL}/${soundtrackId}`,
          });
        }
      }

      if ("playlists" in spotifySearchData && spotifySearchData.playlists.items.length > 0) {
        const parsedPlaylists = spotifySearchData.playlists.items.filter((playlist) => playlist !== null);

        const soundtracksWithoutGamesSoundtracks = parsedPlaylists.filter(({ name }) => {
          const parsedName = getStringWithoutSpecialCharacters(name);
          return !parsedName.includes("game soundtrack");
        });

        const soundtrack = soundtracksWithoutGamesSoundtracks.find(({ name }) => {
          const parsedName = getStringWithoutSpecialCharacters(name);

          return parsedName.startsWith(parsedTitle) && /soundtrack|motion/gi.test(parsedName);
        });

        if (soundtrack) {
          const { id: soundtrackId } = soundtrack;
          await supabaseClient
            .from("Titles")
            .update({
              spotify_type: "playlist",
              spotify_id: soundtrackId,
            })
            .match({ slug });

          return context.json({
            type: "playlist",
            link: `${SPOTIFY_PLAYLIST_URL}/${soundtrackId}`,
          });
        }
      }

      context.status(404);
      return context.json({ message: "No soundtrack found" });
    },
    cache({
      cacheName: "subtis-api-providers",
      cacheControl: `max-age=${timestring("1 month")}`,
    }),
  )
  .get(
    "/letterboxd/:slug",
    describeRoute({
      tags: ["Providers (4)"],
      description: "Get title Letterboxd from slug",
      responses: {
        200: {
          description: "Successful Letterboxd response",
          content: {
            "application/json": {
              schema: resolver(titleLetterboxdSlugResponseSchema),
            },
          },
        },
        404: {
          description: "Title letterboxd not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator("param", z.object({ slug: z.string().openapi({ example: "nosferatu-2024" }) })),
    async (context) => {
      const { slug } = context.req.valid("param");
      const parsedSlug = EDGE_CASE_MOVIES[slug as EdgeCaseMovieKeys] ?? slug;

      const supabaseClient = getSupabaseClient(context);

      const { data: foundSlug } = await supabaseClient.from("Titles").select("letterboxd_id").match({ slug }).single();

      if (foundSlug?.letterboxd_id) {
        return context.json({
          link: `https://letterboxd.com/film/${foundSlug.letterboxd_id}`,
        });
      }

      const slugArray = parsedSlug.split("-");
      const year = Number(slugArray.at(-1));
      const slugWithoutYear = parsedSlug.split("-").slice(0, -1).join("-");

      const standardLink = `https://letterboxd.com/film/${slugWithoutYear}`;
      const response = await fetch(standardLink);

      if (response.status === 200) {
        await supabaseClient.from("Titles").update({ letterboxd_id: slugWithoutYear }).match({ slug });
        return context.json({ link: standardLink });
      }

      if (response.status === 404) {
        const newSlugWithoutYear = parsedSlug;
        const newLink = `https://letterboxd.com/film/${newSlugWithoutYear}`;
        const newLinkResponse = await fetch(newLink);

        if (newLinkResponse.status === 200) {
          await supabaseClient.from("Titles").update({ letterboxd_id: newSlugWithoutYear }).match({ slug });
          return context.json({ link: newLink });
        }

        if (newLinkResponse.status === 404) {
          const newSlugWithMinusOneYear = `${slugWithoutYear}-${year - 1}`;
          const newLink = `https://letterboxd.com/film/${newSlugWithMinusOneYear}`;
          const newLinkResponse = await fetch(newLink);

          if (newLinkResponse.status === 200) {
            await supabaseClient.from("Titles").update({ letterboxd_id: newSlugWithMinusOneYear }).match({ slug });
            return context.json({ link: newLink });
          }

          context.status(404);
          return context.json({ message: "Title letterboxd not found" });
        }
      }
    },
    cache({
      cacheName: "subtis-api-providers",
      cacheControl: `max-age=${timestring("1 month")}`,
    }),
  )
  .get(
    "/justwatch/:slug",
    describeRoute({
      tags: ["Providers (4)"],
      description: "Get title JustWatch from slug",
      responses: {
        200: {
          description: "Successful JustWatch response",
          content: {
            "application/json": {
              schema: resolver(titleJustWatchSlugResponseSchema),
            },
          },
        },
        404: {
          description: "Title JustWatch not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator("param", z.object({ slug: z.string().openapi({ example: "babygirl-2024" }) })),
    async (context) => {
      const { slug } = context.req.valid("param");
      const parsedSlug = EDGE_CASE_MOVIES[slug as EdgeCaseMovieKeys] ?? slug;

      const supabaseClient = getSupabaseClient(context);

      const { data: foundSlug } = await supabaseClient.from("Titles").select("justwatch_id").match({ slug }).single();

      if (foundSlug?.justwatch_id) {
        return context.json({
          link: `https://www.justwatch.com/us/movie/${foundSlug.justwatch_id}`,
        });
      }

      const standardLink = `https://www.justwatch.com/us/movie/${parsedSlug}`;
      const response = await fetch(standardLink);

      if (response.status === 200) {
        await supabaseClient.from("Titles").update({ justwatch_id: slug }).match({ slug });
        return context.json({ link: standardLink });
      }

      if (response.status === 404) {
        const slugArray = parsedSlug.split("-");
        const year = Number(slugArray.at(-1));
        const slugWithoutYear = parsedSlug.split("-").slice(0, -1).join("-");

        const newSlug = `${slugWithoutYear}-${year - 1}`;
        const newLink = `https://www.justwatch.com/us/movie/${newSlug}`;
        const newLinkResponse = await fetch(newLink);

        if (newLinkResponse.status === 200) {
          await supabaseClient.from("Titles").update({ justwatch_id: newSlug }).match({ slug });
          return context.json({ link: newLink });
        }

        if (newLinkResponse.status === 404) {
          const newLink = `https://www.justwatch.com/us/movie/${slugWithoutYear}`;
          const newLinkResponse = await fetch(newLink);

          if (newLinkResponse.status === 200) {
            await supabaseClient.from("Titles").update({ justwatch_id: slugWithoutYear }).match({ slug });
            return context.json({ link: newLink });
          }

          context.status(404);
          return context.json({ message: "Title JustWatch not found" });
        }
      }
    },
    cache({
      cacheName: "subtis-api-providers",
      cacheControl: `max-age=${timestring("1 month")}`,
    }),
  )
  .get(
    "/rottentomatoes/:slug",
    describeRoute({
      tags: ["Providers (4)"],
      description: "Get title Rotten Tomatoes from slug",
      responses: {
        200: {
          description: "Successful Rotten Tomatoes response",
          content: {
            "application/json": {
              schema: resolver(titleRottenTomatoesSlugResponseSchema),
            },
          },
        },
        404: {
          description: "Title Rotten tomatoes not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    }),
    zValidator("param", z.object({ slug: z.string().openapi({ example: "nosferatu-2024" }) })),
    async (context) => {
      const { slug } = context.req.valid("param");
      const parsedSlug = EDGE_CASE_MOVIES[slug as EdgeCaseMovieKeys] ?? slug;

      const supabaseClient = getSupabaseClient(context);

      const { data: foundSlug } = await supabaseClient
        .from("Titles")
        .select("rottentomatoes_id")
        .match({ slug })
        .single();

      if (foundSlug?.rottentomatoes_id) {
        return context.json({
          link: `https://www.rottentomatoes.com/m/${foundSlug.rottentomatoes_id}`,
        });
      }

      const rottenTomatoesSlug = parsedSlug
        .toLowerCase()
        .replaceAll("-", "_")
        .replaceAll("&", "and")
        .replaceAll(":", "");
      const standardLink = `https://www.rottentomatoes.com/m/${rottenTomatoesSlug}`;
      const response = await fetch(standardLink);

      if (response.status === 200) {
        await supabaseClient.from("Titles").update({ rottentomatoes_id: rottenTomatoesSlug }).match({ slug });
        return context.json({ link: standardLink });
      }

      if (response.status === 404) {
        const slugArray = rottenTomatoesSlug.split("_");
        const year = Number(slugArray.at(-1));
        const slugWithoutYear = slugArray.slice(0, -1).join("_");

        const newSlug = `${slugWithoutYear}_${year - 1}`;
        const newLink = `https://www.rottentomatoes.com/m/${newSlug}`;
        const newLinkResponse = await fetch(newLink);

        if (newLinkResponse.status === 200) {
          await supabaseClient.from("Titles").update({ rottentomatoes_id: newSlug }).match({ slug });
          return context.json({ link: newLink });
        }

        if (newLinkResponse.status === 404) {
          const newLink = `https://www.rottentomatoes.com/m/${slugWithoutYear}`;
          const newLinkResponse = await fetch(newLink);

          if (newLinkResponse.status === 200) {
            await supabaseClient.from("Titles").update({ rottentomatoes_id: slugWithoutYear }).match({ slug });
            return context.json({ link: newLink });
          }

          context.status(404);
          return context.json({ message: "Title Rotten tomatoes not found" });
        }
      }
    },
    cache({
      cacheName: "subtis-api-providers",
      cacheControl: `max-age=${timestring("1 month")}`,
    }),
  );
