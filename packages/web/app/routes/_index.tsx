import type { MetaFunction } from "@remix-run/node";

// home
import { HomeAlert } from "~/components/home/alert";
import { HomeFaq } from "~/components/home/faq";
import { HomeFeatures } from "~/components/home/features";
import { HomeFooter } from "~/components/home/footer";
import { HomeHero } from "~/components/home/hero";
import { SearchButton } from "~/components/home/search-button";
import { HomeTrending } from "~/components/home/trending";

// shared
import { getApiClient } from "@subtis/shared";

// meta
export const meta: MetaFunction = () => {
  return [{ title: "Subtis" }, { name: "description", content: "Encontra tus subtítulos rápidamente!" }];
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
    <main className="min-h-screen bg-[url('/background.png')] bg-contain bg-no-repeat bg-slate-50">
      <div className="container mx-auto px-4">
        <nav className="flex items-center justify-between py-4">
          <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px]" />
          <SearchButton />
        </nav>
        <HomeHero />
        <HomeTrending />
        <HomeFeatures />
        <HomeFaq />
        <HomeAlert />
        <HomeFooter />
      </div>
    </main>
  );
}
