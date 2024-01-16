import fetch from 'node-fetch'

// api
import { getApiClient } from '@subtis/api'

// polyfill fetch for Raycast
Object.assign(globalThis, { fetch })

// helpers
export const apiClient = getApiClient({
  isProduction: true,
  apiBaseUrlProduction: 'http://localhost:8080',
  apiBaseUrlDevelopment: 'http://localhost:8080',
})
