import { describe, expect, test } from 'bun:test'

// shared
import { getMovieFileNameExtension } from './get-movie-file-name-extension'

describe('getMovieFileNameExtension', () => {
  test('should return mp4 for "Valley.Of.The.Witch.2014.720p.WEBRip.x264.AAC-[YTS.MX].mp4"', async () => {
    const fileExtension = getMovieFileNameExtension('Valley.Of.The.Witch.2014.720p.WEBRip.x264.AAC-[YTS.MX].mp4')
    expect(fileExtension).toBe('mp4')
  })

  test('should return mp4 for "Lupu.2013.720p.WEBRip.x264.AAC-[YTS.MX].mkv"', async () => {
    const fileExtension = getMovieFileNameExtension('Lupu.2013.720p.WEBRip.x264.AAC-[YTS.MX].mkv')
    expect(fileExtension).toBe('mkv')
  })
})
