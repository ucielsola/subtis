// internals
import type { SubtitleGroupNames } from "./subtitle-groups";

type SupportedLanguages = "es";

export type FileExtension = "rar" | "srt" | "zip";

export type SubtitleData = {
  downloadFileName: string;
  fileExtension: FileExtension;
  subtitleCompressedFileName: string;
  subtitleFileNameWithoutExtension: string;
  subtitleGroup: SubtitleGroupNames;
  subtitleLink: string;
  subtitleSrtFileName: string;
  lang: SupportedLanguages;
};
