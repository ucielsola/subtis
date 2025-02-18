export function HomeProviders() {
  return (
    <section className="py-16 flex flex-col gap-16 items-center justify-center">
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-50 text-4xl font-bold text-balance">Proveedores</h2>
        <h3 className="text-zinc-400 text-balance max-w-[624px]">
          En Subtis, nos apoyamos en estos proveedores para traerte siempre los mejores subtítulos de la web.
        </h3>
      </div>
      <div className="flex flex-row flex-wrap gap-4 max-w-screen-xl items-center justify-evenly w-full">
        <div className="flex flex-col items-center justify-center">
          <a
            href="https://www.opensubtitles.com"
            className="text-zinc-300 text-3xl font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            OpenSubtitles
          </a>
        </div>
        <div className="flex flex-col items-center justify-center">
          <a
            href="https://subdivx.com"
            className="text-zinc-300 text-3xl font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            SubDivX
          </a>
        </div>
        <div className="flex flex-col items-center justify-center">
          <a
            href="https://subdl.com"
            className="text-zinc-300 text-3xl font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            SubDL
          </a>
        </div>
        <div className="flex flex-col items-center justify-center">
          <a
            href="https://argenteam.net"
            className="text-zinc-300 text-3xl font-medium"
            target="_blank"
            rel="noopener noreferrer"
          >
            aRGENTeaM
          </a>
        </div>
      </div>
    </section>
  );
}
