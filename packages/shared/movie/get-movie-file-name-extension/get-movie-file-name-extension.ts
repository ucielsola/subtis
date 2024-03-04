import invariant from "tiny-invariant";
import { z } from "zod";

import {
	getVideoFileExtension,
	videoFileExtensionSchema,
} from "../get-video-file-extension/get-video-file-extension";

export const videoFileNameSchema = z.string().refine(
	(input) => {
		const [videoFileExtension] = input.split(".").slice(-1);
		return videoFileExtensionSchema.safeParse(`.${videoFileExtension}`).success;
	},
	{
		message: "File extension not supported",
	},
);

export function getMovieFileNameExtension(fileName: string): string {
	const videoFileExtension = getVideoFileExtension(fileName);
	invariant(
		videoFileExtension,
		`Video file extension not supported: ${fileName}`,
	);

	return videoFileExtension.slice(1);
}
