export function HomeProviders() {
  return (
    <section className="py-32 pb-48 flex flex-col gap-16 items-center justify-center">
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-50 text-4xl font-bold text-balance">Proveedores</h2>
        <h3 className="text-zinc-400 text-balance max-w-[624px]">
          En Subtis, nos paramos sobre los hombros de gigantes para traerte siempre los mejores subtítulos de la web.
        </h3>
      </div>
      <div className="flex flex-col md:flex-row gap-12 md:gap-4 flex-wrap max-w-screen-xl items-center justify-evenly w-full">
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
