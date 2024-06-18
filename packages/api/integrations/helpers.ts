// shared
import { getDecodedSubtitleFile } from "@subtis/shared";

export async function getSubtitleText(subtitleLink: string): Promise<string> {
  const response = await fetch(subtitleLink);
  const buffer = await response.arrayBuffer();

  return getDecodedSubtitleFile(buffer);
}
