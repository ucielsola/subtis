import { expect, test } from "bun:test";

// shared
import { getMovieMetadata } from "@subtis/shared";

// internals
import { getSubDivXSubtitle } from "../subdivx";

test('should return an search params for "Guardians of the Galaxy Vol 3 (2023)" for page 1', async () => {
	const movieData = getMovieMetadata("Guardians.Of.The.Galaxy.Vol..3.2023.720p.WEBRip.x264.AAC-[YTS.MX].mp4");
	const subtitle = await getSubDivXSubtitle({ movieData });

	expect(subtitle).toEqual({
		downloadFileName: "Guardians.Of.The.Galaxy.Vol..3.2023.720p.WEBRip.x264.AAC-[YTS.MX].srt",
		fileExtension: "zip",
		subtitleCompressedFileName: "guardians-of-the-galaxy-vol-3-720p-yts-mx-subdivx.zip",
		subtitleFileNameWithoutExtension: "guardians-of-the-galaxy-vol-3-720p-yts-mx-subdivx",
		subtitleGroup: "SubDivX",
		subtitleLink: "https://subdivx.com/sub9/666540.zip",
		subtitleSrtFileName: "guardians-of-the-galaxy-vol-3-720p-yts-mx-subdivx.srt",
	});
});
