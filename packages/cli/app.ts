import { z } from 'zod';
import minimist from 'minimist';
import invariant from 'tiny-invariant';
import { intro, outro, spinner } from '@clack/prompts';

// internals
import { getSubtitleFromFileName } from './api';

// shared
import { getFilenameFromPath, getVideoFileExtension } from 'shared/movie';
import { getIsInvariantError, getParsedInvariantMessage } from 'shared/invariant';

// schemas
const cliArgumentsSchema = z.object({ file: z.string() });

// core
async function cli(): Promise<void> {
  // 1. Initialize loader
  const loader = spinner();

  try {
    // 2. Display intro
    intro('🤗 Hola, soy Subtis CLI');

    // 3. Get cli arguments
    const cliArguments = minimist(Bun.argv);

    // 4. Parse with zod
    const { file } = cliArgumentsSchema.parse(cliArguments);

    // 5. Sanitize filename
    const fileName = getFilenameFromPath(file);
    invariant(fileName, 'Parámetro --file no provisto. Prueba con "--file [archivo]".');

    // 6. Checks if file is a video
    const videoFileExtension = getVideoFileExtension(fileName);
    invariant(videoFileExtension, 'Extension de video no soportada. Prueba con otro archivo.');

    // 8. Display loader
    loader.start(`🔎 Buscando subtitulos`);

    // 9. Fetch subtitle link from API
    const { data } = await getSubtitleFromFileName(fileName);

    // 10. Throw error if subtitle not found
    invariant(data !== null && !('message' in data), 'No se encontró ningún subtítulo. Prueba con otro archivo.');

    // 11. Stop loader and display subtitle link
    loader.stop(`🥳 Descarga tu subtítulo del siguiente link: ${data.subtitleShortLink}`);

    // 12. Display outro
    outro(`🍿 Disfruta de ${data.Movies?.name} (${data.Movies?.year}) en ${data.resolution} subtitulada`);
  } catch (error) {
    loader.stop();

    const parsedError = error as Error;
    const isInvariantError = getIsInvariantError(parsedError);

    if (!isInvariantError) {
      return outro(`🔴 ${parsedError.message}`);
    }

    const errorMessage = getParsedInvariantMessage(parsedError);
    outro(`😢 ${errorMessage}`);
  }
}

cli();
