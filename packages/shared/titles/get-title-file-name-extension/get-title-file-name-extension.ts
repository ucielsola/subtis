import { z } from "zod";

// internals
import {
  getVideoFileExtension,
  videoFileExtensionSchema,
} from "../../files/get-video-file-extension/get-video-file-extension";

export const videoFileNameSchema = z.string().refine(
  (input) => {
    const [videoFileExtension] = input.split(".").slice(-1);
    return videoFileExtensionSchema.safeParse(`.${videoFileExtension}`).success;
  },
  {
    message: "File extension not supported",
  },
);

export function getTitleFileNameExtension(fileName: string): string {
  const videoFileExtension = getVideoFileExtension(fileName);
  const videoFileExtensionParsed = z
    .string({ message: `Video file extension not supported: ${fileName}` })
    .parse(videoFileExtension);

  return videoFileExtensionParsed.slice(1);
}
