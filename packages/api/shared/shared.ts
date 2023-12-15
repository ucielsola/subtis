import { z } from 'zod'

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
