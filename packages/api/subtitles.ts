import { z } from 'zod';
import invariant from 'tiny-invariant';

// db
import { supabase, Subtitle } from 'db';

// shared
import { getVideoFileExtension } from 'shared/movie';
import { INVARIANT_ERROR, getParsedInvariantMessage } from 'shared/invariant';

// schemas
const errorSchema = z.object({
  status: z.number(),
  message: z.string(),
});

// constants
const cache = new Map<string, Subtitle>();

// core fn
export async function getSubtitleFromFileName({
  body,
  set,
}: {
  body: { fileName: string };
  set: any;
}): Promise<Subtitle> {
  try {
    const { fileName } = body;

    // 1. Checks if file is a video
    const videoFileExtension = getVideoFileExtension(fileName);
    invariant(
      videoFileExtension,
      JSON.stringify({ message: `Video file extension not supported: ${fileName}`, status: 415 }),
    );

    // 2. Check if file exists in cache
    const subtitleInCache = cache.get(fileName);

    // 3. Return subtitle link from cache if exists
    if (subtitleInCache) {
      return subtitleInCache;
    }

    // 4. Get subtitle from database
    const { data, statusText } = await supabase.from('Subtitles').select('*').eq('fileName', fileName);

    // 5. Throw error if subtitles not found
    invariant(
      statusText === 'OK' && data && data.length > 0,
      JSON.stringify({ message: `Subtitles not found for file: ${fileName}`, status: 404 }),
    );

    // 6. Get subtitle link from array
    const [subtitle] = data;

    // 7. Save subtitle in cache
    cache.set(fileName, subtitle);

    // 8. Return subtitle link
    return subtitle;
  } catch (error) {
    const parsedError = error as Error;

    if (!parsedError.message.includes(INVARIANT_ERROR)) {
      throw new Error(parsedError.message);
    }

    const invariantMessage = getParsedInvariantMessage(parsedError);
    const rawError = JSON.parse(invariantMessage);
    const { status, message } = errorSchema.parse(rawError);

    set.status = status;
    throw new Error(message);
  }
}
