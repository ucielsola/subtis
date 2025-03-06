import { useAnimation } from "motion/react";

// ui
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

// icons
import { MessageCircleMoreIcon } from "~/components/icons/message-circle-more";

export function HomeAlert() {
  const controls = useAnimation();

  return (
    <section className="py-24 flex flex-col gap-16 items-center justify-center">
      <div className="mx-auto w-full max-w-screen-md">
        <Alert
          className="bg-zinc-950 border border-zinc-700 flex items-start gap-4"
          onMouseEnter={() => controls.start("animate")}
          onMouseLeave={() => controls.start("normal")}
        >
          <MessageCircleMoreIcon size={24} controls={controls} className="flex-shrink-0" />
          <div className="pt-1">
            <AlertTitle className="text-zinc-50">
              Actualmente contamos con todas las películas del 2025 y el Top 300 de Rotten Tomatoes.
            </AlertTitle>
            <AlertDescription className="text-zinc-400 text-sm font-normal">
              Estamos catalogando los años anteriores. Pronto estará disponible un catálogo mucho más amplio.
            </AlertDescription>
          </div>
        </Alert>
      </div>
    </section>
  );
}
