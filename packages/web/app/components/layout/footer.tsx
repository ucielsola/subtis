import { Link } from "@remix-run/react";

export function HomeFooter() {
  return (
    <footer className="pt-8 pb-20 flex flex-col gap-6 border-t border-zinc-700">
      <Link to="/">
        <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px]" />
      </Link>
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-6">
        <span className="text-xs font-medium text-zinc-400">
          Creado por{" "}
          <a href="https://www.leonardogalante.com" className="underline hover:text-zinc-50">
            Leonardo Galante
          </a>
        </span>
        <div className="flex flex-row gap-4">
          <span className="text-xs text-zinc-50 font-semibold">X</span>
          <span className="text-xs text-zinc-50 font-semibold">Soporte</span>
          <span className="text-xs text-zinc-50 font-semibold">Términos y Condiciones</span>
        </div>
      </div>
    </footer>
  );
}
