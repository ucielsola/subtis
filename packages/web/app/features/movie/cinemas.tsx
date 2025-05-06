import { Fragment } from "react";
import { useLoaderData } from "react-router";

// ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";
import { Separator } from "~/components/ui/separator";

// hooks
import { useCinemas } from "~/hooks/use-cinemas";

// types
import type { loader } from "~/routes/subtitles.movie.$slug";

export function MovieCinemas() {
  // remix hooks
  const loaderData = useLoaderData<typeof loader>();

  // query hooks
  const { data: titleCinemas } = useCinemas("message" in loaderData ? undefined : loaderData.title.slug);

  if (!titleCinemas) {
    return null;
  }

  return (
    <Fragment>
      <Separator className="my-16 bg-zinc-700 max-w-[630px]" />
      <section className="flex flex-col gap-12 mt-16 max-w-[630px]">
        <div className="flex flex-col gap-2">
          <h3 className="text-2xl font-semibold text-zinc-50">Cines</h3>
          <h4 className="text-zinc-50 text-sm md:text-base">Mirá en que cines se está proyectando la película.</h4>
        </div>
        <div className="flex flex-col gap-4">
          {Object.entries(titleCinemas.cinemas).map(([city, cinemas]) => {
            return (
              <Accordion key={city} type="single" collapsible className="w-full">
                <AccordionItem value={city}>
                  <AccordionTrigger>{city}</AccordionTrigger>
                  <AccordionContent>
                    <ul className="flex flex-col list-disc list-inside pl-4 pt-1 gap-1">
                      {cinemas.map((cinema) => (
                        <li key={cinema.name}>
                          <a
                            href={titleCinemas.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-zinc-50 text-sm hover:underline"
                          >
                            {cinema.name}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            );
          })}
        </div>
      </section>
    </Fragment>
  );
}
