import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// db
import { subtitlesRowSchema } from "@subtis/db/schemas";

// schemas
const subtitleSchema = subtitlesRowSchema.pick({ subtitleLink: true });

// core
export const shortener = new Hono<{ Variables: AppVariables }>().get(
	"/:subtitleId",
	zValidator("param", z.object({ subtitleId: z.string() })),
	async (context) => {
		const { subtitleId } = context.req.valid("param");

		const { data } = await getSupabaseClient(context)
			.from("Subtitles")
			.select("subtitleLink")
			.match({ id: subtitleId })
			.single();

		const subtitleById = subtitleSchema.safeParse(data);
		if (!subtitleById.success) {
			context.status(404);
			return context.json({ message: "Subtitle not found for id" });
		}

		return context.redirect(subtitleById.data.subtitleLink);
	},
);
