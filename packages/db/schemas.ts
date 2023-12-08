import { z } from 'zod'
import type { Json } from './types'

export const jsonSchema: z.ZodSchema<Json> = z.lazy(() =>
  z
    .union([
      z.string(),
      z.number(),
      z.boolean(),
      z.record(z.union([jsonSchema, z.undefined()])),
      z.array(jsonSchema),
    ])
    .nullable(),
)

export const moviesRowSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  name: z.string(),
  rating: z.number(),
  year: z.number(),
})

export const moviesInsertSchema = z.object({
  created_at: z.string().optional(),
  id: z.number(),
  name: z.string(),
  rating: z.number(),
  year: z.number(),
})

export const moviesUpdateSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  name: z.string().optional(),
  rating: z.number().optional(),
  year: z.number().optional(),
})

export const releaseGroupsRowSchema = z.object({
  created_at: z.string(),
  fileAttribute: z.string(),
  id: z.number(),
  isSupported: z.boolean().nullable(),
  name: z.string(),
  searchableArgenteamName: z.string(),
  searchableOpenSubtitlesName: z.string().nullable(),
  searchableSubDivXName: z.string(),
  website: z.string(),
})

export const releaseGroupsInsertSchema = z.object({
  created_at: z.string().optional(),
  fileAttribute: z.string(),
  id: z.number().optional(),
  isSupported: z.boolean().optional().nullable(),
  name: z.string(),
  searchableArgenteamName: z.string(),
  searchableOpenSubtitlesName: z.string().optional().nullable(),
  searchableSubDivXName: z.string(),
  website: z.string(),
})

export const releaseGroupsUpdateSchema = z.object({
  created_at: z.string().optional(),
  fileAttribute: z.string().optional(),
  id: z.number().optional(),
  isSupported: z.boolean().optional().nullable(),
  name: z.string().optional(),
  searchableArgenteamName: z.string().optional(),
  searchableOpenSubtitlesName: z.string().optional().nullable(),
  searchableSubDivXName: z.string().optional(),
  website: z.string().optional(),
})

export const subtitleGroupsRowSchema = z.object({
  created_at: z.string(),
  id: z.number(),
  name: z.string(),
  website: z.string(),
})

export const subtitleGroupsInsertSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  name: z.string(),
  website: z.string(),
})

export const subtitleGroupsUpdateSchema = z.object({
  created_at: z.string().optional(),
  id: z.number().optional(),
  name: z.string().optional(),
  website: z.string().optional(),
})

export const subtitlesRowSchema = z.object({
  author: z.string().nullable(),
  created_at: z.string(),
  fileExtension: z.string(),
  fileName: z.string(),
  fileNameHash: z.string(),
  id: z.number(),
  movieId: z.number().nullable(),
  releaseGroupId: z.number(),
  resolution: z.string(),
  subtitleFullLink: z.string(),
  subtitleGroupId: z.number(),
  subtitleShortLink: z.string(),
})

export const subtitlesInsertSchema = z.object({
  author: z.string().optional().nullable(),
  created_at: z.string().optional(),
  fileExtension: z.string(),
  fileName: z.string(),
  fileNameHash: z.string(),
  id: z.number().optional(),
  movieId: z.number().optional().nullable(),
  releaseGroupId: z.number(),
  resolution: z.string(),
  subtitleFullLink: z.string(),
  subtitleGroupId: z.number(),
  subtitleShortLink: z.string(),
})

export const subtitlesUpdateSchema = z.object({
  author: z.string().optional().nullable(),
  created_at: z.string().optional(),
  fileExtension: z.string().optional(),
  fileName: z.string().optional(),
  fileNameHash: z.string().optional(),
  id: z.number().optional(),
  movieId: z.number().optional().nullable(),
  releaseGroupId: z.number().optional(),
  resolution: z.string().optional(),
  subtitleFullLink: z.string().optional(),
  subtitleGroupId: z.number().optional(),
  subtitleShortLink: z.string().optional(),
})
