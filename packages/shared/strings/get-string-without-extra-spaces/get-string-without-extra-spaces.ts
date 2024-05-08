export function getStringWithoutExtraSpaces(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}
