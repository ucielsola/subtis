import { useLoaderData } from "@remix-run/react";

// routes
import type { loader } from "~/routes/_index";

export function TrendingSlider() {
  const { trendingDownloadedTitles } = useLoaderData<typeof loader>();

  if ("message" in trendingDownloadedTitles) {
    return null;
  }

  return (
    <div className="carousel carousel-start rounded-sm gap-3 py-3">
      {trendingDownloadedTitles.results.map((title) => {
        if (!title.poster) {
          return null;
        }

        return (
          <div key={title.id} className="carousel-item rounded-sm overflow-hidden cursor-pointer">
            <img
              alt={title.title_name}
              src={title.poster}
              className="w-56 h-[336px] object-cover hover:scale-110 transition-all ease-in-out"
            />
          </div>
        );
      })}
    </div>
  );
}
