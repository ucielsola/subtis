import { getIsTvShow } from "../../files";
import { getStringWithoutExtraSpaces } from "../../strings";

export function getTitleName(name: string): string {
  const [parsedName] = getIsTvShow(name) ? name.split(/s\d{2}e\d{2}/gi) : [name];
  return getStringWithoutExtraSpaces(parsedName.replaceAll(".", " ").replaceAll(/s\d{2}e\d{2}/gi, "")).trim();
}
