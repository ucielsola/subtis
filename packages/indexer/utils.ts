import crypto from 'node:crypto'
import type { Buffer } from 'node:buffer'
import parseTorrent from 'parse-torrent-updated'

export async function getIsLinkAlive(link: string): Promise<boolean> {
  const { ok } = await fetch(link, { method: 'HEAD' })
  return ok
}

export function getNumbersArray(length: number): number[] {
  return Array.from({ length }, (_, index) => index + 1)
}

export function getRandomDelay(
  min = 5,
  max = 15,
): {
    seconds: number
    miliseconds: number
  } {
  const seconds = Math.floor(Math.random() * (max - min + 1) + min)
  return { seconds, miliseconds: seconds * 1000 }
}

export function getFileNameHash(fileName: string): string {
  return crypto.createHash('md5').update(fileName).digest('hex')
}

export function safeParseTorrent(torrentFile: Buffer, torrentFilename: string): {
  files: { path: string; name: string; length: number; offset: number }[]
} {
  try {
    return parseTorrent(torrentFile) as {
      files: { path: string; name: string; length: number; offset: number }[]
    }
  }
  catch (error) {
    console.error(`No se pudo parsear el torrent ${torrentFilename} \n`)
    return { files: [] }
  }
}
