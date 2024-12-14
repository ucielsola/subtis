import { encode } from "blurhash";
import sharp from "sharp";

export async function getImageData(imageBuffer: Buffer): Promise<{
  data: Uint8ClampedArray;
  width: number;
  height: number;
}> {
  const metadata = await sharp(imageBuffer).metadata();
  const { width, height } = metadata;

  if (!width || !height) {
    throw new Error("Failed to get image dimensions");
  }

  const rawBuffer = await sharp(imageBuffer).raw().ensureAlpha().toBuffer();

  const pixels = new Uint8ClampedArray(rawBuffer);

  return {
    data: pixels,
    width,
    height,
  };
}

export async function encodeImageToBlurhash(imageUrl: string): Promise<string> {
  // Fetch the image from URL
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  // Convert response to buffer
  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const { data, width, height } = await getImageData(imageBuffer);

  return encode(data, width, height, 4, 4);
}
