import { z } from 'zod';
import { type Context } from 'elysia';
import invariant from 'tiny-invariant';

// db
import { type Subtitle, supabase } from 'db';

// shared
import { getVideoFileExtension } from 'shared/movie';
import { getIsInvariantError, getParsedInvariantMessage } from 'shared/invariant';

// types
type ApiErrorResponse = { message: string };

// schemas
const errorSchema = z.object({
  status: z.number(),
  message: z.string(),
});

// constants
const cache = new Map<string, Subtitle>();

// core
export async function getSubtitleFromFileName({
  set,
  body,
}: {
  set: Context['set'];
  body: { fileName: string };
}): Promise<Subtitle | ApiErrorResponse> {
  try {
    const { fileName } = body;

    // 1. Checks if file is a video
    const videoFileExtension = getVideoFileExtension(fileName);
    invariant(videoFileExtension, JSON.stringify({ message: 'File extension not supported', status: 415 }));

    // 2. Check if file exists in cache
    const subtitleInCache = cache.get(fileName);

    // 3. Return subtitle from cache if exists
    if (subtitleInCache) {
      return subtitleInCache;
    }

    // 4. Get subtitle from database
    const { data, statusText } = await supabase.from('Subtitles').select('*').eq('fileName', fileName);

    // 5. Throw error if subtitles not found
    invariant(
      statusText === 'OK' && data && data.length > 0,
      JSON.stringify({ message: 'Subtitles not found for file', status: 404 }),
    );

    // 6. Get subtitle link from array
    const [subtitle] = data;

    // 7. Save subtitle in cache
    cache.set(fileName, subtitle);

    // 8. Return subtitle link
    return subtitle;
  } catch (error) {
    const parsedError = error as Error;
    const isInvariantError = getIsInvariantError(parsedError);

    if (!isInvariantError) {
      throw new Error(parsedError.message);
    }

    const invariantMessage = getParsedInvariantMessage(parsedError);
    const rawError = JSON.parse(invariantMessage);
    const { status, message } = errorSchema.parse(rawError);

    set.status = status;
    return { message };
  }
}
