export function HomeFooter() {
  return (
    <footer className="pt-8 pb-20 flex flex-col gap-6 border-t border-slate-200">
      <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px]" />
      <div className="flex flex-row justify-between items-center">
        <span className="text-xs font-medium text-slate-600">
          Creado por{" "}
          <a href="https://www.leonardogalante.com" className="underline hover:text-slate-950">
            Leonardo Galante
          </a>
        </span>
        <div className="flex flex-row gap-4">
          <span className="text-xs text-stone-950 font-semibold">X</span>
          <span className="text-xs text-stone-950 font-semibold">Soporte</span>
          <span className="text-xs text-stone-950 font-semibold">Términos y Condiciones</span>
        </div>
      </div>
    </footer>
  );
}
