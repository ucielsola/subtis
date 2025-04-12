import { Link } from "react-router";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

import { GitHub } from "~/components/logos/github";
// logos
import { X } from "~/components/logos/x";

// shared components
import { AnimatedLogo } from "~/components/shared/animated-logo";

export function HomeFooter() {
  // ts hooks
  const [_copiedText, copy] = useCopyToClipboard();

  // handlers
  async function handleCopyEmailToClipboard(): Promise<void> {
    await copy("soporte@subtis.io");
    toast.success("¡Email copiado a tu clipboard!", {
      description: "Escribinos y te responderemos lo antes posible.",
    });
  }

  return (
    <footer className="pt-8 pb-20 flex flex-col gap-6 border-t border-zinc-700">
      <div className="flex md:flex-row flex-col gap-6 justify-between items-start">
        <Link to="/" className="cursor-pointer group">
          <AnimatedLogo />
        </Link>

        <div className="flex flex-row gap-16">
          <div className="flex flex-col gap-2 py-2">
            <span className="text-xs font-bold text-zinc-400 mb-1">Soporte</span>
            <a
              href="https://subtis.canny.io/feature-requests"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-zinc-50 hover:underline"
            >
              Pedir una feature
            </a>
            <button
              type="button"
              onClick={handleCopyEmailToClipboard}
              className="text-xs font-medium text-zinc-50 hover:underline inline-flex"
            >
              Contacto vía email
            </button>
          </div>

          <div className="flex flex-col gap-2 py-2">
            <span className="text-xs font-bold text-zinc-400 mb-1">Desarrolladores</span>
            <a
              href="https://api.subt.is/v1/docs"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-zinc-50 hover:underline"
            >
              Conectate a la API
            </a>
            <a
              href="https://github.com/lndgalante/subtis"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-zinc-50 hover:underline"
            >
              Repositorio en GitHub
            </a>
          </div>

          <div className="flex flex-col gap-2 py-2">
            <span className="text-xs font-bold text-zinc-400 mb-1">Legal</span>
            <Link to="/faq" className="text-xs font-medium text-zinc-50 hover:underline">
              Preguntas Frecuentes
            </Link>
            <Link to="/terms" className="text-xs font-medium text-zinc-50 hover:underline">
              Términos y Condiciones
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-row justify-between items-center flex-1 pt-7 mt-20">
        <span className="text-xs text-zinc-400 text-left">&#169; Subtis {new Date().getFullYear()}</span>

        <div className="flex flex-row gap-4">
          <a href="https://x.com/subt_is" target="_blank" rel="noopener noreferrer">
            <X className="w-4 h-4 fill-zinc-400 hover:fill-zinc-50 transition-all duration-300 ease-in-out" />
          </a>
          <a href="https://github.com/lndgalante/subtis" target="_blank" rel="noopener noreferrer">
            <GitHub className="w-4 h-4 fill-zinc-400 hover:fill-zinc-50 transition-all duration-300 ease-in-out" />
          </a>
        </div>
      </div>
    </footer>
  );
}
