export function getMovieFileNameWithoutExtension(fileName: string): string {
	return fileName.slice(0, -4);
}
