import { describe, expect, it } from "bun:test";
import { SupabaseClient } from "@supabase/supabase-js";

// internals
import { supabase } from "../app";

describe("DB | Supabase", () => {
	it("returns a supabase instance", () => {
		expect(supabase).toBeInstanceOf(SupabaseClient);
	});
});
