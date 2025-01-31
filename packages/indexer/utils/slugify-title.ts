import slugify from "slugify";

// shared
import { getStringWithoutSpecialCharacters } from "@subtis/shared";

export function getTitleSlugifiedName(title: string, year: number): string {
  const parsedTitle = getStringWithoutSpecialCharacters(title);

  return slugify(`${parsedTitle}-${year}`);
}
