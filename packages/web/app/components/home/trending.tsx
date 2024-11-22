// internals
import { NewsSlider } from "~/components/home/news-slider";
import { TrendingSlider } from "~/components/home/trending-slider";

export function HomeTrending() {
  return (
    <section className="py-16 flex flex-col gap-32">
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-slate-950 text-3xl font-semibold">Subtítulos más buscados</h3>
          <h4 className="text-slate-600">Descubrí los subtítulos más descargados del momento.</h4>
        </div>
        <TrendingSlider />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-2">
          <h3 className="text-slate-950 text-3xl font-semibold">Últimos subtítulos cargados</h3>
          <h4 className="text-slate-600">Descarga los subtítulos para las últimas películas agregadas.</h4>
        </div>
        <NewsSlider />
      </div>
    </section>
  );
}
