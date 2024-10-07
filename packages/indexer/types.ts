// internals
import type { SubtitleGroupNames } from "./subtitle-groups";

type SupportedLanguages = "es";

export type FileExtension = "rar" | "srt" | "zip";

export type SubtitleData = {
  downloadFileName: string;
  fileExtension: FileExtension;
  subtitleCompressedFileName: string;
  subtitleFileNameWithoutExtension: string;
  subtitleGroupName: SubtitleGroupNames;
  subtitleLink: string;
  subtitleSrtFileName: string;
  lang: SupportedLanguages;
};

export type IndexedBy =
  | "indexer-cron"
  | "indexer-websocket"
  | "indexer-supabase"
  | "indexer-not-found"
  | "indexer-movie"
  | "indexer-tv-show";
