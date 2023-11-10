/* eslint-disable no-console */

import fs from 'node:fs'
import path from 'node:path'
import turl from 'turl'
import delay from 'delay'
import sound from 'sound-play'
import download from 'download'
import extract from 'extract-zip'
import { match } from 'ts-pattern'
import unrar from '@continuata/unrar'
import invariant from 'tiny-invariant'
import torrentSearchApi from 'torrent-search-api'

// import { confirm } from '@clack/prompts';

// shared
import { VIDEO_FILE_EXTENSIONS, getMovieFileNameExtension, getMovieMetadata } from '../shared/movie'

// internals
import { type Movie, supabase } from '../db'
import { getImdbLink } from './imdb'
import type { SubtitleData } from './types'
import { getSubDivXSubtitle } from './subdivx'
import { getFileNameHash, safeParseTorrent } from './utils'
import { type ReleaseGroupMap, type ReleaseGroupNames, getReleaseGroups } from './release-groups'
import { type SubtitleGroupMap, type SubtitleGroupNames, getSubtitleGroups } from './subtitle-groups'

// import { getArgenteamSubtitle } from './argenteam';
// import { getOpenSubtitlesSubtitle } from './opensubtitles';

// db

// tmdb
import { type TmdbMovie, getMoviesFromTmdb, getTmdbMoviesTotalPagesArray } from './tmdb'
import { bufferSchema } from './buffer'

// setup torrent-search-api
torrentSearchApi.enableProvider('1337x')

// utils
async function setMovieSubtitlesToDatabase({
  subtitle,
  movie,
  fileName,
  resolution,
  fileNameHash,
  fileNameExtension,
  releaseGroup,
  subtitleGroup,
  releaseGroups,
  subtitleGroups,
}: {
  subtitle: SubtitleData
  movie: Pick<Movie, 'id' | 'name' | 'year' | 'rating'>
  fileName: string
  resolution: string
  fileNameHash: string
  fileNameExtension: string
  releaseGroup: ReleaseGroupNames
  subtitleGroup: SubtitleGroupNames
  releaseGroups: ReleaseGroupMap
  subtitleGroups: SubtitleGroupMap
}): Promise<void> {
  try {
    const {
      subtitleLink,
      fileExtension,
      downloadFileName,
      subtitleSrtFileName,
      subtitleCompressedFileName,
      subtitleFileNameWithoutExtension,
    } = subtitle

    // 1. Download subtitle to fs
    const subtitlesFolderAbsolutePath = path.join(__dirname, '..', 'indexer', 'subtitles')
    await download(subtitleLink, subtitlesFolderAbsolutePath, {
      filename: subtitleCompressedFileName,
    })

    // 2. Create path to downloaded subtitles
    const subtitleAbsolutePath = path.join(__dirname, '..', 'indexer', 'subtitles', subtitleCompressedFileName)

    // 3. Create path to extracted subtitles
    const extractedSubtitlePath = path.join(__dirname, '..', 'indexer', 'subs', subtitleFileNameWithoutExtension)

    // 4. Handle compressed zip/rar files
    await match(fileExtension)
      .with('rar', async () => {
        fs.mkdir(extractedSubtitlePath, { recursive: true }, _error => null)

        await unrar.uncompress({
          command: 'e',
          switches: ['-o+', '-idcd'],
          src: subtitleAbsolutePath,
          dest: extractedSubtitlePath,
        })
      })
      .with('zip', async () => {
        await extract(subtitleAbsolutePath, { dir: extractedSubtitlePath })
      })
      .with('srt', async () => {
        await download(subtitleLink, 'subs', {
          filename: subtitleSrtFileName,
        })
      })
      .exhaustive()

    let srtFileToUpload: unknown

    if (['zip', 'rar'].includes(fileExtension)) {
      const extractedSubtitleFiles = fs.readdirSync(extractedSubtitlePath)

      const srtFile = extractedSubtitleFiles.find(file => path.extname(file).toLowerCase() === '.srt')
      invariant(srtFile, 'SRT file not found')

      const extractedSrtFileNamePath = path.join(
        __dirname,
        '..',
        'indexer',
        'subs',
        subtitleFileNameWithoutExtension,
        srtFile,
      )

      srtFileToUpload = fs.readFileSync(extractedSrtFileNamePath)
    }

    if (fileExtension === 'srt') {
      const srtFileNamePath = path.join(__dirname, '..', 'indexer', 'subs', subtitleSrtFileName)
      srtFileToUpload = fs.readFileSync(srtFileNamePath)
    }

    // 10. Upload SRT file to Supabase storage
    await supabase.storage.from('subtitles').upload(subtitleSrtFileName, bufferSchema.parse(srtFileToUpload), {
      upsert: true,
      contentType: 'text/plain;charset=UTF-8',
    })

    // 11. Remove files and folders from fs to avoid collition with others subtitle groups
    // await rimraf([subtitleAbsolutePath, extractedSubtitlePath]);

    // 12. Save SRT to Supabase and get public URL for SRT file
    const {
      data: { publicUrl },
    } = await supabase.storage.from('subtitles').getPublicUrl(subtitleSrtFileName, { download: true })

    // 13. Append download file name to public URL so it matches movie file name
    const subtitleLinkWithDownloadFileName = `${publicUrl}${downloadFileName}`

    // 14. Create short link for subtitle
    const subtitleFullLink = subtitleLinkWithDownloadFileName
    const subtitleShortLink = await turl.shorten(subtitleLinkWithDownloadFileName)

    // 13. Get movie by ID
    const { data: movieData } = await supabase.from('Movies').select('*').eq('id', movie.id)
    invariant(movieData, 'Movie not found')

    // 14. Save movie to Supabase if is not yet saved
    if (Array.isArray(movieData) && !movieData.length)
      await supabase.from('Movies').insert(movie).select()

    // 15. Get release and subtitle group id
    const { id: releaseGroupId } = releaseGroups[releaseGroup]
    const { id: subtitleGroupId } = subtitleGroups[subtitleGroup]

    // 16. Save subtitle to Supabase
    await supabase.from('Subtitles').insert({
      fileName,
      resolution,
      fileNameHash,
      releaseGroupId,
      subtitleGroupId,
      subtitleFullLink,
      subtitleShortLink,
      movieId: movie.id,
      fileExtension: fileNameExtension,
    })

    // play sound when a subtitle was found
    console.log('Subtitle found, and saved to DB and Storage! 🎉')

    const successSoundPath = path.join(__dirname, '..', 'indexer', 'success_short_high.wav')
    sound.play(successSoundPath)

    // TODO: Move to console.table when is supported in Bun
    console.table([
      {
        movie,
        resolution,
        releaseGroup,
        subtitleGroup,
        imdbLink: getImdbLink(movie.id),
        subtitleLink: `${subtitleLink.slice(0, 100)}...`,
      },
    ])
  }
  catch (error) {
    console.log('\n ~ error:', error)
    console.log('\n ~ error message:', error instanceof Error ? error.message : '')
  }
}

