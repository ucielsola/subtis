import fs from 'fs';
import 'dotenv/config';
import path from 'path';
import delay from 'delay';
import crypto from 'crypto';
import { JSDOM } from 'jsdom';
import slugify from 'slugify';
import download from 'download';
import times from 'lodash.times';
import extract from 'extract-zip';
import unrar from '@continuata/unrar';
import { P, match } from 'ts-pattern';
import invariant from 'tiny-invariant';
import parseTorrent from 'parse-torrent-updated';
import { createClient } from '@supabase/supabase-js';

// supabase
const supabaseApiKey = process.env.SUPABASE_KEY as string;
const supabase = createClient('https://yelhsmnvfyyjuamxbobs.supabase.co', supabaseApiKey);

// constants
const VIDEO_FILE_EXTENSIONS = [
  '.mkv',
  '.mp4',
  '.avi',
  '.mov',
  '.wmv',
  '.flv',
  '.webm',
  '.vob',
  '.m4v',
  '.mpg',
  '.mpeg',
  '.3gp',
  '.3g2',
] as const;

// utils
async function checkLinkLife(link: string): Promise<boolean> {
  const response = await fetch(link);
  return response.status === 200;
}

// movie helpers
function removeExtraSpaces(name: string): string {
  return name.replace(/\s+/g, ' ').trim();
}

