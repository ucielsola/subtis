// icons
import { ListSearch } from "~/components/icons/list-search";
import { Lock } from "~/components/icons/lock";
import { MonitorPlay } from "~/components/icons/monitor-play";
import { Robot } from "~/components/icons/robot";
import { Shapes } from "~/components/icons/shapes";
import { SyncIcon } from "~/components/icons/sync";
import { ThunderIcon } from "~/components/icons/thunder";
import { Translate } from "~/components/icons/translate";

export function HomeFeatures() {
  return (
    <section className="py-24 flex flex-col gap-16 items-center justify-center">
      <div className="flex flex-col md:flex-row gap-6 md:gap-14">
        <div className="flex flex-col gap-8">
          <div className="flex flex-row gap-3 items-start">
            <SyncIcon size={16} className="fill-zinc-50" />
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 text-sm uppercase tracking-[3px] font-gillsans font-medium">SIN DESFASES</p>
              <p className="text-zinc-400 text-sm">El subtítulo justo, siempre.</p>
            </div>
          </div>
          <div className="flex flex-row gap-3">
            <ThunderIcon size={16} className="fill-zinc-50" />
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 text-sm uppercase tracking-[3px] font-gillsans font-medium">
                RESULTADOS EN UN CLICK
              </p>
              <p className="text-zinc-400 text-sm">Resultados al instante, siempre al día.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <Lock size={16} className="fill-zinc-50" />
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 text-sm uppercase tracking-[3px] font-gillsans font-medium">
                COMPATIBLE CON SRT
              </p>
              <p className="text-zinc-400 text-sm">Usá el formato estándar, sin problemas.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <Robot size={16} className="fill-zinc-50" />
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 text-sm uppercase tracking-[3px] font-gillsans font-medium">
                SUBTÍTULOS CON IA
              </p>
              <p className="text-zinc-400 text-sm">Dejá que la IA cree los subtítulos por vos.</p>
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-8">
          <div className="flex flex-row gap-3 items-start">
            <ListSearch size={16} className="fill-zinc-50" />
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 text-sm uppercase tracking-[3px] font-gillsans font-medium">ESPAÑOL LATINO</p>
              <p className="text-zinc-400 text-sm">Diálogos claros, como nos gusta.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <Shapes size={16} className="fill-zinc-50" />
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 text-sm uppercase tracking-[3px] font-gillsans font-medium">
                INTEGRACIONES SIMPLES
              </p>
              <p className="text-zinc-400 text-sm">Conectá Subtis donde quieras.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <Translate size={16} className="fill-zinc-50" />
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 text-sm uppercase tracking-[3px] font-gillsans font-medium">
                BUSCÁ SIN LÍMITES
              </p>
              <p className="text-zinc-400 text-sm">Encontrá películas, sin importar el idioma.</p>
            </div>
          </div>

          <div className="flex flex-row gap-3 items-start">
            <MonitorPlay size={16} className="fill-zinc-50" />
            <div className="flex flex-col gap-[2px] leading-4">
              <p className="text-zinc-50 text-sm uppercase tracking-[3px] font-gillsans font-medium">
                MIRÁ AL INSTANTE
              </p>
              <p className="text-zinc-400 text-sm">Reproducí desde la web.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
