// shared
import { getApiClient } from "@subtis/shared";

// constants
const isProduction = process.env.NODE_ENV === "production";

export const apiClient = getApiClient({
  apiBaseUrl: isProduction ? "https://api.subtis.workers.dev" : "http://localhost:8787",
});
