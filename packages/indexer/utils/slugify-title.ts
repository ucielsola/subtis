import slugify from "slugify";

export function getTitleSlugifiedName(title: string, year: number): string {
  return slugify(`${title}-${year}`).toLowerCase();
}
