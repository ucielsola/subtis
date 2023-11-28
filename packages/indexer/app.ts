/* eslint-disable no-console */

import fs from 'node:fs'
import path from 'node:path'
import turl from 'turl'
import sound from 'sound-play'
import download from 'download'
import extract from 'extract-zip'
import { match } from 'ts-pattern'
import unrar from '@continuata/unrar'
import invariant from 'tiny-invariant'
import { confirm } from '@clack/prompts'
import torrentSearchApi from 'torrent-search-api'

// db
import { type Movie, supabase } from 'db'

// shared
import 'shared/console'
import { bufferSchema } from 'shared/buffer'
import { VIDEO_FILE_EXTENSIONS, getMovieFileNameExtension, getMovieMetadata } from 'shared/movie'

// internals
import { getImdbLink } from './imdb'
import type { SubtitleData } from './types'
import { getFileNameHash, getSubtitleAuthor, safeParseTorrent } from './utils'
import { type TmdbMovie, getMoviesFromTmdb, getTmdbMoviesTotalPagesArray } from './tmdb'
import { type ReleaseGroupMap, type ReleaseGroupNames, getReleaseGroups } from './release-groups'
import { type SubtitleGroupMap, type SubtitleGroupNames, getEnabledSubtitleProviders, getSubtitleGroups } from './subtitle-groups'

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

    // 1. Download subtitle to fs if file is compressed
    const subtitlesFolderAbsolutePath = path.join(__dirname, '..', 'indexer', 'subtitles')

    if (['rar', 'zip'].includes(fileExtension)) {
      await download(subtitleLink, subtitlesFolderAbsolutePath, {
        filename: subtitleCompressedFileName,
      })
    }

    // 2. Create path to downloaded subtitles
    const subtitleAbsolutePath = path.join(__dirname, '..', 'indexer', 'subtitles', subtitleCompressedFileName)

    // 3. Create path to extracted subtitles
    const extractedSubtitlePath = path.join(__dirname, '..', 'indexer', 'subs', subtitleFileNameWithoutExtension)

    // 4. Handle compressed zip/rar files or srt files
    fs.mkdirSync(extractedSubtitlePath, { recursive: true })

    await match(fileExtension)
      .with('rar', async () => {
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
        await download(subtitleLink, extractedSubtitlePath, {
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
      const srtFileNamePath = path.join(__dirname, '..', 'indexer', 'subs', subtitleFileNameWithoutExtension, subtitleSrtFileName)
      srtFileToUpload = fs.readFileSync(srtFileNamePath)
    }

    // 10. Get author
    const srtFileToUploadBuffer = bufferSchema.parse(srtFileToUpload)
    const author = getSubtitleAuthor(srtFileToUploadBuffer)

    // 10. Upload SRT file to Supabase storage
    await supabase.storage.from('subtitles').upload(subtitleSrtFileName, srtFileToUploadBuffer, {
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
    if (Array.isArray(movieData) && !movieData.length) {
      await supabase.from('Movies').insert(movie).select()
    }

    // 15. Get release and subtitle group id
    const { id: releaseGroupId } = releaseGroups[releaseGroup]
    const { id: subtitleGroupId } = subtitleGroups[subtitleGroup]

    // 16. Save subtitle to Supabase
    await supabase.from('Subtitles').insert({
      author,
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
    console.log('\n✅ Subtítulo guardado en la base de datos!\n')

    const successSoundPath = path.join(__dirname, '..', 'indexer', 'success_short_high.wav')
    sound.play(successSoundPath)

    console.log(
      {
        movie,
        resolution,
        releaseGroup,
        subtitleGroup,
        imdbLink: getImdbLink(movie.id),
        subtitleLink: `${subtitleLink.slice(0, 100)}...`,
      },
    )
  }
  catch (error) {
    console.log('\n ~ error:', error)
    console.log('\n ~ error message:', error instanceof Error ? error.message : '')
  }
}

async function getSubtitlesFromMovie(
  index: string,
  movie: TmdbMovie,
  releaseGroups: ReleaseGroupMap,
  subtitleGroups: SubtitleGroupMap,
) {
  const { year, rating, imdbId, title } = movie

  // 1. Get first 21 movie torrents from 1337x
  const TOTAL_MOVIES_TO_SEARCH = 5

  const torrents = await torrentSearchApi.search(movie.title, 'Movies', TOTAL_MOVIES_TO_SEARCH)

  const torrentsWithoutCineRecordings = torrents.filter(({ title }) =>
    !/hq-cam|telesync/gi.test(title),
  )

  console.log(`4.${index}) Torrents encontrados para la pelicula "${title}" \n`)
  console.table(torrentsWithoutCineRecordings.map(({ title, provider, size }) => ({ title, provider, size })))
  console.log('\n')

  // 2. Iterate over each torrent
  for await (const [index, torrentData] of Object.entries(torrentsWithoutCineRecordings)) {
    console.log(`4.${index}) Procesando torrent`, `"${torrentData.title}"`, '\n')

    // 3. Download torrent
    const torrentFilename = torrentData.title
    const torrentFolderPath = path.join(__dirname, '..', 'indexer', 'torrents', torrentFilename)
    await torrentSearchApi.downloadTorrent(torrentData, torrentFolderPath)

    // 4. Read torrent files
    const torrentPath = path.join(__dirname, '..', 'indexer', 'torrents', torrentFilename)
    const torrentFile = fs.readFileSync(torrentPath)
    const { files } = safeParseTorrent(torrentFile, torrentFilename)

    if (files.length === 0) {
      console.log('No se encontraron archivos en el torrent', '\n')
      continue
    }

    // 5. Remove torrent from fs
    // await rimraf(torrentPath);

    // 6. Find video file
    const videoFile = files.find((file) => {
      return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => {
        return file.name.endsWith(videoFileExtension)
      })
    })

    // 7. Return if no video file
    if (!videoFile) {
      continue
    }

    // 8. Get movie data from video file name
    const fileName = videoFile.name
    const fileNameExtension = getMovieFileNameExtension(fileName)

    const movieData = getMovieMetadata(fileName)
    const { resolution, releaseGroup, isReleaseGroupSupported } = movieData

    if (isReleaseGroupSupported === false) {
      console.log('\n')
      await confirm({
        message: `¿Desea continuar? El Release Group ${releaseGroup} no es soportado, se debería de agregar al indexador`,
      })
      console.log('\n')
      continue
    }

    // 9. Hash video file name
    const fileNameHash = getFileNameHash(fileName)

    // 10. Get only providers I want to use

    // TODO: Check if we can download subtitles from OpenSubitles
    const enabledSubtitleProviders = getEnabledSubtitleProviders(['SubDivX'])

    // 11. Find subtitle metadata from SubDivx and Argenteam
    for await (const [indexSubtitleProvider, enabledSubtitleProvider] of Object.entries(enabledSubtitleProviders)) {
      const { name, getSubtitleFromProvider } = enabledSubtitleProvider

      try {
        console.log(`4.${index}.${indexSubtitleProvider}) Buscando subtítulo en ${name}`)

        const subtitle = await getSubtitleFromProvider({ movieData, imdbId })

        const { subtitleGroup } = subtitle
        console.log(`4.${index}.${indexSubtitleProvider}) Subtítulo encontrado para ${subtitleGroup}`)

        await setMovieSubtitlesToDatabase({
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
      }
      catch (error) {
        console.log(`4.${index}.${indexSubtitleProvider}) Subtítulo no encontrado en ${name} \n`)
      }
    }

    await confirm({ message: `¿Desea continuar?` })
    console.log('\n------------------------------\n')
  }

  console.log(`4.${index}) Pasando la siguiente película... \n`)
  console.log('------------------------------ \n')
}

// core -> NEW FLOW : TMDB -> Torrent-search-api -> Indexer -> DB
async function mainIndexer(): Promise<void> {
  try {
    // 1. Get release and subtitle groups from DB
    const releaseGroups = await getReleaseGroups(supabase)
    const subtitleGroups = await getSubtitleGroups(supabase)

    // 2. Get all movie pages from TMDB
    const totalPagesArray = await getTmdbMoviesTotalPagesArray()
    console.log(`\n1) Total de páginas (con ${20} pelis c/u) de TMDB`, totalPagesArray.at(-1), '\n')

    for await (const tmbdMoviesPage of totalPagesArray) {
      console.log(`2) Buscando en página ${tmbdMoviesPage} de TMDB \n`)

      // 3. Get movies from TMDB
      const movies = await getMoviesFromTmdb(tmbdMoviesPage)
      console.log(`3) Películas encontradas en página ${tmbdMoviesPage} \n`)
      console.table(movies)
      console.log('\n')

      for await (const [index, movie] of Object.entries(movies)) {
        // 4. Get subtitles from each movie
        await getSubtitlesFromMovie(index, movie, releaseGroups, subtitleGroups)
      }
    }
  }
  catch (error) {
    console.log('\n ~ mainIndexer ~ error message:', (error as Error).message)
  }
}

mainIndexer()
