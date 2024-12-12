import replaceSpecialCharacters from "replace-special-characters";

export function getStringWithoutSpecialCharacters(str: string): string {
  return replaceSpecialCharacters(str.toLowerCase())
    .replaceAll(":", "")
    .replaceAll(",", "")
    .replaceAll(" - ", " ")
    .replaceAll(".", "")
    .replaceAll("'", "")
    .replaceAll("´", "");
}
