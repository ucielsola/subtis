import replaceSpecialCharacters from "replace-special-characters";
import { P, match } from "ts-pattern";

// internals
import type { CurrentTitle } from "../app";

export function getQueryForTorrentProvider({ name, year, episode }: CurrentTitle): string {
  const parsedName = replaceSpecialCharacters(name.replace(/'/g, ""));

  return match(episode)
    .with(null, () => `${parsedName} ${year}`)
    .with(P.string, () => `${parsedName} ${episode}`)
    .exhaustive();
}
