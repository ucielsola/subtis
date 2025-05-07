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

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405 });
  }

  const body = await request.json();

  const { success, data: parsedData } = z
    .object({ bytes: z.number(), titleFileName: z.string(), email: z.string().email().optional() })
    .safeParse(body);

  if (!success) {
    return new Response(JSON.stringify({ error: "Invalid request format" }), { status: 400 });
  }

  const { bytes, titleFileName, email } = parsedData;

  const token = await sign({ bytes, titleFileName, email }, "JWT_SECRET");

  const response = await apiClient.v1.subtitle["not-found"].$post(
    { json: { bytes, titleFileName, email } },
    { headers: { Authorization: `Bearer ${token}` } },
  );

  if (!response.ok) {
    return new Response(JSON.stringify({ error: "Failed to create not found subtitle" }), { status: response.status });
  }

  return new Response(JSON.stringify({ message: "Not found subtitle created" }), { status: 200 });
};
