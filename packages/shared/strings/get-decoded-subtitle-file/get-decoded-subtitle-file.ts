export function getDecodedSubtitleFile(subtitleBuffer: Buffer): string {
  const decoder = new TextDecoder("iso-8859-1");
  return decoder.decode(subtitleBuffer);
}
