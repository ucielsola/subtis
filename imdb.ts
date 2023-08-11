export function getFullImdbId(imdbId: string): string {
  return `tt${imdbId}`;
}

export function getStripedImdbId(imdbId: string): number {
  return Number(imdbId.replace("tt", ""));
}
