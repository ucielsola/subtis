import { getIsTvShow } from "../../files";
import { getStringWithoutExtraSpaces } from "../../strings";

export function getTitleName(name: string): string {
  const [parsedName] = getIsTvShow(name) ? name.split(/s\d{2}e\d{2}/gi) : [name];
  let result = getStringWithoutExtraSpaces(parsedName.replaceAll(".", " ").replaceAll(/s\d{2}e\d{2}/gi, "")).trim();

  if (result.startsWith("[ Torrent911 eu ]")) {
    result = result.replaceAll("[ Torrent911 eu ] ", "");
  }

  if (result.startsWith("[ Torrent911 tw ]")) {
    result = result.replaceAll("[ Torrent911 tw ] ", "");
  }

  if (result.startsWith("[ Torrent911 lol ]")) {
    result = result.replaceAll("[ Torrent911 lol ] ", "");
  }

  if (result.startsWith("[ Torrent911 pm ]")) {
    result = result.replaceAll("[ Torrent911 pm ] ", "");
  }

  if (result.startsWith("[ Torrent911 cz ]")) {
    result = result.replaceAll("[ Torrent911 pm ] ", "");
  }

  return result;
}
