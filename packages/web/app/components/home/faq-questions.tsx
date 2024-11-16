import { useState } from "react";

// ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";

export function FaqQuestions() {
  // react hooks
  const [expanded, setExpanded] = useState<string>("faq-1");

  // handlers
  function handleExpandedChange(value: string) {
    setExpanded(value);
  }

  return (
    <Accordion onValueChange={handleExpandedChange} value={expanded} type="single">
      <AccordionItem value="faq-1">
        <AccordionTrigger className="text-slate-950 text-sm">Qué es Subtis?</AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          Subtis es un servicio que te permite descargar subtítulos para tus películas y series.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-2">
        <AccordionTrigger className="text-slate-950 text-sm">
          Puedo mirar y/o descargar las películas desde Subtis?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          No. Subtis solamente proporciona subtítulos.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-3">
        <AccordionTrigger className="text-slate-950 text-sm">
          Todavía no recibí mi subtítulo en mi email, cuando lo recibiré?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          Si todavía no recibiste tu subtítulo por email, es probable que aún no esté disponible.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-4">
        <AccordionTrigger className="text-slate-950 text-sm">
          No encuentro mi película en la búsqueda, como puedo solucionarlo?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          Si tu película no está en la búsqueda significa que por el momento no tenemos los subtítulos disponibles.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-5">
        <AccordionTrigger className="text-slate-950 text-sm">
          Mi subtítulo no está sincronizado con el video, qué puedo hacer?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          Si descargaste el subtítulo desde la página de película, proba arrastrando y soltando el archivo de video para
          poder buscar el subtítulo correcto. En caso de que el problema persista podes escribirnos a soporte@subt.is
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-6">
        <AccordionTrigger className="text-slate-950 text-sm">
          Cuál es el cliente o extensión de Subtis que debería usar?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          Te recomendamos principalmente la extensión para Stremio.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-7">
        <AccordionTrigger className="text-slate-950 text-sm">Qué resoluciones soporta Subtis?</AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          Soportamos títulos desde 480p hasta 2160p (4K). También soportamos títulos en 3D.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-8">
        <AccordionTrigger className="text-slate-950 text-sm">
          Qué publicadores o release groups soporta Subtis?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          Soportamos los release groups más conocidos como YTS/YIFI, GalaxyRG, ETHEL y otros 75 más.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="faq-9">
        <AccordionTrigger className="text-slate-950 text-sm">
          Soportan versiones extendidas como por ej “Director's Cut”, “Extended Version”?
        </AccordionTrigger>
        <AccordionContent className="text-slate-600 text-sm">
          Por el momento no lo soportamos pero podes contactarnos al email enviándonos la versión que estas buscando.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
