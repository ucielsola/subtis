// internals
import { FaqQuestions } from "~/components/home/faq-questions";

export function HomeFaq() {
  return (
    <section className="py-16 flex flex-col gap-16 items-center justify-center">
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-950 dark:text-zinc-50 text-4xl font-bold text-balance">Preguntas Frecuentes</h2>
      </div>
      <div className="mx-auto w-full max-w-screen-sm">
        <FaqQuestions />
        <p className="text-zinc-600 dark:text-zinc-400 text-sm mt-8">
          Te quedaron dudas? Podes escribirnos a{" "}
          <a
            href="mailto:soporte@subt.is"
            className="underline hover:text-zinc-950 dark:hover:text-zinc-50 transition-all ease-in-out"
          >
            soporte@subt.is
          </a>
        </p>
      </div>
    </section>
  );
}
