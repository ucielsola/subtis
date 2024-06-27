import { getStringWithoutExtraSpaces } from "../../strings";

export function getTitleName(name: string): string {
  return getStringWithoutExtraSpaces(name.replaceAll(".", " ").replaceAll(/s\d{2}e\d{2}/gi, "")).trim();
}
