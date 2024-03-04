import fetch from "node-fetch";

// api
import { getApiClient } from "@subtis/ui";

// polyfill fetch for Raycast
Object.assign(globalThis, { fetch });

// helpers
export const apiClient = getApiClient({
	apiBaseUrlDevelopment: "http://localhost:8080",
	apiBaseUrlProduction: "http://localhost:8080",
	isProduction: true,
});
