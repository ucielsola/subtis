import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// core
export const metrics = new Hono<{ Variables: AppVariables }>().post(
	"/download",
	zValidator("json", z.object({ subtitleId: z.number() })),
	async (context) => {
		const { subtitleId } = context.req.valid("json");

		const { error } = await getSupabaseClient(context).rpc("update_subtitle_info", { subtitle_id: subtitleId });

		if (error) {
			context.status(404);
			return context.json({ message: "File name not found in database to update subtitle" });
		}

		return context.json({ ok: true });
	},
);
