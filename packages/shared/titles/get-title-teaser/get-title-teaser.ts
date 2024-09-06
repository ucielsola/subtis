import querystring from "querystring";
import { unescape as htmlUnescape } from "html-escaper";
import replaceSpecialCharacters from "replace-special-characters";

// internals
import { OFFICIAL_SUBTIS_CHANNELS } from "./constants";
import { YOUTUBE_SEARCH_URL, getYoutubeApiKey, youTubeSchema } from "./youtube";

export async function getTitleTeaser({
  name,
  year,
  currentSeason,
}: {
  name: string;
  year: number;
  currentSeason: number | null;
}): Promise<string> {
  const query = currentSeason ? `${name} season ${currentSeason} teaser` : `${name} ${year} teaser`;

  const params = {
    q: query,
    maxResults: 12,
    part: "snippet",
    key: getYoutubeApiKey(),
  };

  const queryParams = querystring.stringify(params);

  const youtubeResponse = await fetch(`${YOUTUBE_SEARCH_URL}?${queryParams}`);
  const youtubeData = await youtubeResponse.json();

  const youtubeParsedData = youTubeSchema.safeParse(youtubeData);

  if (youtubeParsedData.error) {
    throw new Error(youtubeParsedData.error.message);
  }

  const filteredTeasers = youtubeParsedData.data.items.filter(({ snippet }) => {
    const unescapedTitle = htmlUnescape(snippet.title);
    const youtubeTitle = replaceSpecialCharacters(unescapedTitle.toLowerCase()).replaceAll(":", "").replaceAll("'", "");

    return (
      youtubeTitle.includes(name.toLowerCase()) && (youtubeTitle.includes("teaser") || youtubeTitle.includes("trailer"))
    );
  });

  if (filteredTeasers.length === 0) {
    throw new Error("No teaser found");
  }

  const curatedYouTubeTeaser = filteredTeasers.find(({ snippet }) => {
    return OFFICIAL_SUBTIS_CHANNELS.some((curatedChannelsInLowerCase) =>
      curatedChannelsInLowerCase.ids.includes(snippet.channelId.toLowerCase()),
    );
  });

  const youTubeTeaser = curatedYouTubeTeaser ?? filteredTeasers[0];
  const teaser = `https://www.youtube.com/watch?v=${youTubeTeaser?.id.videoId}`;

  return teaser;
}
