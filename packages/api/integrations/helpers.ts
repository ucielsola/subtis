export async function getSubtitleText(subtitleLink: string): Promise<string> {
  const response = await fetch(subtitleLink);
  const buffer = await response.arrayBuffer();

  const decoder = new TextDecoder("iso-8859-1");
  const subtitle = decoder.decode(buffer);

  return subtitle;
}
