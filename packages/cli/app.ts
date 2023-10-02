import { z } from 'zod';
import turl from 'turl';
import delay from 'delay';
import minimist from 'minimist';
import invariant from 'tiny-invariant';
import { intro, outro, spinner } from '@clack/prompts';

// shared
import { getSubtitleLink } from 'shared/api';
import { getIsInvariantMessage, getParsedInvariantMessage } from 'shared/invariant';
import { getFilenameFromPath, getMovieData, getVideoFileExtension } from 'shared/movie';

// schemas
const cliArgumentsSchema = z.object({ file: z.string() });

// core
async function cli(): Promise<void> {
  // 1. Initialize loader
  const loader = spinner();

  try {
    // 2. Display intro
    intro('➖ Subtis CLI');

    // 3. Get cli arguments
    const cliArguments = minimist(Bun.argv);

    // 4. Parse with zod
    const { file } = cliArgumentsSchema.parse(cliArguments);

    // 5. Sanitize filename
    const fileName = getFilenameFromPath(file);
    invariant(fileName, 'File name not provided');

    // 6. Checks if file is a video
    const videoFileExtension = getVideoFileExtension(fileName);
    invariant(videoFileExtension, `Video file extension not supported: ${fileName}`);

    // 7. Get movie data
    const { name, resolution, releaseGroup, year } = getMovieData(fileName);

    // 8. Display loader
    loader.start(`🔎 Searching "${name}" subtitle from ${year} in ${resolution} by ${releaseGroup} release group`);

    // 9. Wait for 3.5s so user can properly read loader message, and fetch subtitle link from API
    const [_, { data, error }] = await Promise.all([
      delay(3500),
      getSubtitleLink(fileName, {
        isProduction: process.env.NODE_ENV === 'production',
        apiBaseUrlProduction: process.env.PUBLIC_API_BASE_URL_PRODUCTION,
        apiBaseUrlDevelopment: process.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
      }),
    ]);

    // 10. Throw error if subtitle not found
    invariant(data !== null, error);

    // 11. Short subtitle link
    const subtitleShortLink = await turl.shorten(data.subtitleLink);

    // 12. Stop loader and display subtitle link
    loader.stop(`🥳 Download your subtitle: ${subtitleShortLink}`);

    // 13. Display outro
    outro('🍿 Enjoy your movie!');
  } catch (error) {
    loader.stop();
    const parsedError = error as Error;

    if (!getIsInvariantMessage(parsedError)) {
      return outro(`🔴 ${parsedError.message}`);
    }

    const errorMessage = getParsedInvariantMessage(parsedError);
    outro(`🔴 ${errorMessage}`);
  }
}

cli();
