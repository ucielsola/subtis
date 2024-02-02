import { expect, test } from 'bun:test'

// shared
import type { MovieData } from '@subtis/shared'

// internals
import type { ReleaseGroup } from '../release-groups'
import { getOpenSubtitlesSubtitle } from '../opensubtitles'

test('should return a subtitle link giving a movie, release group and quality', async () => {
  const releaseGroup: ReleaseGroup = {
    fileAttribute: '',
    isSupported: false,
    name: 'YTS-MX',
    searchableOpenSubtitlesName: 'YTS.MX',
    searchableSubDivXName: 'YTS MX',
    website: '',
  }
  const movieData = {
    fileNameWithoutExtension: '',
    name: 'Meg 2 The Trench',
    releaseGroup,
    resolution: '1080p',
    searchableMovieName: 'Meg 2 The Trench (2023)',
    year: 2023,
  } as MovieData

  const subtitle = await getOpenSubtitlesSubtitle({ imdbId: 9224104, movieData })

  expect(subtitle.subtitleLink).toBeTypeOf('string')

  expect(subtitle.fileExtension).toBe('srt')
  expect(subtitle.subtitleGroup).toBe('OpenSubtitles')
  expect(subtitle.subtitleSrtFileName).toBe('meg-2-the-trench-1080p-yts-mx-opensubtitles.srt')
  expect(subtitle.subtitleCompressedFileName).toBe('meg-2-the-trench-1080p-yts-mx-opensubtitles.srt')
  expect(subtitle.subtitleFileNameWithoutExtension).toBe('meg-2-the-trench-1080p-yts-mx-opensubtitles')
})

test('should return a subtitle link giving a movie, release group and quality', async () => {
  const releaseGroup: ReleaseGroup = {
    fileAttribute: '',
    isSupported: false,
    name: 'YTS-MX',
    searchableOpenSubtitlesName: 'YTS.MX',
    searchableSubDivXName: 'YTS MX',
    website: '',
  }
  const movieData = {
    fileNameWithoutExtension: '',
    name: 'Junk Head',
    releaseGroup,
    resolution: '1080p',
    searchableMovieName: 'Junk Head (2017)',
    year: 2017,
  } as MovieData

  const subtitle = await getOpenSubtitlesSubtitle({ imdbId: 6848928, movieData })

  expect(subtitle.subtitleLink).toBeTypeOf('string')

  expect(subtitle.fileExtension).toBe('srt')
  expect(subtitle.subtitleGroup).toBe('OpenSubtitles')
  expect(subtitle.subtitleSrtFileName).toBe('junk-head-1080p-yts-mx-opensubtitles.srt')
  expect(subtitle.subtitleCompressedFileName).toBe('junk-head-1080p-yts-mx-opensubtitles.srt')
  expect(subtitle.subtitleFileNameWithoutExtension).toBe('junk-head-1080p-yts-mx-opensubtitles')
})
