import { expect, test } from 'bun:test'

// shared
import { getMovieMetadata } from 'shared/movie'

test('Unsupported year movie', () => {
  expect(() => {
    getMovieMetadata('The.Super.Mario.Bros..Movie.1788.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4')
  }).toThrow('Unsupported year movie')
})

test('Unsupported file extension', () => {
  expect(() => {
    getMovieMetadata('The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].zip')
  }).toThrow('Unsupported file extension')
})

test('No file extension', () => {
  expect(() => getMovieMetadata('Avatar (2009) 1080p YTS.MX')).toThrow('Unsupported file extension')
})

test('The Super Mario Bros | 2023 | YTS-MX | (in 1080p)', () => {
  const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4')

  expect(data).toEqual({
    name: 'The Super Mario Bros Movie',
    releaseGroup: 'YTS-MX',
    resolution: '1080p',
    searchableMovieName: 'The Super Mario Bros Movie (2023)',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
    isReleaseGroupSupported: true,
    fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]',
    year: 2023,
  })
})

test('The Super Mario Bros | 2023 | YTS-MX | (in 720p)', () => {
  const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX].mp4')

  expect(data).toEqual({
    name: 'The Super Mario Bros Movie',
    releaseGroup: 'YTS-MX',
    resolution: '720p',
    isReleaseGroupSupported: true,
    searchableMovieName: 'The Super Mario Bros Movie (2023)',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
    fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX]',
    year: 2023,
  })
})

test('The Super Mario Bros | 2023 | YTS-MX | (in 1080p)', () => {
  const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4')

  expect(data).toEqual({
    name: 'The Super Mario Bros Movie',
    releaseGroup: 'YTS-MX',
    resolution: '1080p',
    searchableMovieName: 'The Super Mario Bros Movie (2023)',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    isReleaseGroupSupported: true,
    searchableOpenSubtitlesName: 'YTS.MX',
    fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]',
    year: 2023,
  })
})

test('The Super Mario Bros | 2023 | YTS-MX | (in 2160p)', () => {
  const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX].mp4')

  expect(data).toEqual({
    name: 'The Super Mario Bros Movie',
    releaseGroup: 'YTS-MX',
    resolution: '2160p',
    searchableMovieName: 'The Super Mario Bros Movie (2023)',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
    isReleaseGroupSupported: true,
    fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX]',
    year: 2023,
  })
})

test('The Super Mario Bros | 2023 | YTS-MX | (in 3D)', () => {
  const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX].mp4')

  expect(data).toEqual({
    name: 'The Super Mario Bros Movie',
    releaseGroup: 'YTS-MX',
    resolution: '3D',
    searchableMovieName: 'The Super Mario Bros Movie (2023)',
    searchableSubDivXName: 'YTS MX',
    searchableArgenteamName: 'YIFY',
    searchableOpenSubtitlesName: 'YTS.MX',
    isReleaseGroupSupported: true,
    fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX]',
    year: 2023,
  })
})

test('The Super Mario Bros | 2023 | CODY', () => {
  const data = getMovieMetadata('The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv')

  expect(data).toEqual({
    name: 'The Super Mario Bros Movie',
    releaseGroup: 'CODY',
    resolution: '1080p',
    searchableMovieName: 'The Super Mario Bros Movie (2023)',
    searchableSubDivXName: 'H265-CODY',
    searchableArgenteamName: 'CODY',
    searchableOpenSubtitlesName: 'CODY',
    isReleaseGroupSupported: true,
    fileNameWithoutExtension: 'The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY',
    year: 2023,
  })
})

test('Evil Dead Rise | 2023 | GalaxyRG', () => {
  const data = getMovieMetadata('Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv')

  expect(data).toEqual({
    name: 'Evil Dead Rise',
    releaseGroup: 'GalaxyRG',
    resolution: '1080p',
    searchableMovieName: 'Evil Dead Rise (2023)',
    searchableSubDivXName: 'GalaxyRG',
    searchableArgenteamName: 'GalaxyRG',
    searchableOpenSubtitlesName: 'GalaxyRG',
    isReleaseGroupSupported: true,
    fileNameWithoutExtension: 'Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG',
    year: 2023,
  })
})

test('The Flash | 2023 | RiGHTNOW', () => {
  const data = getMovieMetadata('The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW.mkv')

  expect(data).toEqual({
    name: 'The Flash',
    releaseGroup: 'RiGHTNOW',
    resolution: '1080p',
    searchableMovieName: 'The Flash (2023)',
    searchableSubDivXName: 'RIGHTNOW',
    searchableArgenteamName: 'RiGHTNOW',
    searchableOpenSubtitlesName: 'RiGHTNOW',
    isReleaseGroupSupported: true,
    fileNameWithoutExtension: 'The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW',
    year: 2023,
  })
})

test('Come Fly With Me | 2023 | BONE | (Unsupported release group)', () => {
  const data = getMovieMetadata('Come Fly With Me 2023 720p HDRip x264 BONE.mkv')

  expect(data).toEqual({
    name: 'Come Fly With Me',
    releaseGroup: 'BONE',
    resolution: '720p',
    searchableMovieName: 'Come Fly With Me (2023)',
    searchableSubDivXName: 'BONE',
    searchableArgenteamName: 'BONE',
    isReleaseGroupSupported: false,
    searchableOpenSubtitlesName: 'BONE',
    fileNameWithoutExtension: 'Come Fly With Me 2023 720p HDRip x264 BONE',
    year: 2023,
  })
})

test('should correctly parse a movie string with year and resolution', () => {
  const result = getMovieMetadata('Avatar (2009) 1080p x264 YTS.MX.mp4')
  expect(result).toEqual({
    name: 'Avatar',
    releaseGroup: 'YTS-MX',
    resolution: '1080p',
    searchableArgenteamName: 'YIFY',
    searchableMovieName: 'Avatar (2009)',
    searchableOpenSubtitlesName: 'YTS.MX',
    searchableSubDivXName: 'YTS MX',
    isReleaseGroupSupported: true,
    fileNameWithoutExtension: 'Avatar (2009) 1080p x264 YTS.MX',
    year: 2009,
  })
})

test('should recognize release groups not supported in the DB', () => {
  const result = getMovieMetadata('Avatar (2009) 1080p x264 UNKNOWN.mp4')
  expect(result).toMatchObject({
    name: 'Avatar',
    year: 2009,
    resolution: '1080p',
    releaseGroup: 'UNKNOWN',
  })
})
