import { hc } from "hono/client";
import { z } from "zod";

// api
import type { AppType } from "@subtis/api";

// types
type ApiBaseUrlConfig = {
	isProduction: boolean;
	apiBaseUrlDevelopment?: string;
	apiBaseUrlProduction?: string;
};

// utils
function getApiBaseUrl(apiBaseUrlConfig: ApiBaseUrlConfig): string {
	const schema = z.object({
		isProduction: z.boolean(),
		apiBaseUrlDevelopment: z.string(),
		apiBaseUrlProduction: z.string(),
	});

	const apiBaseUrlConfigParsed = schema.parse(apiBaseUrlConfig);
	return apiBaseUrlConfigParsed.isProduction
		? apiBaseUrlConfigParsed.apiBaseUrlProduction
		: apiBaseUrlConfigParsed.apiBaseUrlDevelopment;
}

export function getApiClient(apiBaseUrlConfig: ApiBaseUrlConfig) {
	const apiBaseUrl = getApiBaseUrl(apiBaseUrlConfig);
	const client = hc<AppType>(apiBaseUrl);

	return client;
}
