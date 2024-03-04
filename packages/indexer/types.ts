// internals
import type { SubtitleGroupNames } from "./subtitle-groups";

export type SubtitleData = {
	downloadFileName: string;
	fileExtension: "rar" | "srt" | "zip";
	subtitleCompressedFileName: string;
	subtitleFileNameWithoutExtension: string;
	subtitleGroup: SubtitleGroupNames;
	subtitleLink: string;
	subtitleSrtFileName: string;
};
