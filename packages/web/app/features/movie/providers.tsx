import { Fragment } from "react";
import { useLoaderData } from "react-router";

// indexer
import { getImdbLink } from "@subtis/indexer/imdb";

// ui
import { Skeleton } from "~/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/ui/tooltip";

// logos
import { IMDbLogo } from "~/components/logos/imdb";
import { JustWatchLogo } from "~/components/logos/justwatch";
import { LetterboxdLogo } from "~/components/logos/letterboxd";
import { RottenTomatoesLogo } from "~/components/logos/rottentomatoes";
import { SpotifyLogo } from "~/components/logos/spotify";
import { YouTubeLogo } from "~/components/logos/youtube";

// hooks
import { useJustWatch } from "~/hooks/use-justwatch";
import { useLetterboxd } from "~/hooks/use-letterboxd";
import { useRottenTomatoes } from "~/hooks/use-rottentomatoes";
import { useSpotify } from "~/hooks/use-spotify";
import { useTeaser } from "~/hooks/use-teaser";

// types
import type { loader } from "~/routes/subtitles.movie.$slug";

export function MovieProviders() {
  // remix hooks
  const loaderData = useLoaderData<typeof loader>();

  // query hooks
  const { data: titleTeaser, isLoading: isLoadingTeaser } = useTeaser(
    "message" in loaderData ? undefined : loaderData.results[0].subtitle.title_file_name,
  );
  const { data: titleJustWatch, isLoading: isLoadingJustWatch } = useJustWatch(
    "message" in loaderData ? undefined : loaderData.title.slug,
  );
  const { data: titleLetterboxd, isLoading: isLoadingLetterboxd } = useLetterboxd(
    "message" in loaderData ? undefined : loaderData.title.slug,
  );
  const { data: titleRottenTomatoes, isLoading: isLoadingRottenTomatoes } = useRottenTomatoes(
    "message" in loaderData ? undefined : loaderData.title.slug,
  );
  const { data: titleSpotify, isLoading: isLoadingSpotify } = useSpotify(
    "message" in loaderData ? undefined : loaderData.title.slug,
  );

  const isLoadingProviders =
    isLoadingTeaser || isLoadingJustWatch || isLoadingLetterboxd || isLoadingRottenTomatoes || isLoadingSpotify;

  if ("message" in loaderData) {
    return null;
  }

  return (
    <div className="pt-1 px-2 flex flex-row items-center gap-6">
      {isLoadingProviders ? (
        <Skeleton className="w-full h-5 rounded-sm" />
      ) : (
        <Fragment>
          {loaderData.title.imdb_id ? (
            <Tooltip>
              <TooltipTrigger>
                <a
                  href={getImdbLink(loaderData.title.imdb_id)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/imdb"
                >
                  <IMDbLogo
                    size={32}
                    className="fill-zinc-300 group-hover/imdb:fill-[#F5C518] transition-all ease-in-out duration-300"
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>IMDb</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
          {titleTeaser && !("message" in titleTeaser) ? (
            <Tooltip>
              <TooltipTrigger>
                <a
                  href={`https://www.youtube.com/watch?v=${titleTeaser.youTubeVideoId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/trailer"
                >
                  <YouTubeLogo
                    size={24}
                    className="fill-zinc-300 group-hover/trailer:fill-[#F03] transition-all ease-in-out duration-300"
                    playerClassName="fill-zinc-950 group-hover/trailer:fill-white"
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Trailer</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
          {titleSpotify ? (
            <Tooltip>
              <TooltipTrigger>
                <a href={titleSpotify.link} target="_blank" rel="noopener noreferrer" className="group/spotify">
                  <SpotifyLogo
                    size={22}
                    className="fill-zinc-300 group-hover/spotify:fill-[#1CD760] transition-all ease-in-out duration-300"
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>
                  Soundtrack{" "}
                  {titleSpotify.type === "album" ? "(Oficial)" : titleSpotify.type === "playlist" ? "(No Oficial)" : ""}
                </p>
              </TooltipContent>
            </Tooltip>
          ) : null}
          {titleRottenTomatoes ? (
            <Tooltip>
              <TooltipTrigger>
                <a
                  href={titleRottenTomatoes.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group/rottentomatoes"
                >
                  <RottenTomatoesLogo
                    size={22}
                    className="fill-zinc-300 group-hover/rottentomatoes:fill-[#F9310A] transition-all ease-in-out duration-300"
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Rotten Tomatoes</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
          {titleJustWatch ? (
            <Tooltip>
              <TooltipTrigger>
                <a href={titleJustWatch.link} target="_blank" rel="noopener noreferrer" className="group/justwatch">
                  <JustWatchLogo
                    size={18}
                    className="fill-zinc-300 group-hover/justwatch:fill-[#E5B817] transition-all ease-in-out duration-300"
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>JustWatch</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
          {titleLetterboxd ? (
            <Tooltip>
              <TooltipTrigger>
                <a href={titleLetterboxd.link} target="_blank" rel="noopener noreferrer" className="group/letterboxd">
                  <LetterboxdLogo
                    size={26}
                    firstDotClassName="fill-zinc-300 group-hover/letterboxd:fill-[#00E054] transition-all ease-in-out duration-300"
                    secondDotClassName="fill-zinc-300 group-hover/letterboxd:fill-[#40BCF4] transition-all ease-in-out duration-300"
                    thirdDotClassName="fill-zinc-300 group-hover/letterboxd:fill-[#FF8000] transition-all ease-in-out duration-300"
                  />
                </a>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Letterboxd</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </Fragment>
      )}
    </div>
  );
}
