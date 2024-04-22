import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { getSupabaseClient } from "../shared";
// internals
import { getSubtitleText } from "./helpers";

// db
import { subtitlesRowSchema } from "@subtis/db/schemas";

// shared
import { videoFileNameSchema } from "@subtis/shared";

// schemas
const subtitleSchema = subtitlesRowSchema.pick({ subtitleLink: true });

// core
export const integrations = new Hono().get(
	"/stremio/:bytes/:fileName",
	zValidator("param", z.object({ bytes: z.string(), fileName: z.string() })),
	async (context) => {
		const { bytes, fileName } = context.req.valid("param");

		const videoFileName = videoFileNameSchema.safeParse(fileName);
		if (!videoFileName.success) {
			context.status(415);
			return context.json({ message: videoFileName.error.issues[0].message });
		}

		const supabase = getSupabaseClient(context);

		const { data } = await supabase
			.from("Subtitles")
			.select("subtitleLink")
			.match({ movieFileName: videoFileName.data })
			.single();

		const subtitleByFileName = subtitleSchema.safeParse(data);

		if (!subtitleByFileName.success) {
			await supabase.rpc("insert_subtitle_not_found", {
				file_name: videoFileName.data,
			});

			const { data } = await supabase.from("Subtitles").select("subtitleLink").match({ bytes }).single();

			const subtitleByBytes = subtitleSchema.safeParse(data);

			if (!subtitleByBytes.success) {
				context.status(404);
				return context.json({ message: "Subtitle not found for file" });
			}

			const subtitle = await getSubtitleText(subtitleByBytes.data.subtitleLink);

			return context.text(subtitle);
		}

		const subtitle = await getSubtitleText(subtitleByFileName.data.subtitleLink);

		return context.text(subtitle);
	},
);
