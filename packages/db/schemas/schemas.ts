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
	releaseDate: z.string(),
	year: z.number(),
});

export const moviesInsertSchema = z.object({
	backdrop: z.string().optional().nullable(),
	created_at: z.string().optional(),
	id: z.number(),
	name: z.string(),
	poster: z.string().optional().nullable(),
	rating: z.number(),
	releaseDate: z.string(),
	year: z.number(),
});

export const moviesUpdateSchema = z.object({
	backdrop: z.string().optional().nullable(),
	created_at: z.string().optional(),
	id: z.number().optional(),
	name: z.string().optional(),
	poster: z.string().optional().nullable(),
	rating: z.number().optional(),
	releaseDate: z.string().optional(),
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
});

export const releaseGroupsInsertSchema = z.object({
	created_at: z.string().optional(),
	fileAttributes: z.array(z.string()),
	id: z.number().optional(),
	isSupported: z.boolean().optional().nullable(),
	name: z.string(),
	searchableOpenSubtitlesName: z.array(z.string()).optional().nullable(),
	searchableSubDivXName: z.array(z.string()),
});

export const releaseGroupsUpdateSchema = z.object({
	created_at: z.string().optional(),
	fileAttributes: z.array(z.string()).optional(),
	id: z.number().optional(),
	isSupported: z.boolean().optional().nullable(),
	name: z.string().optional(),
	searchableOpenSubtitlesName: z.array(z.string()).optional().nullable(),
	searchableSubDivXName: z.array(z.string()).optional(),
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
	id: z.number(),
	lang: z.string(),
	lastQueriedAt: z.string().nullable(),
	movieFileName: z.string(),
	movieId: z.number(),
	queriedTimes: z.number().nullable(),
	releaseGroupId: z.number(),
	resolution: z.string(),
	reviewed: z.boolean(),
	subtitleFileName: z.string(),
	subtitleGroupId: z.number(),
	subtitleLink: z.string(),
	uploadedBy: z.string().nullable(),
});

export const subtitlesInsertSchema = z.object({
	author: z.string().optional().nullable(),
	bytes: z.string(),
	created_at: z.string().optional(),
	fileExtension: z.string(),
	id: z.number().optional(),
	lang: z.string(),
	lastQueriedAt: z.string().optional().nullable(),
	movieFileName: z.string(),
	movieId: z.number(),
	queriedTimes: z.number().optional().nullable(),
	releaseGroupId: z.number(),
	resolution: z.string(),
	reviewed: z.boolean(),
	subtitleFileName: z.string(),
	subtitleGroupId: z.number(),
	subtitleLink: z.string(),
	uploadedBy: z.string().optional().nullable(),
});

export const subtitlesUpdateSchema = z.object({
	author: z.string().optional().nullable(),
	bytes: z.string().optional(),
	created_at: z.string().optional(),
	fileExtension: z.string().optional(),
	id: z.number().optional(),
	lang: z.string().optional(),
	lastQueriedAt: z.string().optional().nullable(),
	movieFileName: z.string().optional(),
	movieId: z.number().optional(),
	queriedTimes: z.number().optional().nullable(),
	releaseGroupId: z.number().optional(),
	resolution: z.string().optional(),
	reviewed: z.boolean().optional(),
	subtitleFileName: z.string().optional(),
	subtitleGroupId: z.number().optional(),
	subtitleLink: z.string().optional(),
	uploadedBy: z.string().optional().nullable(),
});

export const subtitlesNotFoundRowSchema = z.object({
	created_at: z.string(),
	id: z.number(),
	movieFileName: z.string(),
});

export const subtitlesNotFoundInsertSchema = z.object({
	created_at: z.string().optional(),
	id: z.number().optional(),
	movieFileName: z.string(),
});

export const subtitlesNotFoundUpdateSchema = z.object({
	created_at: z.string().optional(),
	id: z.number().optional(),
	movieFileName: z.string().optional(),
});
