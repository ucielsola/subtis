export function getFullImdbId(imdbId: string): string {
  return `tt${imdbId}`;
}

export function getStripedImdbId(imdbId: string): string {
  return imdbId.replace("tt", "");
}

export function getImdbLink(imdbId: string): string {
  return `https://www.imdb.com/title/${getFullImdbId(imdbId)}`;
}
