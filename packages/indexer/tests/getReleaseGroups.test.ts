import { expect, test } from "bun:test";

// db
import { supabase } from "@subtis/db";

// internals
import { RELEASE_GROUPS, getReleaseGroups } from "../release-groups";

test("Indexer | should return a list of release groups", async () => {
	const releaseGroups = await getReleaseGroups(supabase);
	expect(releaseGroups).toMatchObject(RELEASE_GROUPS);
});
