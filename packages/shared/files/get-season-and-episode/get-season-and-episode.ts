export function getSeasonAndEpisode(fullSeason: string | null): {
  current_season: number | null;
  current_episode: number | null;
} {
  if (!fullSeason) {
    return { current_season: null, current_episode: null };
  }

  const [current_season, current_episode] = fullSeason.replace(/e/gi, "-").replace(/s/gi, "").split("-").map(Number);

  return { current_season, current_episode };
}
