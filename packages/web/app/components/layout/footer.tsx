import { Link } from "@remix-run/react";

export function HomeFooter() {
  return (
    <footer className="pt-8 pb-20 flex flex-col gap-6 border-t border-zinc-700">
      <Link to="/">
        <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px] hover:scale-105 transition-all ease-in-out" />
      </Link>
      <div className="flex flex-col-reverse md:flex-row justify-between md:items-center gap-6">
        <div className="flex flex-row gap-4 items-center">
          <a
            href="https://x.com/subt_is"
            target="_blank"
            className=" text-zinc-50 font-semibold hover:underline"
            rel="noreferrer"
          >
            <img src="/x.svg" alt="X" className="w-4 h-4" />
          </a>
          <a href="mailto:soporte@subt.is" className="text-sm text-zinc-50 font-semibold hover:underline">
            Soporte
          </a>
          <Link to="/terms" className="text-sm text-zinc-50 font-semibold hover:underline">
            Términos y Condiciones
          </Link>
        </div>
        <span className="text-sm font-medium text-zinc-50">Subtis &#169; 2024</span>
      </div>
    </footer>
  );
}
