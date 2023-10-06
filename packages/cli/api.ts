// shared
import { getSubtitleLink } from 'shared/api';

// helpers
export async function getSubtitleFromFileName(fileName: string) {
  return getSubtitleLink(fileName, {
    isProduction: Bun.env.NODE_ENV === 'production',
    apiBaseUrlProduction: Bun.env.PUBLIC_API_BASE_URL_PRODUCTION,
    apiBaseUrlDevelopment: Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
  });
}
