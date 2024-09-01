import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// shared
import { getTitleFileNameMetadata, videoFileNameSchema } from "@subtis/shared";

// internals
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
    "/file/name/:bytes/:fileName",
    zValidator("param", z.object({ bytes: z.string(), fileName: z.string() })),
    async (context) => {
      const { bytes, fileName } = context.req.valid("param");

      const parsedBytes = Number.parseInt(bytes);

      if (Number.isNaN(parsedBytes) || parsedBytes < 1) {
        context.status(400);
        return context.json({ message: "Invalid Bytes: it should be a positive integer number" });
      }

      const videoFileName = videoFileNameSchema.safeParse(fileName);
      if (!videoFileName.success) {
        context.status(415);
        return context.json({ message: videoFileName.error.issues[0].message });
      }

      const supabase = getSupabaseClient(context);

      const { data } = await supabase
        .from("Subtitles")
        .select(subtitlesQuery)
        .or(`title_file_name.eq.${fileName},bytes.eq.${bytes}`)
        .single();

      const subtitleByFileName = subtitleSchema.safeParse(data);

      if (!subtitleByFileName.success) {
        context.status(404);
        return context.json({ message: "Subtitle not found for file" });
      }

      return context.json(subtitleByFileName.data);
    },
  )
  .get("/file/alternative/:fileName", zValidator("param", z.object({ fileName: z.string() })), async (context) => {
    const { fileName } = context.req.valid("param");

    const videoFileName = videoFileNameSchema.safeParse(fileName);
    if (!videoFileName.success) {
      context.status(415);
      return context.json({ message: videoFileName.error.issues[0].message });
    }

    const supabase = getSupabaseClient(context);
    const { name, year, releaseGroup, resolution, currentEpisode, currentSeason } = getTitleFileNameMetadata({
      titleFileName: videoFileName.data,
    });

    const titleQuery = supabase.from("Titles").select("id").or(`title_name_without_special_chars.ilike.%${name}%`);

    if (year !== null) {
      titleQuery.eq("year", year);
    }

    const { data: titleData } = await titleQuery.single();
    const titleByNameAndYear = alternativeTitlesSchema.safeParse(titleData);

    if (!titleByNameAndYear.success) {
      context.status(404);
      return context.json({ message: "Subtitle not found for file" });
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

    const { data: subtitleData } = await subtitleQuery.match({
      title_id: titleByNameAndYear.data.id,
    });
    const subtitleByFileName = alternativeSubtitlesSchema.safeParse(subtitleData);

    if (!subtitleByFileName.success) {
      context.status(404);
      return context.json({ message: "Subtitle not found for file" });
    }

    const filteredSubtitlesByResolution = subtitleByFileName.data
      .filter((subtitle) => subtitle.resolution === resolution)
      .sort((a, b) => (a.releaseGroup.release_group_name < b.releaseGroup.release_group_name ? 1 : -1))
      .sort((a, b) => ((a.queried_times || 0) < (b.queried_times || 0) ? 1 : -1));

    if (filteredSubtitlesByResolution.length > 0) {
      return context.json(filteredSubtitlesByResolution.at(0));
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
        return context.json(filteredSubtitles.at(0));
      }
    }

    return context.json(subtitleByFileName.data.at(0));
  })
  .get("/link/:subtitleId", zValidator("param", z.object({ subtitleId: z.string() })), async (context) => {
    const { subtitleId: id } = context.req.valid("param");

    const parsedId = Number.parseInt(id);

    if (Number.isNaN(parsedId) || parsedId < 1) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a positive integer number" });
    }

    const { data } = await getSupabaseClient(context).from("Subtitles").select("subtitle_link").match({ id }).single();

    const subtitleById = subtitleShortenerSchema.safeParse(data);
    if (!subtitleById.success) {
      context.status(404);
      return context.json({ message: "Subtitle not found for ID" });
    }

    return context.redirect(subtitleById.data.subtitle_link);
  })
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

      if (error) {
        context.status(500);
        return context.json({ message: error.message });
      }

      return context.json({ ok: true });
    },
  )
  .post(
    "/metrics/download",
    zValidator("json", z.object({ bytes: z.number(), titleFileName: z.string() })),
    async (context) => {
      const { bytes, titleFileName } = context.req.valid("json");

      if (Number(bytes) < 1) {
        context.status(400);
        return context.json({ message: "Invalid Bytes: it should be a positive integer number" });
      }

      const { data, error } = await getSupabaseClient(context).rpc("update_subtitle_info", {
        _bytes: bytes,
        _title_file_name: titleFileName,
      });

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error });
      }

      if (data === false) {
        context.status(404);
        return context.json({ message: "Subtitle not found" });
      }

      return context.json({ ok: true });
    },
  );
