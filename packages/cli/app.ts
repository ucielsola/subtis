import { z } from 'zod';
import turl from 'turl';
import delay from 'delay';
import invariant from 'tiny-invariant';
import { intro, outro, spinner } from '@clack/prompts';

// shared
import { getSubtitleLink } from 'shared/api';
import { getMovieFileNameExtension, getMovieData } from 'shared/movie';

// cli
import { getCliArguments, getSanitizedPath } from './args';

// schemas
const cliArgumentsSchema = z.object({ '--file': z.string() });

// core fn
async function cli(fakeFileName?: string): Promise<void> {
  const loader = spinner();

  try {
    intro('➖ PoneleLosSubs - CLI');

    // 1. Get cli arguments
    const cliArguments = getCliArguments(process.argv);

    // 2. Parse with zod
    const { ['--file']: file } = cliArgumentsSchema.parse(cliArguments);

    // 3. Sanitize filename
    const fileName = fakeFileName ?? getSanitizedPath(file);
    invariant(fileName, 'File name not provided');

    // 4. Get movie data
    const { name, resolution, releaseGroup, year } = getMovieData(fileName);

    loader.start(
      `🔎 Searching subtitle for "${name}" from ${year} in ${resolution} for "${releaseGroup}" release group`,
    );
    await delay(600);

    // 5. Checks if file is a video
    getMovieFileNameExtension(fileName);

    // 6. Get subtitle link from API
    const { subtitleLink } = await getSubtitleLink(fileName);

    // 7. Short subtitle link
    const subtitleShortLink = await turl.shorten(subtitleLink);

    // 8. Stop loader and display subtitle link
    loader.stop(`🥳 Click on the following link to download your subtitle: ${subtitleShortLink}`);

    outro('🍿 Enjoy your movie!');
  } catch (error) {
    const errorMessage = (error as Error).message.slice(18);

    loader.stop();
    outro(`🔴 ${errorMessage}`);
  }
}

cli();
