// internals
import { NewsSlider } from "~/features/home/news-slider";
import { TrendingSlider } from "~/features/home/trending-slider";

export function HomeTrending() {
  return (
    <section className="py-16 flex flex-col gap-32">
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 text-center">
          <h3 className="text-zinc-50 text-4xl font-bold text-balance">Subtítulos más buscados</h3>
          <h4 className="text-zinc-400 text-balance">Descubrí los subtítulos más descargados del momento.</h4>
        </div>
        <TrendingSlider />
      </div>

      <div className="flex flex-col pt-96 pb-72">
        <div className="flex flex-col gap-4 text-center">
          <h3 className="text-zinc-50 text-4xl font-bold text-balance">Películas recientes</h3>
          <h4 className="text-zinc-400 text-balance">Encontrá subtítulos sincronizados para los últimos estrenos.</h4>
        </div>
        <NewsSlider />
      </div>
    </section>
  );
}
