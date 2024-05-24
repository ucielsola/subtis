import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";
import { getSubtitleText } from "./helpers";

// db
import { subtitlesRowSchema } from "@subtis/db/schemas";

// shared
import { videoFileNameSchema } from "@subtis/shared";

// schemas
const subtitleSchema = subtitlesRowSchema.pick({ subtitle_link: true });

// core
export const integrations = new Hono<{ Variables: AppVariables }>().get(
  "/stremio/:bytes/:fileName",
  zValidator("param", z.object({ bytes: z.string(), fileName: z.string() })),
  async (context) => {
    const { bytes, fileName } = context.req.valid("param");

    const videoFileName = videoFileNameSchema.safeParse(fileName);
    if (!videoFileName.success) {
      context.status(415);
      return context.json({ message: videoFileName.error.message });
    }

    const supabase = getSupabaseClient(context);

    const { data } = await supabase
      .from("Subtitles")
      .select("subtitle_link")
      .match({ title_file_name: videoFileName.data })
      .single();

    const subtitleByFileName = subtitleSchema.safeParse(data);

    if (!subtitleByFileName.success) {
      await supabase.rpc("insert_subtitle_not_found", {
        _title_file_name: videoFileName.data,
        _bytes: Number(bytes),
      });

      const { data } = await supabase.from("Subtitles").select("subtitle_link").match({ bytes }).single();

      const subtitleByBytes = subtitleSchema.safeParse(data);

      if (!subtitleByBytes.success) {
        context.status(404);
        return context.json({ message: "Subtitle not found for file" });
      }

      const subtitle = await getSubtitleText(subtitleByBytes.data.subtitle_link);

      return context.text(subtitle);
    }

    const subtitle = await getSubtitleText(subtitleByFileName.data.subtitle_link);

    return context.text(subtitle);
  },
);
