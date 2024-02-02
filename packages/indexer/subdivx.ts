import { JSDOM } from 'jsdom'
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

// utils

export function getSubDivXSearchParams(
  movieName: string,
  page = '1',
): {
    accion: string
    buscar2: string
    masdesc: string
    oxdown: string
    pg: string
    realiza_b: string
    subtitulos: string
  } {
  return {
    accion: '5',
    buscar2: movieName,
    masdesc: '',
    oxdown: '1',
    pg: page,
    realiza_b: '1',
    subtitulos: '1',
  }
}

export function getSubDivXSearchUrl(movieName: string): string {
  const urlSearchParams = new URLSearchParams({ accion: '5', buscar2: movieName })
  return `${SUBDIVX_BASE_URL}/index.php?${urlSearchParams}`
}

export async function getSubDivXSearchPageHtml(movieName: string, page = '1'): Promise<string> {
  const searchParams = getSubDivXSearchParams(movieName, page)
  const urlSearchParams = new URLSearchParams(searchParams)

  const response = await fetch(`${SUBDIVX_BASE_URL}/index.php`, {
    body: urlSearchParams,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    method: 'POST',
  })

  const html = await response.text()
  return html
}

export async function getSubDivXSubtitleDownloadLink(subtitlePage: string): Promise<string> {
  const response = await fetch(subtitlePage)
  const html = await response.text()

  const dom = new JSDOM(html)
  const document = dom.window.document

  const anchor = document.querySelector('.link1')
  invariant(anchor, `[${SUBDIVX_BREADCRUMB_ERROR}]: Link should be defined`)

  const href = anchor.getAttribute('href')
  const subtitleLink = `${SUBDIVX_BASE_URL}/${href}`

  return subtitleLink
}

// core
export async function getSubDivXSubtitle({ movieData, page = '1' }: {
  movieData: MovieData
  page?: string
}): Promise<SubtitleData> {
  const { fileNameWithoutExtension, name, releaseGroup, resolution, searchableMovieName }
    = movieData
  if (!releaseGroup) {
    throw new Error('release group undefined')
  }
  const { searchableSubDivXName } = releaseGroup

  const subtitlePageHtml = await getSubDivXSearchPageHtml(searchableMovieName, page)

  const dom = new JSDOM(subtitlePageHtml)
  const document = dom.window.document

  const allSubtitlesElements = [...document.querySelectorAll('#buscador_detalle')]
  invariant(allSubtitlesElements.length > 0, `[${SUBDIVX_BREADCRUMB_ERROR}]: There should be at least one subtitle`)

  const value = allSubtitlesElements.find((element) => {
    const movieDetail = element.textContent?.toLowerCase()
    return movieDetail?.includes(searchableSubDivXName.toLowerCase()) && movieDetail?.includes(resolution)
  })

  const previousSibling = value?.previousSibling as Element
  invariant(previousSibling, `[${SUBDIVX_BREADCRUMB_ERROR}]: Subtitle Element should exist`)

  if (allSubtitlesElements.length > 90) {
    // Iterate to next pages until find the subtitle or no more results
    // The recursion will break loop on line 185
    return getSubDivXSubtitle({ movieData, page: String(Number(page) + 1) })
  }

  const hrefElement = previousSibling.querySelector('.titulo_menu_izq')
  invariant(hrefElement, `[${SUBDIVX_BREADCRUMB_ERROR}]: Anchor element should be defined`)

  const subtitleHref = hrefElement.getAttribute('href')
  invariant(subtitleHref, `[${SUBDIVX_BREADCRUMB_ERROR}]: Subtitle page link should be defined`)

  const subtitleDownloadLink = await getSubDivXSubtitleDownloadLink(subtitleHref)

  // compressed file link
  const subtitleId = new URL(subtitleDownloadLink).searchParams.get('id')

  const subtitleRarLink = `${SUBDIVX_BASE_URL}/sub9/${subtitleId}.rar`
  const subtitleZipLink = `${SUBDIVX_BASE_URL}/sub9/${subtitleId}.zip`

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
