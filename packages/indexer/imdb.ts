export function getFullImdbId(imdbId: number): string {
  return `tt${imdbId}`;
}

export function getStripedImdbId(imdbId: string): number {
  return Number(imdbId.replace("tt", ""));
}

export function getImdbLink(imdbId: number): string {
  return `https://www.imdb.com/title/${getFullImdbId(imdbId)}`;
}
