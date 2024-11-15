import { useLoaderData } from "@remix-run/react";

// routes
import type { loader } from "~/routes/_index";

// ui
import { InfiniteSlider } from "~/components/ui/infinite-slider";

export function NewsSlider() {
  const { recentDownloadedTitles } = useLoaderData<typeof loader>();

  if ("message" in recentDownloadedTitles) {
    return null;
  }

  return (
    <InfiniteSlider durationOnHover={300} duration={200} gap={24}>
      {recentDownloadedTitles.results.map((title) => {
        if (!title.backdrop) {
          return null;
        }

        return (
          <div key={title.id} className="max-w-72 cursor-pointer rounded-sm overflow-hidden relative">
            <div className="absolute bottom-0 left-0 right-0 p-1.5 bg-black/40 backdrop-blur-sm flex items-center justify-center">
              <span className="text-white text-sm">{title.title_name}</span>
            </div>
            <img alt={title.title_name} src={title.backdrop} className="w-full h-full object-cover" />
          </div>
        );
      })}
    </InfiniteSlider>
  );
}
