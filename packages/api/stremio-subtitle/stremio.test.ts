import { afterAll, describe, expect, it } from "bun:test";

// internals
import { runApi } from "../app";

// constants
const app = runApi();

describe("API | /subtitles/file", () => {
	afterAll(() => app.stop());

	it("return a response for an existant subtitle with correct title", async () => {
		const bytes = "2300545774";
		const fileName = "Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4";

		const request = new Request(
			`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file`,
			{
				body: JSON.stringify({ bytes, fileName }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			},
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(data).toEqual({
			fileName: "Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
			id: 2106,
			resolution: "1080p",
			subtitleFullLink:
				"https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-1080p-yts-mx-subdivx.srt?download=Wonka.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt",
			subtitleShortLink: "https://tinyurl.com/2x7w48uv",
			Movies: {
				name: "Wonka",
				year: 2023,
			},
			ReleaseGroups: {
				name: "YTS-MX",
			},
			SubtitleGroups: {
				name: "SubDivX",
			},
		});
	});

	it("return a response for an 415 error for non supported file extensions", async () => {
		const request = new Request(
			`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file`,
			{
				body: JSON.stringify({
					bytes: "2",
					fileName:
						"The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3",
				}),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			},
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(415);
		expect(data).toEqual({
			message: "File extension not supported",
		});
	});

	it("return a response for an 200 for a file with changed name but with correct bytes", async () => {
		const bytes = "2382678521";
		const fileName = "Wonka.2023.mp4";

		const request = new Request(
			`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file`,
			{
				body: JSON.stringify({ bytes, fileName }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			},
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(200);
		expect(data).toEqual({
      fileName: "Wonka.2023.1080p.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.mkv",
      id: 2112,
      resolution: "1080p",
      subtitleFullLink: "https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/wonka-1080p-galaxyrg-subdivx.srt?download=Wonka.2023.1080p.WEBRip.DDP5.1.x265.10bit-GalaxyRG265.srt",
      subtitleShortLink: "https://tinyurl.com/2ctrz95c",
      Movies: {
        name: "Wonka",
        year: 2023,
      },
      ReleaseGroups: {
        name: "GalaxyRG",
      },
      SubtitleGroups: {
        name: "SubDivX",
      },
    });
	});

	it("return a response for an 404 error for a non existant subtitle", async () => {
		const bytes = "2071378941";

		const request = new Request(
			`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file`,
			{
				body: JSON.stringify({
					bytes,
					fileName: "The.Marvels.2021.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
				}),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			},
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(response.status).toBe(404);
		expect(data).toEqual({
			message: "Subtitle not found for file",
		});
	});

	it("return a response for an 400 error for a bad payload", async () => {
		const request = new Request(
			`${Bun.env.PUBLIC_API_BASE_URL_DEVELOPMENT}/v1/subtitles/file`,
			{
				body: JSON.stringify({ file: "the" }),
				headers: { "Content-Type": "application/json" },
				method: "POST",
			},
		);

		const response = await app.handle(request);
		const data = await response.json();

		expect(data).toMatchObject({
			expected: {
				bytes: "",
				fileName: "",
			},
			message: "Required property",
			type: "body",
		});
	});
});
