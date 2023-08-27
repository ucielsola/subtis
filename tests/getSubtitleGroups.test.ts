import { rest } from "msw";
import { setupServer } from "msw/node";
import { it, describe, afterEach, beforeAll, afterAll } from "vitest";

import { getSubtitleGroups } from "../subtitle-groups";
import { getSupabaseEnvironmentVariables, supabase } from "../supabase";

// constants
const { supabaseBaseUrl } = getSupabaseEnvironmentVariables();

// mocks
const SUBTITLE_GROUPS_MOCK = {
  SubDivX: {
    id: 17,
    created_at: "2023-08-12T05:38:27.981121+00:00",
    name: "SubDivX",
    website: "https://subdivx.com",
  },
  Argenteam: {
    id: 18,
    created_at: "2023-08-12T05:38:28.120165+00:00",
    name: "Argenteam",
    website: "https://argenteam.net",
  },
  OpenSubtitles: {
    id: 19,
    created_at: "2023-08-12T05:38:28.217056+00:00",
    name: "OpenSubtitles",
    website: "https://www.opensubtitles.org",
  },
};

const server = setupServer(
  rest.all(
    `${supabaseBaseUrl}/rest/v1/SubtitleGroups`,
    async (req, res, ctx) => {
      switch (req.method) {
        case "GET":
          return res(ctx.json(SUBTITLE_GROUPS_MOCK));
        default:
          return res(ctx.json("Unhandled method"));
      }
    },
  ),
);

describe("getSubtitleGroups", () => {
  beforeAll(() => server.listen());
  afterEach(() => server.resetHandlers());
  afterAll(() => server.close());

  it("should return a list of release groups", async ({ expect }) => {
    const releaseGroups = await getSubtitleGroups(supabase);
    expect(releaseGroups).toEqual(SUBTITLE_GROUPS_MOCK);
  });
});
