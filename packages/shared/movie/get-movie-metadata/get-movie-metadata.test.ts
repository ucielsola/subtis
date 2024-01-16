import { describe, expect, test } from 'bun:test'

// indexer
import type { ReleaseGroup } from 'indexer/release-groups'

// shared
import { getMovieMetadata } from './get-movie-metadata'

describe('getMovieMetadata', () => {
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

    const releaseGroup: ReleaseGroup = {
      name: 'YTS-MX',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'YTS MX',
      searchableOpenSubtitlesName: 'YTS.MX',
    }
    expect(data).toEqual({
      name: 'The Super Mario Bros Movie',
      year: 2023,
      resolution: '1080p',
      searchableMovieName: 'The Super Mario Bros Movie (2023)',
      fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]',
      releaseGroup,
    })
  })

  test('The Super Mario Bros | 2023 | YTS-MX | (in 720p)', () => {
    const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX].mp4')

    const releaseGroup: ReleaseGroup = {
      name: 'YTS-MX',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'YTS MX',
      searchableOpenSubtitlesName: 'YTS.MX',
    }
    expect(data).toEqual({
      name: 'The Super Mario Bros Movie',
      resolution: '720p',
      searchableMovieName: 'The Super Mario Bros Movie (2023)',
      fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.720p.BluRay.x264.AAC5.1-[YTS.MX]',
      year: 2023,
      releaseGroup,
    })
  })

  test('The Super Mario Bros | 2023 | YTS-MX | (in 1080p)', () => {
    const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4')

    const releaseGroup: ReleaseGroup = {
      name: 'YTS-MX',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'YTS MX',
      searchableOpenSubtitlesName: 'YTS.MX',
    }
    expect(data).toEqual({
      name: 'The Super Mario Bros Movie',
      resolution: '1080p',
      searchableMovieName: 'The Super Mario Bros Movie (2023)',
      fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX]',
      year: 2023,
      releaseGroup,
    })
  })

  test('The Super Mario Bros | 2023 | YTS-MX | (in 2160p)', () => {
    const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX].mp4')

    const releaseGroup: ReleaseGroup = {
      name: 'YTS-MX',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'YTS MX',
      searchableOpenSubtitlesName: 'YTS.MX',
    }
    expect(data).toEqual({
      name: 'The Super Mario Bros Movie',
      resolution: '2160p',
      searchableMovieName: 'The Super Mario Bros Movie (2023)',
      fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.2160p.BluRay.x264.AAC5.1-[YTS.MX]',
      year: 2023,
      releaseGroup,
    })
  })

  test('The Super Mario Bros | 2023 | YTS-MX | (in 3D)', () => {
    const data = getMovieMetadata('The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX].mp4')

    const releaseGroup: ReleaseGroup = {
      name: 'YTS-MX',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'YTS MX',
      searchableOpenSubtitlesName: 'YTS.MX',
    }
    expect(data).toEqual({
      name: 'The Super Mario Bros Movie',
      releaseGroup,
      resolution: '3D',
      searchableMovieName: 'The Super Mario Bros Movie (2023)',
      fileNameWithoutExtension: 'The.Super.Mario.Bros..Movie.2023.3D.BluRay.x264.AAC5.1-[YTS.MX]',
      year: 2023,
    })
  })

  test('The Super Mario Bros | 2023 | CODY', () => {
    const data = getMovieMetadata('The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv')

    const releaseGroup: ReleaseGroup = {
      name: 'CODY',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'H265-CODY',
      searchableOpenSubtitlesName: 'CODY',
    }
    expect(data).toEqual({
      name: 'The Super Mario Bros Movie',
      resolution: '1080p',
      searchableMovieName: 'The Super Mario Bros Movie (2023)',
      fileNameWithoutExtension: 'The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY',
      year: 2023,
      releaseGroup,
    })
  })

  test('Evil Dead Rise | 2023 | GalaxyRG', () => {
    const data = getMovieMetadata('Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv')

    const releaseGroup: ReleaseGroup = {
      name: 'GalaxyRG',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'GalaxyRG',
      searchableOpenSubtitlesName: 'GalaxyRG',
    }
    expect(data).toEqual({
      name: 'Evil Dead Rise',
      resolution: '1080p',
      searchableMovieName: 'Evil Dead Rise (2023)',
      fileNameWithoutExtension: 'Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG',
      year: 2023,
      releaseGroup,
    })
  })

  test('The Flash | 2023 | RiGHTNOW', () => {
    const data = getMovieMetadata('The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW.mkv')

    const releaseGroup: ReleaseGroup = {
      name: 'RiGHTNOW',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'RIGHTNOW',
      searchableOpenSubtitlesName: 'RiGHTNOW',
    }
    expect(data).toEqual({
      name: 'The Flash',
      resolution: '1080p',
      searchableMovieName: 'The Flash (2023)',
      fileNameWithoutExtension: 'The.Flash.2023.1080p.WEB-DL.H.264-RiGHTNOW',
      year: 2023,
      releaseGroup,
    })
  })

  // test('Come Fly With Me | 2023 | BONE | (Unsupported release group)', () => {
  //   const data = getMovieMetadata('Come Fly With Me 2023 720p HDRip x264 BONE.mkv')

  //   expect(data).toEqual({
  //     name: 'Come Fly With Me',
  //     releaseGroup: 'BONE',
  //     resolution: '720p',
  //     searchableMovieName: 'Come Fly With Me (2023)',
  //     searchableSubDivXName: 'BONE',
  //     isReleaseGroupSupported: false,
  //     searchableOpenSubtitlesName: 'BONE',
  //     fileNameWithoutExtension: 'Come Fly With Me 2023 720p HDRip x264 BONE',
  //     year: 2023,
  //   })
  // })

  test('should correctly parse a movie string with year and resolution', () => {
    const result = getMovieMetadata('Avatar (2009) 1080p x264 YTS.MX.mp4')
    const releaseGroup: ReleaseGroup = {
      name: 'YTS-MX',
      website: '',
      isSupported: true,
      fileAttribute: '',
      searchableSubDivXName: 'YTS MX',
      searchableOpenSubtitlesName: 'YTS.MX',
    }
    expect(result).toEqual({
      name: 'Avatar',
      resolution: '1080p',
      searchableMovieName: 'Avatar (2009)',
      fileNameWithoutExtension: 'Avatar (2009) 1080p x264 YTS.MX',
      year: 2009,
      releaseGroup,
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
})
