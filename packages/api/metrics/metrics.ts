import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// shared
import { videoFileNameSchema } from "@subtis/shared";

// core
export const metrics = new Hono<{ Variables: AppVariables }>().post(
	"/download",
	zValidator("json", z.object({ fileName: z.string() })),
	async (context) => {
		const { fileName } = context.req.valid("json");

		const videoFileName = videoFileNameSchema.safeParse(fileName);
		if (!videoFileName.success) {
			context.status(415);
			return context.json({ message: videoFileName.error.issues[0].message });
		}

		const { error } = await getSupabaseClient(context).rpc("update_subtitle_info", { file_name: videoFileName.data });

		return context.json({ ok: !error });
	},
);
