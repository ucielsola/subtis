// api
import { getApiClient } from 'shared/api-client'

// constants
export const apiClient = getApiClient({
  isProduction: Bun.env.NODE_ENV === 'production',
  apiBaseUrlProduction: Bun.env.PUBLIC_API_BASE_URL_PRODUCTION,
  apiBaseUrlDevelopment: Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
})
