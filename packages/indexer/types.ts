// internals
import { SubtitleGroupNames } from './subtitle-groups';

export type SubtitleData = {
  subtitleLink: string;
  downloadFileName: string;
  subtitleSrtFileName: string;
  subtitleGroup: SubtitleGroupNames;
  subtitleCompressedFileName: string;
  subtitleFileNameWithoutExtension: string;
  fileExtension: 'rar' | 'zip' | 'srt';
};
