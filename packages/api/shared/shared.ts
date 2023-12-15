import { z } from 'zod'
import { moviesRowSchema, releaseGroupsRowSchema, subtitleGroupsRowSchema, subtitlesRowSchema } from 'db/schemas'

// types
export type ApiBaseUrlConfig = {
  isProduction: boolean
  apiBaseUrlProduction?: string
  apiBaseUrlDevelopment?: string
}

// utils
export function getApiBaseUrl(apiBaseUrlConfig: ApiBaseUrlConfig): string {
  const schema = z.object({
    isProduction: z.boolean(),
    apiBaseUrlProduction: z.string(),
    apiBaseUrlDevelopment: z.string(),
  })

  const apiBaseUrlConfigParsed = schema.parse(apiBaseUrlConfig)
  return apiBaseUrlConfigParsed.isProduction
    ? apiBaseUrlConfigParsed.apiBaseUrlProduction
    : apiBaseUrlConfigParsed.apiBaseUrlDevelopment
}

export const errorSchema = z.object({ message: z.string() })
export const subtitleSchema
  = subtitlesRowSchema.pick({ id: true, subtitleShortLink: true, subtitleFullLink: true, resolution: true, fileName: true }).extend({
    Movies: moviesRowSchema.pick({ name: true, year: true }),
    ReleaseGroups: releaseGroupsRowSchema.pick({ name: true }),
    SubtitleGroups: subtitleGroupsRowSchema.pick({ name: true }),
  })
export const subtitlesSchema = z
  .array(subtitleSchema, { invalid_type_error: 'Subtitles not found for movie' })
  .min(1, { message: 'Subtitle not found for file' })
