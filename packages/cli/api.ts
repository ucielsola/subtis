// api
import { getApiClient } from 'shared/api-client'

// constants
const isProduction = Bun.env.NODE_ENV === 'production'

export const apiClient = getApiClient({
  isProduction,
  apiBaseUrlProduction: isProduction ? '' : 'http://localhost:8080',
  apiBaseUrlDevelopment: isProduction ? '' :'http://localhost:8080',
})
