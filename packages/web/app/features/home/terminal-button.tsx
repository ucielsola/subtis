import { useAnimation } from "motion/react";
import { Fragment, useState } from "react";
import { Terminal } from "~/components/icons/terminal";

// ui
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
        <SheetContent className="overflow-y-auto bg-zinc-950 border-zinc-800 border rounded-sm my-3 mr-3 max-h-[calc(100vh-24px)] sm:max-w-md">
          <SheetHeader className="mb-10">
            <SheetTitle className="text-zinc-50">Cómo instalar y usar Subtis en tu Terminal</SheetTitle>
            <SheetDescription className="text-zinc-400 text-sm">
              Seguí estos pasos para instalar Subtis en tu terminal.
              <br />
              Por ahora, la herramienta de Subtis para terminal solo funciona en macOS. Además, necesitás tener
              instalado{" "}
              <a href="https://brew.sh/" target="_blank" className="text-zinc-50 font-mono underline" rel="noreferrer">
                Homebrew
              </a>
              .
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-10 pb-2">
            <section className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-zinc-800 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-50 text-xs">1</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1 font-gillsans tracking-[3px] uppercase text-xs">
                    Agregá el repositorio de Homebrew
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-zinc-400 text-sm leading-6">Primero, agregá el repositorio de Subtis a Homebrew</p>
                  <code className="text-zinc-300 font-mono text-sm">&gt; brew tap lndgalante/homebrew-subtis</code>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-zinc-800 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-50 text-xs">2</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1 font-gillsans tracking-[3px] uppercase text-xs">
                    Instalá la CLI de Subtis
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-zinc-400 text-sm leading-6">Abrí tu terminal y corré el siguiente comando</p>
                  <code className="text-zinc-300 font-mono text-sm">&gt; brew install @lndgalante/subtis</code>
                </div>
              </div>
              <div className="flex flex-col gap-3 items-start">
                <div className="flex flex-row items-end gap-3 ">
                  <div className="flex flex-col items-center">
                    <div className="h-8 border border-dashed border-zinc-800 w-[1px]" />
                    <div className="size-8 flex items-center justify-center rounded-full bg-zinc-800">
                      <span className="text-zinc-50 text-xs">3</span>
                    </div>
                  </div>
                  <div className="text-zinc-50 pb-1 font-gillsans tracking-[3px] uppercase text-xs">
                    Corré la CLI sobre tu archivo
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-zinc-400 text-sm leading-6">Abrí tu terminal y corré el siguiente comando</p>
                  <code className="text-zinc-300 font-mono text-sm">&gt; subtis file "nombre-del-archivo.mp4"</code>
                </div>
              </div>
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
        <span className="group-hover/cli:text-zinc-50 font-gillsans font-medium tracking-[3px] pt-[3px]">CLI</span>
      </button>
    </Fragment>
  );
}
