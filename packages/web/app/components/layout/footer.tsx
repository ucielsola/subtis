import { Link } from "@remix-run/react";

export function HomeFooter() {
  return (
    <footer className="pt-8 pb-20 flex flex-col gap-6 border-t border-zinc-700">
      <Link to="/">
        <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px] hover:scale-105 transition-all ease-in-out" />
      </Link>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <span className="text-xs font-medium text-zinc-400">
          Creado por{" "}
          <a
            href="https://www.leonardogalante.com"
            target="_blank"
            className="underline hover:text-zinc-50"
            rel="noreferrer"
          >
            Leonardo Galante
          </a>
        </span>
        <div className="flex flex-row gap-4">
          <a
            href="https://x.com/subt_is"
            target="_blank"
            className="text-xs text-zinc-50 font-semibold hover:underline"
            rel="noreferrer"
          >
            X
          </a>
          <a href="mailto:soporte@subt.is" className="text-xs text-zinc-50 font-semibold hover:underline">
            Soporte
          </a>
          <Link to="/terms" className="text-xs text-zinc-50 font-semibold hover:underline">
            Términos y Condiciones
          </Link>
        </div>
      </div>
    </footer>
  );
}
