// internals
import { NewsSlider } from "~/features/home/news-slider";
import { TrendingSlider } from "~/features/home/trending-slider";

export function HomeTrending() {
  return (
    <section className="py-16 flex flex-col gap-32">
      <div className="flex flex-col">
        <div className="flex flex-col gap-4 text-center">
          <h3 className="text-zinc-50 text-3xl font-semibold text-balance">Los más buscados</h3>
          <h4 className="text-zinc-400 text-balance">Mirá los subtítulos más vistos del momento</h4>
        </div>
        <TrendingSlider />
      </div>

      <div className="flex flex-col pt-[514px] pb-72">
        <div className="flex flex-col gap-4 text-center">
          <h3 className="text-zinc-50 text-3xl font-semibold text-balance">Últimos estrenos</h3>
          <h4 className="text-zinc-400 text-balance">Subtítulos para las películas recién salidas</h4>
        </div>
        <NewsSlider />
      </div>
    </section>
  );
}
