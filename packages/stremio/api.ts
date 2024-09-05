// shared
import { getApiClient } from "@subtis/shared";

// constants
const isProduction = process.env.NODE_ENV === "production";

export const apiClient = getApiClient({
  apiBaseUrl: isProduction ? "https://api.subt.is" : "http://127.0.0.1:8787",
});
