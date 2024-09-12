import { P, match } from "ts-pattern";

// shared
import { getStringWithoutSpecialCharacters } from "@subtis/shared";

// internals
import type { CurrentTitle } from "../app";

export function getQueryForTorrentProvider({ name, year, episode }: CurrentTitle): string {
  const parsedName = getStringWithoutSpecialCharacters(name);

  return match(episode)
    .with(null, () => `${parsedName} ${year}`)
    .with(P.string, () => `${parsedName} ${episode}`)
    .exhaustive();
}
