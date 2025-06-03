import { ListSearch } from "~/components/icons/list-search";
// icons
import { Lock } from "~/components/icons/lock";
import { MonitorPlay } from "~/components/icons/monitor-play";
import { Robot } from "~/components/icons/robot";
import { Shapes } from "~/components/icons/shapes";
import { SyncIcon } from "~/components/icons/sync";
import { ThunderIcon } from "~/components/icons/thunder";
import { Translate } from "~/components/icons/translate";

export function HomeFeatures() {
  return (
    <section className="py-32 flex flex-col gap-16 items-center justify-center">
      <div className="flex flex-row gap-14">
        <div className="flex flex-col gap-8">
          <div className="flex flex-row gap-3 items-start">
            <div className="pt-[2.5px]">
              <SyncIcon size={16} className="fill-zinc-50" />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-[3px]">SUBTÍTULOS A TIEMPO</p>
              <p className="text-zinc-400 text-sm">El subtítulo justo, siempre.</p>
            </div>
          </div>
          <div className="flex flex-row gap-3 items-start">
            <div className="pt-[2.5px]">
              <ThunderIcon size={16} className="fill-zinc-50" />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-[3px]">BÚSQUEDA AL TOQUE</p>
              <p className="text-zinc-400 text-sm">Resultados al instante, siempre al día.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <div className="pt-[2.5px]">
              <Lock size={16} className="fill-zinc-50" />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-[3px]">COMPATIBLE CON SRT</p>
              <p className="text-zinc-400 text-sm">Usá el formato estándar, sin problemas.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <div className="pt-[2.5px]">
              <Robot size={16} className="fill-zinc-50" />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-[3px]">SUBTÍTULOS CON IA</p>
              <p className="text-zinc-400 text-sm">Dejá que la IA cree los subtítulos por vos.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-row gap-3 items-start">
            <div className="pt-[2.5px]">
              <ListSearch size={16} className="fill-zinc-50" />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-[3px]">ESPAÑOL CLARITO</p>
              <p className="text-zinc-400 text-sm">Diálogos claros, como nos gusta.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <div className="pt-[2.5px]">
              <Shapes size={16} className="fill-zinc-50" />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-[3px]">INTEGRACIONES SIMPLES</p>
              <p className="text-zinc-400 text-sm">Conectá Subtis donde quieras.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <div className="pt-[2.5px]">
              <Translate size={16} className="fill-zinc-50" />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-[3px]">BUSCÁ SIN LÍMITES</p>
              <p className="text-zinc-400 text-sm">Encontrá pelis, sin importar el idioma.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <div className="pt-[2.5px]">
              <MonitorPlay size={16} className="fill-zinc-50" />
            </div>
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 font-medium text-sm uppercase tracking-[3px]">MIRÁ AL INSTANTE</p>
              <p className="text-zinc-400 text-sm">Reproducí desde la web.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
