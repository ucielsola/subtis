import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { cache } from "hono/cache";
import { verify } from "hono/jwt";
import timestring from "timestring";
import z from "zod";

// lib
import { getJwtSecret } from "../../lib/api-keys";
import { buscalaSchema } from "../../lib/buscala";
import { titleMetadataQuery, titleMetadataSchema } from "../../lib/schemas";
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// internals
import {
  titleMetadataSlugResponseSchema,
  titleMetricsSearchResponseSchema,
  titlePlatformsSlugResponseSchema,
} from "./schemas";

// router
export const title = new Hono<{ Variables: AppVariables }>()
  .get(
    "/streaming/:slug",
    describeRoute({
      tags: ["Title (2)"],
      description: "Get title streaming platforms from slug",
      responses: {
        200: {
          description: "Successful title streaming platforms response",
          content: {
            "application/json": {
              schema: resolver(titlePlatformsSlugResponseSchema),
            },
          },
        },
        404: {
          description: "Title not found",
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
    }),
    zValidator("param", z.object({ slug: z.string().openapi({ example: "nosferatu-2024" }) })),
    async (context) => {
      const { slug } = context.req.valid("param");

      const { data, error } = await getSupabaseClient(context)
        .from("Titles")
        .select("title_name, title_name_spa, year, type")
        .match({ slug })
        .single();

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      if (error) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: error.message,
        });
      }

      const response = await fetch(`https://www.buscala.tv/api/search?title=${data.title_name}`, {
        headers: {
          "accept-language": "es-ar",
          "x-vercel-ip-country": "AR",
        },
      });

      const responseData = await response.json();
      const buscalaData = buscalaSchema.safeParse(responseData);

      if (buscalaData.error) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: buscalaData.error.issues[0].message,
        });
      }

      const contentTypeToSearch = data.type === "movie" ? "MOVIE" : "SHOW";
      const WHITELIST_PROVIDERS = ["Apple TV", "Amazon Prime Video", "Disney Plus", "Netflix", "Max"];

      const titles = buscalaData.data.results
        .filter(({ contentType }) => contentType === contentTypeToSearch)
        .map((title) => {
          const platforms = title.platforms.filter(({ name }) => WHITELIST_PROVIDERS.includes(name));

          return {
            ...title,
            platforms,
          };
        });

      const title = titles.find(
        ({ name, releaseYear }) =>
          (name === data.title_name_spa || name === data.title_name) && releaseYear === data.year,
      );

      if (!title) {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      const finalResponse = titlePlatformsSlugResponseSchema.safeParse({
        name: data.title_name,
        platforms: title.platforms,
      });

      if (finalResponse.error) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: finalResponse.error.issues[0].message,
        });
      }

      const results = {
        ...finalResponse.data,
        platforms: finalResponse.data.platforms.sort((a, b) => a.name.localeCompare(b.name)),
      };

      return context.json(results);
    },
    cache({
      cacheName: "subtis-api-title",
      cacheControl: `max-age=${timestring("1 day")}`,
    }),
  )
  .get(
    "/metadata/:slug",
    describeRoute({
      hide: true,
      tags: ["Title (2)"],
      description: "Get title metadata",
      responses: {
        200: {
          description: "Successful title metadata response",
          content: {
            "application/json": {
              schema: resolver(titleMetadataSlugResponseSchema),
            },
          },
        },
        404: {
          description: "Title not found",
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
    }),
    zValidator("param", z.object({ slug: z.string().openapi({ example: "nosferatu-2024" }) })),
    async (context) => {
      const { slug } = context.req.valid("param");

      const { data, error } = await getSupabaseClient(context)
        .from("Titles")
        .select(titleMetadataQuery)
        .match({ slug })
        .single();

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      if (error) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: error.message,
        });
      }

      const titleBySlug = titleMetadataSchema.safeParse(data);

      if (titleBySlug.error) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: titleBySlug.error.issues[0].message,
        });
      }

      const { subtitles, ...rest } = titleBySlug.data;
      const total_subtitles = subtitles.length;

      const subtitlesIds = subtitles.map(({ id }) => id);
      const finalResponse = titleMetadataSlugResponseSchema.safeParse({
        ...rest,
        total_subtitles,
        subtitle_ids: subtitlesIds,
      });

      if (finalResponse.error) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: finalResponse.error.issues[0].message,
        });
      }

      return context.json(finalResponse.data);
    },
  )
  .patch(
    "/metrics/search",
    describeRoute({
      hide: true,
      tags: ["Title (2)"],
      description: "Update title search metrics",
      responses: {
        200: {
          description: "Successful title search metrics response",
          content: {
            "application/json": {
              schema: resolver(titleMetricsSearchResponseSchema),
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: {
            "application/json": {
              schema: resolver(z.object({ message: z.string() })),
            },
          },
        },
        404: {
          description: "Title not found",
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
    }),
    zValidator("json", z.object({ titleSlug: z.string().openapi({ example: "nosferatu-2024" }) })),
    async (context) => {
      const authorizationHeader = context.req.header("Authorization");

      if (!authorizationHeader) {
        context.status(401);
        return context.json({ message: "No Authorization header provided" });
      }

      const [, token] = authorizationHeader.split(" ");

      if (!token) {
        context.status(401);
        return context.json({
          message: "No token provided in Authorization header",
        });
      }

      try {
        const jwtSecret = getJwtSecret(context);
        await verify(token, jwtSecret);
      } catch (error) {
        console.log("\n ~ error:", error);
        context.status(401);
        return context.json({
          message: "Invalid or expired authentication token",
        });
      }

      const { titleSlug } = context.req.valid("json");

      const { data, error } = await getSupabaseClient(context).rpc("update_title_search_metrics", {
        _slug: titleSlug,
      });

      if (error) {
        context.status(500);
        return context.json({
          message: "An error occurred",
          error: error.message,
        });
      }

      if (typeof data === "boolean" && data === false) {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      return context.json({ ok: true });
    },
  );
