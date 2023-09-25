import { FilmIcon } from '@heroicons/react/24/outline';
import type { MetaFunction } from '@remix-run/node';

export const meta: MetaFunction = () => {
  return [
    { title: 'PoneleLosSubs' },
    { name: 'description', content: 'Encontrá rápidamente los subtitulos en español para tu película!' },
  ];
};

export default function HomePage() {
  return (
    <main className='flex flex-col min-h-screen p-2 pt-6 pb-10'>
      <header className='text-center'>
        <h1 className='text-3xl antialiased font-black text-zinc-900 sm:text-5xl md:text-7xl lg:text-8xl'>
          PoneleLosSubs
        </h1>
        <h2 className='text-sm antialiased font-semibold text-zinc-900 sm:text-base md:text-lg lg:text-xl'>
          Encontrá rápidamente los subtítulos en español para tu película!
        </h2>
      </header>

      <form className='flex items-center justify-center flex-1 w-full max-w-lg m-auto'>
        <div className='flex flex-1 justify-center px-6 py-10 mt-2 border border-dashed rounded-lg border-zinc-900/25 hover:scale-105 focus-within:scale-105 transition-all will-change-transform'>
          <div className='text-center'>
            <FilmIcon className='w-12 h-12 mx-auto text-zinc-600' aria-hidden='true' />
            <div className='flex mt-4 text-sm leading-6 text-zinc-600'>
              <label
                htmlFor='file-upload'
                className='relative text-center font-semibold text-blue-600 rounded-md cursor-pointer focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500'
              >
                <span>Seleccionar un archivo</span>
                <input id='file-upload' name='file-upload' type='file' className='sr-only' />
              </label>
              <p className='pl-1'>ó arrastrar y soltar</p>
            </div>
            <p className='text-xs leading-5 text-zinc-600'>MP4, MKV, AVI, ó MOV permitidos</p>
          </div>
        </div>
      </form>

      <section className='flex flex-col gap-2 max-w-5xl w-full m-auto opacity-60 hover:opacity-100 transition-opacity '>
        <p className='text-sm font-medium tracking-wider text-zinc-900 '>Últimos subtítulos descargados</p>
        <div className='flex gap-2 flex-wrap'>
          <article className='flex flex-col min-w-max gap-1 px-3 py-2 rounded-md border border-zinc-900/25'>
            <p className='text-base text-zinc-800'>Til Death Do Us Part</p>
            <div className='flex gap-2'>
              <span className='inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10'>
                1080p
              </span>
              <span className='inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10'>
                YTS-MX
              </span>
              <span className='inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10'>
                SubDivX
              </span>
            </div>
          </article>
          <article className='flex flex-col min-w-max  gap-1 px-3 py-2 rounded-md border border-zinc-900/25'>
            <p className='text-base text-zinc-800'>A Million Miles Away</p>
            <div className='flex gap-2'>
              <span className='inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10'>
                720p
              </span>
              <span className='inline-flex items-center rounded-md bg-zinc-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                YTS-MX
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                Argenteam
              </span>
            </div>
          </article>
          <article className='flex flex-col min-w-max  gap-1 px-3 py-2 rounded-md border border-gray-900/25'>
            <p className='text-base text-gray-800'>Princess</p>
            <div className='flex gap-2'>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                1080p
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                YTS-MX
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                OpenSubtitles
              </span>
            </div>
          </article>
          <article className='flex flex-col min-w-max  gap-1 px-3 py-2 rounded-md border border-gray-900/25'>
            <p className='text-base text-gray-800'>Princess</p>
            <div className='flex gap-2'>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                1080p
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                YTS-MX
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                OpenSubtitles
              </span>
            </div>
          </article>
          <article className='flex flex-col min-w-max  gap-1 px-3 py-2 rounded-md border border-gray-900/25'>
            <p className='text-base text-gray-800'>Princess</p>
            <div className='flex gap-2'>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                1080p
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                YTS-MX
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                OpenSubtitles
              </span>
            </div>
          </article>
          <article className='flex flex-col min-w-max  gap-1 px-3 py-2 rounded-md border border-gray-900/25'>
            <p className='text-base text-gray-800'>Princess</p>
            <div className='flex gap-2'>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                1080p
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                YTS-MX
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                OpenSubtitles
              </span>
            </div>
          </article>
          <article className='flex flex-col min-w-max  gap-1 px-3 py-2 rounded-md border border-gray-900/25'>
            <p className='text-base text-gray-800'>Princess</p>
            <div className='flex gap-2'>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                1080p
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                YTS-MX
              </span>
              <span className='inline-flex items-center rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-600 ring-1 ring-inset ring-gray-500/10'>
                OpenSubtitles
              </span>
            </div>
          </article>
        </div>
      </section>

      <footer className='fixed bottom-0 right-0 px-4 py-3'>
        <nav className='flex gap-2 text-xs font-medium text-zinc-600'>
          <a className='hover:text-zinc-700' href='#'>
            CLI
          </a>
          <a className='hover:text-zinc-700' href='#'>
            API
          </a>
          <a className='hover:text-zinc-700' href='#'>
            macOS
          </a>
          <a className='hover:text-zinc-700' href='#'>
            GitHub
          </a>
          <a className='hover:text-zinc-700' href='#'>
            Twitter
          </a>
        </nav>
      </footer>
    </main>
  );
}