function getMovieName(name: string): string {
  return removeExtraSpaces(name).replaceAll('.', ' ').trim();
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

function getFileNameHash(fileName: string): string {
  return crypto.createHash('md5').update(fileName).digest('hex');
}

// subdivx helpers
const SUBDIVX_BASE_URL = 'https://subdivx.com';

async function getSearchSubtitlesPage(movieName: string, page: string = '1'): Promise<string> {
  const response = await fetch(`${SUBDIVX_BASE_URL}/index.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      buscar2: movieName,
      accion: '5',
      masdesc: '',
      subtitulos: '1',
      realiza_b: '1',
      pg: page,
    }),
  });

  const html = await response.text();
  return html;
}

async function getSubtitleInitialLink(subtitlePage: string): Promise<string> {
  const response = await fetch(subtitlePage);
  const html = await response.text();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const anchor = document.querySelector('.link1');
  invariant(anchor, 'Link should be defined');

  const href = anchor.getAttribute('href');
  const subtitleLink = `${SUBDIVX_BASE_URL}/${href}`;

  return subtitleLink;
}

async function getSubtitleLink(
  movieFileName: string,
  page: string = '1',
): Promise<{
  subtitleLink: string;
  subtitleSrtFileName: string;
  subtitleCompressedFileName: string;
  subtitleFileNameWithoutExtension: string;
  fileExtension: 'zip' | 'rar';
}> {
  const { name, searchableMovieName, resolution, releaseGroup, searchableReleaseGroup } = getMovieData(movieFileName);
  const subtitlePageHtml = await getSearchSubtitlesPage(searchableMovieName, page);

  const dom = new JSDOM(subtitlePageHtml);
  const document = dom.window.document;

  const allSubtitlesElements = [...document.querySelectorAll('#buscador_detalle')];
  invariant(allSubtitlesElements.length > 0, 'There should be at least one subtitle');

  const value = allSubtitlesElements.find((element) => {
    const movieDetail = element.textContent?.toLowerCase();
    return movieDetail?.includes(searchableReleaseGroup.toLowerCase());
  });

  const previousSibling = value?.previousSibling as Element;

  if (!previousSibling) {
    // Iterate to next pages until find the subtitle or no more results
    // The recursion will break loop on line 185
    return getSubtitleLink(movieFileName, String(Number(page) + 1));
  }

  const hrefElement = previousSibling.querySelector('.titulo_menu_izq');
  invariant(hrefElement, 'Anchor element should be defined');

  const subtitlePageLink = hrefElement.getAttribute('href');
  invariant(subtitlePageLink, 'Subtitle page link should be defined');

  const subtitleInitialLink = await getSubtitleInitialLink(subtitlePageLink);

  // compressed file link
  const subtitleId = new URL(subtitleInitialLink).searchParams.get('id');

  const subtitleRarLink = `${SUBDIVX_BASE_URL}/sub9/${subtitleId}.rar`;
  const subtitleZipLink = `${SUBDIVX_BASE_URL}/sub9/${subtitleId}.zip`;

  const isRarLinkAlive = await checkLinkLife(subtitleRarLink);
  const isZipLinkAlive = await checkLinkLife(subtitleZipLink);

  invariant(isRarLinkAlive || isZipLinkAlive, 'Subtitle link should be alive');

  const fileExtension = isRarLinkAlive ? 'rar' : 'zip';
  const subtitleLink = isRarLinkAlive ? subtitleRarLink : subtitleZipLink;

  const subtitleSrtFileName = slugify(`${name}-${resolution}-${releaseGroup}.srt`).toLowerCase();
  const subtitleFileNameWithoutExtension = slugify(`${name}-${resolution}-${releaseGroup}`).toLowerCase();
  const subtitleCompressedFileName = slugify(`${name}-${resolution}-${releaseGroup}.${fileExtension}`).toLowerCase();

  return {
    subtitleLink,
    subtitleSrtFileName,
    subtitleCompressedFileName,
    subtitleFileNameWithoutExtension,
    fileExtension,
  };
}

// yts helpers
const YTS_BASE_URL = 'https://yts.mx/api/v2';

const ytsApiEndpoints = {
  movieList: (page: number = 1, limit: number = 50) => {
    return `${YTS_BASE_URL}/list_movies.json?limit=${limit}&page=${page}`;
  },
};

async function getTotalMoviesAndPages(limit: number = 50): Promise<{
  totalMovies: number;
  totalPages: number;
}> {
  const response = await fetch(ytsApiEndpoints.movieList(1, 1));
  const { data } = await response.json();

  const totalMovies = (data as { movie_count: number }).movie_count;
  const totalPages = Math.ceil(totalMovies / limit);

  return { totalMovies, totalPages };
}

type Torrent = {
  url: string;
  hash: string;
  quality: string;
  type: string;
  is_repack: string;
  video_codec: string;
  bit_depth: string;
  audio_channels: string;
  seeds: number;
  peers: number;
  size: string;
  size_bytes: number;
  date_uploaded: string;
  date_uploaded_unix: number;
};

type Movie = {
  id: number;
  url: string;
  imdb_code: string;
  title: string;
  title_english: string;
  title_long: string;
  slug: string;
  year: number;
  rating: number;
  runtime: number;
  genres: string[];
  summary: string;
  description_full: string;
  synopsis: string;
  yt_trailer_code: string;
  language: string;
  mp_rating: string;
  background_image: string;
  background_image_original: string;
  small_cover_image: string;
  medium_cover_image: string;
  large_cover_image: string;
  state: string;
  torrents: Torrent[];
  date_uploaded: string;
  date_uploaded_unix: number;
};

async function getMovieList(page: number = 1, limit: number = 50): Promise<Movie[]> {
  const response = await fetch(ytsApiEndpoints.movieList(page, limit));
  const { data } = await response.json();

  return data.movies as Movie[];
}

// db indexer
type File = {
  path: string;
  name: string;
  length: number;
  offset: number;
};

async function getMovieListFromDb(movie: Movie) {
  const { title_long: titleLong, rating, year, torrents, imdb_code: imdbId } = movie;

  for await (const torrent of torrents) {
    const { url, hash } = torrent;

    try {
      // 1. Download torrent
      const torrentFilename = hash;
      await download(url, 'torrents', { filename: torrentFilename });

      // 2. Read torrent file
      const torrentFile = fs.readFileSync(__dirname + `/torrents/${torrentFilename}`);
      const { files } = parseTorrent(torrentFile) as { files: File[] };

      // 3. Find video file
      const videoFile = files.find((file) => {
        return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => file.name.endsWith(videoFileExtension));
      });

      // 4. Return if no video file (should return?)
      if (!videoFile) continue;

      // 5. Get movie data from video file
      const { name, resolution, releaseGroup } = getMovieData(videoFile.name);

      // 6. Hash video file name
      const fileNameHash = getFileNameHash(videoFile.name);

      // 7. Find subtitle metadata from SubDivx
      const {
        subtitleLink,
        subtitleCompressedFileName,
        subtitleSrtFileName,
        subtitleFileNameWithoutExtension,
        fileExtension,
      } = await getSubtitleLink(videoFile.name);

      // 8. Download subtitle to fs
      await download(subtitleLink, 'subtitles', { filename: subtitleCompressedFileName });

      // 9. Create path to downloaded subtitles
      const subtitleAbsolutePath = path.resolve(__dirname + `/subtitles/${subtitleCompressedFileName}`);

      // 10. Create path to extracted subtitles
      const extractedSubtitlePath = path.resolve(__dirname + `/subs/${subtitleFileNameWithoutExtension}`);

      // 11. Create path to extracted subtitles
      // fs.mkdirSync(extractedSubtitlePath);

      // 12. Handle compressed rar files
      if (fileExtension === 'rar') {
        await unrar.uncompress({
          command: 'e',
          switches: ['-o+', '-idcd'],
          src: subtitleAbsolutePath,
          dest: extractedSubtitlePath,
        });
      }

      // 13. Handle compressed zip files
      if (fileExtension === 'zip') {
        await extract(subtitleAbsolutePath, { dir: extractedSubtitlePath });
      }

      // 14. Get extracted subtitle files
      const extractedSubtitleFiles = fs.readdirSync(extractedSubtitlePath);

      // 15. Get SRT file name
      const srtFile = extractedSubtitleFiles.find((file) => path.extname(file).toLowerCase() === '.srt');

      // 16. Get SRT file path
      const extractedSrtFileNamePath = path.resolve(__dirname + `/subs/${subtitleFileNameWithoutExtension}/${srtFile}`);

      // 17. Read SRT file
      const srtFileToUpload = fs.readFileSync(extractedSrtFileNamePath);

      // 18. Upload SRT file to Supabase storage
      await supabase.storage.from('subtitles').upload(subtitleSrtFileName, srtFileToUpload);

      // 19. Save SRT to Supabase and get public URL for SRT file
      const {
        data: { publicUrl },
      } = await supabase.storage.from('subtitles').getPublicUrl(subtitleSrtFileName);

      // 20. Save movie to Supabase
      const movie = await supabase.from('Movies').insert({ name: titleLong, year, rating, imdbId }).select();

      // 21. Get movie id from saved movie
      const movieId = movie?.data[0].id;

      // 22. Save subtitle to Supabase
      await supabase
        .from('Subtitles')
        .insert({ movieId, fileNameHash, resolution, releaseGroup, subtitleLink: publicUrl });

      console.log(`Movie (+ Subtitle) saved to DB! ${name} ✨`);
    } catch (error) {
      // console.log('\n ~ forawait ~ error:', error.message);
    }
  }
}

function getRandomDelayInSeconds(
  min: number = 5,
  max: number = 15,
): {
  seconds: number;
  miliseconds: number;
} {
  const seconds = Math.floor(Math.random() * (max - min + 1) + min);
  return { seconds, miliseconds: seconds * 1000 };
}

async function ytsMxIndexer(): Promise<void> {
  // 1. Get total YTS-MX pages
  const { totalPages } = await getTotalMoviesAndPages();

  // 2. Create array of pages (from 1 to totalPages)
  const totalPagesArray = times(totalPages, (value) => value + 1);

  // 3. Await for each page to get movies
  for await (const page of totalPagesArray) {
    console.log(`Getting movies for page ${page} 🚨`);

    // 4. Get all the movies (50) for this page
    const movieList = await getMovieList(page);

    // 5. Run all 50 movies in parallels to get their subtitle and save them to DB and Storage
    const movieListPromises = movieList.map(async (movie) => getMovieListFromDb(movie));
    await Promise.all(movieListPromises);

    console.log(`Finished movies from page ${page} 🥇`);

    // 6. Generate random delays between 5 and 15 seconds
    const { seconds, miliseconds } = getRandomDelayInSeconds();
    console.log(`Delaying next iteration by ${seconds}s to avoid get blocked`);

    // 7. Delay next iteration
    await delay(miliseconds);
  }

  console.log('All movies saved to DB and Storage! 🎉');
}

// ytsMxIndexer();

// TODO: Add Husky for tests
// TODO: Add table for release groups
// TODO: Add type defintions from Supabase
// TODO: Check if movie subtitle already exists in DB before triggering all logic within getMovieListFromDb
