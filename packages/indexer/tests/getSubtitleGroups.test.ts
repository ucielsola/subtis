import { expect, test } from "bun:test";

// db
import { supabase } from "@subtis/db";

// internals
import { getSubtitleGroups } from "../subtitle-groups";

// mocks
const SUBTITLE_GROUPS_MOCK = {
	OpenSubtitles: {
		name: "OpenSubtitles",
		website: "https://www.opensubtitles.org",
	},
	SubDivX: {
		name: "SubDivX",
		website: "https://subdivx.com",
	},
};

test("Indexer | should return a list of subtitle groups", async () => {
	const subtitleGroups = await getSubtitleGroups(supabase);
	expect(subtitleGroups).toMatchObject(SUBTITLE_GROUPS_MOCK);
});
