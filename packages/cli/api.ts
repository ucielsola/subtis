// shared
import { getSubtitle } from 'shared/api';

// helpers
export async function getSubtitleFromFileName(fileName: string) {
  return getSubtitle(fileName, {
    isProduction: process.env.NODE_ENV === 'production',
    apiBaseUrlProduction: process.env.PUBLIC_API_BASE_URL_PRODUCTION,
    apiBaseUrlDevelopment: process.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
  });
}
