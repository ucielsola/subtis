export function getFullImdbId(imdbId: string): string {
  return `tt${imdbId}`;
}

export function getStripedImdbId(imdbId: string): number {
  return Number(imdbId.replace("tt", ""));
}

export function getImdbLink(imdbId: number): string {
  const parsedImdbId = getFullImdbId(String(imdbId));
  return `https://www.imdb.com/title/${parsedImdbId}`;
}
