import { isServer } from '@builder.io/qwik/build';
import { HiFilmOutline } from '@qwikest/icons/heroicons';
import { component$, useSignal, useTask$ } from '@builder.io/qwik';
import { type DocumentHead, routeAction$, routeLoader$, zod$, z } from '@builder.io/qwik-city';

// internals
import { getSubtitleFromFileName } from '~/utils/api';
import { getMessageFromStatusCode } from '~/utils/error-messages';

// shared
import { getFilenameFromPath, getVideoFileExtension } from 'shared/movie';

// schemas
const schema = z.object({
  fileName: z.string().refine((fileName) => getVideoFileExtension(fileName), {
    message: 'Invalid file extension',
  }),
});

// actions
export const useSubtitleAction = routeAction$(async (data) => {
  const result = await getSubtitleFromFileName(data.fileName);
  return result;
}, zod$(schema));

// loaders
export const useSubtitleLoader = routeLoader$(async (requestEvent) => {
  const fileName = requestEvent.url.searchParams.get('fileName');

  if (!fileName) {
    return null;
  }

  const result = await getSubtitleFromFileName(fileName);
  return result;
});

export default component$(() => {
  // signals
  const fileName = useSignal('');
  const fileNameError = useSignal('');

  // actions / loaders
  const subtitleAction = useSubtitleAction();
  const subtitleLoader = useSubtitleLoader();

  // constants
  const primaryValue = subtitleAction.value || subtitleLoader.value;

  // tasks
  useTask$(({ track }) => {
    track(() => fileName.value);

    const fileNameFromPath = getFilenameFromPath(fileName.value);
    const videoFileExtension = getVideoFileExtension(fileNameFromPath);

    fileNameError.value = !videoFileExtension ? `Invalid file extension for ${fileNameFromPath}` : '';
    if (!videoFileExtension) return;

    if (fileNameFromPath) {
      subtitleAction.submit({ fileName: fileNameFromPath });
    }
  });

  useTask$(({ track }) => {
    track(() => subtitleAction.value?.data?.fileName);

    if (isServer) {
      return;
    }

    if (subtitleAction.value?.data?.fileName) {
      history.pushState({}, '', `/?fileName=${subtitleAction.value.data.fileName}`);
    }
  });

  return (
    <main class='flex flex-col min-h-screen p-2 pt-6 pb-10'>
      <header class='text-center'>
        <h1 class='text-3xl antialiased font-black text-zinc-900 sm:text-5xl md:text-7xl lg:text-8xl'>Subtis</h1>
        <h2 class='text-sm antialiased font-semibold text-zinc-900 sm:text-base md:text-lg'>
          Encontrá los subtítulos para tu película
        </h2>
      </header>

      <div class='flex items-center justify-center flex-1 w-full max-w-lg m-auto'>
        <div class='flex flex-1 justify-center px-6 py-10 mt-2 border border-dashed rounded-lg border-zinc-900/25 hover:scale-105 hover:cursor-pointer focus-within:scale-105 transition-all will-change-transform'>
          <div class='text-center flex flex-col items-center'>
            <HiFilmOutline class='w-12 h-12 mx-auto text-zinc-600' aria-hidden='true' />
            <form class='flex mt-4 text-sm leading-6 text-zinc-600'>
              <label
                for='file-upload'
                class='relative text-center font-semibold text-zinc-600 rounded-md cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-zinc-600 focus-within:ring-offset-2 hover:text-zinc-500'
              >
                <span>Selecciona un archivo</span>
                <input id='file-upload' name='file-upload' type='file' class='sr-only' bind:value={fileName} />
              </label>
              {subtitleAction.value?.failed ? <p>{subtitleAction.value.fieldErrors.fileName}</p> : null}
            </form>
            <p class='text-xs leading-5 text-zinc-600 mt-[2px]'>Arrastra y solta tu archivo aquí</p>
          </div>
        </div>
      </div>

      <div class='text-center min-h-[60px]'>
        {primaryValue?.status && primaryValue.status !== 200 ? (
          <div>
            <p>{getMessageFromStatusCode(primaryValue.status).title}</p>
            <p>{getMessageFromStatusCode(primaryValue.status).subtitle}</p>
          </div>
        ) : null}

        {primaryValue?.data?.subtitleLink ? (
          <a href={primaryValue.data.subtitleLink} class='hover:text-indigo-700 text-indigo-600'>
            Descargar Subtitulo
          </a>
        ) : null}
      </div>

      <footer class='fixed bottom-0 left-0 right-0 w-full px-4 py-3 flex justify-between'>
        <nav class='flex gap-2 text-xs font-medium text-zinc-600'>
          <a class='hover:text-zinc-700' href='https://github.com/lndgalante/subtis/tree/main/packages/cli'>
            CLI
          </a>
          <a class='hover:text-zinc-700' href='https://github.com/lndgalante/subtis/tree/main/packages/api'>
            API
          </a>
          <a class='hover:text-zinc-700' href='https://github.com/lndgalante/subtis/tree/main/packages/vlc'>
            VLC
          </a>
        </nav>
        <nav class='flex gap-2 text-xs font-medium text-zinc-600'>
          <a class='hover:text-zinc-700' href='https://github.com/lndgalante/subtis'>
            GitHub
          </a>
          <a class='hover:text-zinc-700' href='https://twitter.com/subt_is'>
            Twitter
          </a>
          <a class='hover:text-zinc-700' href='mailto:soporte@subt.is'>
            Soporte
          </a>
        </nav>
      </footer>
    </main>
  );
});

export const head: DocumentHead = {
  title: 'Subtis',
  meta: [
    {
      name: 'description',
      content: 'Encontrá los subtítulos para tu película!',
    },
  ],
};
