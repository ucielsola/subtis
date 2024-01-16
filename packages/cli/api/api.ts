import { getApiClient } from '@subtis/api'

// constants
const isProduction = Bun.env.NODE_ENV === 'production'

export const apiClient = getApiClient({
  isProduction,
  apiBaseUrlProduction: isProduction ? '' : 'http://localhost:8081',
  apiBaseUrlDevelopment: isProduction ? '' : 'http://localhost:8081',
})
