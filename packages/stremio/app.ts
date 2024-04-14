import { addonBuilder, serveHTTP } from "stremio-addon-sdk";

// constants
const isProduction = Bun.env.NODE_ENV === "production";

const API_BASE_URL = isProduction
	? "https://subt.is/api" // TODO: Complete with real API prod URL
	: "http://localhost:8080";

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

// types
type ExtraArgs = {
	filename: string;
	videoSize: string;
	videoHash: string;
};

builder.defineSubtitlesHandler(async function getMovieSubtitle(args) {
	if (args.type !== "movie") {
		return Promise.resolve({ subtitles: [] });
	}

	const { filename: fileName, videoSize: bytes } = args.extra as ExtraArgs;

	const subtitle = {
		lang: "spa",
		id: ": Subtis | Subtitulo en Español",
		url: `${API_BASE_URL}/v1/integrations/stremio/${bytes}/${fileName}`,
	};

	const withCacheMaxAge = isProduction ? {} : { cacheMaxAge: 0 };

	return Promise.resolve({ subtitles: [subtitle], ...withCacheMaxAge });
});

serveHTTP(builder.getInterface(), { port: 8081 });
