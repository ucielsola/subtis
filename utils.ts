import crypto from 'crypto';

export const VIDEO_FILE_EXTENSIONS = [
  '.mkv',
  '.mp4',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.vob',
  '.m4v',
  '.mpg',
  '.mpeg',
  '.3gp',
  '.3g2',
] as const;

export async function getIsLinkAlive(link: string): Promise<boolean> {
  const response = await fetch(link);
  return response.status === 200;
}

export function getNumbersArray(length: number): number[] {
  return Array.from({ length }, (_, index) => index + 1);
}

export function getRandomDelay(
  min: number = 5,
  max: number = 15,
): {
  seconds: number;
  miliseconds: number;
} {
  const seconds = Math.floor(Math.random() * (max - min + 1) + min);
  return { seconds, miliseconds: seconds * 1000 };
}

export function removeExtraSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function getFileNameHash(fileName: string): string {
  return crypto.createHash('md5').update(fileName).digest('hex');
}
