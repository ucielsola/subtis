import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { cache } from "hono/cache";
import timestring from "timestring";
import z from "zod";

// shared
import { videoFileNameSchema } from "@subtis/shared";
import { getIsCinemaRecording, getIsTvShow, getStringWithoutSpecialCharacters } from "@subtis/shared";
import { getTitleFileNameMetadata } from "@subtis/shared";

// lib
import { getSubtitleNormalized, subtitleNormalizedSchema } from "../../lib/parsers";
import { alternativeTitlesSchema, subtitleSchema, subtitleShortenerSchema, subtitlesQuery } from "../../lib/schemas";
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// internals
import { alternativeSubtitlesSchema } from "./schemas";

// router
export const subtitle = new Hono<{ Variables: AppVariables }>()
  .get(
    "/link/:subtitleId",
    describeRoute({
      tags: ["Subtitle (3)"],
      description: "Get subtitle link by subtitle ID",
      responses: {
        200: {
          description: "Successful subtitle link response",
          content: {
            "application/json": {
              schema: resolver(subtitleNormalizedSchema),
            },
          },
        },
        404: {
          description: "Subtitle link not found",
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
    zValidator("param", z.object({ subtitleId: z.string().openapi({ example: "21224" }) })),

    async (context) => {
      const { subtitleId } = context.req.valid("param");

      const parsedSubtitleId = Number.parseInt(subtitleId);

      if (Number.isNaN(parsedSubtitleId) || parsedSubtitleId < 1) {
        context.status(400);
        return context.json({ message: "Invalid ID: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select("subtitle_link")
        .match({ id: parsedSubtitleId })
        .single();

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitle link not found for subtitle ID" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitleById = subtitleShortenerSchema.safeParse(data);

      if (subtitleById.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitleById.error.issues[0].message });
      }

      return context.redirect(subtitleById.data.subtitle_link);
    },
  )
  .get(
    "/metadata/:subtitleId",
    describeRoute({
      hide: true,
      tags: ["Subtitle (3)"],
      description: "Get subtitle metadata",
      responses: {
        200: {
          description: "Successful subtitle metadata response",
          content: {
            "application/json": {
              schema: resolver(subtitleNormalizedSchema),
            },
          },
        },
        404: {
          description: "Subtitle not found",
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
    zValidator("param", z.object({ subtitleId: z.string().openapi({ example: "21416" }) })),

    async (context) => {
      const { subtitleId } = context.req.valid("param");

      const parsedId = Number.parseInt(subtitleId);

      if (Number.isNaN(parsedId) || parsedId < 1) {
        context.status(400);
        return context.json({ message: "Invalid ID: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context)
        .from("Subtitles")
        .select(subtitlesQuery)
        .match({ id: subtitleId })
        .single();

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitle not found for ID" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitleById = subtitleSchema.safeParse(data);

      if (subtitleById.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitleById.error.issues[0].message });
      }

      const normalizedSubtitle = getSubtitleNormalized(subtitleById.data);

      return context.json(normalizedSubtitle);
    },
  )
  .get(
    "/file/alternative/:fileName",
    describeRoute({
      tags: ["Subtitle (3)"],
      description: "Get alternative subtitle by file name",
      responses: {
        200: {
          description: "Successful alternative subtitle response",
          content: {
            "application/json": {
              schema: resolver(subtitleNormalizedSchema),
            },
          },
        },
        404: {
          description: "Alternative subtitle not found",
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
        fileName: z.string().openapi({ example: "Secrets.and.Lies.1996.720p.BluRay.x264.YIFY.mp4" }),
      }),
    ),

    async (context) => {
      const { fileName } = context.req.valid("param");

      const videoFileName = videoFileNameSchema.safeParse(fileName);
      if (!videoFileName.success) {
        context.status(415);
        return context.json({ message: videoFileName.error.issues[0].message });
      }

      const supabase = getSupabaseClient(context);

      const titleFileNameMetadata = getTitleFileNameMetadata({ titleFileName: videoFileName.data });
      const { name, year, releaseGroup, resolution, currentEpisode, currentSeason } = titleFileNameMetadata;

      const parsedName = getStringWithoutSpecialCharacters(name);
      const alternativeParsedName = parsedName.replaceAll(" and ", " & ");

      const titleQuery = supabase
        .from("Titles")
        .select("slug")
        .or(
          `title_name_without_special_chars.ilike.%${parsedName}%,title_name_without_special_chars.ilike.%${alternativeParsedName}%`,
        );

      if (year !== null) {
        titleQuery.eq("year", year);
      }

      const { data: titleData, error } = await titleQuery.single();

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Alternative subtitle not found for file" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const titleByNameAndYear = alternativeTitlesSchema.safeParse(titleData);

      if (titleByNameAndYear.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: titleByNameAndYear.error.issues[0].message });
      }

      const subtitleQuery = supabase
        .from("Subtitles")
        .select(subtitlesQuery)
        .neq("title_file_name", fileName)
        .order("subtitle_group_id")
        .order("queried_times", { ascending: false });

      if (currentSeason !== null) {
        subtitleQuery.eq("current_season", currentSeason);
      }

      if (currentEpisode !== null) {
        subtitleQuery.eq("current_episode", currentEpisode);
      }

      const { data: subtitleData, error: subtitleError } = await subtitleQuery.match({
        title_slug: titleByNameAndYear.data.slug,
      });

      if (subtitleError) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitleError });
      }

      if (subtitleData.length === 0) {
        context.status(404);
        return context.json({ message: "Alternative subtitle not found for file" });
      }

      const subtitleByFileName = alternativeSubtitlesSchema.safeParse(subtitleData);

      if (subtitleByFileName.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitleByFileName.error.issues[0].message });
      }

      const filteredSubtitlesByResolution = subtitleByFileName.data
        .filter((subtitle) => subtitle.resolution === resolution)
        .sort((a, b) => (a.release_group.release_group_name < b.release_group.release_group_name ? 1 : -1))
        .sort((a, b) => ((a.queried_times || 0) < (b.queried_times || 0) ? 1 : -1));

      if (filteredSubtitlesByResolution.length > 0) {
        const firstSubtitle = filteredSubtitlesByResolution[0];

        const normalizedSubtitle = getSubtitleNormalized(firstSubtitle);

        return context.json(normalizedSubtitle);
      }

      if (releaseGroup) {
        const filteredSubtitles = subtitleByFileName.data
          .filter(
            (subtitle) =>
              subtitle.release_group.release_group_name === releaseGroup.release_group_name ||
              subtitle.resolution === resolution,
          )
          .sort((a, b) => (a.release_group.release_group_name < b.release_group.release_group_name ? 1 : -1))
          .sort((a, b) => ((a.queried_times || 0) < (b.queried_times || 0) ? 1 : -1));

        if (filteredSubtitles.length > 0) {
          const normalizedSubtitle = getSubtitleNormalized(filteredSubtitles[0]);
          return context.json(normalizedSubtitle);
        }
      }

      if (subtitleByFileName.data.length === 0) {
        context.status(404);
        return context.json({ message: "Alternative subtitle not found for file" });
      }

      const firstSubtitle = subtitleByFileName.data[0];
      const normalizedSubtitle = getSubtitleNormalized(firstSubtitle);

      return context.json(normalizedSubtitle);
    },
    cache({ cacheName: "subtis-api-subtitle", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .get(
    "/file/name/:bytes/:fileName",
    describeRoute({
      tags: ["Subtitle (3)"],
      description: "Get primary subtitle by file name and bytes",
      responses: {
        200: {
          description: "Successful primary subtitle response",
          content: {
            "application/json": {
              schema: resolver(subtitleNormalizedSchema),
            },
          },
        },
        404: {
          description: "Primary subtitle not found",
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
        bytes: z.string().openapi({ example: "5485380016" }),
        fileName: z.string().openapi({ example: "Back.In.Action.2025.2160p.4K.WEB.x265.10bit.AAC5.1-[YTS.MX].mkv" }),
      }),
    ),
    async (context) => {
      const { bytes, fileName } = context.req.valid("param");

      const parsedBytes = Number.parseInt(bytes);

      if (Number.isNaN(parsedBytes) || parsedBytes < 0) {
        context.status(400);
        return context.json({ message: "Invalid Bytes: it should be a positive integer number" });
      }

      const videoFileName = videoFileNameSchema.safeParse(fileName);
      if (!videoFileName.success) {
        context.status(415);
        return context.json({ message: videoFileName.error.issues[0].message });
      }

      const supabase = getSupabaseClient(context);

      const { data, error } = await supabase
        .from("Subtitles")
        .select(subtitlesQuery)
        .or(`title_file_name.eq.${fileName},bytes.eq.${bytes}`)
        .single();

      if (error && error.code === "PGRST116") {
        const isTvShow = getIsTvShow(fileName);
        const isCinemaRecording = getIsCinemaRecording(fileName);

        if (!isTvShow && !isCinemaRecording) {
          const { resolution, year } = getTitleFileNameMetadata({ titleFileName: fileName });

          if (!resolution || !year) {
            context.status(404);
            return context.json({ message: "Subtitle not found for file" });
          }

          await supabase.from("SubtitlesNotFound").insert({ bytes: parsedBytes, title_file_name: fileName });
        }
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const subtitleByFileName = subtitleSchema.safeParse(data);

      if (subtitleByFileName.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitleByFileName.error.issues[0].message });
      }

      const normalizedSubtitle = getSubtitleNormalized(subtitleByFileName.data);

      return context.json(normalizedSubtitle);
    },
    cache({ cacheName: "subtis-api-subtitle", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .post(
    "/not-found",
    describeRoute({
      hide: true,
      tags: ["Subtitle (3)"],
      description: "Report a subtitle not found",
      responses: {
        201: {
          description: "Successful subtitle not found response",
          content: {
            "application/json": {
              schema: resolver(subtitleNormalizedSchema),
            },
          },
        },
        400: {
          description: "Invalid bytes",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        415: {
          description: "Invalid video file name",
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
      "json",
      z
        .object({
          bytes: z.number(),
          titleFileName: z.string(),
          email: z.string().email().optional(),
        })
        .openapi({
          example: {
            bytes: 1000,
            email: "test@gmail.com",
            titleFileName: "The.Dark.Knight.2008.720p.BluRay.x264.YIFY.mp4",
          },
        }),
    ),
    async (context) => {
      const { email, bytes, titleFileName } = context.req.valid("json");

      if (Number(bytes) < 1) {
        context.status(400);
        return context.json({ message: "Invalid Bytes: it should be a positive integer number" });
      }

      const videoFileName = videoFileNameSchema.safeParse(titleFileName);
      if (!videoFileName.success) {
        context.status(415);
        return context.json({ message: videoFileName.error.issues[0].message });
      }

      const isTvShow = getIsTvShow(titleFileName);
      const isCinemaRecording = getIsCinemaRecording(titleFileName);

      if (!isTvShow && !isCinemaRecording) {
        const { error } = await getSupabaseClient(context)
          .from("SubtitlesNotFound")
          .insert({ email, bytes, title_file_name: titleFileName });

        if (error?.code === "23505") {
          context.status(400);
          return context.json({ message: "Subtitle already reported" });
        }

        if (error) {
          context.status(500);
          return context.json({ message: "An error occurred", error: error.message });
        }
      }

      context.status(201);
      return context.json({ ok: true });
    },
  )
  .patch(
    "/metrics/download",
    describeRoute({
      hide: true,
      tags: ["Subtitle (3)"],
      description: "Update subtitle download metrics",
      responses: {
        200: {
          description: "Successful subtitle download metrics response",
          content: {
            "application/json": {
              schema: resolver(subtitleNormalizedSchema),
            },
          },
        },

        400: {
          description: "Invalid bytes",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        415: {
          description: "Invalid video file name",
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
      "json",
      z.object({ titleSlug: z.string(), subtitleId: z.number() }).openapi({
        example: {
          subtitleId: 21327,
          titleSlug: "nocturnal-animals-2016",
        },
      }),
    ),
    async (context) => {
      const { titleSlug, subtitleId } = context.req.valid("json");

      if (Number.isNaN(subtitleId) || subtitleId < 1) {
        context.status(400);
        return context.json({ message: "Invalid Subtitle ID: it should be a positive integer number" });
      }

      const supabase = getSupabaseClient(context);

      const { error: subtitleError } = await supabase
        .from("Subtitles")
        .select(subtitlesQuery)
        .match({ id: subtitleId })
        .single();

      if (subtitleError) {
        context.status(404);
        return context.json({ message: "Subtitle not found" });
      }

      const { data, error } = await supabase.rpc("update_subtitle_and_title_download_metrics", {
        _title_slug: titleSlug,
        _subtitle_id: subtitleId,
      });

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error });
      }

      if (typeof data === "boolean" && data === false) {
        context.status(404);
        return context.json({ message: "Subtitle not found" });
      }

      return context.json({ ok: true });
    },
  );
