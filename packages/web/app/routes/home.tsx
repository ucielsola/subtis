import type { MetaFunction } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { z } from "zod";

// api
import { statsSchema } from "@subtis/api/controllers/stats/schemas";
import { trendingSubtitlesResponseSchema } from "@subtis/api/controllers/titles/schemas";

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

export const loader = async () => {
  const [trendingDownloadedTitlesResponse, recentDownloadedTitlesResponse, statsResponse] = await Promise.all([
    apiClient.v1.titles.trending.download[":limit"].$get({
      param: {
        limit: "22",
      },
    }),
    apiClient.v1.titles.recent[":limit"].$get({
      param: {
        limit: "22",
      },
    }),
    apiClient.v1.stats.all.$get(),
  ]);

  if (!trendingDownloadedTitlesResponse.ok || !recentDownloadedTitlesResponse.ok || !statsResponse.ok) {
    const trendingDownloadedTitlesError = z.object({ message: z.string() }).safeParse(trendingDownloadedTitlesResponse);
    const recentDownloadedTitlesError = z.object({ message: z.string() }).safeParse(recentDownloadedTitlesResponse);
    const statsError = z.object({ message: z.string() }).safeParse(statsResponse);

    if (trendingDownloadedTitlesError.success) {
      return trendingDownloadedTitlesError.data;
    }

    if (recentDownloadedTitlesError.success) {
      return recentDownloadedTitlesError.data;
    }

    if (statsError.success) {
      return statsError.data;
    }

    throw new Error("Failed to fetch trending or recent downloaded titles");
  }

  const [trendingDownloadedTitles, recentDownloadedTitles, allStats] = await Promise.all([
    trendingDownloadedTitlesResponse.json(),
    recentDownloadedTitlesResponse.json(),
    statsResponse.json(),
  ]);

  const trending = trendingSubtitlesResponseSchema.safeParse(trendingDownloadedTitles);
  const recent = trendingSubtitlesResponseSchema.safeParse(recentDownloadedTitles);
  const stats = statsSchema.safeParse(allStats);

  if (trending.error || recent.error || stats.error) {
    throw new Error("Failed to parse trending or recent downloaded titles");
  }

  return {
    stats: stats.data,
    recentDownloadedTitles: recent.data,
    trendingDownloadedTitles: trending.data,
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
