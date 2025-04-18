import sharp from "sharp";
import * as ThumbHash from "thumbhash";

export async function getImageData(imageBuffer: Buffer): Promise<{
  data: Buffer<ArrayBufferLike>;
  width: number;
  height: number;
}> {
  const sharpImage = sharp(imageBuffer);
  const { width, height } = await sharpImage.metadata();

  if (!width || !height) {
    throw new Error("Failed to get image dimensions");
  }

  const maxSize = 100;
  const scale = Math.min(maxSize / width, maxSize / height);
  const resizedWidth = Math.floor(width * scale);
  const resizedHeight = Math.floor(height * scale);

  const rawBuffer = await sharpImage
    .resize(resizedWidth, resizedHeight, { fit: "outside" })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  return {
    data: rawBuffer.data,
    width: rawBuffer.info.width,
    height: rawBuffer.info.height,
  };
}

export async function encodeImageToThumbhash(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to fetch image: ${response.statusText}`);
  }

  const imageBuffer = Buffer.from(await response.arrayBuffer());
  const { data, width, height } = await getImageData(imageBuffer);

  const binaryThumbHash = ThumbHash.rgbaToThumbHash(width, height, data);
  const thumbHashToBase64 = Buffer.from(binaryThumbHash).toString("base64");

  return thumbHashToBase64;
}
