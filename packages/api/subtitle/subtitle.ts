import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// shared
import { videoFileNameSchema } from "@subtis/shared";

// internals
import { subtitleSchema, subtitleShortenerSchema, subtitlesQuery } from "../shared/schemas";
import { type AppVariables, getSupabaseClient } from "../shared/supabase";

// core
export const subtitle = new Hono<{ Variables: AppVariables }>()

  .get(
    "/file/name/:bytes/:fileName",
    zValidator("param", z.object({ bytes: z.string(), fileName: z.string() })),
    async (context) => {
      const { bytes, fileName } = context.req.valid("param");

      if (Number.isNaN(Number(bytes))) {
        context.status(400);
        return context.json({ message: "Invalid ID: it should be a number" });
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
  .get("/link/:subtitleId", zValidator("param", z.object({ subtitleId: z.string() })), async (context) => {
    const { subtitleId: id } = context.req.valid("param");

    if (Number.isNaN(Number(id))) {
      context.status(400);
      return context.json({ message: "Invalid ID: it should be a number" });
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

      if (Number.isNaN(Number(bytes))) {
        context.status(400);
        return context.json({ message: "Invalid ID: it should be a number" });
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

      if (Number.isNaN(Number(bytes))) {
        context.status(400);
        return context.json({ message: "Invalid ID: it should be a number" });
      }

      const { error } = await getSupabaseClient(context).rpc("update_subtitle_info", {
        _bytes: bytes,
        _title_file_name: titleFileName,
      });

      if (error) {
        context.status(404);
        return context.json({ message: "File name not found in database to update subtitle" });
      }

      return context.json({ ok: true });
    },
  );
