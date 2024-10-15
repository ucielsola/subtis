export function getSubtitleShortLink(id: number): string {
  return process.env.NODE_ENV === "production"
    ? `https://api.subt.is/v1/subtitle/link/${id}`
    : `http://localhost:58602/v1/subtitle/link/${id}`;
}
