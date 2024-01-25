import type { ReleaseGroup } from 'indexer/release-groups'
import { RELEASE_GROUPS } from 'indexer/release-groups'
import { P, match } from 'ts-pattern'
import { getMovieName } from '../get-movie-name'
import { getStringWithoutExtraSpaces } from '../get-string-without-extra-spaces'
import { getMovieFileNameWithoutExtension } from '../get-movie-file-name-without-extension/get-movie-file-name-without-extension'

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
  const currentYear = new Date().getFullYear() + 2

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

    const fileNameWithoutExtension = getMovieFileNameWithoutExtension(movieFileName)
    // TODO: this will be able to be validated using the schema validation schema, avoiding this type assertion
    const _releaseGroup = Object.values(RELEASE_GROUPS).find(releaseGroupInternal => rawAttributes.includes(releaseGroupInternal.fileAttribute))
    const releaseGroup = _releaseGroup as ReleaseGroup | undefined

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
