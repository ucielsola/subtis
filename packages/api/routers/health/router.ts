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
      hide: true,
      tags: ["Health (5)"],
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
      hide: true,
      tags: ["Health (5)"],
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
  )
  .get(
    "/websocket",
    describeRoute({
      hide: true,
      tags: ["Health (5)"],
      summary: "Check if the WebSocket is running",
      responses: {
        200: {
          description: "Successful WebSocket health response",
        },
        500: {
          description: "Error WebSocket health response",
        },
      },
    }),
    async (context) => {
      try {
        await new Promise((resolve, reject) => {
          const ws = new WebSocket("wss://ws-search.subt.is");

          ws.onopen = () => {
            ws.close();
            resolve(true);
          };

          ws.onerror = () => reject(new Error("WebSocket connection failed"));
        });

        return context.json({ status: "ok", message: "WebSocket is running" });
      } catch (error) {
        return context.json({ status: "error", message: "WebSocket is not running" }, 500);
      }
    },
  )
  .get(
    "/stremio",
    describeRoute({
      hide: true,
      tags: ["Health (5)"],
      summary: "Check if the Stremio is running",
      responses: {
        200: {
          description: "Successful Stremio health response",
        },
        500: {
          description: "Error Stremio health response",
        },
      },
    }),
    async (context) => {
      const response = await fetch("https://stremio.subt.is");

      if (response.status === 200) {
        return context.json({ status: "ok", message: "Stremio is running" });
      }

      return context.json({ status: "error", message: "Stremio is not running" }, 500);
    },
  )
  .get(
    "/web",
    describeRoute({
      hide: true,
      tags: ["Health (5)"],
      summary: "Check if the Web is running",
      responses: {
        200: {
          description: "Successful Web health response",
        },
        500: {
          description: "Error Web health response",
        },
      },
    }),
    async (context) => {
      const response = await fetch("https://subtis.io");

      if (response.status === 200) {
        return context.json({ status: "ok", message: "Web is running" });
      }

      return context.json({ status: "error", message: "Web is not running" }, 500);
    },
  );
