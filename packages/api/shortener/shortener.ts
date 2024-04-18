import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { getSupabaseClient } from "../shared";

// db
import { subtitlesRowSchema } from "@subtis/db/schemas";

// schemas
const subtitleSchema = subtitlesRowSchema.pick({ subtitleLink: true });

// core
export const shortener = new Hono().post("/:id", zValidator("param", z.object({ id: z.string() })), async (context) => {
	const { id } = context.req.valid("param");

	const { data } = await getSupabaseClient(context).from("Subtitles").select("subtitleLink").eq("id", id).single();

	const subtitleById = subtitleSchema.safeParse(data);
	if (!subtitleById.success) {
		context.status(404);
		return context.json({ message: "Subtitle not found for id" });
	}

	context.redirect(subtitleById.data.subtitleLink);
	return context.text(subtitleById.data.subtitleLink);
});
