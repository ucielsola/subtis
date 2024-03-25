import { getStringWithoutExtraSpaces } from "../../strings";

export function getMovieName(name: string): string {
	return getStringWithoutExtraSpaces(name.replaceAll(".", " ")).trim();
}
