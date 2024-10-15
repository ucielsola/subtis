import { hc } from "hono/client";
import { z } from "zod";

// api
import type { AppType } from "@subtis/api";

// types
const schema = z.object({ apiBaseUrl: z.string() });
type ApiBaseUrlConfig = z.infer<typeof schema>;

// utils
function getApiBaseUrl(apiBaseUrlConfig: ApiBaseUrlConfig): string {
  const apiBaseUrlConfigParsed = schema.parse(apiBaseUrlConfig);
  return apiBaseUrlConfigParsed.apiBaseUrl;
}

function getApiClient(apiBaseUrlConfig: ApiBaseUrlConfig) {
  const apiBaseUrl = getApiBaseUrl(apiBaseUrlConfig);
  const client = hc<AppType>(apiBaseUrl);

  return client;
}

const isProduction = process.env.NODE_ENV === "production";

export const apiClient = getApiClient({
  apiBaseUrl: isProduction ? process.env.PUBLIC_API_BASE_URL_PRODUCTION : process.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
});
