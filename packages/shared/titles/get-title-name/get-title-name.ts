import { getIsTvShow } from "../../files";
import { getStringWithoutExtraSpaces } from "../../strings";

export function getTitleName(name: string): string {
  const [parsedName] = getIsTvShow(name) ? name.split(/s\d{2}e\d{2}/gi) : [name];
  let result = getStringWithoutExtraSpaces(parsedName.replaceAll(".", " ").replaceAll(/s\d{2}e\d{2}/gi, "")).trim();

  if (result.startsWith("[ Torrent911 eu ]")) {
    result = result.replaceAll("[ Torrent911 eu ] ", "");
  }

  return result;
}
