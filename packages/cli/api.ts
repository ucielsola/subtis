// shared
import { getSubtitle } from 'shared/api'

// helpers
export async function getSubtitleFromFileName(fileName: string) {
  return getSubtitle(fileName, {
    isProduction: Bun.env.NODE_ENV === 'production',
    apiBaseUrlProduction: Bun.env.PUBLIC_API_BASE_URL_PRODUCTION,
    apiBaseUrlDevelopment: Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
  })
}
