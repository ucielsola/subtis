export function getEpisode(title: string): string {
  return title.match(/s\d{2}e\d{2}/gi)?.[0] || "";
}
