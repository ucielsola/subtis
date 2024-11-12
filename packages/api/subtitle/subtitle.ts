import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";
// import { cache } from "hono/cache";
// import timestring from "timestring";

// shared
import {
  getIsCinemaRecording,
  getIsTvShow,
  getStringWithoutSpecialCharacters,
  getTitleFileNameMetadata,
  videoFileNameSchema,
} from "@subtis/shared";

// internals
import { getSubtitleNormalized } from "../shared/parsers";
import { alternativeTitlesSchema, subtitleSchema, subtitleShortenerSchema, subtitlesQuery } from "../shared/schemas";
import { getSupabaseClient } from "../shared/supabase";
import type { AppVariables } from "../shared/types";

// schemas
const alternativeSubtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: "Alternative subtitles not found for file" })
  .min(1, { message: "Alternative subtitles not found for file" });

// core
export const subtitle = new Hono<{ Variables: AppVariables }>()
  .get(
    "/metadata/:subtitleId",
    zValidator("param", z.object({ subtitleId: z.string() })),
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

      const subtitleByFileName = subtitleSchema.safeParse(data);

      if (subtitleByFileName.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: subtitleByFileName.error.issues[0].message });
      }

      const normalizedSubtitle = getSubtitleNormalized(subtitleByFileName.data);

      return context.json(normalizedSubtitle);
    },
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("2 weeks")}` }),
  )
  .get(
    "/file/name/:bytes/:fileName",
    zValidator("param", z.object({ bytes: z.string(), fileName: z.string() })),
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
          await supabase.from("SubtitlesNotFound").insert({ bytes: parsedBytes, title_file_name: fileName });
        }

        context.status(404);
        return context.json({ message: "Subtitle not found for file" });
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
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("1 week")}` }),
  )
  .get("/file/alternative/:fileName", zValidator("param", z.object({ fileName: z.string() })), async (context) => {
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
      .select("imdb_id")
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
      title_imdb_id: titleByNameAndYear.data.imdb_id,
    });

    if (subtitleError && subtitleError.code === "PGRST116") {
      context.status(404);
      return context.json({ message: "Alternative subtitle not found for file" });
    }

    if (subtitleError) {
      context.status(500);
      return context.json({ message: "An error occurred", error: subtitleError });
    }

    const subtitleByFileName = alternativeSubtitlesSchema.safeParse(subtitleData);

    if (subtitleByFileName.error) {
      context.status(500);
      return context.json({ message: "An error occurred", error: subtitleByFileName.error.issues[0].message });
    }

    const filteredSubtitlesByResolution = subtitleByFileName.data
      .filter((subtitle) => subtitle.resolution === resolution)
      .sort((a, b) => (a.releaseGroup.release_group_name < b.releaseGroup.release_group_name ? 1 : -1))
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
            subtitle.releaseGroup.release_group_name === releaseGroup.release_group_name ||
            subtitle.resolution === resolution,
        )
        .sort((a, b) => (a.releaseGroup.release_group_name < b.releaseGroup.release_group_name ? 1 : -1))
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
  })
  .get(
    "/link/:subtitleId",
    zValidator("param", z.object({ subtitleId: z.string() })),
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
    // cache({ cacheName: "subtis-api", cacheControl: `max-age=${timestring("2 weeks")}` }),
  )
  .post(
    "/not-found",
    zValidator(
      "json",
      z.object({ email: z.string().email().optional(), bytes: z.number(), titleFileName: z.string() }),
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

      const { error } = await getSupabaseClient(context)
        .from("SubtitlesNotFound")
        .insert({ email, bytes, title_file_name: titleFileName });

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Subtitle not found for file" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      return context.json({ ok: true });
    },
  )
  .patch(
    "/metrics/download",
    zValidator("json", z.object({ imdbId: z.string(), subtitleId: z.number() })),
    async (context) => {
      const { imdbId, subtitleId } = context.req.valid("json");

      if (Number.isNaN(subtitleId) || subtitleId < 1) {
        context.status(400);
        return context.json({ message: "Invalid Subtitle ID: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context).rpc("update_subtitle_and_title_download_metrics", {
        _imdb_id: imdbId,
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
