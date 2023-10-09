import { z } from 'zod';
import { edenTreaty } from '@elysiajs/eden';

// api
import { type App } from 'api';

// types
type ApiBaseUrlConfig = {
  isProduction: boolean;
  apiBaseUrlProduction?: string;
  apiBaseUrlDevelopment?: string;
};

// utils
export function getApiBaseUrl(apiBaseUrlConfig: ApiBaseUrlConfig): string {
  const schema = z.object({
    isProduction: z.boolean(),
    apiBaseUrlProduction: z.string(),
    apiBaseUrlDevelopment: z.string(),
  });

  const apiBaseUrlConfigParsed = schema.parse(apiBaseUrlConfig);
  return apiBaseUrlConfigParsed.isProduction
    ? apiBaseUrlConfigParsed.apiBaseUrlProduction
    : apiBaseUrlConfigParsed.apiBaseUrlDevelopment;
}

// core
export async function getSubtitle(fileName: string, apiBaseUrlConfig: ApiBaseUrlConfig) {
  const apiBaseUrl = getApiBaseUrl(apiBaseUrlConfig);
  const app = edenTreaty<App>(apiBaseUrl);

  return app.subtitles.post({ fileName });
}
