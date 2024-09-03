export function getDecodedSubtitleFile(subtitleBuffer: Buffer, encoding?: string): string {
  let parsedEncoder = "iso-8859-1";

  if (encoding && encoding !== "windows-1251") {
    parsedEncoder = encoding;
  }

  const decoder = new TextDecoder(parsedEncoder);

  return decoder.decode(subtitleBuffer);
}
