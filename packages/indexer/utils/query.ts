import replaceSpecialCharacters from "replace-special-characters";
import { P, match } from "ts-pattern";

import type { CurrentTitle } from "../app";

export function getQueryForTorrentProvider(title: CurrentTitle): string {
  const { name, year, episode } = title;
  const parsedName = replaceSpecialCharacters(name.replace(/'/g, ""));

  return match(episode)
    .with(null, () => `${parsedName} ${year}`)
    .with(P.string, () => `${parsedName} ${episode}`)
    .exhaustive();
}
