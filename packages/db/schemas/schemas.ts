import { z } from "zod";

// internals
import type { Json } from "./../types/types";

export const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
	z
		.union([z.string(), z.number(), z.boolean(), z.record(z.union([jsonSchema, z.undefined()])), z.array(jsonSchema)])
		.nullable(),
);

export const moviesRowSchema = z.object({
	backdrop: z.string().nullable(),
	created_at: z.string(),
	id: z.number(),
	name: z.string(),
	poster: z.string().nullable(),
	rating: z.number(),
	release_date: z.string(),
	year: z.number(),
});

export const moviesInsertSchema = z.object({
	backdrop: z.string().optional().nullable(),
	created_at: z.string().optional(),
	id: z.number(),
	name: z.string(),
	poster: z.string().optional().nullable(),
	rating: z.number(),
	release_date: z.string(),
	year: z.number(),
});

export const moviesUpdateSchema = z.object({
	backdrop: z.string().optional().nullable(),
	created_at: z.string().optional(),
	id: z.number().optional(),
	name: z.string().optional(),
	poster: z.string().optional().nullable(),
	rating: z.number().optional(),
	release_date: z.string().optional(),
	year: z.number().optional(),
});

export const releaseGroupsRowSchema = z.object({
	created_at: z.string(),
	fileAttributes: z.array(z.string()),
	id: z.number(),
	isSupported: z.boolean().nullable(),
	name: z.string(),
	searchableOpenSubtitlesName: z.array(z.string()).nullable(),
	searchableSubDivXName: z.array(z.string()),
	website: z.string(),
});

export const releaseGroupsInsertSchema = z.object({
	created_at: z.string().optional(),
	fileAttributes: z.array(z.string()),
	id: z.number().optional(),
	isSupported: z.boolean().optional().nullable(),
	name: z.string(),
	searchableOpenSubtitlesName: z.array(z.string()).optional().nullable(),
	searchableSubDivXName: z.array(z.string()),
	website: z.string(),
});

export const releaseGroupsUpdateSchema = z.object({
	created_at: z.string().optional(),
	fileAttributes: z.array(z.string()).optional(),
	id: z.number().optional(),
	isSupported: z.boolean().optional().nullable(),
	name: z.string().optional(),
	searchableOpenSubtitlesName: z.array(z.string()).optional().nullable(),
	searchableSubDivXName: z.array(z.string()).optional(),
	website: z.string().optional(),
});

export const subtitleGroupsRowSchema = z.object({
	created_at: z.string(),
	id: z.number(),
	name: z.string(),
	website: z.string(),
});

export const subtitleGroupsInsertSchema = z.object({
	created_at: z.string().optional(),
	id: z.number().optional(),
	name: z.string(),
	website: z.string(),
});

export const subtitleGroupsUpdateSchema = z.object({
	created_at: z.string().optional(),
	id: z.number().optional(),
	name: z.string().optional(),
	website: z.string().optional(),
});

export const subtitlesRowSchema = z.object({
	author: z.string().nullable(),
	bytes: z.string(),
	created_at: z.string(),
	fileExtension: z.string(),
	fileName: z.string(),
	id: z.number(),
	lastQueriedAt: z.string().nullable(),
	movieId: z.number().nullable(),
	queriedTimes: z.number().nullable(),
	releaseGroupId: z.number(),
	resolution: z.string(),
	subtitleFullLink: z.string(),
	subtitleGroupId: z.number(),
	subtitleShortLink: z.string(),
});

export const subtitlesInsertSchema = z.object({
	author: z.string().optional().nullable(),
	bytes: z.string(),
	created_at: z.string().optional(),
	fileExtension: z.string(),
	fileName: z.string(),
	id: z.number().optional(),
	lastQueriedAt: z.string().optional().nullable(),
	movieId: z.number().optional().nullable(),
	queriedTimes: z.number().optional().nullable(),
	releaseGroupId: z.number(),
	resolution: z.string(),
	subtitleFullLink: z.string(),
	subtitleGroupId: z.number(),
	subtitleShortLink: z.string(),
});

export const subtitlesUpdateSchema = z.object({
	author: z.string().optional().nullable(),
	bytes: z.string().optional(),
	created_at: z.string().optional(),
	fileExtension: z.string().optional(),
	fileName: z.string().optional(),
	id: z.number().optional(),
	lastQueriedAt: z.string().optional().nullable(),
	movieId: z.number().optional().nullable(),
	queriedTimes: z.number().optional().nullable(),
	releaseGroupId: z.number().optional(),
	resolution: z.string().optional(),
	subtitleFullLink: z.string().optional(),
	subtitleGroupId: z.number().optional(),
	subtitleShortLink: z.string().optional(),
});

export const subtitlesNotFoundRowSchema = z.object({
	created_at: z.string(),
	fileName: z.string(),
	id: z.number(),
});

export const subtitlesNotFoundInsertSchema = z.object({
	created_at: z.string().optional(),
	fileName: z.string(),
	id: z.number().optional(),
});

export const subtitlesNotFoundUpdateSchema = z.object({
	created_at: z.string().optional(),
	fileName: z.string().optional(),
	id: z.number().optional(),
});
