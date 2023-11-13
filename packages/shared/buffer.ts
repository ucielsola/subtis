import { Buffer } from 'node:buffer'
import { z } from 'zod'

export const bufferSchema = z.instanceof(Buffer)
