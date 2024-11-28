import type { LinksFunction } from "@remix-run/node";
import { Link } from "@remix-run/react";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

// layout
import { HomeFooter } from "~/components/layout/footer";
import { SearchButton } from "~/components/layout/search-button";

// ui
import { Toaster } from "~/components/ui/toaster";

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
    <main className="min-h-screen bg-right-top bg-[url('/hero-bg.png')] bg-contain bg-no-repeat">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <Link to="/">
            <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px] hover:scale-105 transition-all ease-in-out" />
          </Link>
          <SearchButton />
        </nav>
        <Outlet />
        <HomeFooter />
      </div>
      <Toaster />
    </main>
  );
}
