import { Fragment, type SVGProps, useState } from "react";

// ui
import { MorphingDialogBasicImage } from "~/components/ui/morphin-dialog-image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";

function StremioWhiteLogo({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" viewBox="0 0 25 25" {...props}>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="m12.338.338 10.37 10.37c.45.45.45 1.18 0 1.63l-10.37 10.37c-.45.45-1.18.45-1.63 0L.337 12.337c-.45-.45-.45-1.18 0-1.63L10.708.337c.45-.45 1.18-.45 1.63 0Zm3.205 11.03a.192.192 0 0 1 0 .31l-5.502 4.046a.192.192 0 0 1-.306-.155V7.476a.192.192 0 0 1 .306-.155l5.502 4.047Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function StremioButton() {
  // react hooks
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // handlers
  function handleToggleIsOpen(): void {
    setIsOpen((previousIsOpen) => !previousIsOpen);
  }

  return (
    <Fragment>
      <Sheet open={isOpen} onOpenChange={handleToggleIsOpen}>
        <SheetContent className="overflow-y-auto bg-zinc-950 border-[#232323] border rounded-sm my-3 mr-3 max-h-[calc(100vh-24px)] sm:max-w-md">
          <SheetHeader className="mb-10">
            <SheetTitle className="text-zinc-50">Cómo instalar y usar Subtis en Stremio</SheetTitle>
            <SheetDescription className="text-zinc-400 text-sm">
              Seguí estos pasos para integrar Subtis con Stremio. Hacé clic en las imágenes para verlas en pantalla
              completa.
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-10 pb-2">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-[#232323] w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-50 text-xs">1</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1 font-gillsans tracking-[3px] uppercase text-xs">
                    Instalá el Add-on
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-1.webp"
                    alt="Instalación de add-on de Stremio"
                    containerClassName="w-full md:w-44 border border-[#232323] rounded-sm flex-shrink-0 overflow-hidden"
                  />
                  <p className="text-zinc-400 text-sm">
                    Hacé clic en este{" "}
                    <a
                      href="stremio://stremio.subt.is/manifest.json"
                      target="_blank"
                      className="text-zinc-50 underline"
                      rel="noreferrer"
                    >
                      Deeplink
                    </a>{" "}
                    para instalar el add-on de Subtis. Cuando se abra Stremio, hacé clic en &ldquo;Instalar&rdquo; o
                    &ldquo;Install&rdquo;. Si no tenés Stremio instalado, podés ir a este{" "}
                    <a
                      href="https://stremio.subt.is"
                      target="_blank"
                      className="text-zinc-50 underline"
                      rel="noreferrer"
                    >
                      Link
                    </a>
                    .
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-[#232323] w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-50 text-xs">2</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1 font-gillsans tracking-[3px] uppercase text-xs">
                    Movete al ícono de subtítulos
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-2.webp"
                    alt="Instalación de add-on de Stremio"
                    containerClassName="w-full md:w-44 h-fit border border-[#232323] rounded-sm flex-shrink-0 overflow-hidden"
                  />
                  <p className="text-zinc-400 text-sm">
                    Mientras estás viendo una película, hacé clic en el ícono de subtítulos en la barra de reproducción.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-[#232323] w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-50 text-xs">3</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1 font-gillsans tracking-[3px] uppercase text-xs">
                    Seleccioná los subtítulos
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-3.webp"
                    alt="Instalación de add-on de Stremio"
                    containerClassName="w-full md:w-44 h-fit border border-[#232323] rounded-sm flex-shrink-0 overflow-hidden"
                  />
                  <p className="text-zinc-400 text-sm">
                    En la sección debajo de &ldquo;Add-ons&rdquo;, hacé clic en &ldquo;español&rdquo; para poner los
                    subtítulos en español.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-[#232323] w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-50 text-xs">4</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1 font-gillsans tracking-[3px] uppercase text-xs">
                    Desinstalá otros Add-ons (Opcional)
                  </div>
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-4.webp"
                    alt="Instalación de add-on de Stremio"
                    containerClassName="w-full md:w-44 h-fit border border-[#232323] rounded-sm flex-shrink-0 overflow-hidden"
                  />
                  <p className="text-zinc-400 text-sm">
                    Para una mejor experiencia, te sugerimos desinstalar otros add-ons de subtítulos, como los de
                    OpenSubtitles.
                  </p>
                </div>
              </div>
            </section>
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-zinc-50 text-lg font-semibold">¿Te quedaron dudas?</p>
                <p className="text-zinc-400 text-sm">Mirate este video tutorial</p>
              </div>
              <iframe
                src="https://www.youtube.com/embed/fOL1tppyYV8?si=qghnzPe_sEasbraX"
                title="YouTube video player"
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
        className={`text-zinc-50 h-10 group relative isolate cursor-pointer ${isOpen ? "pointer-events-none" : ""}`}
        onClick={handleToggleIsOpen}
      >
        <div className="border-[#6521FF] rounded-md relative h-full px-4 z-10 border-2 flex gap-2 items-center bg-[#754AD6] transition-transform duration-300 ease-in-out group-hover:-translate-x-[3px] group-hover:-translate-y-[3px] group-active:-translate-x-[1.5px] group-active:-translate-y-[1.5px] text-xs tracking-[3px] font-medium uppercase font-gillsans">
          <StremioWhiteLogo size={20} />
          <span className="pt-[3px]">AGREGAR A STREMIO</span>
        </div>
        <div className="absolute inset-0 rounded-md bg-[#6521FF]" />
      </button>
    </Fragment>
  );
}
