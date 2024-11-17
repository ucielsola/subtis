import { useState } from "react";

// ui
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/ui/accordion";

// constants
const FAQ_QUESTIONS = [
  {
    id: "faq-1",
    question: "Qué es Subtis?",
    answer: "Subtis es un servicio que te permite descargar subtítulos para tus películas.",
  },
  {
    id: "faq-2",
    question: "Como funciona Subtis?",
    answer: "Subtis busca en varios proveedores de subtitulos el mejor subtitulo para tu pelicula.",
  },
  {
    id: "faq-3",
    question: "Puedo mirar y/o descargar las películas desde Subtis?",
    answer: "No. Subtis solamente proporciona subtítulos.",
  },
  {
    id: "faq-4",
    question: "Todavía no recibí mi subtítulo en mi email, cuando lo recibiré?",
    answer: "Si todavía no recibiste tu subtítulo por email, es probable que aún no esté disponible.",
  },
  {
    id: "faq-5",
    question: "No encuentro mi película en la búsqueda, como puedo solucionarlo?",
    answer: "Si tu película no está en la búsqueda significa que por el momento no tenemos los subtítulos disponibles.",
  },
  {
    id: "faq-6",
    question: "Mi subtítulo no está sincronizado con el video, qué puedo hacer?",
    answer:
      "Si descargaste el subtítulo desde la página de película, proba arrastrando y soltando el archivo de video para poder buscar el subtítulo correcto. En caso de que el problema persista podes escribirnos a soporte@subt.is",
  },
  {
    id: "faq-7",
    question: "Cuál es el cliente o extensión de Subtis que debería usar?",
    answer: "Te recomendamos principalmente la extensión para Stremio.",
  },
  {
    id: "faq-8",
    question: "Qué resoluciones soporta Subtis?",
    answer: "Soportamos títulos desde 480p hasta 2160p (4K). También soportamos títulos en 3D.",
  },
  {
    id: "faq-9",
    question: "Qué publicadores o release groups soporta Subtis?",
    answer: "Soportamos los release groups más conocidos como YTS/YIFI, GalaxyRG, ETHEL y otros 75 más.",
  },
  {
    id: "faq-10",
    question: "Soportan versiones extendidas como por ej “Director's Cut”, “Extended Version”?",
    answer:
      "Por el momento no lo soportamos pero podes contactarnos al email enviándonos la versión que estas buscando.",
  },
  {
    id: "faq-11",
    question: "Si utilizo la búsqueda por archivo, el video se sube a algún servidor?",
    answer: "No, el video no se sube a ningún lado. Solo obtenemos la metadata del archivo.",
  },
];

export function FaqQuestions() {
  // react hooks
  const [expanded, setExpanded] = useState<string>("faq-1");

  // handlers
  function handleExpandedChange(value: string) {
    setExpanded(value);
  }

  return (
    <Accordion onValueChange={handleExpandedChange} value={expanded} type="single">
      {FAQ_QUESTIONS.map((question) => (
        <AccordionItem key={question.id} value={question.id}>
          <AccordionTrigger className="text-slate-950 text-sm">{question.question}</AccordionTrigger>
          <AccordionContent className="text-slate-600 text-sm">{question.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
