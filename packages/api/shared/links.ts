export function getSubtitleShortLink(id: number): string {
	return Bun.env.NODE_ENV === "production" ? `https://subt.is/${id}` : `http://localhost:8080/${id}`;
}
