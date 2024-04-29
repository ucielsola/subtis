import { type ContentType, addonBuilder, serveHTTP } from "stremio-addon-sdk";

// utils
import { getSubtitleUrl, isProduction } from "./utils";

// types
type Args = {
	type: ContentType;
	id: string;
	extra: {
		videoHash: string;
		videoSize: string;
	};
};

type ExtraArgs = Args["extra"] & { filename: string };

// core
async function getMovieSubtitle(args: Args) {
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
}

// addon
const builder = new addonBuilder({
	id: "org.subtis",
	version: "0.0.1",
	name: "Subtis",
	description: "Subtis es un buscador de subtitulos para tus películas",
	catalogs: [],
	resources: ["subtitles"],
	types: ["movie"],
	logo: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/assets/stremio.jpg",
});

builder.defineSubtitlesHandler(getMovieSubtitle);

serveHTTP(builder.getInterface(), { port: 8081 });
