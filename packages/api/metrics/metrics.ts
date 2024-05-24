import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// core
export const metrics = new Hono<{ Variables: AppVariables }>().patch(
  "/download",
  zValidator("json", z.object({ bytes: z.number(), titleFileName: z.string() })),
  async (context) => {
    const { bytes, titleFileName } = context.req.valid("json");

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
