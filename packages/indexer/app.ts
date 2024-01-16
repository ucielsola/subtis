/* eslint-disable no-console */
import { Buffer } from 'node:buffer'

import fs from 'node:fs'
import path from 'node:path'
import { Console } from 'node:console'
import { Transform, type TransformCallback } from 'node:stream'
import turl from 'turl'
import sound from 'sound-play'
import download from 'download'
import tg from 'torrent-grabber'
import extract from 'extract-zip'
import { match } from 'ts-pattern'
import clipboard from 'clipboardy'
import unrar from '@continuata/unrar'
import invariant from 'tiny-invariant'
import prettyBytes from 'pretty-bytes'
import { confirm } from '@clack/prompts'
import torrentStream from 'torrent-stream'

import { type Movie, supabase } from '@subtis/db'

// shared
// TODO: Remove this file when console.table is fully supported in Bun
import 'shared/console'

// internals
import { z } from 'zod'
import { VIDEO_FILE_EXTENSIONS, getMovieFileNameExtension, getMovieMetadata } from '@subtis/shared'
import { getImdbLink } from './imdb'
import { getSubtitleAuthor } from './utils'
import type { SubtitleData } from './types'
import { getSubDivXSearchUrl } from './subdivx'
import { type TmdbMovie, getMoviesFromTmdb, getTmdbMoviesTotalPagesArray } from './tmdb'
import { type ReleaseGroupMap, type ReleaseGroupNames, getReleaseGroups } from './release-groups'
import { type SubtitleGroupMap, type SubtitleGroupNames, getEnabledSubtitleProviders, getSubtitleGroups } from './subtitle-groups'

const ts = new Transform({
  transform(chunk: unknown, _bufferEncoding: BufferEncoding, cb: TransformCallback) {
    cb(null, chunk)
  },
})
const logger = new Console({ stdout: ts })

function getTable(data: Array<Record<string, unknown>>): void {
  logger.table(data)
  const table = (ts.read() || '').toString() as string

  console.log(table)
}

console.table = getTable

// utils
async function setMovieSubtitlesToDatabase({
  subtitle,
  movie,
  fileName,
  resolution,
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
    const bufferSchema = z.instanceof(Buffer)
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

    console.table(
      [{
        movie: movie.name,
        resolution,
        releaseGroup,
        subtitleGroup,
        imdbLink: getImdbLink(movie.id),
        subtitleLink: `${subtitleLink.slice(0, 100)}...`,
      }],
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
  // 0. Create necessary folders if they do not exists
  const folders = ['subs', 'subtitles', 'torrents']

  folders.forEach((folder) => {
    const folderPath = path.join(__dirname, '..', 'indexer', folder)

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath)
    }
  })

  const { year, rating, imdbId, title } = movie

  // 1. Get first 5 movie torrents from ThePirateBay
  const TOTAL_MOVIES_TO_SEARCH = 5

  const torrents = await tg.search(`${movie.title} ${movie.year}`, {
    groupByTracker: false,
  })

  const torrentsWithoutCineRecordings = torrents.sort((torrentA, torrentB) => torrentB.seeds - torrentA.seeds).slice(0, TOTAL_MOVIES_TO_SEARCH).filter(({ title }) =>
    !/hq-cam|telesync|hdts/gi.test(title),
  )

  console.log(`4.${index}) Torrents encontrados para la pelicula "${title}" \n`)
  const subtitleProviderQuery = `${movie.title} ${year}`
  console.table(torrentsWithoutCineRecordings.map(({ tracker, size, title }) => ({ name: subtitleProviderQuery, title, tracker, size: prettyBytes(size) })))
  clipboard.writeSync(subtitleProviderQuery)
  console.log(`👉 Nombre de película ${subtitleProviderQuery} guardado en el clipboard, para poder pegar directamente en proveedor de subtitulos\n`)
  console.log(`👉 Clickea en el link para chequear en SubDivX ${getSubDivXSearchUrl(subtitleProviderQuery)}`)
  console.log('\n')

  // 2. Iterate over each torrent
  for await (const [index, torrentData] of Object.entries(torrentsWithoutCineRecordings)) {
    console.log(`4.${index}) Procesando torrent`, `"${torrentData.title}"`, '\n')

    const engine = torrentStream(torrentData.trackerId)
    const { files } = await new Promise((resolve) => {
      engine.on('torrent', (data) => {
        resolve(data)
      })
    })

    engine.destroy()

    if (files.length === 0) {
      console.log('No se encontraron archivos en el torrent', '\n')
      continue
    }

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

    if (!movieData) {
      console.log(`4.${index}) No se encontró metadata para la película "${title}" \n`)
      continue
    }

    const { resolution, releaseGroup } = movieData

    if (!releaseGroup) {
      // TODO: handle how?
      throw new Error('release group undefined')
    }

    console.table([{ name: movie.title, year, fileName, resolution, releaseGroup }])

    if (releaseGroup.isSupported === false) {
      console.log('\n')
      await confirm({
        message: `¿Desea continuar? El Release Group ${releaseGroup} no es soportado, se debería de agregar al indexador`,
      })
      console.log('\n')
      continue
    }

    // TODO: Check if we can download subtitles from OpenSubitles
    // 9. Find subtitle metadata from SubDivx
    const enabledSubtitleProviders = getEnabledSubtitleProviders(subtitleGroups, ['SubDivX'])

    for await (const [indexSubtitleProvider, enabledSubtitleProvider] of Object.entries(enabledSubtitleProviders)) {
      const { id, name, getSubtitleFromProvider } = enabledSubtitleProvider

      try {
        console.log(`4.${index}.${indexSubtitleProvider}) Buscando subtítulo en ${name}`)

        const subtitle = await getSubtitleFromProvider({ movieData, imdbId })

        // 10. Check if subtitle already exists in DB
        if (subtitle) {
          const { data: subtitles } = await supabase
            .from('Subtitles')
            .select('*')
            .eq('fileName', fileName)
            .eq('subtitleGroupId', id)

          if (subtitles && subtitles.length) {
            console.log(`4.${index}.${indexSubtitleProvider}) Subtítulo ya existe en la base de datos para ${subtitle.subtitleGroup}`)
            continue
          }
        }

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
          fileNameExtension,
          releaseGroup: releaseGroup.name as ReleaseGroupNames,
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
    // 0. Activate ThePirateBay provider
    await tg.activate('ThePirateBay')

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
saveReleaseGroupsToDb(supabase)
