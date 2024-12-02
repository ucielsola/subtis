import { Lens } from "~/components/ui/lens";

export default function SearchPage() {
  return (
    <div className="pt-24 pb-48 flex flex-col lg:flex-row justify-between gap-4">
      <article className="max-w-xl w-full">
        <section className="flex flex-col gap-12">
          <div className="flex flex-col gap-4">
            <h1 className="text-zinc-50 text-5xl font-bold">Búsqueda en catálogo</h1>
            <h2 className="text-zinc-50">
              Ingresa el título de la película que quieras buscar su subtítulo. Soportamos búsqueda en español, inglés y
              japonés (perfecto para películas de anime).
            </h2>
          </div>
        </section>
      </article>
      <figure className="flex-1 hidden lg:flex justify-center">
        <Lens>
          <img src="/s-logo.png" alt="Cargando" className="size-64" />
        </Lens>
      </figure>
    </div>
  );
}
