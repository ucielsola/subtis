import { Link } from "@remix-run/react";
import { useCopyToClipboard } from "usehooks-ts";

// hooks
import { useToast } from "~/hooks/use-toast";

// components
import { AnimatedLogo } from "~/components/shared/animated-logo";

export function HomeFooter() {
  // toast hooks
  const { toast } = useToast();

  // ts hooks
  const [_copiedText, copy] = useCopyToClipboard();

  // handlers
  async function handleCopyEmailToClipboard(): Promise<void> {
    await copy("soporte@subtis.io");
    toast({
      title: "¡Email copiado a tu clipboard!",
      description: "Escribinos y te responderemos lo antes posible.",
    });
  }

  return (
    <footer className="pt-8 pb-16 flex flex-col md:flex-row justify-between items-start gap-6 md:gap-4 border-t border-zinc-700">
      <div className="flex flex-col gap-2 items-start">
        <Link to="/" className="cursor-pointer group">
          <AnimatedLogo />
        </Link>
        <span className="text-[13px] text-zinc-50 text-left">Subtis &#169; 2025</span>
      </div>

      <div className="flex flex-col gap-2 py-2">
        <span className="text-xs font-bold text-zinc-300 mb-1">Desarrolladores</span>
        <a
          href="https://api.subt.is/v1/docs"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-zinc-50  hover:underline"
        >
          Conectate a la API
        </a>
        <a
          href="https://github.com/lndgalante/subtis"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-zinc-50  hover:underline"
        >
          Repositorio en GitHub
        </a>
      </div>

      <div className="flex flex-col gap-2 py-2">
        <span className="text-xs font-bold text-zinc-300 mb-1">Soporte</span>
        <a
          href="https://subtis.canny.io/feature-requests"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-medium text-zinc-50  hover:underline"
        >
          Pedir una feature
        </a>
        <button
          type="button"
          onClick={handleCopyEmailToClipboard}
          className="text-xs font-medium text-zinc-50  hover:underline inline-flex"
        >
          Contacto vía email
        </button>
      </div>

      <div className="flex flex-col gap-2  py-2">
        <span className="text-xs font-bold text-zinc-300 mb-1">Legal</span>
        <Link to="/faq" className="text-xs font-medium text-zinc-50  hover:underline">
          Preguntas Frecuentes
        </Link>
        <Link to="/terms" className="text-xs font-medium text-zinc-50  hover:underline">
          Términos y Condiciones
        </Link>
      </div>

      <div className="flex flex-col gap-2 py-2">
        <span className="text-xs font-bold text-zinc-300 mb-1">Redes</span>
        <a
          href="https://x.com/subt_is"
          target="_blank"
          className="text-xs font-medium text-zinc-50 hover:underline flex items-center gap-1.5"
          rel="noopener noreferrer"
        >
          Seguinos en
          <img src="/x.svg" alt="X" className="w-4 h-4" />
        </a>
        <span className="text-xs font-medium text-zinc-50 hover:underline flex items-center gap-1.5 cursor-wait">
          Pronto en Instagram
        </span>
      </div>
    </footer>
  );
}
