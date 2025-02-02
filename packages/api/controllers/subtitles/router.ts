import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { cache } from "hono/cache";
import JSZip from "jszip";
import slugify from "slugify";
import timestring from "timestring";
import z from "zod";

// lib
import { getResultsWithLength, getSubtitlesNormalized } from "../../lib/parsers";
import { RESOLUTION_REGEX } from "../../lib/resolutions";
import { subtitlesQuery } from "../../lib/schemas";
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// schemas
import { subtitlesResponseSchema, subtitlesSchema } from "./schemas";

// router
export const subtitles = new Hono<{ Variables: AppVariables }>()
  .get(
    "/movie/:slug",
    describeRoute({
      tags: ["Subtitles (1)"],
      description: "Get subtitles by movie slug",
      responses: {
        200: {
          description: "Successful subtitles response",
          content: {
            "application/json": {
              schema: resolver(subtitlesResponseSchema),
            },
          },
          404: {
            description: "Subtitles not found for movie slug",
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
      },
    }),
    zValidator("param", z.object({ slug: z.string().openapi({ example: "back-in-action-2025" }) })),

    async (context) => {
      const { slug } = context.req.valid("param");

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("queried_times", { ascending: false })
        .match({ title_slug: slug });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitles not found for movie slug" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitles = subtitlesSchema.safeParse(data);

      if (subtitles.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitles.error.issues[0].message });
      }

      const [firstSubtitle] = subtitles.data;
      const { title } = firstSubtitle;

      const subtitlesNormalized = subtitles.data.map(getSubtitlesNormalized);
      const { results, total } = getResultsWithLength(subtitlesNormalized);

      const subtitlesResponse = subtitlesResponseSchema.safeParse({
        total,
        title,
        results,
      });

      if (subtitlesResponse.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitlesResponse.error.issues[0].message });
      }

      return context.json(subtitlesResponse.data);
    },
    cache({ cacheName: "subtis-api-subtitles", cacheControl: `max-age=${timestring("2 weeks")}` }),
  )
  .get(
    "/tv-show/:slug/:season?/:episode?",
    describeRoute({
      hide: true,
      tags: ["Subtitles (1)"],
      description: "Get subtitles by tv show slug, season and episode",
      responses: {
        200: {
          description: "Successful subtitles response",
          content: {
            "application/json": {
              schema: resolver(subtitlesResponseSchema),
            },
          },
          404: {
            description: "Subtitles not found for tv show slug, season and episode",
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
      },
    }),
    zValidator(
      "param",
      z.object({
        slug: z.string().openapi({ example: "back-in-action-2025" }),
        season: z.string().optional().openapi({ example: "1" }),
        episode: z.string().optional().openapi({ example: "1" }),
      }),
    ),

    async (context) => {
      const { slug, season = "1", episode = "1" } = context.req.valid("param");

      const parsedSeason = Number.parseInt(season);

      if (Number.isNaN(parsedSeason) || parsedSeason < 1) {
        context.status(400);
        return context.json({ message: "Invalid Season: it should be a positive integer number" });
      }

      const parsedEpisode = Number.parseInt(episode);

      if (Number.isNaN(parsedEpisode) || parsedEpisode < 1) {
        context.status(400);
        return context.json({ message: "Invalid Episode: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("subtitle_group_id")
        .match({ title_slug: slug, current_season: parsedSeason, current_episode: parsedEpisode });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitles not found for TV Show", error: error.message });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitles = subtitlesSchema.safeParse(data);

      if (subtitles.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitles.error.issues[0].message });
      }

      const { title } = subtitles.data[0];
      const subtitlesNormalized = subtitles.data.map(getSubtitlesNormalized);
      const { results, total } = getResultsWithLength(subtitlesNormalized);

      const subtitlesResponse = subtitlesResponseSchema.safeParse({
        total,
        title,
        results,
      });

      if (subtitlesResponse.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitlesResponse.error.issues[0].message });
      }

      return context.json(subtitlesResponse.data);
    },
    cache({ cacheName: "subtis-api-subtitles", cacheControl: `max-age=${timestring("2 weeks")}` }),
  )
  .get(
    "/tv-show/download/metadata/:slug/:season",
    describeRoute({
      hide: true,
      tags: ["Subtitles (1)"],
      description: "Get subtitles by tv show download metadata by slug, season",
      responses: {
        200: {
          description: "Successful tv show subtitles download metadata response",
          content: {
            "application/json": {
              schema: resolver(subtitlesResponseSchema),
            },
          },
          404: {
            description: "Subtitles download metadata not found for tv show slug, season",
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
      },
    }),
    zValidator(
      "param",
      z.object({
        slug: z.string().openapi({ example: "back-in-action-2025" }),
        season: z.string().optional().openapi({ example: "1" }),
        episode: z.string().optional().openapi({ example: "1" }),
      }),
    ),

    async (context) => {
      const { slug, season = "1", episode = "1" } = context.req.valid("param");

      const parsedSeason = Number.parseInt(season);

      if (Number.isNaN(parsedSeason) || parsedSeason < 1) {
        context.status(400);
        return context.json({ message: "Invalid Season: it should be a positive integer number" });
      }

      const parsedEpisode = Number.parseInt(episode);

      if (Number.isNaN(parsedEpisode) || parsedEpisode < 1) {
        context.status(400);
        return context.json({ message: "Invalid Episode: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("subtitle_group_id")
        .match({ title_slug: slug, current_season: parsedSeason, current_episode: parsedEpisode });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitles not found for TV Show", error: error.message });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitles = subtitlesSchema.safeParse(data);

      if (subtitles.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitles.error.issues[0].message });
      }

      const { title } = subtitles.data[0];
      const subtitlesNormalized = subtitles.data.map(getSubtitlesNormalized);
      const { results, total } = getResultsWithLength(subtitlesNormalized);

      const subtitlesResponse = subtitlesResponseSchema.safeParse({
        total,
        title,
        results,
      });

      if (subtitlesResponse.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitlesResponse.error.issues[0].message });
      }

      return context.json(subtitlesResponse.data);
    },
    cache({ cacheName: "subtis-api-subtitles", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .get(
    "/tv-show/download/season/:slug/:season/:resolution/:releaseGroupId",
    describeRoute({
      hide: true,
      tags: ["Subtitles (1)"],
      description: "Get subtitles by tv show download metadata by slug, season",
      responses: {
        200: {
          description: "Successful tv show subtitles download metadata response",
          content: {
            "application/json": {
              schema: resolver(subtitlesResponseSchema),
            },
          },
          404: {
            description: "Subtitles download metadata not found for tv show slug, season",
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
      },
    }),
    zValidator(
      "param",
      z.object({
        slug: z.string().openapi({ example: "back-in-action-2025" }),
        season: z.string().openapi({ example: "1" }),
        resolution: z.string().openapi({ example: "1080p" }),
        releaseGroupId: z.string().openapi({ example: "1" }),
      }),
    ),

    async (context) => {
      const { slug, season, resolution, releaseGroupId } = context.req.valid("param");

      const parsedSeason = Number.parseInt(season);

      if (Number.isNaN(parsedSeason) || parsedSeason < 1) {
        context.status(400);
        return context.json({ message: "Invalid Season: it should be a positive integer number" });
      }

      const parsedReleaseGroupId = Number.parseInt(releaseGroupId);

      if (Number.isNaN(parsedReleaseGroupId) || parsedReleaseGroupId < 1) {
        context.status(400);
        return context.json({ message: "Invalid Release Group ID: it should be a positive integer number" });
      }

      if (!resolution.match(RESOLUTION_REGEX)) {
        context.status(400);
        return context.json({ message: "Invalid Resolution: it should be a valid resolution" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .order("subtitle_group_id")
        .match({
          resolution,
          title_slug: slug,
          current_season: parsedSeason,
          release_group_id: parsedReleaseGroupId,
        });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitles not found for TV Show" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitles = subtitlesSchema.safeParse(data);

      if (subtitles.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitles.error.issues[0].message });
      }

      const zip = new JSZip();

      await Promise.all(
        subtitles.data.map(async (subtitle) => {
          const response = await fetch(subtitle.subtitle_link);
          const text = await response.text();

          zip.file(subtitle.subtitle_file_name, text);
        }),
      );

      const zipContent = await zip.generateAsync({ type: "arraybuffer" });

      const [firstSubtitle] = subtitles.data;
      const zipFileName = slugify(
        `${firstSubtitle.title.title_name}-Temporada-${firstSubtitle.current_season}-${resolution}-${firstSubtitle.release_group.release_group_name}.zip`,
      );

      context.header("Content-Type", "application/zip");
      context.header("Content-Disposition", `attachment; filename="${zipFileName}"`);

      return context.body(zipContent);
    },
    cache({ cacheName: "subtis-api-subtitles", cacheControl: `max-age=${timestring("1 week")}` }),
  );
