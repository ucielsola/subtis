export function HomeFooter() {
  return (
    <footer className="pt-8 pb-20 flex flex-col gap-6 border-t border-slate-200">
      <img src="/logo.png" alt="Subtis" className="max-w-24" />
      <div className="flex flex-col gap-3">
        <div className="flex flex-row gap-4">
          <span className="text-xs text-stone-950 font-semibold">X</span>
          <span className="text-xs text-stone-950 font-semibold">Soporte</span>
          <span className="text-xs text-stone-950 font-semibold">Términos y Condiciones</span>
        </div>
        <span className="text-xs font-medium text-slate-600">Subtis es un proyecto creado por Leonardo Galante.</span>
      </div>
    </footer>
  );
}
