import { useLoaderData } from "@remix-run/react";

// routes
import type { loader } from "~/routes/_index";

// ui
import { InfiniteSlider } from "~/components/ui/infinite-slider";

export function TrendingSlider() {
  const { trendingDownloadedTitles } = useLoaderData<typeof loader>();

  if ("message" in trendingDownloadedTitles) {
    return null;
  }

  return (
    <InfiniteSlider durationOnHover={300} duration={65} gap={24}>
      {trendingDownloadedTitles.results.map((title) => {
        if (!title.poster) {
          return null;
        }

        return (
          <div key={title.id} className="max-w-56 cursor-pointer group rounded-sm overflow-hidden">
            <img
              alt={title.title_name}
              src={title.poster}
              className="w-full h-full object-cover group-hover:scale-105 transition-all duration-300"
            />
          </div>
        );
      })}
    </InfiniteSlider>
  );
}
