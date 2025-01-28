import type { LinksFunction } from "@remix-run/cloudflare";
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useNavigate, useRouteError } from "@remix-run/react";
import { QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/remix";

// layout
import { HomeFooter } from "~/components/layout/footer";
import { Header } from "~/components/layout/header";

import { Toaster } from "~/components/ui/toaster";
import { TooltipProvider } from "~/components/ui/tooltip";
// ui
import { Button } from "./components/ui/button";

// lib
import "~/lib/analytics";
import { queryClient } from "~/lib/react-query";

// internals
import styles from "./tailwind.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: styles },
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <NuqsAdapter>
          <Header />
          <main className="min-h-screen bg-right-top bg-[url('/hero-bg.webp')] bg-contain bg-no-repeat selection:text-zinc-950 selection:bg-zinc-50 pt-20">
            <div className="container mx-auto px-4 min-h-screen flex flex-col">
              <Outlet />
              <HomeFooter />
            </div>
          </main>
          <Toaster />
        </NuqsAdapter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary() {
  // remix hooks
  const error = useRouteError() as Error;
  const navigate = useNavigate();

  return (
    <html lang="en">
      <head>
        <title>Subtis | Error</title>
        <Meta />
        <Links />
      </head>
      <body>
        <Header />
        <main className="min-h-screen bg-right-top bg-[url('/hero-bg.webp')] bg-contain bg-no-repeat selection:text-zinc-950 selection:bg-zinc-50 pt-20">
          <div className="container mx-auto px-4 h-[90vh] flex flex-col">
            <div className="text-center gap-2 h-full flex flex-col justify-center items-center">
              <h1 className="text-4xl font-bold text-red-600">Ups!</h1>
              <p className="text-xl text-zinc-300">Algo salió mal.</p>

              <div className="text-sm text-zinc-400">{error?.message || "Ocurrió un error inesperado"}</div>

              <Button
                onClick={() => navigate("/")}
                size="sm"
                variant="ghost"
                className="hover:bg-zinc-950 bg-zinc-950 border border-zinc-700 transition-all ease-in-out z-10 mt-4"
              >
                Ir a la Home
              </Button>
            </div>
            <HomeFooter />
          </div>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
