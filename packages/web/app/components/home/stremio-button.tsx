import { Fragment, type SVGProps, useState } from "react";

// ui
import { Button } from "~/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";

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
    setIsOpen((previousIsOpen) => !previousIsOpen);
  }

  return (
    <Fragment>
      <Sheet open={isOpen} onOpenChange={handleToggleIsOpen}>
        <SheetContent className="overflow-auto">
          <SheetHeader className="mb-10">
            <SheetTitle className="text-slate-950">Gracias por descargar Subtis para Stremio!</SheetTitle>
            <SheetDescription className="text-slate-600 text-sm">
              Seguí estos pasos para poder integrar Subtis con Stremio correctamente
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-10">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-slate-200 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-slate-100">
                      <span className="text-slate-600 text-sm">1</span>
                    </div>
                  </div>
                  <div className="text-slate-950 pb-1">First title</div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="min-w-44 h-24 border border-slate-200 rounded-sm overflow-hidden">
                    <img src="https://placehold.co/176x96" alt="Placeholder" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Seguí estos pasos para poder integrar Subtis con Stremio correctamente
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-slate-200 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-slate-100">
                      <span className="text-slate-600 text-sm">2</span>
                    </div>
                  </div>
                  <div className="text-slate-950 pb-1">Second title</div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="min-w-44 h-24 border border-slate-200 rounded-sm overflow-hidden">
                    <img src="https://placehold.co/176x96" alt="Placeholder" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Seguí estos pasos para poder integrar Subtis con Stremio correctamente
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-slate-200 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-slate-100">
                      <span className="text-slate-600 text-sm">3</span>
                    </div>
                  </div>
                  <div className="text-slate-950 pb-1">Third title</div>
                </div>
                <div className="flex flex-row gap-4">
                  <div className="min-w-44 h-24 border border-slate-200 rounded-sm overflow-hidden">
                    <img src="https://placehold.co/176x96" alt="Placeholder" />
                  </div>
                  <p className="text-slate-600 text-sm">
                    Seguí estos pasos para poder integrar Subtis con Stremio correctamente
                  </p>
                </div>
              </div>
            </section>
            <section className="flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <p className="text-slate-950 text-lg font-semibold">Te quedaron dudas?</p>
                <p className="text-slate-600 text-sm">Mirate este video tutorial</p>
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
        className="bg-slate-950 group border-[#1155D9] border-2 relative overflow-hidden"
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
