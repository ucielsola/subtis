import { getApiClient } from "@subtis/ui";

// constants
const isProduction = process.env.NODE_ENV === "production";

export const apiClient = getApiClient({
	apiBaseUrlDevelopment: isProduction ? "" : "http://localhost:8080",
	apiBaseUrlProduction: isProduction ? "" : "http://localhost:8080",
	isProduction,
});
