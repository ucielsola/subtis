import type { MetaFunction } from "react-router";
import { Fragment } from "react/jsx-runtime";

// home
import { HomeFeatures } from "~/features/home/features";
import { HomeHero } from "~/features/home/hero";
import { HomeProviders } from "~/features/home/providers";
import { HomeStats } from "~/features/home/stats";
import { HomeTrending } from "~/features/home/trending";

// lib
import { apiClient } from "~/lib/api";

// meta
export const meta: MetaFunction = () => {
  return [{ title: "Subtis" }, { name: "description", content: "Subtítulos para todas tus películas" }];
};

export const loader = () => {
  const trendingDownloadedTitlesPromise = apiClient.v1.titles.trending.download[":limit"]
    .$get({
      param: {
        limit: "22",
      },
    })
    .then((response) => response.json());

  const recentDownloadedTitlesPromise = apiClient.v1.titles.recent[":limit"]
    .$get({
      param: {
        limit: "22",
      },
    })
    .then((response) => response.json());

  const statsPromise = apiClient.v1.stats.all.$get().then((response) => response.json());

  return {
    statsPromise,
    recentDownloadedTitlesPromise,
    trendingDownloadedTitlesPromise,
  };
};

export default function HomePage() {
  return (
    <Fragment>
      <HomeHero />
      <HomeTrending />
      <HomeStats />
      <HomeFeatures />
      <HomeProviders />
    </Fragment>
  );
}
