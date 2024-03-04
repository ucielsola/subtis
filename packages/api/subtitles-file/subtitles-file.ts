import type { Context } from "elysia";
import ms from "ms";
import { z } from "zod";

// db
import {
	moviesRowSchema,
	releaseGroupsRowSchema,
	subtitleGroupsRowSchema,
	subtitlesRowSchema,
	supabase,
} from "@subtis/db";

// shared
import { videoFileNameSchema } from "@subtis/shared";

// internals
import { errorSchema } from "../shared";

// schemas
export const subtitleSchema = subtitlesRowSchema
	.pick({
		fileName: true,
		id: true,
		resolution: true,
		subtitleFullLink: true,
		subtitleShortLink: true,
	})
	.extend({
		Movies: moviesRowSchema.pick({ name: true, year: true }),
		ReleaseGroups: releaseGroupsRowSchema.pick({ name: true }),
		SubtitleGroups: subtitleGroupsRowSchema.pick({ name: true }),
	});
const responseSchema = z.union([subtitleSchema, errorSchema]);

// types
type Subtitle = z.infer<typeof subtitleSchema>;
type Response = z.infer<typeof responseSchema>;

// cache
export const cache = new Map<string, Subtitle>();
setInterval(() => cache.clear(), ms("1d"));

// core
export async function getSubtitleFromFileName({
	body,
	set,
}: {
	body: { bytes: string; fileName: string };
	set: Context["set"];
}): Promise<Response> {
	const { bytes, fileName } = body;

	const videoFileName = videoFileNameSchema.safeParse(fileName);
	if (!videoFileName.success) {
		set.status = 415;
		return { message: videoFileName.error.issues[0].message };
	}

	const cachedSubtitle = cache.get(videoFileName.data) || cache.get(bytes);
	if (cachedSubtitle) {
		return cachedSubtitle;
	}

	const { data } = await supabase
		.from("Subtitles")
		.select(
			"id, subtitleShortLink, subtitleFullLink, resolution, fileName, bytes, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )",
		)
		.eq("fileName", videoFileName.data)
		.order("subtitleGroupId", { ascending: false })
		.single();

	const subtitleByFileName = subtitleSchema.safeParse(data);

	if (!subtitleByFileName.success) {
		await supabase.rpc("insert_subtitle_not_found", {
			file_name: videoFileName.data,
		});

		const { data } = await supabase
			.from("Subtitles")
			.select(
				"id, subtitleShortLink, subtitleFullLink, resolution, fileName, bytes, Movies ( name, year ), ReleaseGroups ( name ), SubtitleGroups ( name )",
			)
			.eq("bytes", bytes)
			.order("subtitleGroupId", { ascending: false })
			.single();

		const subtitleByBytes = subtitleSchema.safeParse(data);

		if (!subtitleByBytes.success) {
			set.status = 404;
			return { message: "Subtitle not found for file" };
		}

		cache.set(videoFileName.data, subtitleByBytes.data);

		return subtitleByBytes.data;
	}

	cache.set(videoFileName.data, subtitleByFileName.data);

	return subtitleByFileName.data;
}
