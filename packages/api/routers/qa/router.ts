import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import z from "zod";

import { titleRandomSchema } from "../../lib/schemas";
// lib
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// router
export const qa = new Hono<{ Variables: AppVariables }>().get(
  "/random/movies",
  describeRoute({
    tags: ["QA (1)"],
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
  async (context) => {
    const supabaseClient = await getSupabaseClient(context);

    const { data, error } = await supabaseClient.from("RandomTitles").select("slug").limit(10);

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
      link: `https://subtis.io/subtitles/movie/${slug}`,
    }));

    return context.json({ random_movies: randomMovies });
  },
);
