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
  file_attributes: z.array(z.string()),
  id: z.number(),
  is_supported: z.boolean().nullable(),
  name: z.string(),
  searchable_opensubtitles_name: z.array(z.string()).nullable(),
  searchable_subdivx_name: z.array(z.string()),
});

export const releaseGroupsInsertSchema = z.object({
  created_at: z.string().optional(),
  file_attributes: z.array(z.string()),
  id: z.number().optional(),
  is_supported: z.boolean().optional().nullable(),
  name: z.string(),
  searchable_opensubtitles_name: z.array(z.string()).optional().nullable(),
  searchable_subdivx_name: z.array(z.string()),
});

export const releaseGroupsUpdateSchema = z.object({
  created_at: z.string().optional(),
  file_attributes: z.array(z.string()).optional(),
  id: z.number().optional(),
  is_supported: z.boolean().optional().nullable(),
  name: z.string().optional(),
  searchable_opensubtitles_name: z.array(z.string()).optional().nullable(),
  searchable_subdivx_name: z.array(z.string()).optional(),
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
  bytes: z.number(),
  created_at: z.string(),
  file_extension: z.string(),
  id: z.number(),
  lang: z.string(),
  last_queried_at: z.string().nullable(),
  movie_file_name: z.string(),
  movie_id: z.number(),
  queried_times: z.number().nullable(),
  release_group_id: z.number(),
  resolution: z.string(),
  reviewed: z.boolean(),
  subtitle_file_name: z.string(),
  subtitle_group_id: z.number(),
  subtitle_link: z.string(),
  uploaded_by: z.string().nullable(),
});

export const subtitlesInsertSchema = z.object({
  author: z.string().optional().nullable(),
  bytes: z.number(),
  created_at: z.string().optional(),
  file_extension: z.string(),
  id: z.number().optional(),
  lang: z.string(),
  last_queried_at: z.string().optional().nullable(),
  movie_file_name: z.string(),
  movie_id: z.number(),
  queried_times: z.number().optional().nullable(),
  release_group_id: z.number(),
  resolution: z.string(),
  reviewed: z.boolean(),
  subtitle_file_name: z.string(),
  subtitle_group_id: z.number(),
  subtitle_link: z.string(),
  uploaded_by: z.string().optional().nullable(),
});

export const subtitlesUpdateSchema = z.object({
  author: z.string().optional().nullable(),
  bytes: z.number().optional(),
  created_at: z.string().optional(),
  file_extension: z.string().optional(),
  id: z.number().optional(),
  lang: z.string().optional(),
  last_queried_at: z.string().optional().nullable(),
  movie_file_name: z.string().optional(),
  movie_id: z.number().optional(),
  queried_times: z.number().optional().nullable(),
  release_group_id: z.number().optional(),
  resolution: z.string().optional(),
  reviewed: z.boolean().optional(),
  subtitle_file_name: z.string().optional(),
  subtitle_group_id: z.number().optional(),
  subtitle_link: z.string().optional(),
  uploaded_by: z.string().optional().nullable(),
});

export const subtitlesNotFoundRowSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  movie_file_name: z.string(),
});

export const subtitlesNotFoundInsertSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  movie_file_name: z.string(),
});

export const subtitlesNotFoundUpdateSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  movie_file_name: z.string().optional(),
});
