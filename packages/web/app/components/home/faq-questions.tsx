import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "~/components/ui/accordion";
import { ChevronUp } from "lucide-react";
import { useState } from "react";

export function FaqQuestions() {
  // react hooks
  const [expanded, setExpanded] = useState<React.Key | null>("faq-1");

  // handlers
  function handleExpandedChange(value: React.Key | null) {
    setExpanded(value);
  }

  return (
    <Accordion
      className="flex w-full flex-col divide-y divide-zinc-200 dark:divide-zinc-700"
      transition={{ duration: 0.2, ease: "easeInOut" }}
      onValueChange={handleExpandedChange}
      expandedValue={expanded}
    >
      <AccordionItem value="faq-1" className="py-2">
        <AccordionTrigger className="w-full text-left text-slate-950 dark:text-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">Puedo mirar y/o descargar las películas desde Subtis?</div>
            <ChevronUp className="h-4 w-4 text-slate-950 transition-transform duration-200 group-data-[expanded]:-rotate-180 dark:text-zinc-50" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-zinc-500 dark:text-zinc-400">No. Subtis solamente proporciona subtítulos.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-2" className="py-2">
        <AccordionTrigger className="w-full text-left text-slate-950 dark:text-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">Todavía no recibí mi subtítulo en mi email, qué tengo que hacer?</div>
            <ChevronUp className="h-4 w-4 text-slate-950 transition-transform duration-200 group-data-[expanded]:-rotate-180 dark:text-zinc-50" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-zinc-500 dark:text-zinc-400">
            Si todavía no recibiste tu subtítulo por email, es probable que aún no esté disponible. De todos modos,
            podés escribirnos a soporte@subt.is
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-3" className="py-2">
        <AccordionTrigger className="w-full text-left text-slate-950 dark:text-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">No encuentro mi película o serie en el Catálogo, qué tengo que hacer?</div>
            <ChevronUp className="h-4 w-4 text-slate-950 transition-transform duration-200 group-data-[expanded]:-rotate-180 dark:text-zinc-50" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-zinc-500 dark:text-zinc-400">
            Si tu película o serie no está en el Catálogo significa que por el momento no tenemos los subtítulos
            disponibles.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-4" className="py-2">
        <AccordionTrigger className="w-full text-left text-slate-950 dark:text-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">
              Mi subtítulo no está bien sincronizado con el video, qué tengo que hacer?
            </div>
            <ChevronUp className="h-4 w-4 text-slate-950 transition-transform duration-200 group-data-[expanded]:-rotate-180 dark:text-zinc-50" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-zinc-500 dark:text-zinc-400">
            Si descargaste el subtítulo desde la búsqueda por Catálogo, proba arrastrando y soltando el archivo de video
            para poder buscar el subtítulo correcto desde la página principal.
          </p>
          <p className="text-zinc-500 dark:text-zinc-400">
            En caso de que el problema persista podes escribirnos a soporte@subt.is
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-5" className="py-2">
        <AccordionTrigger className="w-full text-left text-slate-950 dark:text-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">Cuál es la extensión de Subtis que debería usar?</div>
            <ChevronUp className="h-4 w-4 text-slate-950 transition-transform duration-200 group-data-[expanded]:-rotate-180 dark:text-zinc-50" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-zinc-500 dark:text-zinc-400">Te recomendamos principalmente la extensión para Stremio.</p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-6" className="py-2">
        <AccordionTrigger className="w-full text-left text-slate-950 dark:text-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">Qué resoluciones soporta Subtis?</div>
            <ChevronUp className="h-4 w-4 text-slate-950 transition-transform duration-200 group-data-[expanded]:-rotate-180 dark:text-zinc-50" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-zinc-500 dark:text-zinc-400">
            Soportamos títulos desde 480p hasta 2160p (4K). También soportamos títulos en 3D.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-7" className="py-2">
        <AccordionTrigger className="w-full text-left text-slate-950 dark:text-zinc-50">
          <div className="flex items-center justify-between">
            <div className="text-slate-600">Qué release groups soporta Subtis?</div>
            <ChevronUp className="h-4 w-4 text-slate-950 transition-transform duration-200 group-data-[expanded]:-rotate-180 dark:text-zinc-50" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-zinc-500 dark:text-zinc-400">
            Soportamos los release group más conocidos como YTS/YIFI. También soportamos otros release group como
            GalaxyRG o ETHEL.
          </p>
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-8" className="py-2">
        <AccordionTrigger className="w-full text-left text-slate-950 dark:text-zinc-50">
          <div className="flex items-center justify-between">
            <div>Soportan versiones extendidas como por ej “Director's Cut”, “Extended Version”?</div>
            <ChevronUp className="h-4 w-4 text-slate-950 transition-transform duration-200 group-data-[expanded]:-rotate-180 dark:text-zinc-50" />
          </div>
        </AccordionTrigger>
        <AccordionContent className="pt-4">
          <p className="text-zinc-500 dark:text-zinc-400">
            Por el momento no lo soportamos pero podes contactarnos al email enviándonos la versión que estas buscando.
          </p>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
