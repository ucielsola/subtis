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
const supabase = createClient('https://yelhsmnvfyyjuamxbobs.supabase.co', process.env.SUPABASE_KEY);

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
];

// utils
async function checkLinkLife(link: string) {
  const response = await fetch(link);
  return response.status === 200;
}

// movie helpers
function getMovieData(movie: string) {
  const FIRST_MOVIE_RECORDED = 1888;

  const currentYear = new Date().getFullYear() + 1;

  for (let year = FIRST_MOVIE_RECORDED; year < currentYear; year++) {
    const yearString = String(year);

    if (movie.includes(yearString)) {
      const [rawName, rawAttributes] = movie.split(yearString);
      const name = rawName.replace(/\s+/g, ' ');

      const movieName = name.replaceAll('.', ' ').trim();
      const resolution = match(rawAttributes)
        .with(P.string.includes('1080'), () => '1080p')
        .with(P.string.includes('720'), () => '720p')
        .with(P.string.includes('2160'), () => '2160p')
        .with(P.string.includes('3D'), () => '3D')
        .run();

      for (const videoFileExtension of VIDEO_FILE_EXTENSIONS) {
        if (rawAttributes.includes(videoFileExtension)) {
          // 'The.Super.Mario.Bros..Movie.2023.1080p.BluRay.x264.AAC5.1-[YTS.MX].mp4'
          if (rawAttributes.includes('YTS.MX')) {
            return { name: movieName, year, resolution, searchableReleaseGroup: 'YTS MX', releaseGroup: 'YTS-MX' };
          }

          // 'The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv (4.3 GB)'
          // 'Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv (1.4 GB)'
          const releaseGroup = rawAttributes
            .split(videoFileExtension)
            .at(0)!
            .split(/\.|\s/g)
            .at(-1)!
            .replace('x264-', '');

          return { name: movieName, year, resolution, releaseGroup, searchableReleaseGroup: releaseGroup };
        }
      }
    }
  }

  throw new Error("Couldn't parse movie name");
}

function getFileNameHash(fileName: string) {
  return crypto.createHash('md5').update(fileName).digest('hex');
}

// subdivx helpers
async function getSearchSubtitlesPage(movieName: string) {
  const response = await fetch(`https://subdivx.com/index.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ buscar2: movieName, accion: '5', masdesc: '', subtitulos: '1', realiza_b: '1' }),
  });

  const html = await response.text();

  return html;
}

async function getSubtitleInitialLink(subtitlePage: string) {
  const response = await fetch(subtitlePage);
  const html = await response.text();

  const dom = new JSDOM(html);
  const document = dom.window.document;

  const path = document.querySelector('.link1').getAttribute('href');
  const subtitleLink = `https://www.subdivx.com/${path}`;

  return subtitleLink;
}

async function getSubtitleLink(movieFileName: string) {
  const { name, resolution, releaseGroup, searchableReleaseGroup } = getMovieData(movieFileName);

  const subtitlePageHtml = await getSearchSubtitlesPage(name);

  const dom = new JSDOM(subtitlePageHtml);
  const document = dom.window.document;

  const value = [...document.querySelectorAll('#buscador_detalle')].find((element) => {
    const movieDetail = element.textContent?.toLowerCase();
    return movieDetail?.includes(searchableReleaseGroup.toLowerCase());
  });

  const previousSibling = value?.previousSibling as Element;
  invariant(previousSibling, 'Previous sibling for value should be defined');

  const hrefElement = previousSibling.querySelector('.titulo_menu_izq');
  invariant(hrefElement, 'Anchor element should be defined');

  const subtitlePageLink = hrefElement.getAttribute('href');
  invariant(subtitlePageLink, 'Subtitle page link should be defined');

  const subtitleInitialLink = await getSubtitleInitialLink(subtitlePageLink);

  // compressed file link
  const subtitleId = new URL(subtitleInitialLink).searchParams.get('id');

  const subtitleRarLink = `https://www.subdivx.com/sub9/${subtitleId}.rar`;
  const subtitleZipLink = `https://www.subdivx.com/sub9/${subtitleId}.zip`;

  const isRarLinkAlive = await checkLinkLife(subtitleRarLink);

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

// TODO: Go to next page if subtitle is not found, and if there's next page

// yts helpers
const YTS_BASE_URL = 'https://yts.mx/api/v2';

const ytsApiEndpoints = {
  movieList: (page: number = 1, limit: number = 50) => {
    return `${YTS_BASE_URL}/list_movies.json?limit=${limit}&page=${page}`;
  },
};

async function getTotalPages(limit: number = 50) {
  const response = await fetch(ytsApiEndpoints.movieList(1, 1));
  const { data } = await response.json();

  return Math.ceil(data.movie_count / limit);
}

async function getMovieList(page: number = 1, limit: number = 50) {
  const response = await fetch(ytsApiEndpoints.movieList(page, limit));
  const { data } = await response.json();

  return data.movies;
}

// db indexer
async function getMovieListFromDb(movie) {
  const { title_long: titleLong, rating, year, torrents, imdb_code: imdbId } = movie;

  for await (const torrent of torrents) {
    const { url, hash } = torrent;

    try {
      // 1. Download torrent
      const torrentFilename = hash;
      await download(url, 'torrents', { filename: torrentFilename });

      // 2. Read torrent file
      const torrentFile = fs.readFileSync(__dirname + `/torrents/${torrentFilename}`);
      const { files } = parseTorrent(torrentFile);

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
          src: subtitleAbsolutePath,
          dest: extractedSubtitlePath,
          command: 'e',
          switches: ['-o+', '-idcd'],
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

      console.log(`Movie saved to DB! ${name} ✨`);
    } catch (error) {
      // console.log('\n ~ forawait ~ error:', error.message);
    }
  }
}

async function indexer() {
  // 1. Get total YTS-MX pages
  const totalPages = await getTotalPages();

  // 2. Create array of pages (from 1 to totalPages)
  const totalPagesArray = times(totalPages, (value) => value + 1);

  // 3. Await for each page to get movies
  for await (const page of totalPagesArray) {
    console.log('getting movies from page 🚨', page);

    // 4. Get all the movies (50) for this page
    const movieList = await getMovieList(page);

    // 5. Run all 50 movies in parallels to get their subtitle and save them to DB and Storage
    const movieListPromises = movieList.map(async (movie) => getMovieListFromDb(movie));
    await Promise.all(movieListPromises);

    console.log('finished movies from page 🥇', page);

    // 6. Generate random delays between 5 and 15 seconds
    const randomDelay = Math.floor(Math.random() * (15 - 5 + 1) + 5);
    console.log(`Delaying next iteration by ${randomDelay}s to avoid get blocked`);

    // 7. Delay next iteration
    await delay(randomDelay * 1000);
  }
}

indexer();
