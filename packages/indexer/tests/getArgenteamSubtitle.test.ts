import { expect, test } from 'bun:test'

// shared
import type { MovieData } from 'shared/movie'
import { getMovieMetadata } from 'shared/movie'

// internals
import { argenteamApiEndpoints, getArgenteamSubtitle } from '../argenteam'

test('should return an endpoint for each value', () => {
  const MOVIE_ID = 24146896

  const searchEndpoint = argenteamApiEndpoints.search(MOVIE_ID)
  const tvShowEndpoint = argenteamApiEndpoints.tvShow(MOVIE_ID)
  const episodeEndpoint = argenteamApiEndpoints.episode(MOVIE_ID)
  const movieEndpoint = argenteamApiEndpoints.movie(MOVIE_ID)

  expect(searchEndpoint).toBe(`https://argenteam.net/api/v1/search?q=${MOVIE_ID}`)
  expect(tvShowEndpoint).toBe(`https://argenteam.net/api/v1/tvshow?id=${MOVIE_ID}`)
  expect(episodeEndpoint).toBe(`https://argenteam.net/api/v1/episode?id=${MOVIE_ID}`)
  expect(movieEndpoint).toBe(`https://argenteam.net/api/v1/movie?id=${MOVIE_ID}`)
})

test.skip('should throw error if no search results are found', () => {
  expect(async () => {
    const movieData = {
      name: 'Movie Name',
      year: 2021,
      resolution: '1080p',
      searchableMovieName: 'Movie',
      searchableSubDivXName: 'Movie',
      searchableArgenteamName: 'Movie',
      releaseGroup: 'YTS-MX',
    } as MovieData

    await getArgenteamSubtitle({
      movieData,
      imdbId: 1234,
    },
    )
  }).toThrow('[ARGENTEAM_ERROR]: There should be at least one result')
})

test.skip('should return a subtitle link giving a movie, release group and quality', async () => {
  const movieData = getMovieMetadata('Spider-Man.Across.The.Spider-Verse.2023.1080p.WEB-DL.DDP5.1.Atmos.x264-AOC.mkv')
  const subtitle = await getArgenteamSubtitle({ movieData, imdbId: 9362722 })

  expect(subtitle).toEqual({
    fileExtension: 'zip',
    subtitleGroup: 'Argenteam',
    subtitleCompressedFileName: 'spider-man-across-the-spider-verse-1080p-aoc-argenteam.zip',
    subtitleFileNameWithoutExtension: 'spider-man-across-the-spider-verse-1080p-aoc-argenteam',
    subtitleLink:
      'https://argenteam.net/subtitles/90262/Spider-Man.Across.the.Spider-Verse.%282023%29.WEB-DL.x264.1080p.ATMOS-AOC',
    subtitleSrtFileName: 'spider-man-across-the-spider-verse-1080p-aoc-argenteam.srt',
    downloadFileName: 'Spider-Man.Across.The.Spider-Verse.2023.1080p.WEB-DL.DDP5.1.Atmos.x264-AOC.srt',
  })
})

test('should throw an error giving a subtitle link giving a movie, release group and quality', () => {
  expect(async () => {
    const movieData = getMovieMetadata('Haunting.Of.The.Queen.Mary.2023.720p.WEBRip.x264.AAC-[YTS.MX].mp4')
    await getArgenteamSubtitle({ movieData, imdbId: 9362722 })
  }).toThrow()
})
