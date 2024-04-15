import type { Context } from "elysia";
import { z } from "zod";

// db
import { subtitlesRowSchema, supabase } from "@subtis/db";

// internals
import { errorSchema } from "../shared";

// schemas
const subtitleSchema = subtitlesRowSchema.pick({ subtitleFullLink: true });
const responseSchema = z.union([z.string(), errorSchema]);

// types
type Response = z.infer<typeof responseSchema>;

// core
export async function redirectSubtitle({
	params,
	set,
}: {
	params: { id: number };
	set: Context["set"];
}): Promise<Response> {
	const { id } = params;

	const { data } = await supabase.from("Subtitles").select("subtitleFullLink").eq("id", id).single();

	const subtitleByFileName = subtitleSchema.safeParse(data);
	if (!subtitleByFileName.success) {
		set.status = 404;
		return { message: "Subtitle not found for id" };
	}

	set.redirect = subtitleByFileName.data.subtitleFullLink;

	return subtitleByFileName.data.subtitleFullLink;
}
