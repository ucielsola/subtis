import { moviesRowSchema, releaseGroupsRowSchema, subtitlesRowSchema } from "@subtis/db/schemas";

const releaseGroupSchema = releaseGroupsRowSchema.pick({ name: true });
const movieSchema = moviesRowSchema.pick({ name: true, year: true, poster: true, backdrop: true });

export const moviesVersionSchema = moviesRowSchema.pick({ id: true });

export const subtitleSchema = subtitlesRowSchema
	.pick({
		id: true,
		resolution: true,
		subtitleLink: true,
		subtitleFileName: true,
	})
	.extend({
		movie: movieSchema,
		releaseGroup: releaseGroupSchema,
	});
