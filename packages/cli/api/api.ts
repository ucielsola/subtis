import { getApiClient } from "@subtis/ui";

// constants
const isProduction = process.env.NODE_ENV === "production";

export const apiClient = getApiClient({
	isProduction,
	apiBaseUrlDevelopment: isProduction ? "" : "http://localhost:8787",
	apiBaseUrlProduction: isProduction ? "" : "http://localhost:8787",
});
