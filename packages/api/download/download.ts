import { z } from 'zod'
import type { Context } from 'elysia'

// db
import { supabase } from '@subtis/db'

// shared
import { videoFileNameSchema } from 'shared/movie'

// internals
import { errorSchema } from '../shared'

// schemas
const okResponse = z.object({ ok: z.boolean() })
const responseSchema = z.union([okResponse, errorSchema])

// types
type Response = z.infer<typeof responseSchema>

// core
export async function getDownloadFromFileName({
  set,
  body,
}: {
  set: Context['set']
  body: { fileName: string }
}): Promise<Response> {
  const videoFileName = videoFileNameSchema.safeParse(body.fileName)
  if (!videoFileName.success) {
    set.status = 415
    return { message: videoFileName.error.issues[0].message }
  }

  await supabase.rpc('update_subtitle_info', { file_name: videoFileName.data })

  return { ok: true }
}
