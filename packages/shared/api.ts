import { z } from 'zod';
import { edenTreaty } from '@elysiajs/eden';

// api
import { type App } from 'api';

// db
import { Subtitle } from 'db';

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
export async function getSubtitleLink(
  fileName: string,
  apiBaseUrlConfig: ApiBaseUrlConfig,
): Promise<{
  error: any;
  status: number;
  data: Subtitle | null;
}> {
  const apiBaseUrl = getApiBaseUrl(apiBaseUrlConfig);
  const app = edenTreaty<App>(apiBaseUrl);

  const { data, error, status } = await app.subtitles.post({ fileName });

  return { data, error, status };
}
