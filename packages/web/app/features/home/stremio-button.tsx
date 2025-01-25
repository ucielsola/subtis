import { Fragment, type SVGProps, useState } from "react";

// ui
import { Button } from "~/components/ui/button";
import { MorphingDialogBasicImage } from "~/components/ui/morphin-dialog-image";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";

// lib
import { op } from "~/lib/analytics";

function StremioWhiteLogo({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} fill="none" {...props}>
      <title>Stremio</title>
      <path
        fill="#fff"
        fillRule="evenodd"
        d="m12.338.338 10.37 10.37c.45.45.45 1.18 0 1.63l-10.37 10.37c-.45.45-1.18.45-1.63 0L.337 12.337c-.45-.45-.45-1.18 0-1.63L10.708.337c.45-.45 1.18-.45 1.63 0Zm3.205 11.03a.192.192 0 0 1 0 .31l-5.502 4.046a.192.192 0 0 1-.306-.155V7.476a.192.192 0 0 1 .306-.155l5.502 4.047Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function StremioColouredLogo({ size = 24, ...props }: SVGProps<SVGSVGElement> & { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <title>Stremio</title>
      <path
        fill="url(#stremio-gradient)"
        d="M23.184 11.185 12.814.815c-.45-.45-1.18-.45-1.63 0L.814 11.185c-.45.45-.45 1.18 0 1.63l10.37 10.37c.45.45 1.18.45 1.63 0l10.37-10.37c.45-.45.45-1.18 0-1.63Z"
      />
      <path
        fill="#fff"
        d="M16.02 11.845a.193.193 0 0 1 .058.242.193.193 0 0 1-.058.068L10.518 16.2a.191.191 0 0 1-.277-.054.192.192 0 0 1-.029-.1V7.953a.192.192 0 0 1 .306-.155l5.502 4.047Z"
      />
      <defs>
        <linearGradient id="stremio-gradient" x1={11.999} x2={11.999} y1={24} y2={7.104} gradientUnits="userSpaceOnUse">
          <stop stopColor="#1155D9" />
          <stop offset={1} stopColor="#7B5BF5" />
        </linearGradient>
      </defs>
    </svg>
  );
}

export function StremioButton() {
  // react hooks
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // handlers
  function handleToggleIsOpen(): void {
    op.track("stremio_button_clicked");
    setIsOpen((previousIsOpen) => !previousIsOpen);
  }

  return (
    <Fragment>
      <Sheet open={isOpen} onOpenChange={handleToggleIsOpen} modal={false}>
        <SheetContent className="overflow-y-auto bg-zinc-950 border-zinc-700 border rounded-sm my-3 mr-3 max-h-[calc(100vh-24px)] sm:max-w-md">
          <SheetHeader className="mb-10">
            <SheetTitle className="text-zinc-50">Instalación de Subtis para Stremio</SheetTitle>
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
                  <div className="text-zinc-50 pb-1">Instalá el Addon</div>
                </div>
                <div className="flex flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-1.webp"
                    alt="Instalación de addon de Stremio"
                    containerClassName="w-44 border border-zinc-700 rounded-sm flex-shrink-0"
                  />
                  <p className="text-zinc-400 text-sm">
                    Haz click en este{" "}
                    <a
                      href="stremio://stremio.subt.is/manifest.json
"
                      target="_blank"
                      className="text-zinc-50 underline"
                      rel="noreferrer"
                    >
                      link
                    </a>{" "}
                    para instalar el addon de Subtis. Una vez abierto Stremio, haz click en "Instalar" o "Install".
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
                <div className="flex flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-2.webp"
                    alt="Instalación de addon de Stremio"
                    containerClassName="w-44 h-fit border border-zinc-700 rounded-sm flex-shrink-0"
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
                <div className="flex flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-3.webp"
                    alt="Instalación de addon de Stremio"
                    containerClassName="w-44 h-fit border border-zinc-700 rounded-sm flex-shrink-0"
                  />
                  <p className="text-zinc-400 text-sm">
                    En la sección debajo de "Addons" haz click en "español" para reproducir el subtítulo en español.
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
                  <div className="text-zinc-50 pb-1">Desinstalá otros Addons (Opcional)</div>
                </div>
                <div className="flex flex-row gap-4">
                  <MorphingDialogBasicImage
                    src="/stremio-4.webp"
                    alt="Instalación de addon de Stremio"
                    containerClassName="w-44 h-fit border border-zinc-700 rounded-sm flex-shrink-0"
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
                src="https://www.youtube.com/embed/Way9Dexny3w?si=lArvXxxaxXgVZnyw"
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

      <Button
        className={`bg-zinc-950 text-zinc-50 group border-[#1155D9] border-2 relative overflow-hidden rounded-md ${isOpen ? "pointer-events-none" : ""}`}
        onClick={handleToggleIsOpen}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[#1155D9] to-[#7B5BF5] transition-all ease-in-out -translate-y-full group-hover:translate-y-0" />
        <div className="relative flex items-center gap-2">
          <div className="relative size-6">
            <StremioColouredLogo
              size={24}
              className="!size-auto absolute transition-all ease-in-out group-hover:opacity-0 delay-75"
            />
            <StremioWhiteLogo
              size={24}
              className="!size-auto absolute transition-all ease-in-out opacity-0 group-hover:opacity-100 delay-75"
            />
          </div>
          Stremio
        </div>
      </Button>
    </Fragment>
  );
}
