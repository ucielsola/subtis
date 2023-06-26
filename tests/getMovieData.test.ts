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
});
