import { z } from 'zod'
import slugify from 'slugify'
import invariant from 'tiny-invariant'

// shared
import type { MovieData } from '@subtis/shared'

// internals
import { getIsLinkAlive } from './utils'
import type { SubtitleData } from './types'
import { SUBTITLE_GROUPS } from './subtitle-groups'

// constants
const SUBDIVX_BASE_URL = 'https://subdivx.com' as const
const SUBDIVX_BREADCRUMB_ERROR = 'SUBDIVX_ERROR' as const

// schemas
const subdivxSubtitleSchema = z.object({
  calificacion: z.string().optional(),
  cds: z.number(),
  comentarios: z.number(),
  descargas: z.number(),
  descripcion: z.string(),
  eliminado: z.union([z.literal(0), z.literal(1)]),
  fecha: z.string().optional(),
  formato: z.string(),
  fotos: z.string(),
  framerate: z.string(),
  id: z.number(),
  idmoderador: z.number(),
  nick: z.string(),
  promedio: z.string(),
  titulo: z.string(),
})

const subdivxSchema = z.object({
  aaData: z.array(subdivxSubtitleSchema),
  iTotalDisplayRecords: z.number(),
  iTotalRecords: z.number(),
  sEcho: z.string(),
})

// core
export async function getSubDivXSubtitle({ movieData }: {
  movieData: MovieData
  page?: string
}): Promise<SubtitleData> {
  const { fileNameWithoutExtension, name, releaseGroup, resolution, searchableMovieName }
      = movieData

  if (!releaseGroup) {
    throw new Error('release group undefined')
  }

  const response = await fetch(`${SUBDIVX_BASE_URL}/inc/ajax.php`, {
    body: `tabla=resultados&filtros=&buscar=${searchableMovieName}`,
    headers: { 'content-type': 'application/x-www-form-urlencoded; charset=UTF-8' },
    method: 'POST',
  })

  const data = await response.json()
  const subtitles = subdivxSchema.parse(data)

  // TODO: Usar este codigo si el indexador descarga subtitulos de español españa por sobre español latino
  // const sortedSubtitlesByDownloadsAndComments = subtitles.aaData.sort((a, b) => {
  //   const aDownloads = a.descargas
  //   const bDownloads = b.descargas

  //   const aComments = a.comentarios
  //   const bComments = b.comentarios

  //   return bDownloads - aDownloads || bComments - aComments
  // })

  const subtitle = subtitles.aaData.find((subtitle) => {
    const movieDescription = subtitle.descripcion.toLowerCase()

    const hasMovieResolution = movieDescription.includes(resolution)
    const hasReleaseGroup = releaseGroup.searchableSubDivXName.some((searchableSubDivXName) => {
      return movieDescription.includes(searchableSubDivXName.toLowerCase())
    })

    return hasMovieResolution && hasReleaseGroup
  })

  invariant(subtitle, `[${SUBDIVX_BREADCRUMB_ERROR}]: Subtitle doesn't exists`)

  const subtitleRarLink = `${SUBDIVX_BASE_URL}/sub9/${subtitle.id}.rar`
  const subtitleZipLink = `${SUBDIVX_BASE_URL}/sub9/${subtitle.id}.zip`

  const isRarLinkAlive = await getIsLinkAlive(subtitleRarLink)
  const isZipLinkAlive = await getIsLinkAlive(subtitleZipLink)

  invariant(isRarLinkAlive || isZipLinkAlive, `[${SUBDIVX_BREADCRUMB_ERROR}]: Subtitle link should be alive`)

  const subtitleGroup = SUBTITLE_GROUPS.SUBDIVX.name
  const fileExtension = isRarLinkAlive ? 'rar' : 'zip'
  const subtitleLink = isRarLinkAlive ? subtitleRarLink : subtitleZipLink

  const subtitleSrtFileName = slugify(`${name}-${resolution}-${releaseGroup.name}-${subtitleGroup}.srt`).toLowerCase()
  const downloadFileName = `${fileNameWithoutExtension}.srt`

  const subtitleFileNameWithoutExtension = slugify(
      `${name}-${resolution}-${releaseGroup.name}-${subtitleGroup}`,
  ).toLowerCase()
  const subtitleCompressedFileName = slugify(
      `${name}-${resolution}-${releaseGroup.name}-${subtitleGroup}.${fileExtension}`,
  ).toLowerCase()

  return {
    downloadFileName,
    fileExtension,
    subtitleCompressedFileName,
    subtitleFileNameWithoutExtension,
    subtitleGroup,
    subtitleLink,
    subtitleSrtFileName,
  }
}
