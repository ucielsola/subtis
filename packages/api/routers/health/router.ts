import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver } from "hono-openapi/zod";
import z from "zod";

// lib
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// router
export const health = new Hono<{ Variables: AppVariables }>()
  .get(
    "/api",
    describeRoute({
      tags: ["Health (2)"],
      summary: "Check if the API is running",
      responses: {
        200: {
          description: "Successful API health response",
          content: {
            "application/json": {
              schema: resolver(z.object({ status: z.string(), message: z.string() })),
            },
          },
        },
        500: {
          description: "Error API health response",
        },
      },
    }),
    async (context) => {
      return context.json({ status: "ok", message: "Service is running" });
    },
  )
  .get(
    "/database",
    describeRoute({
      tags: ["Health (2)"],
      summary: "Check if the Database is running",
      responses: {
        200: {
          description: "Successful database health response",
        },
        500: {
          description: "Error database health response",
        },
      },
    }),
    async (context) => {
      const supabaseClient = getSupabaseClient(context);

      const { error } = await supabaseClient.from("SubtitleGroups").select("*");

      if (error) {
        return context.json({ status: "error", message: error.message }, 500);
      }

      return context.json({ status: "ok", message: "Database is running" });
    },
  );
