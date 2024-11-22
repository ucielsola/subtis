export function HomeFooter() {
  return (
    <footer className="pt-8 pb-20 flex flex-col gap-6 border-t border-zinc-200">
      <img src="/logo.png" alt="Subtis" className="w-24 h-[38.9px] dark:hidden" />
      <img src="/logo-dark.png" alt="Subtis" className="w-24 h-[38.9px] hidden dark:block" />
      <div className="flex flex-row justify-between items-center">
        <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
          Creado por{" "}
          <a href="https://www.leonardogalante.com" className="underline hover:text-zinc-950 dark:hover:text-zinc-50">
            Leonardo Galante
          </a>
        </span>
        <div className="flex flex-row gap-4">
          <span className="text-xs text-zinc-950 dark:text-zinc-50 font-semibold">X</span>
          <span className="text-xs text-zinc-950 dark:text-zinc-50 font-semibold">Soporte</span>
          <span className="text-xs text-zinc-950 dark:text-zinc-50 font-semibold">Términos y Condiciones</span>
        </div>
      </div>
    </footer>
  );
}
