import { createRequestHandler } from "react-router";

declare global {
  interface CloudflareEnvironment extends Env {}
}

declare module "react-router" {
  export interface AppLoadContext {
    cloudflare: {
      env: CloudflareEnvironment;
      // @ts-ignore - virtual module provided by React Router
      ctx: ExecutionContext;
    };
  }
}

const requestHandler = createRequestHandler(
  // @ts-ignore - virtual module provided by React Router
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

export default {
  // @ts-ignore - virtual module provided by React Router
  async fetch(request, env, ctx) {
    return requestHandler(request, {
      cloudflare: { env, ctx },
    });
  },
  // @ts-ignore - virtual module provided by React Router
} satisfies ExportedHandler<CloudflareEnvironment>;
