import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /subtitles/movie", () => {
	afterAll(() => app.stop());

	it("return a subtitles response for a specific movie", async () => {
		const movieId = "11057302";

		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/movie`, {
			body: JSON.stringify({ movieId }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(data).toMatchObject([
			{
				fileName: "Madame.Web.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
				id: 2218,
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/madame-web-1080p-yts-mx-subdivx.srt?download=Madame.Web.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/27fployb",
				ReleaseGroups: {
					name: "YTS-MX",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				Movies: {
					name: "Madame Web",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
				},
			},
			{
				fileName: "Madame.Web.2024.720p.WEBRip.x264.AAC-[YTS.MX].mp4",
				id: 2219,
				resolution: "720p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/madame-web-720p-yts-mx-subdivx.srt?download=Madame.Web.2024.720p.WEBRip.x264.AAC-[YTS.MX].srt",
				subtitleShortLink: "https://tinyurl.com/27e94opl",
				ReleaseGroups: {
					name: "YTS-MX",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				Movies: {
					name: "Madame Web",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
				},
			},
			{
				fileName: "Madame.Web.2024.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv",
				id: 2220,
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/madame-web-1080p-galaxyrg-subdivx.srt?download=Madame.Web.2024.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.srt",
				subtitleShortLink: "https://tinyurl.com/258jyvmz",
				ReleaseGroups: {
					name: "GalaxyRG",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				Movies: {
					name: "Madame Web",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
				},
			},
			{
				fileName: "Madame.Web.2024.720p.WEBRip.800MB.x264-GalaxyRG.mkv",
				id: 2221,
				resolution: "720p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/madame-web-720p-galaxyrg-subdivx.srt?download=Madame.Web.2024.720p.WEBRip.800MB.x264-GalaxyRG.srt",
				subtitleShortLink: "https://tinyurl.com/2de336lc",
				ReleaseGroups: {
					name: "GalaxyRG",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				Movies: {
					name: "Madame Web",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
				},
			},
			{
				fileName: "Madame.Web.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv",
				id: 2222,
				resolution: "1080p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/madame-web-1080p-galaxyrg-subdivx.srt?download=Madame.Web.2024.1080p.AMZN.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
				subtitleShortLink: "https://tinyurl.com/232lxzm6",
				ReleaseGroups: {
					name: "GalaxyRG",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				Movies: {
					name: "Madame Web",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
				},
			},
			{
				fileName: "Madame.Web.2024.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.mkv",
				id: 2223,
				resolution: "2160p",
				subtitleFullLink:
					"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/madame-web-2160p-flux-subdivx.srt?download=Madame.Web.2024.2160p.WEB-DL.DDP5.1.Atmos.DV.HDR.H.265-FLUX.srt",
				subtitleShortLink: "https://tinyurl.com/2bzffdam",
				ReleaseGroups: {
					name: "FLUX",
				},
				SubtitleGroups: {
					name: "SubDivX",
				},
				Movies: {
					name: "Madame Web",
					year: 2024,
					poster: "https://image.tmdb.org/t/p/original/rULWuutDcN5NvtiZi4FRPzRYWSh.jpg",
				},
			},
		]);
	});

	it("return a response for an 404 error for a non existant movie id", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/movie`, {
			body: JSON.stringify({ movieId: "17913a50" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Subtitles not found for movie",
		});
	});

	it("return a response for an 422 error for a bad payload", async () => {
		const request = new Request(`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/movie`, {
			body: JSON.stringify({ movie: "123" }),
			headers: { "Content-Type": "application/json" },
			method: "POST",
		});

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(422);
		expect(data).toMatchObject({
			expected: {
				movieId: "",
			},
			message: "Required property",
			type: "validation",
		});
	});
});
