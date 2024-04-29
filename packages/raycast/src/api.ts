import fetch from "node-fetch";

// shared
import { getApiClient } from "@subtis/shared";

// polyfill fetch for Raycast
Object.assign(globalThis, { fetch });

// helpers
const isProduction = true;

export const apiClient = getApiClient({
	apiBaseUrl: isProduction ? "https://api.subtis.workers.dev" : "http://localhost:8787",
});
