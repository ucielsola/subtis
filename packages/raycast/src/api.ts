import fetch from "node-fetch";

// shared
import { getApiClient } from "@subtis/shared";

// polyfill fetch for Raycast
Object.assign(globalThis, { fetch });

// helpers
const isProduction = true;

export const apiClient = getApiClient({
	isProduction,
	apiBaseUrlProduction: isProduction ? "" : "http://localhost:8787",
	apiBaseUrlDevelopment: isProduction ? "" : "http://localhost:8787",
});
