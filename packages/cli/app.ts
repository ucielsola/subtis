import { z } from 'zod'
import minimist from 'minimist'
import { intro, outro, spinner } from '@clack/prompts'

// shared
import { getZodError } from 'shared/zod'
import { getMessageFromStatusCode } from 'shared/error-messages'
import { getFilenameFromPath, getVideoFileExtension } from 'shared/movie'

// cli
import { getSubtitleFromFileName } from '@subtis/cli/api'

// schemas
const cliArgumentsSchema = z.object({
  f: z.string({
    invalid_type_error: '🤔 El valor de --f debe ser una ruta de archivo válida',
  }).optional(),
  file: z.string({
    invalid_type_error: '🤔 El valor de --file debe ser una ruta de archivo válida',
  }).optional(),
})
  .refine(data => data.f || data.file, {
    message: '🤔 Debe proporcionar o bien --file [archivo] o bien -f [archivo].',
  })
  .refine((data) => {
    if (data.file && !getVideoFileExtension(data.file)) {
      return false
    }

    if (data.f && !getVideoFileExtension(data.f)) {
      return false
    }

    return true
  }, {
    message: '🤔 Extension de video no soportada. Prueba con otro archivo.',
  })

// core
async function cli(): Promise<void> {
  // 1. Initialize loader
  const loader = spinner()

  try {
    // 2. Display intro
    intro('🤗 Hola, soy Subtis CLI')

    // 3. Get cli arguments
    const cliRawArguments = minimist(Bun.argv)

    // 4. Parse with zod
    const cliArguments = cliArgumentsSchema.parse(cliRawArguments)

    // 5. Sanitize filename
    const fileName = getFilenameFromPath(cliArguments.f ?? cliArguments.file ?? '')

    // 8. Display loader
    loader.start(`🔎 Buscando subtitulos`)

    // 9. Fetch subtitle link from API
    const { data, status } = await getSubtitleFromFileName(fileName)

    // 10. Display error message if status is not 200
    if (data === null || 'message' in data) {
      const { title, description } = getMessageFromStatusCode(status)
      loader.stop(`😥 ${title}`)
      return outro(`⛏ ${description}`)
    }

    // 11. Stop loader and display subtitle link
    loader.stop(`🥳 Descarga tu subtítulo del siguiente link: ${data.subtitleShortLink}`)

    // 12. Display outro
    outro(`🍿 Disfruta de ${data.Movies?.name} (${data.Movies?.year}) en ${data.resolution} subtitulada`)
  }
  catch (error) {
    const nativeError = error as Error
    const zodError = getZodError(nativeError)

    if (zodError) {
      return outro(zodError)
    }

    return outro(`🔴 ${nativeError.message}`)
  }
}

cli()
