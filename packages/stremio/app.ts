import { addonBuilder, serveHTTP } from "stremio-addon-sdk";

// utils
import { getSubtitleUrl, isProduction } from "./utils";

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

	const { videoSize: bytes, filename: fileName } = args.extra as ExtraArgs;

	const subtitle = {
		lang: "spa",
		id: ": Subtis | Subtitulo en Español",
		url: getSubtitleUrl({ bytes, fileName }),
	};

	const withCacheMaxAge = isProduction ? {} : { cacheMaxAge: 0 };

	return Promise.resolve({ subtitles: [subtitle], ...withCacheMaxAge });
});

serveHTTP(builder.getInterface(), { port: 8081 });
