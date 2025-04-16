import { useAnimation } from "motion/react";
import { Fragment, useState } from "react";
import { Terminal } from "~/components/icons/terminal";

// ui
import { MorphingDialogBasicImage } from "~/components/ui/morphin-dialog-image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";

export function TerminalButton() {
  // react hooks
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // motion hooks
  const controls = useAnimation();

  // handlers
  function handleToggleIsOpen(): void {
    setIsOpen((previousIsOpen) => !previousIsOpen);
  }

  return (
    <Fragment>
      <Sheet open={isOpen} onOpenChange={handleToggleIsOpen}>
        <SheetContent className="overflow-y-auto bg-zinc-950 border-zinc-700 border rounded-sm my-3 mr-3 max-h-[calc(100vh-24px)] sm:max-w-md">
          <SheetHeader className="mb-10">
            <SheetTitle className="text-zinc-50">Instalación y uso de Subtis para Stremio</SheetTitle>
            <SheetDescription className="text-zinc-400 text-sm">
              Seguí estos pasos para integrar Subtis con Stremio correctamente. Haz click en las imagenes para verlas en
              pantalla completa.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-10 pb-2">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-zinc-700 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-100">
                      <span className="text-zinc-700 text-sm">1</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1">Instalá el Add-on</div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-1.webp"
                    alt="Instalación de add-on de Stremio"
                    containerClassName="w-full md:w-44 border border-zinc-700 rounded-sm flex-shrink-0"
                  />
                  <p className="text-zinc-400 text-sm">
                    Haz click en este{" "}
                    <a
                      href="stremio://stremio.subt.is/manifest.json"
                      target="_blank"
                      className="text-zinc-50 underline"
                      rel="noreferrer"
                    >
                      link
                    </a>{" "}
                    para instalar el add-on de Subtis. Una vez abierto Stremio, haz click en &ldquo;Instalar&rdquo; o
                    &ldquo;Install&rdquo;.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-zinc-700 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-100">
                      <span className="text-zinc-700 text-sm">2</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1">Ir al Visualizador de Subtítulos</div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-2.webp"
                    alt="Instalación de add-on de Stremio"
                    containerClassName="w-full md:w-44 h-fit border border-zinc-700 rounded-sm flex-shrink-0"
                  />
                  <p className="text-zinc-400 text-sm">
                    Mientras estás viendo una película, haz click en el ícono de subtítulos en la barra de reproducción.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-zinc-700 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-100">
                      <span className="text-zinc-700 text-sm">3</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1">Seleccionar Subtítulos</div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-3.webp"
                    alt="Instalación de add-on de Stremio"
                    containerClassName="w-full md:w-44 h-fit border border-zinc-700 rounded-sm flex-shrink-0"
                  />
                  <p className="text-zinc-400 text-sm">
                    En la sección debajo de &ldquo;Add-ons&rdquo; haz click en &ldquo;español&rdquo; para reproducir el
                    subtítulo en español.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-zinc-700 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-100">
                      <span className="text-zinc-700 text-sm">4</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1">Desinstalá otros Add-ons (Opcional)</div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-4.webp"
                    alt="Instalación de add-on de Stremio"
                    containerClassName="w-full md:w-44 h-fit border border-zinc-700 rounded-sm flex-shrink-0"
                  />
                  <p className="text-zinc-400 text-sm">
                    Para disfrutar de una mejor experiencia, te sugerimos desinstalar otros complementos de subtítulos,
                    como los de OpenSubtitles.
                  </p>
                </div>
              </div>
            </section>
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-zinc-50 text-lg font-semibold">Te quedaron dudas?</p>
                <p className="text-zinc-400 text-sm">Mirate este video tutorial</p>
              </div>
              <iframe
                src="https://www.youtube.com/embed/fOL1tppyYV8?si=qghnzPe_sEasbraX"
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="w-full aspect-video rounded-sm"
              />
            </section>
          </div>
        </SheetContent>
      </Sheet>

      <button
        type="button"
        onClick={handleToggleIsOpen}
        onMouseEnter={() => controls.start("hover")}
        onMouseLeave={() => controls.start("normal")}
        className={`inline-flex flex-row items-center gap-1 px-1.5 text-zinc-300 group/cli cursor-pointer ${isOpen ? "pointer-events-none" : ""}`}
      >
        <Terminal
          controls={controls}
          size={14}
          className="fill-transparent stroke-zinc-300 transition-all ease-in-out group-hover/cli:stroke-zinc-50"
        />
        <span className="group-hover/cli:text-zinc-50">CLI</span>
      </button>
    </Fragment>
  );
}
