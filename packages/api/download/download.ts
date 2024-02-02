import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from '@subtis/db'

// shared
import { videoFileNameSchema } from '@subtis/shared'

// internals
import { errorSchema } from '../shared'

// schemas
const okResponse = z.object({ ok: z.boolean() })
const responseSchema = z.union([okResponse, errorSchema])

// types
type Response = z.infer<typeof responseSchema>

// core
export async function getDownloadFromFileName({
  body,
  set,
}: {
  body: { fileName: string }
  set: Context['set']
}): Promise<Response> {
  const videoFileName = videoFileNameSchema.safeParse(body.fileName)
  if (!videoFileName.success) {
    set.status = 415
    return { message: videoFileName.error.issues[0].message }
  }

  await supabase.rpc('update_subtitle_info', { file_name: videoFileName.data })

  return { ok: true }
}
