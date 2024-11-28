import { Link, useLoaderData } from "@remix-run/react";

// routes
import type { loader } from "~/routes/_index";

export function NewsSlider() {
  const { recentDownloadedTitles } = useLoaderData<typeof loader>();

  if ("message" in recentDownloadedTitles) {
    return null;
  }

  return (
    <div className="inline-flex overflow-x-scroll [scroll-snap-type:x_mandatory] [scroll-behavior:smooth] [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden rounded-md gap-3 py-3">
      {recentDownloadedTitles.results.map((title) => {
        if (!title.backdrop) {
          return null;
        }

        return (
          <Link
            key={title.id}
            to={`/subtitles/movie/${title.imdb_id}`}
            className="box-content flex flex-none [scroll-snap-align:start] rounded-md overflow-hidden cursor-pointer border-2 border-transparent hover:border-zinc-800"
          >
            <div className="w-72 h-[162.05px] relative rounded-md overflow-hidden group/new-card">
              <img
                alt={title.title_name}
                src={title.backdrop}
                className="w-full h-full object-cover group-hover/new-card:scale-110 transition-all ease-in-out rounded-md will-change-transform"
              />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
