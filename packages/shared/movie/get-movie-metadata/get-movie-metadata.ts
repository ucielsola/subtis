import type { ReleaseGroup } from 'indexer/release-groups'
import { RELEASE_GROUPS } from 'indexer/release-groups'
import { P, match } from 'ts-pattern'
import invariant from 'tiny-invariant'
import { getMovieName } from '../get-movie-name'
import { getStringWithoutExtraSpaces } from '../get-string-without-extra-spaces'
import { getMovieFileNameWithoutExtension } from '../get-movie-file-name-without-extension/get-movie-file-name-without-extension'
import { VIDEO_FILE_EXTENSIONS } from '..'

// types
export type MovieData = {
  name: string
  year: number
  resolution: string
  searchableMovieName: string
  fileNameWithoutExtension: string
  releaseGroup: ReleaseGroup | undefined
}

export function getMovieMetadata(movieFileName: string): MovieData {
  const FIRST_MOVIE_RECORDED = 1888
  const currentYear = new Date().getFullYear()

  const parsedMovieFileName = movieFileName.replace(/\s/g, '.')

  for (let year = FIRST_MOVIE_RECORDED; year <= currentYear; year++) {
    const yearString = String(year)

    const yearStringToReplace = match(parsedMovieFileName)
      .with(P.string.includes(`(${yearString})`), () => `(${yearString})`)
      .with(P.string.includes(yearString), () => yearString)
      .otherwise(() => false)

    if (!yearStringToReplace || typeof yearStringToReplace !== 'string') {
      continue
    }

    const [rawName, rawAttributes] = parsedMovieFileName.split(yearStringToReplace)
    const movieName = getMovieName(rawName)
    const searchableMovieName = getStringWithoutExtraSpaces(`${movieName} (${yearString})`)

    const videoFileExtension = VIDEO_FILE_EXTENSIONS.find(videoFileExtension =>
      rawAttributes.includes(videoFileExtension),
    )
    invariant(videoFileExtension, 'Unsupported file extension')

    const resolution = match(rawAttributes)
      .with(P.string.includes('480'), () => '480p')
      .with(P.string.includes('576'), () => '576p')
      .with(P.string.includes('1080'), () => '1080p')
      .with(P.string.includes('720'), () => '720p')
      .with(P.string.includes('2160'), () => '2160p')
      .with(P.string.includes('3D'), () => '3D')
      .run()

    const fileNameWithoutExtension = getMovieFileNameWithoutExtension(parsedMovieFileName)

    const _releaseGroup = Object.values(RELEASE_GROUPS).find(releaseGroupInternal => rawAttributes.includes(releaseGroupInternal.fileAttribute))
    const releaseGroup = _releaseGroup as ReleaseGroup | undefined

    if (!releaseGroup) {
      const unsupportedReleaseGroup = rawAttributes
        .split(videoFileExtension)
        .at(0)
        ?.split(/\.|\s/g)
        .at(-1)
        ?.replace('x264-', '') as string

      console.error(`🛑 Release group ${unsupportedReleaseGroup} no soportado 🛑`)
    }

    return {
      year,
      resolution,
      name: movieName,
      searchableMovieName,
      fileNameWithoutExtension,
      releaseGroup,
    }
  }

  throw new Error('Unsupported year movie')
}
