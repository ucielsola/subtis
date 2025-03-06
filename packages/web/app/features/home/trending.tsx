// internals
import { NewsSlider } from "~/features/home/news-slider";
import { TrendingSlider } from "~/features/home/trending-slider";

export function HomeTrending() {
  return (
    <section className="py-16 flex flex-col gap-32">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-zinc-50 text-3xl font-semibold">Subtítulos más buscados</h3>
          <h4 className="text-zinc-400">Descubrí los subtítulos más descargados del momento.</h4>
        </div>
        <TrendingSlider />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-zinc-50 text-3xl font-semibold">Películas recientes</h3>
          <h4 className="text-zinc-400">Encontrá subtítulos sincronizados para los últimos estrenos.</h4>
        </div>
        <NewsSlider />
      </div>
    </section>
  );
}
