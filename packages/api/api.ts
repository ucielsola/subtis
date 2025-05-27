import { DurableObjectRateLimiter } from "@hono-rate-limiter/cloudflare";

// internals
import { runApi } from "./app";

// constants
const app = runApi();

// exports
export default app;
export { DurableObjectRateLimiter };
