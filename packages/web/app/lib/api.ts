// shared external
import { getApiClient } from "@subtis/shared";

export const apiClient = getApiClient({
  apiBaseUrl: "https://api.subt.is",
  // apiBaseUrl: "http://localhost:58602",
});
