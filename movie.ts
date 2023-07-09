import { P, match } from 'ts-pattern';

import { removeExtraSpaces, VIDEO_FILE_EXTENSIONS } from './utils';

export function getMovieName(name: string): string {
  return removeExtraSpaces(name.replaceAll('.', ' ')).trim();
}

export function getMovieData(movie: string): {
  name: string;
  year: number;
  resolution: string;
  releaseGroup: string;
  searchableMovieName: string;
  searchableReleaseGroup: string;
} {
  const FIRST_MOVIE_RECORDED = 1888;
  const currentYear = new Date().getFullYear() + 1;

  for (let year = FIRST_MOVIE_RECORDED; year < currentYear; year++) {
    const yearString = String(year);

    const yearStringToReplace = match(movie)
      .with(P.string.includes(`(${yearString})`), () => `(${yearString})`)
      .with(P.string.includes(yearString), () => yearString)
      .otherwise(() => false);

    if (yearStringToReplace && typeof yearStringToReplace === 'string') {
      const [rawName, rawAttributes] = movie.split(yearStringToReplace);

      const movieName = getMovieName(rawName);
      const searchableMovieName = removeExtraSpaces(`${movieName} (${yearString})`);

      const resolution = match(rawAttributes)
        .with(P.string.includes('1080'), () => '1080p')
        .with(P.string.includes('720'), () => '720p')
        .with(P.string.includes('2160'), () => '2160p')
        .with(P.string.includes('3D'), () => '3D')
        .run();

      for (const videoFileExtension of VIDEO_FILE_EXTENSIONS) {
        if (rawAttributes.includes(videoFileExtension)) {
          if (rawAttributes.includes('YTS.MX')) {
            return {
              name: movieName,
              searchableMovieName,
              year,
              resolution,
              releaseGroup: 'YTS-MX',
              searchableReleaseGroup: 'YTS MX',
            };
          }

          if (rawAttributes.includes('CODY')) {
            return {
              name: movieName,
              searchableMovieName,
              year,
              resolution,
              releaseGroup: 'CODY',
              searchableReleaseGroup: 'H265-CODY',
            };
          }

          // 'Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv (1.4 GB)'
          const releaseGroup = rawAttributes
            .split(videoFileExtension)
            .at(0)!
            .split(/\.|\s/g)
            .at(-1)!
            .replace('x264-', '');

          return {
            name: movieName,
            searchableMovieName,
            year,
            resolution,
            releaseGroup,
            searchableReleaseGroup: releaseGroup,
          };
        }
      }
    }
  }

  throw new Error("Couldn't parse movie name");
}
