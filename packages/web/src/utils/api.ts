// api
import { getSubtitle } from '@subtis/api'

// core
export async function getSubtitleFromFileName(fileName: string) {
  return getSubtitle(fileName, {
    isProduction: import.meta.env.NODE_ENV === 'production',
    apiBaseUrlProduction: import.meta.env.PUBLIC_API_BASE_URL_PRODUCTION,
    apiBaseUrlDevelopment: import.meta.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
  })
}
