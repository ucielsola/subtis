import { JSDOM } from 'jsdom';
import invariant from 'tiny-invariant';

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

// sync helpers
function getMovieData(movie: string) {
  const FIRST_MOVIE_RECORDED = 1888;

  const currentYear = new Date().getFullYear() + 1;

  for (let year = FIRST_MOVIE_RECORDED; year < currentYear; year++) {
    const yearString = String(year);

    if (movie.includes(yearString)) {
      const [name, rawAttributes] = movie.split(yearString);
      const movieName = name.replaceAll('.', ' ').trim();

      for (const videoFileExtension of VIDEO_FILE_EXTENSIONS) {
        if (rawAttributes.includes(videoFileExtension)) {
          if (rawAttributes.includes('YTS')) {
            return { name: movieName, year, releaseGroup: 'YTS' };
          }

          // 'The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv (4.3 GB)'
          // 'Evil.Dead.Rise.2023.1080p.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mkv (1.4 GB)'
          const releaseGroup = rawAttributes
            .split(videoFileExtension)
            .at(0)!
            .split(/\.|\s/g)
            .at(-1)!
            .replace('x264-', '');

          return { name: movieName, year, releaseGroup };
        }
      }
    }
  }

  throw new Error("Couldn't parse movie name");
}

// async helpers
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

async function checkLinkLife(link: string) {
  const response = await fetch(link);
  return response.status === 200;
}

async function getSubtitleLink(movieName: string) {
  const { name, releaseGroup } = getMovieData(movieName);

  const subtitlePageHtml = await getSearchSubtitlesPage(name);

  const dom = new JSDOM(subtitlePageHtml);
  const document = dom.window.document;

  const value = [...document.querySelectorAll('#buscador_detalle')].find((element) => {
    const movieDetail = element.textContent?.toLowerCase();
    return movieDetail?.includes(releaseGroup.toLowerCase());
  });

  const previousSibling = value?.previousSibling as Element;
  invariant(previousSibling, 'Previous sibling for value should be defined');

  const hrefElement = previousSibling.querySelector('.titulo_menu_izq');
  invariant(hrefElement, 'Anchor element should be defined');

  const subtitlePageLink = hrefElement.getAttribute('href');
  invariant(subtitlePageLink, 'Subtitle page link should be defined');

  const subtitleInitialLink = await getSubtitleInitialLink(subtitlePageLink);

  // zip link
  const subtitleId = new URL(subtitleInitialLink).searchParams.get('id');

  const subtitleRarLink = `https://www.subdivx.com/sub9/${subtitleId}.rar`;
  const subtitleZipLink = `https://www.subdivx.com/sub9/${subtitleId}.zip`;

  const isRarLinkAlive = await checkLinkLife(subtitleRarLink);
  const subtitleLink = isRarLinkAlive ? subtitleRarLink : subtitleZipLink;

  return subtitleLink;
}

async function indexer() {
  getSubtitleLink('The Super Mario Bros Movie 2023 1080p WEBRip H265-CODY.mkv (4.3 GB)');

  // 1. Obtener lista de peliculas de TMDB
  // 2. Buscar película en SubDivx
  // 3. Obtener todos los links de subtítulos
  // 4. Descargar subtitulo por cada link
  // 5. Repetir hasta que no haya más páginas (Siguiente)
  // 6. Almacenar en Supabase (DB)
  // ID, Hash del Nombre, Nombre Peli, Nombre del Archivo, Año, Release Group, Link Subs
  // import download from 'download';
  // await download(subtitleLink, 'subtitles');
}
