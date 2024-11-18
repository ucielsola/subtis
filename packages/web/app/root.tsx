import type { LinksFunction } from "@remix-run/node";
import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "@remix-run/react";

// layout
import { HomeFooter } from "~/components/layout/footer";
import { SearchButton } from "~/components/layout/search-button";

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
    rel: "preload",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
    as: "style",
    onLoad: "this.onload=null;this.rel='stylesheet'",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
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
    <main className="min-h-screen bg-[url('/background.png')] bg-contain bg-no-repeat bg-slate-50 bg-right-top">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px]" />
          <SearchButton />
        </nav>
        <Outlet />
        <HomeFooter />
      </div>
    </main>
  );
}
