import { getStringWithoutExtraSpaces } from "..";

export function getMovieName(name: string): string {
	return getStringWithoutExtraSpaces(name.replaceAll(".", " ")).trim();
}
