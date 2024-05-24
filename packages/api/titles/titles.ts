import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

// internals
import { type AppVariables, getSupabaseClient } from "../shared";

// db
import { titlesRowSchema } from "@subtis/db/schemas";

// schemas
const searchTitleSchema = titlesRowSchema.pick({ id: true, type: true, title_name: true, year: true });
const searchTitlesSchema = z.array(searchTitleSchema).min(1);

const recentTitleSchema = titlesRowSchema.pick({
  id: true,
  title_name: true,
  type: true,
  year: true,
  rating: true,
  release_date: true,
});
const recentTitlesSchema = z
  .array(recentTitleSchema, { invalid_type_error: "Recent movies not found" })
  .min(1, { message: "Recent movies not found" });

// queries
const recentTitlesQuery = `
  id,
  year,
  type,
  rating,
  title_name,
  release_date
`;

// core
export const titles = new Hono<{ Variables: AppVariables }>()
  .get("/search/:query", zValidator("param", z.object({ query: z.string() })), async (context) => {
    const { query } = context.req.valid("param");
    const { data } = await getSupabaseClient(context).rpc("fuzzy_search_title", { query });

    const titles = searchTitlesSchema.safeParse(data);
    if (!titles.success) {
      context.status(404);
      return context.json({ message: `Titles not found for query ${query}` });
    }

    return context.json(titles.data);
  })
  .get("/recent/:limit", zValidator("param", z.object({ limit: z.string() })), async (context) => {
    const { limit } = context.req.valid("param");

    const { data } = await getSupabaseClient(context)
      .from("Titles")
      .select(recentTitlesQuery)
      .order("release_date", { ascending: false })
      .limit(Number(limit));

    const recentSubtitles = recentTitlesSchema.safeParse(data);
    if (!recentSubtitles.success) {
      context.status(404);
      return context.json({ message: "No recent movies found" });
    }

    return context.json(recentSubtitles.data);
  });
