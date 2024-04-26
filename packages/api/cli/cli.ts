// @ts-ignore
import manifest from "__STATIC_CONTENT_MANIFEST";
import { Hono } from "hono";
import { serveStatic } from "hono/cloudflare-workers";

// internals
import type { AppVariables } from "../shared";

// core
export const cli = new Hono<{ Variables: AppVariables }>().get("/", serveStatic({ path: "./subtis.bin", manifest }));
