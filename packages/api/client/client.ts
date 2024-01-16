import { z } from 'zod'
import { edenTreaty } from '@elysiajs/eden'

// api
import type { App } from '@subtis/api'

// types
type ApiBaseUrlConfig = {
  isProduction: boolean
  apiBaseUrlProduction?: string
  apiBaseUrlDevelopment?: string
}

// utils
function getApiBaseUrl(apiBaseUrlConfig: ApiBaseUrlConfig): string {
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

export function getApiClient(apiBaseUrlConfig: ApiBaseUrlConfig) {
  const apiBaseUrl = getApiBaseUrl(apiBaseUrlConfig)
  return edenTreaty<App>(apiBaseUrl)
}
