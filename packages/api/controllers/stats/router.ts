import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import { cache } from "hono/cache";
import timestring from "timestring";
import z from "zod";

// lib
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// schemas
import { statsSchema } from "./schemas";

// router
export const stats = new Hono<{ Variables: AppVariables }>().get(
  "/all",
  describeRoute({
    tags: ["Stats (1)"],
    description: "Get stats",
    responses: {
      200: {
        description: "Successful stats response",
        content: {
          "application/json": {
            schema: resolver(statsSchema),
          },
        },
        400: {
          description: "Invalid stats",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Stats not found",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        500: {
          description: "An error occurred",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string(), error: z.string() })),
            },
          },
        },
      },
    },
  }),
  async (context) => {
    const supabaseClient = await getSupabaseClient(context);

    const { count: totalTitles, error: totalTitlesError } = await supabaseClient
      .from("Titles")
      .select("*", { count: "exact", head: true });

    if (totalTitlesError) {
      context.status(500);
      return context.json({ message: "An error occurred", error: totalTitlesError.message });
    }

    const { count: totalSubtitles, error: totalSubtitlesError } = await supabaseClient
      .from("Subtitles")
      .select("*", { count: "exact", head: true });

    if (totalSubtitlesError) {
      context.status(500);
      return context.json({ message: "An error occurred", error: totalSubtitlesError.message });
    }

    const { data: totalQueriedTimes, error: totalQueriedTimesError } = await supabaseClient.rpc("sum_queried_times");

    if (totalQueriedTimesError) {
      context.status(500);
      return context.json({ message: "An error occurred", error: totalQueriedTimesError.message });
    }

    const stats = {
      total_titles: totalTitles,
      total_subtitles: totalSubtitles,
      total_queried_times: totalQueriedTimes,
    };

    const parsedStats = statsSchema.safeParse(stats);

    if (!parsedStats.success) {
      context.status(400);
      return context.json({ message: "Invalid stats", error: parsedStats.error.issues[0].message });
    }

    return context.json(parsedStats.data);
  },
  cache({ cacheName: "subtis-api-stats", cacheControl: `max-age=${timestring("1 week")}` }),
);
