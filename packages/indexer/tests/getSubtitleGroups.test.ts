import { expect, test } from "bun:test";

// db
import { supabase } from "@subtis/db";

// internals
import { getSubtitleGroups } from "../subtitle-groups";

// mocks
const SUBTITLE_GROUPS_MOCK = {
	OpenSubtitles: {
		created_at: "2024-02-12T02:14:53.176286+00:00",
		id: 41,
		name: "OpenSubtitles",
		website: "https://www.opensubtitles.org",
	},
	SubDivX: {
		created_at: "2024-02-12T02:14:53.267618+00:00",
		id: 42,
		name: "SubDivX",
		website: "https://subdivx.com",
	},
};

test("Indexer | should return a list of subtitle groups", async () => {
	const subtitleGroups = await getSubtitleGroups(supabase);
	expect(subtitleGroups).toEqual(SUBTITLE_GROUPS_MOCK);
});
