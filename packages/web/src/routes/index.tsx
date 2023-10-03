import { HiFilmOutline } from '@qwikest/icons/heroicons';
import { type DocumentHead } from '@builder.io/qwik-city';
import { Resource, component$, useResource$, useSignal } from '@builder.io/qwik';

// shared
import { getSubtitleLink } from 'shared/api';
import { getFilenameFromPath } from 'shared/movie';

export default component$(() => {
  // signals
  const fileName = useSignal('');

  // resources
  const subtitle = useResource$(async ({ track }) => {
    track(() => fileName.value);

    if (!fileName.value) {
      return null;
    }

    const fileNameFromPath = getFilenameFromPath(fileName.value);

    const result = await getSubtitleLink(fileNameFromPath, {
      isProduction: import.meta.env.NODE_ENV === 'production',
      apiBaseUrlProduction: import.meta.env.PUBLIC_API_BASE_URL_PRODUCTION,
      apiBaseUrlDevelopment: import.meta.env.PUBLIC_API_BASE_URL_DEVELOPMENT,
    });

    return result.data;
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
        <div class='flex flex-1 justify-center px-6 py-10 mt-2 border border-dashed rounded-lg border-zinc-900/25 hover:scale-105 focus-within:scale-105 transition-all will-change-transform'>
          <div class='text-center'>
            <HiFilmOutline class='w-12 h-12 mx-auto text-zinc-600' aria-hidden='true' />
            <form class='flex mt-4 text-sm leading-6 text-zinc-600'>
              <label
                for='file-upload'
                class='relative text-center font-semibold text-blue-600 rounded-md cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500'
              >
                <span>Seleccionar un archivo</span>
                <input id='file-upload' name='file-upload' type='file' class='sr-only' bind:value={fileName} />
              </label>
              <p class='pl-1'>ó arrastrar y soltar</p>
            </form>
            <p class='text-xs leading-5 text-zinc-600'>MP4, MKV, AVI, ó MOV permitidos</p>
          </div>
        </div>
      </div>

      <div class='text-center'>
        <Resource
          value={subtitle}
          onPending={() => <p>Buscando subtítulo...</p>}
          onRejected={() => <p>Subtítulo no encontrado</p>}
          onResolved={(subtitle) => <a href={subtitle?.subtitleLink}>{subtitle?.fileName}</a>}
        />
      </div>

      <footer class='fixed bottom-0 right-0 px-4 py-3'>
        <nav class='flex gap-2 text-xs font-medium text-zinc-600'>
          <a class='hover:text-zinc-700' href='#'>
            CLI
          </a>
          <a class='hover:text-zinc-700' href='#'>
            API
          </a>
          <a class='hover:text-zinc-700' href='#'>
            VLC
          </a>
          <a class='hover:text-zinc-700' href='#'>
            GitHub
          </a>
          <a class='hover:text-zinc-700' href='#'>
            Twitter
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
