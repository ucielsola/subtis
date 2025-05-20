import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import z from "zod";

// lib
import { titleRandomSchema } from "../../lib/schemas";
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// router
export const qa = new Hono<{ Variables: AppVariables }>().get(
  "/random/movies/:year?",
  describeRoute({
    tags: ["QA"],
    hide: true,
    description: "Get random movies",
    responses: {
      200: {
        description: "Successful random movies response",
        content: {
          "application/json": {
            schema: resolver(titleRandomSchema),
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
  }),
  zValidator(
    "param",
    z.object({
      year: z.string().default(new Date().getFullYear().toString()),
    }),
  ),
  async (context) => {
    const { year } = context.req.valid("param");
    const supabaseClient = await getSupabaseClient(context);

    const { data, error } = await supabaseClient.from("RandomTitles").select("slug").eq("year", year).limit(10);

    if (error) {
      context.status(500);
      return context.json({ message: error.message }, 500);
    }

    const parsedData = z.array(titleRandomSchema).safeParse(data);

    if (!parsedData.success) {
      context.status(500);
      return context.json({ message: parsedData.error.message }, 500);
    }

    const randomMovies = parsedData.data.map(({ slug }) => ({
      slug,
      year,
      link: `https://subtis.io/subtitles/movie/${slug}`,
    }));

    return context.json({ random_movies: randomMovies });
  },
);
