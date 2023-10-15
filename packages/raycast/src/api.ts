import fetch from 'node-fetch';

// shared
import { getSubtitle } from 'shared/api';

// polyfill global fetch
Object.assign(global, { fetch });

// helpers
export async function getSubtitleFromFileName(fileName: string) {
  return getSubtitle(fileName, {
    isProduction: true,
    apiBaseUrlProduction: 'http://localhost:8080',
    apiBaseUrlDevelopment: 'http://localhost:8080',
  });
}
