import { z } from "zod";

// shared
import { getApiClient } from "@subtis/shared";

// constants
const isProduction = process.env.NODE_ENV === "production";

// helpers
function getApiProductionUrl() {
  return z.string().parse(process.env.PUBLIC_API_BASE_URL_PRODUCTION);
}

function getApiDevelopmentUrl() {
  return z.string().parse(process.env.PUBLIC_API_BASE_URL_DEVELOPMENT);
}

export const apiClient = getApiClient({
  apiBaseUrl: isProduction ? getApiProductionUrl() : getApiDevelopmentUrl(),
});
