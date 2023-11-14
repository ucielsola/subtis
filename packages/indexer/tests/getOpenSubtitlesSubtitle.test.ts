import { expect, test } from 'bun:test'

// shared
import type { MovieData } from 'shared/movie'

// internals
import type { ReleaseGroupNames } from '../release-groups'
import { getOpenSubtitlesSubtitle } from '../opensubtitles'

test('should return a subtitle link giving a movie, release group and quality', async () => {
  const movieData = {
    name: 'Meg 2 The Trench',
    searchableMovieName: 'Meg 2 The Trench (2023)',
    year: 2023,
    resolution: '1080p',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
    releaseGroup: 'YTS-MX' as ReleaseGroupNames,
    fileNameWithoutExtension: '',
  } as MovieData

  const subtitle = await getOpenSubtitlesSubtitle({ movieData, imdbId: 9224104 })

  expect(subtitle.subtitleLink).toBeTypeOf('string')

  expect(subtitle.fileExtension).toBe('srt')
  expect(subtitle.subtitleGroup).toBe('OpenSubtitles')
  expect(subtitle.subtitleSrtFileName).toBe('meg-2-the-trench-1080p-yts-mx-opensubtitles.srt')
  expect(subtitle.subtitleCompressedFileName).toBe('meg-2-the-trench-1080p-yts-mx-opensubtitles.srt')
  expect(subtitle.subtitleFileNameWithoutExtension).toBe('meg-2-the-trench-1080p-yts-mx-opensubtitles')
})

test('should return a subtitle link giving a movie, release group and quality', async () => {
  const movieData = {
    name: 'Junk Head',
    searchableMovieName: 'Junk Head (2017)',
    year: 2017,
    resolution: '1080p',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
    releaseGroup: 'YTS-MX' as ReleaseGroupNames,
    fileNameWithoutExtension: '',
  } as MovieData

  const subtitle = await getOpenSubtitlesSubtitle({ movieData, imdbId: 6848928 })

  expect(subtitle.subtitleLink).toBeTypeOf('string')

  expect(subtitle.fileExtension).toBe('srt')
  expect(subtitle.subtitleGroup).toBe('OpenSubtitles')
  expect(subtitle.subtitleSrtFileName).toBe('junk-head-1080p-yts-mx-opensubtitles.srt')
  expect(subtitle.subtitleCompressedFileName).toBe('junk-head-1080p-yts-mx-opensubtitles.srt')
  expect(subtitle.subtitleFileNameWithoutExtension).toBe('junk-head-1080p-yts-mx-opensubtitles')
})
