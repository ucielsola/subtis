import { z } from 'zod'
import { edenTreaty } from '@elysiajs/eden'

// api
import type { App } from '@subtis/api'

// types
type ApiBaseUrlConfig = {
  apiBaseUrlDevelopment?: string
  apiBaseUrlProduction?: string
  isProduction: boolean
}

// utils
function getApiBaseUrl(apiBaseUrlConfig: ApiBaseUrlConfig): string {
  const schema = z.object({
    apiBaseUrlDevelopment: z.string(),
    apiBaseUrlProduction: z.string(),
    isProduction: z.boolean(),
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
