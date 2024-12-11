// shared
import { getApiClient } from "@subtis/shared";

const isProduction = process.env.NODE_ENV === "production";

export const apiClient = getApiClient({
  apiBaseUrl: !isProduction ? process.env.PUBLIC_API_BASE_URL_PRODUCTION : process.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
});
