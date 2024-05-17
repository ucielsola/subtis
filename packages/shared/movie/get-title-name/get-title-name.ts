import { getStringWithoutExtraSpaces } from "../../strings";

export function getTitleName(name: string): string {
  return getStringWithoutExtraSpaces(name.replaceAll(".", " ")).trim();
}
