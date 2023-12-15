// api
import { getApiClient } from 'shared/api-client'

// core
export const apiClient = getApiClient({
  isProduction: import.meta.env.NODE_ENV === 'production',
  apiBaseUrlProduction: import.meta.env.PUBLIC_API_BASE_URL_PRODUCTION,
  apiBaseUrlDevelopment: import.meta.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
})
