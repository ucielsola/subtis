import { describe, it } from 'vitest';

import { getMovieData } from '../app';

describe('suite', () => {
  it('The Super Mario Bros | 2023 | YTS-MX', ({ expect }) => {
    const data = getMovieData('The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4');

    expect(data).toEqual({
      name: 'The Super Mario Bros  Movie',
      releaseGroup: 'YTS-MX',
      resolution: '1080p',
      searchableMovieName: 'The Super Mario Bros Movie (2023)',
      searchableReleaseGroup: 'YTS MX',
      year: 2023,
    });
  });

  it('The Super Mario Bros | 2023 | CODY', ({ expect }) => {
    const data = getMovieData('The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv (4.3 GB)');

    expect(data).toEqual({
      name: 'The Super Mario Bros Movie',
      releaseGroup: 'CODY',
      resolution: '1080p',
      searchableMovieName: 'The Super Mario Bros Movie (2023)',
      searchableReleaseGroup: 'H265-CODY',
      year: 2023,
    });
  });

  it('Evil Dead Rise | 2023 | GalaxyRG', ({ expect }) => {
    const data = getMovieData('Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv (1.4 GB)');

    expect(data).toEqual({
      name: 'Evil Dead Rise',
      releaseGroup: 'GalaxyRG',
      resolution: '1080p',
      searchableMovieName: 'Evil Dead Rise (2023)',
      searchableReleaseGroup: 'GalaxyRG',
      year: 2023,
    });
  });

  it('Fast X | 2023 | CMRG', ({ expect }) => {
    const data = getMovieData('Fast.X.2023.1080p.MA.WEB-DL.DDP5.1.Atmos.x264-CMRG.mkv (8.6 GB)');

    expect(data).toEqual({
      name: 'Fast X',
      releaseGroup: 'CMRG',
      resolution: '1080p',
      searchableMovieName: 'Fast X (2023)',
      searchableReleaseGroup: 'CMRG',
      year: 2023,
    });
  });

  it('Beau is Afraid | 2023 | GalaxyRG', ({ expect }) => {
    const data = getMovieData('Beau.is.Afraid.2023.1080p.AMZN.WEBRip.1600MB.DD5.1.x264-GalaxyRG.mkv (1.6 GB)');

    expect(data).toEqual({
      name: 'Beau is Afraid',
      releaseGroup: 'GalaxyRG',
      resolution: '1080p',
      searchableMovieName: 'Beau is Afraid (2023)',
      searchableReleaseGroup: 'GalaxyRG',
      year: 2023,
    });
  });
});
