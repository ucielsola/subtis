import { P, match } from 'ts-pattern'
import invariant from 'tiny-invariant'

// indexer
import { RELEASE_GROUPS, type ReleaseGroup, type ReleaseGroupKeys, type ReleaseGroupNames } from 'indexer/release-groups'
import { z } from 'zod'

// constants
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
] as const

// utils
export function getFilenameFromPath(path: string): string {
  return path.split(/[\\\/]/).at(-1) as string
}

export function getStringWithoutExtraSpaces(value: string): string {
  return value.replace(/\s+/g, ' ').trim()
}

export function getMovieName(name: string): string {
  return getStringWithoutExtraSpaces(name.replaceAll('.', ' ')).trim()
}

export function getVideoFileExtension(fileName: string): string | undefined {
  return VIDEO_FILE_EXTENSIONS.find(videoFileExtension => fileName.endsWith(videoFileExtension))
}
export const videoFileExtensionSchema = z.union([
  z.literal('.mkv'),
  z.literal('.mp4'),
  z.literal('.avi'),
  z.literal('.wov'),
  z.literal('.wmv'),
  z.literal('.flv'),
  z.literal('.webm'),
  z.literal('.vob'),
  z.literal('.m4v'),
  z.literal('.mpg'),
  z.literal('.mpeg'),
  z.literal('.3gp'),
  z.literal('.3g2'),
], {
  invalid_type_error: 'File extension not supported',
})

export function getMovieFileNameExtension(fileName: string): string {
  const videoFileExtension = getVideoFileExtension(fileName)
  invariant(videoFileExtension, `Video file extension not supported: ${fileName}`)

  return videoFileExtension.slice(1)
}

export function getMovieFileNameWithoutExtension(fileName: string): string {
  return fileName.slice(0, -4)
}

// types
export type MovieData = {
  name: string
  year: number
  resolution: string
  searchableMovieName: string
  searchableSubDivXName: string
  searchableArgenteamName: string
  releaseGroup: ReleaseGroupNames
  fileNameWithoutExtension: string
  searchableOpenSubtitlesName: string
  isReleaseGroupSupported: boolean
}

// core
export function getMovieMetadata(movieFileName: string): MovieData {
  const FIRST_MOVIE_RECORDED = 1888
  const currentYear = new Date().getFullYear() + 1

  for (let year = FIRST_MOVIE_RECORDED; year < currentYear; year++) {
    const yearString = String(year)

    const yearStringToReplace = match(movieFileName)
      .with(P.string.includes(`(${yearString})`), () => `(${yearString})`)
      .with(P.string.includes(yearString), () => yearString)
      .otherwise(() => false)

    if (!yearStringToReplace || typeof yearStringToReplace !== 'string') {
      continue
    }

    const [rawName, rawAttributes] = movieFileName.split(yearStringToReplace)
    const movieName = getMovieName(rawName)
    const searchableMovieName = getStringWithoutExtraSpaces(`${movieName} (${yearString})`)

    const resolution = match(rawAttributes)
      .with(P.string.includes('480'), () => '480p')
      .with(P.string.includes('1080'), () => '1080p')
      .with(P.string.includes('720'), () => '720p')
      .with(P.string.includes('2160'), () => '2160p')
      .with(P.string.includes('3D'), () => '3D')
      .run()

    const videoFileExtension = VIDEO_FILE_EXTENSIONS.find(videoFileExtension =>
      rawAttributes.includes(videoFileExtension),
    )
    invariant(videoFileExtension, 'Unsupported file extension')

    const fileNameWithoutExtension = getMovieFileNameWithoutExtension(movieFileName)

    let releaseGroup: ReleaseGroup | undefined

    for (const key in RELEASE_GROUPS) {
      const releaseGroupInternal = RELEASE_GROUPS[key as ReleaseGroupKeys]

      if (rawAttributes.includes(releaseGroupInternal.fileAttribute)) {
        releaseGroup = releaseGroupInternal
        break
      }
    }

    if (!releaseGroup) {
      const unsupportedReleaseGroup = rawAttributes
        .split(videoFileExtension)
        .at(0)
        ?.split(/\.|\s/g)
        .at(-1)
        ?.replace('x264-', '') as string

      console.error(`⚠️ Release group ${unsupportedReleaseGroup} no soportado ⚠️`)

      releaseGroup = {
        website: '',
        fileAttribute: ' ',
        isSupported: false,
        name: unsupportedReleaseGroup,
        searchableSubDivXName: unsupportedReleaseGroup,
        searchableArgenteamName: unsupportedReleaseGroup,
        searchableOpenSubtitlesName: unsupportedReleaseGroup,
      }
    }

    return {
      year,
      resolution,
      name: movieName,
      searchableMovieName,
      fileNameWithoutExtension,
      isReleaseGroupSupported: releaseGroup.isSupported,
      releaseGroup: releaseGroup.name as ReleaseGroupNames,
      searchableSubDivXName: releaseGroup.searchableSubDivXName as string,
      searchableArgenteamName: releaseGroup.searchableArgenteamName as string,
      searchableOpenSubtitlesName: releaseGroup.searchableOpenSubtitlesName as string,
    }
  }

  throw new Error('Unsupported year movie')
}
