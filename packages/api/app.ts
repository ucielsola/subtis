import invariant from 'tiny-invariant';

// db
import { supabase } from 'db';

// shared
import { getMovieFileNameExtension } from 'shared/movie';

// constants
const cache = new Map<string, string>();

// core fn
export async function fetchSubtitleLink(request: Request) {
  try {
    // 0. Get request information
    const { url, method } = request;

    // 1. Support only POST methods
    invariant(method === 'POST', `Invalid method: ${method}`);

    // 2. Support only /subtitles path
    const parsedUrl = new URL(url);
    invariant(parsedUrl.pathname === '/subtitles', `Invalid URL: ${url}`);

    // 3. Parse request body
    const { fileName } = (await request.json()) as { fileName: string | undefined };

    // 4. Check if fileName value exists
    invariant(fileName, 'File name not provided');

    // 5. Checks if file is a video
    getMovieFileNameExtension(fileName);

    // 6. Check if file exists in cache
    const subtitleInCache = cache.get(fileName);

    // 7. Return subtitle link from cache if exists
    if (subtitleInCache) {
      return new Response(JSON.stringify({ subtitleLink: subtitleInCache }), { status: 200 });
    }

    // 8. Check if file exists in database
    const { data: subtitles, statusText } = await supabase
      .from('Subtitles')
      .select('subtitleLink')
      .eq('fileName', fileName);

    // 9. Throw error if subtitles not found
    invariant(statusText === 'OK' && subtitles && subtitles.length > 0, `Subtitles not found for file: ${fileName}`);

    // 10. Get subtitle link from array
    const [{ subtitleLink }] = subtitles;

    // 11. Save subtitle in cache
    cache.set(fileName, subtitleLink);

    // 12. Return subtitle link
    return new Response(JSON.stringify({ subtitleLink }), { status: 200 });
  } catch (error) {
    const errorMessage = (error as Error).message.slice(18);
    return new Response(errorMessage, { status: 400 });
  }
}

Bun.serve({ fetch: fetchSubtitleLink });
