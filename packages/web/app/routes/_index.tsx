import type { MetaFunction } from "@remix-run/cloudflare";
import { Fragment } from "react/jsx-runtime";

// home
import { HomeAlert } from "~/features/home/alert";
import { HomeFeatures } from "~/features/home/features";
import { HomeHero } from "~/features/home/hero";
import { HomeTrending } from "~/features/home/trending";

// shared external
import { getApiClient } from "@subtis/shared";

// meta
export const meta: MetaFunction = () => {
  return [{ title: "Subtis" }, { name: "description", content: "Subtítutlos para todas tus películas" }];
};

export const loader = async () => {
  const apiClient = getApiClient({
    apiBaseUrl: "https://api.subt.is" as string,
  });

  const [trendingDownloadedTitlesResponse, recentDownloadedTitlesResponse] = await Promise.all([
    apiClient.v1.titles.trending.download[":limit"].$get({
      param: {
        limit: "20",
      },
    }),
    apiClient.v1.titles.recent[":limit"].$get({
      param: {
        limit: "20",
      },
    }),
  ]);

  if (!trendingDownloadedTitlesResponse.ok || !recentDownloadedTitlesResponse.ok) {
    throw new Error("Failed to fetch trending or recent downloaded titles");
  }

  const [trendingDownloadedTitles, recentDownloadedTitles] = await Promise.all([
    trendingDownloadedTitlesResponse.json(),
    recentDownloadedTitlesResponse.json(),
  ]);

  return {
    recentDownloadedTitles,
    trendingDownloadedTitles,
  };
};

export default function Index() {
  return (
    <Fragment>
      <HomeHero />
      <HomeTrending />
      <HomeFeatures />
      <HomeAlert />
    </Fragment>
  );
}
