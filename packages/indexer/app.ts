/* eslint-disable no-console */
import { Buffer } from 'node:buffer'

import fs from 'node:fs'
import path from 'node:path'
import turl from 'turl'
import sound from 'sound-play'
import download from 'download'
import extract from 'extract-zip'
import { match } from 'ts-pattern'
import clipboard from 'clipboardy'
import unrar from '@continuata/unrar'
import invariant from 'tiny-invariant'
import prettyBytes from 'pretty-bytes'
import { confirm } from '@clack/prompts'

import { type Movie, supabase } from '@subtis/db'
import { VIDEO_FILE_EXTENSIONS, getMovieFileNameExtension, getMovieMetadata } from '@subtis/shared'

import tg from 'torrent-grabber'
import type { File } from 'torrent-stream'
import torrentStream from 'torrent-stream'

// internals
import { z } from 'zod'
import { getImdbLink } from './imdb'
import { getSubtitleAuthor } from './utils'
import type { SubtitleData } from './types'
import { type TmdbMovie, getMoviesFromTmdb, getTmdbMoviesTotalPagesArray } from './tmdb'
import { type ReleaseGroupMap, type ReleaseGroupNames, getReleaseGroups, saveReleaseGroupsToDb } from './release-groups'
import { type SubtitleGroupMap, type SubtitleGroupNames, getEnabledSubtitleProviders, getSubtitleGroups, saveSubtitleGroupsToDb } from './subtitle-groups'

// utils
async function setMovieSubtitlesToDatabase({
  file,
  movie,
  releaseGroup,
  releaseGroups,
  resolution,
  subtitle,
  subtitleGroup,
  subtitleGroups,
}: {
  file: {
    bytes: number
    fileName: string
    fileNameExtension: string
  }
  movie: Pick<Movie, 'id' | 'name' | 'rating' | 'release_date' | 'year'>
  releaseGroup: ReleaseGroupNames
  releaseGroups: ReleaseGroupMap
  resolution: string
  subtitle: SubtitleData
  subtitleGroup: SubtitleGroupNames
  subtitleGroups: SubtitleGroupMap
}): Promise<void> {
  try {
    const {
      downloadFileName,
      fileExtension,
      subtitleCompressedFileName,
      subtitleFileNameWithoutExtension,
      subtitleLink,
      subtitleSrtFileName,
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
          dest: extractedSubtitlePath,
          src: subtitleAbsolutePath,
          switches: ['-o+', '-idcd'],
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

    let srtFileToUpload: Buffer | unknown

    if (['rar', 'zip'].includes(fileExtension)) {
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
      contentType: 'text/plain;charset=UTF-8',
      upsert: true,
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

    let subtitleShortLink

    try {
      subtitleShortLink = await turl.shorten(subtitleLinkWithDownloadFileName)
    }
    catch (error) {
      subtitleShortLink = ''
    }

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

    const { bytes, fileName, fileNameExtension } = file

    // 16. Save subtitle to Supabase
    await supabase.from('Subtitles').insert({
      author,
      bytes: String(bytes),
      fileExtension: fileNameExtension,
      fileName,
      movieId: movie.id,
      releaseGroupId,
      resolution,
      subtitleFullLink,
      subtitleGroupId,
      subtitleShortLink,
    })

    // play sound when a subtitle was found
    console.log('\n✅ Subtítulo guardado en la base de datos!\n')

    const successSoundPath = path.join(__dirname, '..', 'indexer', 'success_short_high.wav')
    sound.play(successSoundPath)

    console.table(
      [{
        imdbLink: getImdbLink(movie.id),
        movie: movie.name,
        releaseGroup,
        resolution,
        subtitleGroup,
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
  isDebugging: boolean,
) {
  // 0. Create necessary folders if they do not exists
  const folders = ['subs', 'subtitles', 'torrents']

  folders.forEach((folder) => {
    const folderPath = path.join(__dirname, '..', 'indexer', folder)

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath)
    }
  })

  const { imdbId, rating, release_date, title, year } = movie

  // 1. Get first 10 movie torrents from ThePirateBay
  const TOTAL_MOVIES_TO_SEARCH = 10

  const torrents = await tg.search(`${movie.title} ${movie.year}`, {
    groupByTracker: false,

  })

  const cinemaRecordingsRegex = /hq-cam|telesync|hdts|hdcam/gi

  const torrentsWithoutCineRecordings = torrents.sort((torrentA, torrentB) => torrentB.seeds - torrentA.seeds).slice(0, TOTAL_MOVIES_TO_SEARCH).filter(({ title }) =>
    !cinemaRecordingsRegex.test(title),
  )

  if (!torrentsWithoutCineRecordings.length) {
    console.log(`4.${index}) No se encontraron torrents para la película "${title}" \n`)
    return
  }

  console.log(`4.${index}) Torrents encontrados para la pelicula "${title}" \n`)
  const subtitleProviderQuery = `${movie.title} ${year}`
  console.table(torrentsWithoutCineRecordings.map(({ seeds, size, title, tracker }) => ({ name: subtitleProviderQuery, seeds, size: prettyBytes(size ?? 0), title, tracker })))
  clipboard.writeSync(subtitleProviderQuery)
  console.log(`👉 Nombre de película ${subtitleProviderQuery} guardado en el clipboard, para poder pegar directamente en proveedor de subtitulos\n`)
  console.log('\n')

  // 2. Iterate over each torrent
  for await (const [index, torrentData] of Object.entries(torrentsWithoutCineRecordings)) {
    console.log(`4.${index}) Procesando torrent`, `"${torrentData.title}"`, '\n')

    const engine = torrentStream(torrentData.trackerId)

    const files = await new Promise<File[]>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        engine.destroy()
        reject(new Error('Timeout: Tardo más de 10s puede ser por falta de seeds'))
      }, 10000)

      engine.on('torrent', (data) => {
        clearTimeout(timeoutId)
        resolve(data.files)
      })
    })

    engine.destroy()

    if (files.length === 0) {
      console.log('No se encontraron archivos en el torrent', '\n')
      continue
    }

    // 6. Find video file
    const filesSortedByLength = files.toSorted((fileA, fileB) => fileB.length - fileA.length)

    const videoFile = filesSortedByLength.find((file) => {
      return VIDEO_FILE_EXTENSIONS.some((videoFileExtension) => {
        return file.name.endsWith(videoFileExtension)
      })
    })

    // 7. Return if no video file
    if (!videoFile) {
      continue
    }

    // 8. Get movie data from video file name
    const { length: bytes, name: fileName } = videoFile
    const fileNameExtension = getMovieFileNameExtension(fileName)
    const movieData = getMovieMetadata(fileName)

    if (!movieData) {
      console.log(`4.${index}) No se encontró metadata para la película "${title}" \n`)
      continue
    }

    const { releaseGroup, resolution } = movieData

    if (!releaseGroup) {
      console.log(`No hay release group soportado para ${videoFile.name} \n`)
      continue
    }

    console.table([{ fileName, name: movie.title, releaseGroup: releaseGroup.name, resolution, year }])

    if (releaseGroup.isSupported === false) {
      console.log('\n')
      if (isDebugging) {
        await confirm({
          message: `¿Desea continuar? El Release Group ${releaseGroup.name} no es soportado, se debería de agregar al indexador`,
        })
        console.log('\n')
      }
      continue
    }

    // TODO: Check if we can download subtitles from OpenSubitles
    // 9. Find subtitle metadata from SubDivx
    const enabledSubtitleProviders = getEnabledSubtitleProviders(subtitleGroups, ['SubDivX'])

    for await (const [indexSubtitleProvider, enabledSubtitleProvider] of Object.entries(enabledSubtitleProviders)) {
      const { getSubtitleFromProvider, id, name } = enabledSubtitleProvider

      try {
        console.log(`4.${index}.${indexSubtitleProvider}) Buscando subtítulo en ${name}`)

        const subtitle = await getSubtitleFromProvider({ imdbId, movieData })

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
          file: {
            bytes,
            fileName,
            fileNameExtension,
          },
          movie: {
            id: imdbId,
            name: title,
            rating,
            release_date,
            year,
          },
          releaseGroup: releaseGroup.name as ReleaseGroupNames,
          releaseGroups,
          resolution,
          subtitle,
          subtitleGroup,
          subtitleGroups,
        })
      }
      catch (error) {
        console.log(`4.${index}.${indexSubtitleProvider}) Subtítulo no encontrado en ${name} \n`)
      }
    }

    if (isDebugging) {
      await confirm({ message: `¿Desea continuar?` })
    }

    console.log('\n------------------------------\n')
  }

  console.log(`4.${index}) Pasando la siguiente película... \n`)
  console.log('------------------------------ \n')
}

