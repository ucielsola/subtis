import invariant from "tiny-invariant";
import { z } from "zod";

// internals
import { generateIdFromMagnet } from "./utils/torrent";

// schemas
const ytsSchemaWithTorrents = z.object({
  status: z.string(),
  status_message: z.string(),
  data: z.object({
    movie: z.object({
      id: z.number(),
      url: z.string(),
      imdb_code: z.string(),
      title: z.string(),
      title_english: z.string(),
      title_long: z.string(),
      slug: z.string(),
      year: z.number(),
      rating: z.number(),
      runtime: z.number(),
      genres: z.array(z.string()),
      like_count: z.number(),
      description_intro: z.string(),
      description_full: z.string(),
      yt_trailer_code: z.string(),
      language: z.string(),
      mpa_rating: z.string(),
      background_image: z.string(),
      background_image_original: z.string(),
      small_cover_image: z.string(),
      medium_cover_image: z.string(),
      large_cover_image: z.string(),
      torrents: z.array(
        z.object({
          url: z.string(),
          hash: z.string(),
          quality: z.string(),
          type: z.string(),
          is_repack: z.string(),
          video_codec: z.string(),
          bit_depth: z.string(),
          audio_channels: z.string(),
          seeds: z.number(),
          peers: z.number(),
          size: z.string(),
          size_bytes: z.number(),
          date_uploaded: z.string().optional(),
          date_uploaded_unix: z.number().optional(),
        }),
      ),
      date_uploaded: z.string().optional(),
      date_uploaded_unix: z.number().optional(),
    }),
  }),
  "@meta": z.object({
    server_time: z.number(),
    server_timezone: z.string(),
    api_version: z.number(),
    execution_time: z.string(),
  }),
});

const ytsSchemaWithoutTorrents = z.object({
  status: z.string(),
  status_message: z.string(),
  data: z.object({
    movie: z.object({
      id: z.number(),
      url: z.string(),
      imdb_code: z.string(),
      title: z.null(),
      title_english: z.null(),
      title_long: z.string(),
      slug: z.null(),
      year: z.number(),
      rating: z.number(),
      runtime: z.number(),
      genres: z.array(z.string()),
      like_count: z.number(),
      description_intro: z.null(),
      description_full: z.null(),
      yt_trailer_code: z.null(),
      language: z.null(),
      mpa_rating: z.null(),
      medium_screenshot_image1: z.string(),
      medium_screenshot_image2: z.string(),
      medium_screenshot_image3: z.string(),
      large_screenshot_image1: z.string(),
      large_screenshot_image2: z.string(),
      large_screenshot_image3: z.string(),
      cast: z.array(
        z.object({
          name: z.string(),
          character_name: z.string(),
          url_small_image: z.string(),
          imdb_code: z.string(),
        }),
      ),
    }),
  }),
  "@meta": z.object({
    server_time: z.number(),
    server_timezone: z.string(),
    api_version: z.number(),
    execution_time: z.string(),
  }),
});

export const ytsSchema = z.union([ytsSchemaWithTorrents, ytsSchemaWithoutTorrents]);

// constants
export const YTS_TRACKERS = [
  "udp://open.demonii.com:1337/announce",
  "udp://tracker.openbittorrent.com:80",
  "udp://tracker.coppersurfer.tk:6969",
  "udp://glotorrents.pw:6969/announce",
  "udp://tracker.opentrackr.org:1337/announce",
  "udp://torrent.gresille.org:80/announce",
  "udp://p4p.arenabg.com:1337",
  "udp://p4p.arenabg.ch:1337",
  "udp://tracker.leechers-paradise.org:6969",
  "udp://tracker.internetwarriors.net:1337",
];
const [FIRST_YTS_TRACKER] = YTS_TRACKERS;

export async function getYtsTorrents(imdbId: string) {
  const response = await fetch(
    `https://yts.am/api/v2/movie_details.json?imdb_id=${imdbId}&with_images=false&with_cast=false`,
  );

  if (!response.ok) {
    throw new Error("YTS API failed");
  }

  const data = await response.json();
  const yts = ytsSchema.parse(data);

  if ("torrents" in yts.data.movie === false) {
    return [];
  }

  const { torrents } = yts.data.movie;

  return torrents.map((torrent) => {
    const dn = encodeURIComponent(yts.data.movie.title || yts.data.movie.title_long);
    const trackerId = `magnet:?xt=urn:btih:${torrent.hash}&dn=${dn}&tr=${FIRST_YTS_TRACKER}`;

    return {
      tracker: "YTS",
      title: `${yts.data.movie.title_long} [${torrent.quality}] [${torrent.video_codec}] [${torrent.audio_channels}] YTS`,
      size: torrent.size_bytes,
      trackerId,
      seeds: torrent.seeds,
      isBytesFormatted: false,
      id: generateIdFromMagnet(trackerId),
    };
  });
}

// https://github.com/BrokenEmpire/YTS/blob/master/API.md
export async function getYtsTorrent(imdbId: number, resolution: string) {
  const response = await fetch(
    `https://yts.am/api/v2/movie_details.json?imdb_id=${imdbId}&with_images=false&with_cast=false`,
  );

  if (!response.ok) {
    throw new Error("YTS API failed");
  }

  const data = await response.json();
  const yts = ytsSchema.parse(data);

  if ("torrents" in yts.data.movie === false) {
    return null;
  }

  const { torrents } = yts.data.movie;

  const torrent = torrents.find((torrent) => torrent.quality === resolution);

  invariant(torrent, "Torrent not found");

  const dn = encodeURIComponent(yts.data.movie.title || yts.data.movie.title_long);
  const trackerId = `magnet:?xt=urn:btih:${torrent.hash}&dn=${dn}&tr=${FIRST_YTS_TRACKER}`;

  return {
    tracker: "YTS",
    title: `${yts.data.movie.title_long} YTS`,
    size: torrent.size_bytes,
    trackerId,
    seeds: torrent.seeds,
    isBytesFormatted: false,
    id: generateIdFromMagnet(trackerId),
  };
}
