import fetch from 'node-fetch'

// api
import { getSubtitle } from '@subtis/api'

// polyfill fetch for Raycast
Object.assign(globalThis, { fetch })

// helpers
export async function getSubtitleFromFileName(fileName: string) {
  return getSubtitle(fileName, {
    isProduction: true,
    apiBaseUrlProduction: 'http://localhost:8080',
    apiBaseUrlDevelopment: 'http://localhost:8080',
  })
}
