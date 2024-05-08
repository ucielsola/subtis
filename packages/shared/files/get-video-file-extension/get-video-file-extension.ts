import { z } from "zod";

export const VIDEO_FILE_EXTENSIONS = [
  ".mkv",
  ".mp4",
  ".avi",
  ".mov",
  ".wmv",
  ".flv",
  ".webm",
  ".vob",
  ".m4v",
  ".mpg",
  ".mpeg",
  ".3gp",
  ".3g2",
] as const;

export const videoFileExtensionSchema = z.union(
  [
    z.literal(".mkv"),
    z.literal(".mp4"),
    z.literal(".avi"),
    z.literal(".wov"),
    z.literal(".wmv"),
    z.literal(".flv"),
    z.literal(".webm"),
    z.literal(".vob"),
    z.literal(".m4v"),
    z.literal(".mpg"),
    z.literal(".mpeg"),
    z.literal(".3gp"),
    z.literal(".3g2"),
  ],
  {
    invalid_type_error: "File extension not supported",
  },
);

export function getVideoFileExtension(fileName: string): string | undefined {
  return VIDEO_FILE_EXTENSIONS.find((videoFileExtension) => fileName.endsWith(videoFileExtension));
}
