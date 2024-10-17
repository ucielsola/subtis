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

export function getApiClient(apiBaseUrlConfig: ApiBaseUrlConfig) {
  const apiBaseUrl = getApiBaseUrl(apiBaseUrlConfig);
  const client = hc<AppType>(apiBaseUrl);

  return client;
}

import getApiCLient from '..'
export laoder({context}) = {
  const config = {
    apiBaseUrl: context.BASE_URL
  }
  getApiClient()
}
