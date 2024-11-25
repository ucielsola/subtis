import { useAnimation } from "motion/react";

// ui
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

// icons
import { MessageCircleMoreIcon } from "~/components/icons/message-circle-more";

export function HomeAlert() {
  const controls = useAnimation();

  return (
    <section className="py-16 flex flex-col gap-16 items-center justify-center">
      <div className="mx-auto w-full max-w-screen-md">
        <Alert
          className="bg-zinc-900/80 border border-zinc-800 flex items-start gap-4"
          onMouseEnter={() => controls.start("animate")}
          onMouseLeave={() => controls.start("normal")}
        >
          <MessageCircleMoreIcon size={24} controls={controls} />
          <div className="pt-1">
            <AlertTitle className="text-zinc-50 text-sm">
              Actualmente contamos con todas las películas del 2024 y el Top 300 de Rotten Tomatoes.
            </AlertTitle>
            <AlertDescription className="text-zinc-400 text-sm font-normal">
              Estamos catalogando los años anteriores. Te pedimos por favor paciencia.
            </AlertDescription>
          </div>
        </Alert>
      </div>
    </section>
  );
}
