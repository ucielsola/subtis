export function getDecodedSubtitleFile(subtitleBuffer: Buffer, encoding?: string): string {
  const decoder = new TextDecoder(encoding ?? "iso-8859-1");
  return decoder.decode(subtitleBuffer);
}
