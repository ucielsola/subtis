import type { MetaFunction } from "react-router";
import { Fragment } from "react/jsx-runtime";

// home
import { HomeDropzone } from "~/features/home/dropzone";
import { HomeFeatures } from "~/features/home/features";
import { HomeHero } from "~/features/home/hero";
import { HomeProviders } from "~/features/home/providers";
import { HomeStats } from "~/features/home/stats";
import { HomeTrending } from "~/features/home/trending";

// lib
import { apiClient } from "~/lib/api";

// meta
export const meta: MetaFunction = () => {
  return [
    { title: "Subtis | Subtítulos para tus películas" },
    {
      name: "description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    {
      name: "keywords",
      content: "subtítulos, películas, subtis, descargar subtítulos, subtítulos español, subtítulos sincronizados",
    },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Subtis" },
    { property: "og:title", content: "Subtis | Subtítulos para tus películas" },
    {
      property: "og:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Subtis" },
    { property: "og:url", content: "https://subtis.io" },
    { property: "og:image", content: "https://subtis.io/og.png" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@subt_is" },
    {
      name: "twitter:title",
      content: "Subtis | Subtítulos para tus películas",
    },
    {
      name: "twitter:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { name: "twitter:image", content: "https://subtis.io/twitter.png" },
  ];
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
      <HomeDropzone />
      <HomeTrending />
      <HomeFeatures />
      <HomeStats />
      <HomeProviders />
    </Fragment>
  );
}
