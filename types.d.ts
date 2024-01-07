/// <reference types="node" />

declare module 'turl' {
  export function shorten(url: string): Promise<string>
}
declare module 'parse-torrent-updated' {
  export default function parseTorrent(torrentFile: Buffer): { // eslint-disable-line node/prefer-global/buffer
    files: { path: string, name: string, length: number, offset: number }[]
  }
}
