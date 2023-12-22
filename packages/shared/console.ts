// TODO: Remove this file when console.table is fully supported in Bun

import { Console } from 'node:console'
import { Transform } from 'node:stream'

const ts = new Transform({ transform(chunk, _, cb) {
  cb(null, chunk)
} })
const logger = new Console({ stdout: ts })

function getTable(data: any) {
  logger.table(data)
  const table = (ts.read() || '').toString()
  // eslint-disable-next-line no-console
  console.log(table)
}

// eslint-disable-next-line no-console
console.table = getTable
