// internals
import type { SubtitleGroupNames } from './subtitle-groups'

export interface SubtitleData {
  subtitleLink: string
  downloadFileName: string
  subtitleSrtFileName: string
  subtitleGroup: SubtitleGroupNames
  subtitleCompressedFileName: string
  subtitleFileNameWithoutExtension: string
  fileExtension: 'rar' | 'zip' | 'srt'
}
