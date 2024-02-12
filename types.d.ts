/// <reference types="node" />

declare module 'bun' {
  interface Env {
    NODE_ENV: string
    OPEN_SUBTITLES_API_KEY: string
    PUBLIC_API_BASE_URL_DEVELOPMENT: string
    PUBLIC_API_BASE_URL_PRODUCTION: string
    SUPABASE_API_KEY: string
    SUPABASE_BASE_URL: string
    TMDB_API_KEY: string
  }
}

declare module 'turl' {
  export function shorten(url: string): Promise<string>
}

declare module 'parse-torrent-updated' {
  export default function parseTorrent(torrentFile: Buffer): {
    files: { length: number, name: string, offset: number, path: string }[]
  }
}

declare module 'torrent-grabber' {
  interface SearchResult {
    seeds: number
    size: number
    title: string
    tracker: string
    trackerId: string
  }

  interface SearchOptions {
    groupByTracker: boolean
  }

  class TorrentEngine {
    activate(...torrents: ([string, TorrentCredentials] | string)[]): Promise<string[]>
    search(query: string, opts?: SearchOptions): Promise<SearchResult[]>
  }

  export = new TorrentEngine()
}

declare module 'torrent-stream' {
  export interface File {
    length: number
    name: string
    offset: number
    path: string
  }

  interface TorrentData {
    announce?: string[]
    files: File[]
    infoBuffer?: Buffer
    infoHash?: string
    lastPieceLength?: number
    length?: number
    name?: string
    pieceLength?: number
    pieces?: string[]
    urlList?: string[]

  }

  interface Engine extends EventEmitter {
    destroy: (cb?: (err?: Error) => void) => void
    on: (event: 'torrent', listener: (data: TorrentData) => void) => this
  }

  function torrentStream(link: Buffer | string | torrentStream.Torrent, opts?: TorrentStreamOptions, cb?: (engine: Engine) => void): Engine

  export = torrentStream
}
