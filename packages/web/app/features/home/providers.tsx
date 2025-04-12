import { ArgenteamLogo } from "~/components/logos/argenteam";
import { OpenSubtitlesLogo } from "~/components/logos/opensubtitles";
import { SubDivXLogo } from "~/components/logos/subdivx";
import { SubDLLogo } from "~/components/logos/subdl";

export function HomeProviders() {
  return (
    <section className="py-32 pb-48 flex flex-col gap-20 items-center justify-center">
      <div className="flex flex-col gap-3 items-center justify-center text-center">
        <h2 className="text-zinc-50 text-4xl font-bold text-balance">Proveedores</h2>
        <h3 className="text-zinc-400 text-balance">Desde Subtis traemos los mejores subtítulos de la web.</h3>
      </div>
      <div className="flex flex-col gap-16 md:flex-row justify-between w-full max-w-[800px]">
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.opensubtitles.com"
          className="flex flex-col gap-2 items-center justify-between h-20 group/provider"
        >
          <div className="h-11 flex items-center justify-center group-hover/provider:opacity-85 transition-all duration-300 ease-in-out">
            <OpenSubtitlesLogo />
          </div>
          <span className="text-zinc-50 font-medium text-sm uppercase tracking-widest border-b border-b-transparent group-hover/provider:border-b-zinc-50 transition-all duration-300 ease-in-out">
            OpenSubtitles
          </span>
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.subdivx.com"
          className="flex flex-col gap-2 items-center justify-between h-20 group/provider"
        >
          <div className="h-11 flex items-center justify-center group-hover/provider:opacity-85 transition-all duration-300 ease-in-out">
            <SubDivXLogo />
          </div>
          <span className="text-zinc-50 font-medium text-sm uppercase tracking-widest border-b border-b-transparent group-hover/provider:border-b-zinc-50 transition-all duration-300 ease-in-out">
            SubDivX
          </span>
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://www.subdl.com"
          className="flex flex-col gap-2 items-center justify-between h-20 group/provider"
        >
          <div className="h-11 flex items-center justify-center group-hover/provider:opacity-85 transition-all duration-300 ease-in-out">
            <SubDLLogo />
          </div>
          <span className="text-zinc-50 font-medium text-sm uppercase tracking-widest border-b border-b-transparent group-hover/provider:border-b-zinc-50 transition-all duration-300 ease-in-out">
            SubDL
          </span>
        </a>
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://arar.net.ar"
          className="flex flex-col gap-2 items-center justify-between h-20 group/provider"
        >
          <div className="h-11 flex items-center justify-center group-hover/provider:opacity-85 transition-all duration-300 ease-in-out">
            <ArgenteamLogo />
          </div>
          <span className="text-zinc-50 font-medium text-sm uppercase tracking-widest border-b border-b-transparent group-hover/provider:border-b-zinc-50 transition-all duration-300 ease-in-out">
            aRGENTeaM
          </span>
        </a>
      </div>
    </section>
  );
}
