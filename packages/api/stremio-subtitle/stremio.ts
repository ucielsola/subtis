import type { Context } from "elysia";
import { z } from "zod";

// db
import { subtitlesRowSchema, supabase } from "@subtis/db";

// shared
import { videoFileNameSchema } from "@subtis/shared";

// internals
import { errorSchema } from "../shared";

// helpers
async function getSubtitleText(subtitleLink: string): Promise<string> {
	const response = await fetch(subtitleLink);
	const buffer = await response.arrayBuffer();

	const decoder = new TextDecoder("iso-8859-1");
	const subtitle = decoder.decode(buffer);

	return subtitle;
}

// schemas
const subtitleSchema = subtitlesRowSchema.pick({
	subtitleLink: true,
});
const responseSchema = z.union([z.string(), errorSchema]);

// types
type Response = z.infer<typeof responseSchema>;

// core
export async function getStremioSubtitleFromFileName({
	params,
	set,
}: {
	params: { bytes: string; fileName: string };
	set: Context["set"];
}): Promise<Response> {
	const { bytes, fileName } = params;

	const videoFileName = videoFileNameSchema.safeParse(fileName);
	if (!videoFileName.success) {
		set.status = 415;
		return { message: videoFileName.error.issues[0].message };
	}

	const { data } = await supabase
		.from("Subtitles")
		.select("subtitleLink")
		.eq("movieFileName", videoFileName.data)
		.single();

	const subtitleByFileName = subtitleSchema.safeParse(data);

	if (!subtitleByFileName.success) {
		await supabase.rpc("insert_subtitle_not_found", {
			file_name: videoFileName.data,
		});

		const { data } = await supabase.from("Subtitles").select("subtitleLink").eq("bytes", bytes).single();

		const subtitleByBytes = subtitleSchema.safeParse(data);

		if (!subtitleByBytes.success) {
			set.status = 404;
			return { message: "Subtitle not found for file" };
		}

		const subtitle = await getSubtitleText(subtitleByBytes.data.subtitleLink);

		return subtitle;
	}

	const subtitle = await getSubtitleText(subtitleByFileName.data.subtitleLink);

	return subtitle;
}
