import * as ThumbHash from "thumbhash";

export function generatePlaceholderURL(hashUrl: string): string {
  const base64ToBinary = (base64: string) =>
    new Uint8Array(
      atob(base64)
        .split("")
        .map((x) => x.charCodeAt(0)),
    );

  const binaryThumbHash = base64ToBinary(hashUrl);
  const placeholderURL = ThumbHash.thumbHashToDataURL(binaryThumbHash);

  return placeholderURL;
}