async function getSubtitlesFromMovie(
  movie: TmdbMovie,
  releaseGroups: ReleaseGroupMap,
  subtitleGroups: SubtitleGroupMap,
) {
  const { year, rating, imdbId, title } = movie
  console.log('\n ~ getSubtitlesFromMovie ~ title:', title)

  // 1. Get first 21 movie torrents from 1337x
  const TOTAL_MOVIES_TO_SEARCH = 5
  const torrents = await torrentSearchApi.search(movie.title, 'Movies', TOTAL_MOVIES_TO_SEARCH)
  console.log('\n ~ forawait ~ torrents:', torrents)

  // 2. Iterate over each torrent
  for await (const torrentData of torrents) {
    console.log('\n ~ forawait ~ torrentData:', torrentData)
    // 3. Download torrent
    const torrentFilename = torrentData.title
    const torrentFolderPath = path.join(__dirname, '..', 'indexer', 'torrents', torrentFilename)
    await torrentSearchApi.downloadTorrent(torrentData, torrentFolderPath)

    // 4. Read torrent files
    const torrentPath = path.join(__dirname, '..', 'indexer', 'torrents', torrentFilename)
    const torrentFile = fs.readFileSync(torrentPath)
    const { files } = safeParseTorrent(torrentFile)

    // 5. Remove torrent from fs
    // await rimraf(torrentPath);

    // 6. Find video file
    const videoFile = files.find((file) => {
      return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => {
        return file.name.endsWith(videoFileExtension)
      })
    })

    // 7. Return if no video file
    if (!videoFile)
      continue

    // 8. Get movie data from video file name
    const fileName = videoFile.name
    const fileNameExtension = getMovieFileNameExtension(fileName)

    const movieData = getMovieMetadata(fileName)
    const { resolution, releaseGroup } = movieData

    // 9. Hash video file name
    const fileNameHash = getFileNameHash(fileName)

    // 10. Find subtitle metadata from SubDivx and Argenteam
    const subtitles = await Promise.allSettled([
      getSubDivXSubtitle(movieData),
      // getArgenteamSubtitle(movieData, imdbId),
      // getOpenSubtitlesSubtitle(movieData, imdbId),
    ])

    // 11. Filter fulfilled only promises
    const resolvedSubtitles = subtitles.filter(
      subtitle => subtitle.status === 'fulfilled',
    ) as PromiseFulfilledResult<SubtitleData>[]

    // 12. Save whole subtitles data to DB
    resolvedSubtitles.forEach(({ value: subtitle }) => {
      const { subtitleGroup } = subtitle
      console.log('\n ~ resolvedSubtitles.forEach ~ subtitleGroup:', subtitleGroup)

      setMovieSubtitlesToDatabase({
        subtitle,
        subtitleGroup,
        movie: {
          year,
          rating,
          id: imdbId,
          name: title,
        },
        resolution,
        fileName,
        fileNameHash,
        fileNameExtension,
        releaseGroup,
        releaseGroups,
        subtitleGroups,
      })
    })

    await delay(3000)
  }
}

// core -> NEW FLOW : TMDB -> Torrent-search-api -> Indexer -> DB
async function mainIndexer(): Promise<void> {
  try {
    // 1. Get release and subtitle groups from DB
    const releaseGroups = await getReleaseGroups(supabase)
    const subtitleGroups = await getSubtitleGroups(supabase)

    // 2. Get all movie pages from TMDB
    const totalPagesArray = await getTmdbMoviesTotalPagesArray()
    console.log(`totalPagesArray: ${totalPagesArray.at(-1)} \n`)

    for await (const tmbdMoviesPage of totalPagesArray) {
      console.log(`Buscando en pagina ${tmbdMoviesPage}`)

      // 3. Get movies from TMDB
      const movies = await getMoviesFromTmdb(tmbdMoviesPage)

      for await (const movie of movies) {
        console.log(`Buscando subtitulos para "${movie.title}"`)

        // 4. Get subtitles from each movie
        await getSubtitlesFromMovie(movie, releaseGroups, subtitleGroups)
      }
    }
  }
  catch (error) {
    console.log('\n ~ mainIndexer ~ error:', error)
    console.log('\n ~ mainIndexer ~ error message:', (error as Error).message)
  }
}

mainIndexer()
