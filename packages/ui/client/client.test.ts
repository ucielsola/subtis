import { describe, expect, it } from "bun:test";

// internals
import { getApiClient } from "../client";

describe("UI | getApiClient", () => {
	it("returns a edenTreaty instance", () => {
		const apiBaseUrlConfig = {
			apiBaseUrlDevelopment: "http://localhost:3000",
			apiBaseUrlProduction: "http://localhost:3000",
			isProduction: false,
		};

		const api = getApiClient(apiBaseUrlConfig);

		expect(api.v1.movies).toBeDefined();
		expect(api.v1.metrics).toBeDefined();
		expect(api.v1.subtitles).toBeDefined();
		expect(api.v1.integrations).toBeDefined();
	});
});
