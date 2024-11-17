import { useLoaderData } from "@remix-run/react";

// routes
import type { loader } from "~/routes/_index";

export function TrendingSlider() {
  const { trendingDownloadedTitles } = useLoaderData<typeof loader>();

  if ("message" in trendingDownloadedTitles) {
    return null;
  }

  return (
    <div className="carousel carousel-center rounded-sm gap-3 py-3">
      {trendingDownloadedTitles.results.map((title) => {
        if (!title.poster) {
          return null;
        }

        return (
          <div
            key={title.id}
            className="carousel-item hover:scale-105 transition-all rounded-sm overflow-hidden will-change-transform"
          >
            <img alt={title.title_name} src={title.poster} className="max-w-56" />
          </div>
        );
      })}
    </div>
  );
}
