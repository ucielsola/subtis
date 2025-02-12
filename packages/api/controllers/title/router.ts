import { Hono } from "hono";
import { describeRoute } from "hono-openapi";
import { resolver, validator as zValidator } from "hono-openapi/zod";
import { cache } from "hono/cache";
import slugify from "slugify";
import timestring from "timestring";
import z from "zod";

// lib
import { buscalaSchema } from "../../lib/buscala";
import { cinemarkSchema } from "../../lib/cinemark";
import { titleMetadataQuery, titleMetadataSchema } from "../../lib/schemas";
import { getSupabaseClient } from "../../lib/supabase";
import type { AppVariables } from "../../lib/types";

// schemas
import {
  titleCinemaSlugResponseSchema,
  titleMetadataSlugResponseSchema,
  titleMetricsSearchResponseSchema,
  titlePlatformsSlugResponseSchema,
} from "./schemas";

// router
export const title = new Hono<{ Variables: AppVariables }>()
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
        return context.json({ message: "An error occurred", error: error.message });
      }

      const titleBySlug = titleMetadataSchema.safeParse(data);

      if (titleBySlug.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: titleBySlug.error.issues[0].message });
      }

      const { subtitles, ...rest } = titleBySlug.data;
      const total_subtitles = subtitles.length;

      const finalResponse = titleMetadataSlugResponseSchema.safeParse({ ...rest, total_subtitles });

      if (finalResponse.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: finalResponse.error.issues[0].message });
      }

      return context.json(finalResponse.data);
    },
  )
  .get(
    "/cinemas/:slug",
    describeRoute({
      tags: ["Title (2)"],
      description: "Get title cinemas from slug",
      responses: {
        200: {
          description: "Successful title cinemas response",
          content: {
            "application/json": {
              schema: resolver(titleCinemaSlugResponseSchema),
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
      },
    }),
    zValidator("param", z.object({ slug: z.string().openapi({ example: "nosferatu-2024" }) })),
    async (context) => {
      const { slug } = context.req.valid("param");

      const { data, error } = await getSupabaseClient(context)
        .from("Titles")
        .select("title_name, title_name_spa, year")
        .match({ slug })
        .single();

      if (error && error.code === "PGRST116") {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      const { title_name, title_name_spa, year } = data;

      const cinemarkData = await fetch("https://www.cinemarkhoyts.com.ar/ws/Billboard_WWW_202501082050585424.js");
      const code = await cinemarkData.text();
      const value = JSON.parse(code.slice(15, -1));

      const cinemarkParsedData = cinemarkSchema.safeParse(value);

      if (cinemarkParsedData.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: cinemarkParsedData.error.issues[0].message });
      }

      const { Cinemas, Films } = cinemarkParsedData.data;

      const parsedYear = String(year);
      const parsedNextYear = String(year + 1);

      const film = Films.find(
        (film) =>
          film.Name.toLowerCase().includes(title_name_spa.toLowerCase()) &&
          (film.OpeningDate.startsWith(parsedYear) || film.OpeningDate.startsWith(parsedNextYear)),
      );

      if (!film) {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      const { CinemaList } = film;

      const filmCinemas = Cinemas.filter((cinema) => CinemaList.includes(cinema.Id)).map(({ City, Name }) => ({
        city: City,
        name: Name,
      }));
      const groupedFilmCinemas = Object.groupBy(filmCinemas, ({ city }) => city);

      const link = `https://www.cinemarkhoyts.com.ar/pelicula/${slugify(title_name_spa).toUpperCase()}`;

      const finalResponse = {
        link,
        name: title_name,
        cinemas: groupedFilmCinemas,
      };

      const parsedFinalResponse = titleCinemaSlugResponseSchema.safeParse(finalResponse);

      if (parsedFinalResponse.error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: parsedFinalResponse.error.issues[0].message });
      }

      return context.json(parsedFinalResponse.data);
    },
    cache({ cacheName: "subtis-api-title", cacheControl: `max-age=${timestring("1 day")}` }),
  )
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
        return context.json({ message: "An error occurred", error: error.message });
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
        return context.json({ message: "An error occurred", error: buscalaData.error.issues[0].message });
      }

      const contentTypeToSearch = data.type === "movie" ? "MOVIE" : "SHOW";
      const titles = buscalaData.data.results.filter(({ contentType }) => contentType === contentTypeToSearch);

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
        return context.json({ message: "An error occurred", error: finalResponse.error.issues[0].message });
      }

      return context.json(finalResponse.data);
    },
    cache({ cacheName: "subtis-api-title", cacheControl: `max-age=${timestring("1 day")}` }),
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
      },
    }),
    zValidator("json", z.object({ slug: z.string().openapi({ example: "nosferatu-2024" }) })),
    async (context) => {
      const { slug } = context.req.valid("json");

      const { data, error } = await getSupabaseClient(context).rpc("update_title_search_metrics", {
        _slug: slug,
      });

      if (error) {
        context.status(500);
        return context.json({ message: "An error occurred", error: error.message });
      }

      if (typeof data === "boolean" && data === false) {
        context.status(404);
        return context.json({ message: "Title not found" });
      }

      return context.json({ ok: true });
    },
  );
