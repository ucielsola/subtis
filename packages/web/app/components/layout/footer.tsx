import { Link } from "@remix-run/react";

export function HomeFooter() {
  return (
    <footer className="pt-8 pb-16 flex flex-col gap-4 border-t border-zinc-700">
      <Link to="/">
        <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px] hover:scale-105 transition-all ease-in-out" />
      </Link>
      <div className="flex flex-col md:flex-row justify-between gap-6">
        <span className="text-sm text-zinc-50">Subtis &#169; 2024</span>
        <div>
          <a
            href="https://x.com/subt_is"
            target="_blank"
            className=" text-zinc-50  hover:underline"
            rel="noopener noreferrer"
          >
            <img src="/x.svg" alt="X" className="w-4 h-4" />
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <a href="mailto:soporte@subt.is" className="text-sm text-zinc-50  hover:underline">
            Soporte
          </a>
          <a
            href="https://subtis.canny.io/feature-requests"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-zinc-50  hover:underline"
          >
            Pedir una feature
          </a>
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/faq" className="text-sm text-zinc-50  hover:underline">
            Preguntas Frecuentes
          </Link>
          <Link to="/terms" className="text-sm text-zinc-50  hover:underline">
            Términos y Condiciones
          </Link>
        </div>
      </div>
    </footer>
  );
}
