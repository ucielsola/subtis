import { Link, useLoaderData } from "@remix-run/react";

// routes
import type { loader } from "~/routes/_index";

// internals
import { ThumbHashNewsImage } from "./thumbhash-news-image";

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
            className="box-content flex flex-none [scroll-snap-align:start] rounded-sm overflow-hidden cursor-pointer hover:scale-105 transition-all ease-in-out duration-300 group will-change-transform"
          >
            <ThumbHashNewsImage src={title.backdrop} hashUrl={title.backdrop_thumbhash} alt={title.title_name} />
          </Link>
        );
      })}
    </div>
  );
}
