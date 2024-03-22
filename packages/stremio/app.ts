import { z } from "zod";
import { addonBuilder, serveHTTP } from "stremio-addon-sdk";

// subtis
import { getApiClient } from "@subtis/ui";

// constants
const isProduction = process.env.NODE_ENV === "production";

const apiClient = getApiClient({
	isProduction,
	apiBaseUrlProduction: isProduction ? "" : "http://localhost:8080",
	apiBaseUrlDevelopment: isProduction ? "" : "http://localhost:8080",
});

// schemas
const subtitleSchema = z.object({
	fileName: z.string(),
	id: z.number(),
	resolution: z.string(),
	subtitleFullLink: z.string(),
	subtitleShortLink: z.string(),
	Movies: z.object({
		name: z.string(),
		year: z.number(),
	}),
	ReleaseGroups: z.object({
		name: z.string(),
	}),
	SubtitleGroups: z.object({
		name: z.string(),
	}),
});

// addon
const builder = new addonBuilder({
	id: "org.subtis",
	version: "0.0.1",
	name: "Subtis",
	description: "Subtis es un buscador de subtitulos para tus películas",
	catalogs: [],
	resources: ["subtitles"],
	types: ["movie"],
	logo: "", // TODO: Add subtis logo URL
});

// @ts-expect-error mismatch between type definitions and data received
builder.defineSubtitlesHandler(async function getMovieSubtitle(args) {
	if (args.type !== "movie") {
		return Promise.resolve({ subtitles: [] });
	}

	// @ts-expect-error mismatch between type definitions and data received
	const { filename: fileName, videoSize: bytes } = args.extra;

	const { data } = await apiClient.v1.subtitles.file.post({ fileName, bytes, });
	const subtitleRaw = subtitleSchema.parse(data);

	const subtitles = [
		{
			lang: "spa",
			id: subtitleRaw.id,
			url: subtitleRaw.subtitleFullLink,
		},
	];
	const withCacheMaxAge = isProduction ? {} : { cacheMaxAge: 0 };
  console.log(subtitles);

	return Promise.resolve({ subtitles, ...withCacheMaxAge });
});

serveHTTP(builder.getInterface(), { port: 8081 });
