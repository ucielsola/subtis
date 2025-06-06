import { useLoaderData } from "react-router";
import { Fragment } from "react/jsx-runtime";

// hooks
import { usePlatforms } from "~/hooks/use-platforms";

// ui
import { Separator } from "~/components/ui/separator";

// types
import type { loader } from "~/routes/subtitles.movie.$slug";

export function MoviePlatforms() {
  // remix hooks
  const loaderData = useLoaderData<typeof loader>();

  // query hooks
  const { data: titlePlatforms } = usePlatforms("message" in loaderData ? undefined : loaderData.title.slug);

  // ui
  if (!titlePlatforms || titlePlatforms.platforms.length === 0) {
    return null;
  }

  return (
    <Fragment>
      <Separator className="my-16 bg-zinc-800 max-w-[630px]" />
      <section className="flex flex-col gap-12 mt-16 max-w-[630px]">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-zinc-50">Plataformas</h3>
          <h4 className="text-zinc-50 text-sm md:text-base">
            También podés disfrutar de la película en las siguientes plataformas.
          </h4>
        </div>
        <ul className="flex flex-col list-disc list-inside">
          {titlePlatforms.platforms.map((platform) => (
            <li key={platform.name}>
              <a href={platform.url} target="_blank" rel="noreferrer" className="text-zinc-50 text-sm hover:underline">
                {platform.name}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </Fragment>
  );
}
