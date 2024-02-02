/// <reference types="node" />

declare module 'turl' {
  export function shorten(url: string): Promise<string>
}
declare module 'parse-torrent-updated' {
  export default function parseTorrent(torrentFile: Buffer): {
    files: { length: number, name: string, offset: number, path: string }[]
  }
}
