const { z } = require("zod");
const { addonBuilder, serveHTTP } = require("stremio-addon-sdk");

// handler types
type SubtitlesArguments = {
	type: string;
	id: string;
	extra: {
		videoHash: string;
		videoSize: string;
		filename: string;
	};
};

// handler schemas
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

// handler core
async function getMovieSubtitle(args: SubtitlesArguments) {
	console.log("\n ~ getMovieSubtitle ~ args:", args.extra);

	if (args.type === "movie") {
		const { filename: fileName, videoSize: bytes } = args.extra;

		const response = await fetch("http://localhost:8080/v1/subtitles/file", {
			method: "POST",
			body: JSON.stringify({ fileName, bytes }),
			headers: { "Content-Type": "application/json" },
		});
		const data = await response.json();

		// TODO: check why I've no type returns
		const subtitleRaw = subtitleSchema.parse(data);

		const subtitle = {
			lang: "spa",
			id: subtitleRaw.id,
			url: subtitleRaw.subtitleFullLink,
		};

    // TODO: Seems like broken encoding it's due to Supabase response https://github.com/Stremio/stremio-addon-sdk/issues/265
		console.log('\n ~ getMovieSubtitle ~ subtitle:', [subtitle])

		return Promise.resolve({ subtitles: [subtitle] });
	}

		return Promise.resolve({ subtitles: [] });

}

// addon
const builder = new addonBuilder({
	id: "org.subtis",
	version: "0.0.1",
	name: "Subtis",
	catalogs: [],
	resources: ["subtitles"],
	types: ["movie"],
	idPrefixes: ["tt"],
});

// docs https://github.com/Stremio/stremio-addon-sdk/blob/master/docs/api/requests/defineSubtitlesHandler.md
builder.defineSubtitlesHandler(getMovieSubtitle);

// TODO: Set environment variable here
serveHTTP(builder.getInterface(), { port: process.env.PORT || 8081 });
