import { z } from 'zod';

// schemas
const subtitlesSchema = z.object({ subtitleLink: z.string() });

// utils
function getApiBaseUrl(): { apiBaseUrl: string } {
  const [apiBaseUrl] = [Bun.env.API_BASE_URL];
  const apiEnvironmentVariables = { apiBaseUrl };

  const schema = z.object({ apiBaseUrl: z.string() });
  return schema.parse(apiEnvironmentVariables);
}

function getApiEndpoints() {
  const { apiBaseUrl } = getApiBaseUrl();

  return {
    subtitles: () => `${apiBaseUrl}/subtitles`,
  };
}

export async function getSubtitleLink(fileName: string): Promise<{ subtitleLink: string }> {
  const subtitlesEndpoint = getApiEndpoints().subtitles();

  const response = await fetch(subtitlesEndpoint, { headers: { body: JSON.stringify({ fileName }) } });
  const data = await response.json();

  return subtitlesSchema.parse(data);
}
