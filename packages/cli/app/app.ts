import { z } from 'zod'
import chalk from 'chalk'
import minimist from 'minimist'
import { intro, outro, spinner } from '@clack/prompts'

// shared
import { getMessageFromStatusCode } from 'shared/error-messages'
import { videoFileNameSchema } from 'shared/movie'

// cli
import { apiClient } from '@subtis/cli/api'

// schemas
const cliArgumentsSchema = z.union([
  z.object({
    f: z.string({
      invalid_type_error: '🤔 El valor de -f debe ser una ruta de archivo válida.',
    }),
  }),
  z.object({
    file: z.string({
      invalid_type_error: '🤔 El valor de --file debe ser una ruta de archivo válida.',
    }),
  }),
], {
  invalid_type_error: '🤔 Debe proporcionar o bien --file [archivo] o bien -f [archivo].',
})

// core
export async function runCli(): Promise<void> {
  const loader = spinner()

  try {
    intro(`👋 Hola, soy ${chalk.magenta('Subtis')}`)

    const cliArgumentsResult = cliArgumentsSchema.safeParse(minimist(Bun.argv))
    if (!cliArgumentsResult.success) {
  	 	 return outro(chalk.yellow(cliArgumentsResult.error.message))
    }
    const cliArguments = cliArgumentsResult.data

    const fileNameResult = videoFileNameSchema.safeParse(
      'file' in cliArguments
        ? cliArguments.file
        : cliArguments.f,
    )
    if (!fileNameResult.success) {
  	 	 return outro(chalk.yellow(fileNameResult.error.message))
    }
    const fileName = fileNameResult.data

    loader.start('🔎 Buscando subtitulos')

    const { data, status } = await apiClient.v1.subtitle.post({ fileName })
    if (data === null || 'message' in data) {
      const { title, description } = getMessageFromStatusCode(status)
      loader.stop(`😥 ${title}`)
      return outro(`⛏ ${description}`)
    }

    loader.stop(`🥳 Descarga tu subtítulo en ${chalk.blue(data.subtitleShortLink)}`)
    outro(`🍿 Disfruta de ${chalk.bold(`${data.Movies?.name} (${data.Movies?.year})`)} en ${chalk.italic(data.resolution)} subtitulada`)
  }
  catch (error) {
    if (error instanceof Error) {
      outro(chalk.red(`🔴 ${error.message}`))
    }
  }
  finally {
    process.exit()
  }
}
