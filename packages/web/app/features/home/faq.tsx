// ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";

export function HomeFaq() {
  return (
    <section className="py-24 pb-72 flex flex-col gap-20 items-center justify-center">
      <div className="flex flex-col gap-4 items-center justify-center text-center">
        <h2 className="text-zinc-50 text-4xl font-semibold text-balance">Preguntas Frecuentes</h2>
      </div>
      <div className="flex flex-col gap-16 md:flex-row justify-between w-full max-w-[600px]">
        <Accordion type="multiple" className="w-full" defaultValue={["item-1", "item-2", "item-3"]}>
          <AccordionItem value="item-1">
            <AccordionTrigger className="text-zinc-50 text-sm font-medium font-gillsans uppercase tracking-[3px] py-4">
              ¿Qué es Subtis?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <p className="text-zinc-400 text-normal">
                Subtis es un proyecto gratuito y open-source que te permite encontrar y descargar subtítulos
                sincronizados para tus películas.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger className="text-zinc-50 text-sm font-medium font-gillsans uppercase tracking-[3px] py-4">
              ¿Puedo mirar y/o descargar las películas desde Subtis?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <p className="text-zinc-400 text-normal">
                No. Subtis solamente proporciona subtítulos. Sin embargo, te permite reproducir el video que tengas en
                tu computadora con el subtítulo que te damos.
              </p>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger className="text-zinc-50 text-sm font-medium font-gillsans uppercase tracking-[3px] py-4">
              ¿Cómo funciona Subtis?
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-4">
              <p className="text-zinc-400 text-normal">
                Subtis en alto nivel busca en varios proveedores de subtítulos el mejor subtítulo para tu película.
              </p>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </section>
  );
}
