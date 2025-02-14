import { z } from "zod";
import type { MetaFunction } from "@remix-run/cloudflare";
import { Fragment } from "react/jsx-runtime";

// api
import { trendingSubtitlesResponseSchema } from "@subtis/api/controllers/titles/schemas";

// home
import { HomeAlert } from "~/features/home/alert";
import { HomeFeatures } from "~/features/home/features";
import { HomeHero } from "~/features/home/hero";
import { HomeTrending } from "~/features/home/trending";

// lib
import { apiClient } from "~/lib/api";

// meta
export const meta: MetaFunction = () => {
  return [{ title: "Subtis" }, { name: "description", content: "Subtítulos para todas tus películas" }];
};

export const loader = async () => {
  const [trendingDownloadedTitlesResponse, recentDownloadedTitlesResponse] = await Promise.all([
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
  ]);

  if (!trendingDownloadedTitlesResponse.ok || !recentDownloadedTitlesResponse.ok) {
    const trendingDownloadedTitlesError = z.object({ message: z.string() }).safeParse(trendingDownloadedTitlesResponse);
    const recentDownloadedTitlesError = z.object({ message: z.string() }).safeParse(recentDownloadedTitlesResponse);

    if (trendingDownloadedTitlesError.success) {
      return trendingDownloadedTitlesError.data;
    }

    if (recentDownloadedTitlesError.success) {
      return recentDownloadedTitlesError.data;
    }

    throw new Error("Failed to fetch trending or recent downloaded titles");
  }

  const [trendingDownloadedTitles, recentDownloadedTitles] = await Promise.all([
    trendingDownloadedTitlesResponse.json(),
    recentDownloadedTitlesResponse.json(),
  ]);

  const trending = trendingSubtitlesResponseSchema.safeParse(trendingDownloadedTitles);
  const recent = trendingSubtitlesResponseSchema.safeParse(recentDownloadedTitles);

  if (trending.error || recent.error) {
    throw new Error("Failed to parse trending or recent downloaded titles");
  }

  return {
    recentDownloadedTitles: recent.data,
    trendingDownloadedTitles: trending.data,
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
