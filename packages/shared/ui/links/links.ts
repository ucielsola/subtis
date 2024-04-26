export function getSubtitleShortLink(id: number): string {
	return Bun.env.NODE_ENV === "production" ? `https://subt.is/${id}` : `http://localhost:5173/${id}`;
}
