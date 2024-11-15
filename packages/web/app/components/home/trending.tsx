// ui
import { TrendingSlider } from "~/components/home/trending-slider";
import { NewsSlider } from "~/components/home/news-slider";
export function HomeTrending() {
  return (
    <section className="py-16 flex flex-col gap-32">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-slate-950 text-3xl font-semibold">Trending</h3>
          <h4 className="text-slate-600">Descubrí los títulos más descargados del momento.</h4>
        </div>
        <TrendingSlider />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h3 className="text-slate-950 text-3xl font-semibold">Novedades</h3>
          <h4 className="text-slate-600">Encontrá los últimos títulos agregados a la plataforma.</h4>
        </div>
        <NewsSlider />
      </div>
    </section>
  );
}
