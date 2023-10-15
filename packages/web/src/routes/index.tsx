import { isServer } from '@builder.io/qwik/build';
import { HiFilmOutline } from '@qwikest/icons/heroicons';
import { component$, useSignal, useTask$, useVisibleTask$ } from '@builder.io/qwik';
import { type DocumentHead, routeAction$, routeLoader$, zod$, z } from '@builder.io/qwik-city';

// internals
import { getSubtitleFromFileName } from '~/utils/api';

// shared
import { getMessageFromStatusCode } from 'shared/error-messages';
import { getFilenameFromPath, getVideoFileExtension } from 'shared/movie';

// schemas
const schema = z.object({
  fileName: z.string().refine((fileName) => getVideoFileExtension(fileName), {
    message: 'Invalid file extension',
  }),
});

// actions
export const useSubtitleAction = routeAction$(async (formData) => {
  const { data, status } = await getSubtitleFromFileName(formData.fileName);
  return { data, status };
}, zod$(schema));

// loaders
export const useSubtitleLoader = routeLoader$(async (requestEvent) => {
  const fileName = requestEvent.url.searchParams.get('fileName');

  if (!fileName) {
    return null;
  }

  const { data, status } = await getSubtitleFromFileName(fileName);
  return { data, status };
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

  const droppableRef = useSignal<HTMLElement>();
  const dropStatus = useSignal<'drop' | 'dragover' | 'none'>('none');

  useVisibleTask$(({ cleanup }) => {
    if (droppableRef.value) {
      const drop = (event) => {
        dropStatus.value = 'drop';

        if (event.dataTransfer.items) {
          const [file] = [...event.dataTransfer.items].map((item) => item.getAsFile());

          if (file && file.name) {
            subtitleAction.submit({ fileName: file.name });
          }
        }
      };

      const dragover = () => {
        dropStatus.value = 'dragover';
      };

      droppableRef.value!.addEventListener('drop', drop);
      droppableRef.value!.addEventListener('dragover', dragover);

      cleanup(() => {
        droppableRef.value!.removeEventListener('drop', drop);
        droppableRef.value!.removeEventListener('dragover', dragover);
      });
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

      <div class='flex items-center justify-center flex-1 w-full max-w-lg m-auto p-4'>
        <div
          class={`flex flex-1 justify-center px-6 py-10 mt-2 border border-dashed rounded-lg border-zinc-900/25 hover:scale-105 hover:cursor-pointer transition-all will-change-transform ${
            dropStatus.value === 'dragover' ? 'scale-105' : ' scale-100'
          }`}
          preventdefault:dragover
          preventdefault:drop
          ref={droppableRef}
        >
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

      <div
        class={`text-center min-h-[90px] rounded-sm border-zinc-400 border flex self-center min-w-[240px] ${
          primaryValue ? 'opacity-100' : 'opacity-0'
        } transition-opacity hover:bg-zinc-100 hover:cursor-pointer`}
      >
        {primaryValue?.status && primaryValue.status !== 200 ? (
          <div>
            <p>{getMessageFromStatusCode(primaryValue.status).title}</p>
            <p>{getMessageFromStatusCode(primaryValue.status).description}</p>
          </div>
        ) : null}

        {primaryValue?.status && primaryValue.status === 200 && primaryValue.data ? (
          <a href={primaryValue.data.subtitleShortLink} class='text-zinc-600 flex-1 p-2'>
            <div>
              <p>
                {primaryValue.data.Movies?.name} from {primaryValue.data.Movies?.year} at {primaryValue.data.resolution}
              </p>
            </div>
            <div>
              <p>Release Group: {primaryValue.data.ReleaseGroups?.name}</p>
              <p>Subtitle Group: {primaryValue.data.SubtitleGroups?.name}</p>
            </div>
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
          <a class='hover:text-zinc-700' href='https://github.com/lndgalante/subtis/tree/main/packages/raycast'>
            Raycast
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
