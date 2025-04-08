import { Fragment, use } from "react";
import { Link } from "react-router";

// api
import { trendingSubtitlesResponseSchema } from "@subtis/api/controllers/titles/schemas";

export function TrendingSearch({ trendingSearchPromise }: { trendingSearchPromise: Promise<undefined> }) {
  // react hooks
  const trendingSearchData = use(trendingSearchPromise);

  // constants
  const trendingSearchParsedData = trendingSubtitlesResponseSchema.parse(trendingSearchData);

  const parsedTrendingSearch = trendingSearchParsedData.results.map((result) => ({
    title: result.title_name,
    year: result.year,
    slug: result.slug,
    searchedTimes: result.searched_times,
  }));

  const [firstTrending, secondTrending] = parsedTrendingSearch;

  return (
    <Fragment>
      <p className="text-zinc-400 text-xs truncate">
        Lo más buscado últimamente:{" "}
        <Link to={`/subtitles/movie/${firstTrending.slug}`} className="hover:text-zinc-50">
          {firstTrending.title}
        </Link>{" "}
        y{" "}
        <Link to={`/subtitles/movie/${secondTrending.slug}`} className="hover:text-zinc-50">
          {secondTrending.title}
        </Link>
      </p>
    </Fragment>
  );
}
