import { sign } from "hono/jwt";
import type { ActionFunctionArgs } from "react-router";
import { z } from "zod";

// lib
import { apiClient } from "~/lib/api";

export const action = async ({ request, context }: ActionFunctionArgs) => {
  const env = context.cloudflare.env as Env;
  const JWT_SECRET = env.JWT_SECRET;

  if (!JWT_SECRET) {
    return new Response(JSON.stringify({ error: "JWT_SECRET is not set" }), { status: 500 });
  }

  const origin = request.headers.get("origin");

  if (origin !== "https://subtis.io") {
    return new Response(JSON.stringify({ error: "Origin not allowed" }), { status: 403 });
  }

  if (request.method !== "PATCH") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const body = await request.json();

  const { success, data: parsedData } = z.object({ titleSlug: z.string() }).safeParse(body);

  if (!success) {
    return new Response(JSON.stringify({ error: "Invalid request format" }), { status: 400 });
  }

  const { titleSlug } = parsedData;

  const token = await sign({ titleSlug }, JWT_SECRET);

  const response = await apiClient.v1.title.metrics.search.$patch(
    { json: { titleSlug } },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to update search metrics" }), { status: response.status });
  }

  return new Response(JSON.stringify({ message: "Search metrics updated" }), { status: 200 });
};