// core
async function mainIndexer(moviesYear: number, isDebugging: boolean): Promise<void> {
  try {
    // 0. Activate ThePirateBay provider
    await tg.activate('ThePirateBay')

    // 1. Get release and subtitle groups from DB
    const releaseGroups = await getReleaseGroups(supabase)
    const subtitleGroups = await getSubtitleGroups(supabase)

    // 2. Get all movie pages from TMDB
    const { totalPages, totalResults } = await getTmdbMoviesTotalPagesArray(moviesYear, isDebugging)
    console.log(`\n1.1) Con un total de ${totalResults} películas en el año ${moviesYear}`)
    console.log(`\n1.2) ${totalPages.at(-1)} páginas (con ${20} pelis c/u), con un total de ${totalResults} películas en el año ${moviesYear}`, '\n')

    for await (const tmbdMoviesPage of totalPages) {
      console.log(`2) Buscando en página ${tmbdMoviesPage} de TMDB \n`)

      // 3. Get movies from TMDB
      const movies = await getMoviesFromTmdb(tmbdMoviesPage, moviesYear, isDebugging)
      console.log(`3) Películas encontradas en página ${tmbdMoviesPage} \n`)

      console.table(movies)
      console.log('\n')

      for await (const [index, movie] of Object.entries(movies)) {
        if (isDebugging) {
          const value = await confirm({
            message: `¿Desea skippear la película ${movie.title}?`,
          })

          if (value === true) {
            continue
          }
        }

        try {
          // 4. Get subtitles from each movie
          await getSubtitlesFromMovie(index, movie, releaseGroups, subtitleGroups, isDebugging)
        }
        catch (error) {
          console.log('mainIndexer => getSubtitlesFromMovie error =>', error)
          console.error('Ningún subtítulo encontrado para la película', movie.title)
        }
      }
    }
  }
  catch (error) {
    console.log('mainIndexer => error =>', error)
    console.log('\n ~ mainIndexer ~ error message:', (error as Error).message)
  }
}

mainIndexer(2023, true)
saveReleaseGroupsToDb(supabase)
saveSubtitleGroupsToDb(supabase)
