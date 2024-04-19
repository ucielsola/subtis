export function getSubtitleUrl({
	bytes,
	fileName,
}: {
	bytes: string;
	fileName: string;
}): string {
	const isProduction = process.env.NODE_ENV === "production";

	const API_BASE_URL = isProduction
		? "https://api.subt.is"
		: "http://localhost:8787";

	return `${API_BASE_URL}/v1/integrations/stremio/${bytes}/${fileName}`;
}
