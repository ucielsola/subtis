/* eslint-disable no-console */
import { Console } from 'node:console'
import { Transform, type TransformCallback } from 'node:stream'

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

export function polyfillConsoleTable(): void {
  console.table = getTable
}
