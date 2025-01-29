import { Link } from "@remix-run/react";

// hooks
import { useToast } from "~/hooks/use-toast";

// components
import { AnimatedLogo } from "~/components/shared/animated-logo";

export function HomeFooter() {
  // toast hooks
  const { toast } = useToast();

  // handlers
  function handleCopyEmailToClipboard() {
    navigator.clipboard.writeText("soporte@subtis.io");
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
        <span className="text-[11px] text-zinc-50 text-left">Subtis &#169; 2025</span>
      </div>
      <div className="flex flex-col gap-2 py-2">
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
          Soporte vía email
        </button>
      </div>
      <div className="flex flex-col gap-2  py-2">
        <Link to="/faq" className="text-xs font-medium text-zinc-50  hover:underline">
          Preguntas Frecuentes
        </Link>
        <Link to="/terms" className="text-xs font-medium text-zinc-50  hover:underline">
          Términos y Condiciones
        </Link>
      </div>
      <a
        href="https://x.com/subt_is"
        target="_blank"
        className="text-xs font-medium text-zinc-50 hover:underline flex items-center gap-1.5 py-2"
        rel="noopener noreferrer"
      >
        Seguinos en
        <img src="/x.svg" alt="X" className="w-4 h-4" />
      </a>
    </footer>
  );
}
