export function getSubtitleShortLink(id: number): string {
  return process.env.NODE_ENV === "production"
    ? `https://api.subtis.workers.dev/v1/${id}`
    : `http://localhost:8787/v1/${id}`;
}
