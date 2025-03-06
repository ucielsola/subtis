import type { MetaFunction } from "@remix-run/cloudflare";
import { useCopyToClipboard } from "usehooks-ts";

// hooks
import { useToast } from "~/hooks/use-toast";

// meta
export const meta: MetaFunction = () => {
  return [
    { title: "Subtis | Preguntas Frecuentes" },
    { name: "description", content: "Subtítutlos para todas tus películas" },
  ];
};

export default function FaqPage() {
  // toast hooks
  const { toast } = useToast();

  // ts hooks
  const [_copiedText, copy] = useCopyToClipboard();

  // handlers
  async function handleCopyEmailToClipboard(): Promise<void> {
    await copy("soporte@subtis.io");

    toast({
      title: "¡Email copiado a tu clipboard!",
      description: "Escribinos y te responderemos lo antes posible.",
    });
  }

  return (
    <article className="prose dark:prose-invert pt-24 pb-48">
      <h1>Preguntas Frecuentes</h1>
      <section>
        <h2>¿Qué es Subtis?</h2>
        <p>
          Subtis es un proyecto gratuito, open-source, y sin fines de lucro, que te permite encontrar y descargar
          subtítulos sincronizados para tus películas.
        </p>
      </section>

      <section>
        <h2>¿Cómo funciona Subtis?</h2>
        <p>Subtis busca en varios proveedores de subtítulos el mejor subtítulo para tu película.</p>
      </section>

      <section>
        <h2>¿Puedo mirar y/o descargar las películas desde Subtis?</h2>
        <p>
          No. Subtis solamente proporciona subtítulos. De igual manera Subtis te permite reproducir tu video que se
          encuentra en tu computadora con el subtítulo que te proveemos.
        </p>
      </section>

      <section>
        <h2>¿Donde encuentro el reproductor de video?</h2>
        <p>
          Podés encontrar el reproductor de video cuando dropeas el archivo de video en la sección de "Buscar subtítulo
          por archivo", o también llamada Página de Subtítulo.
        </p>
      </section>

      <section>
        <h2>¿Qué formatos soporta el reproductor de video?</h2>
        <p>Por el momento solamente soportamos el formato MP4.</p>
      </section>

      <section>
        <h2>Todavía no recibí mi subtítulo en mi email. ¿Cuando lo recibiré?</h2>
        <p>Si todavía no recibiste tu subtítulo por email, es probable que aún no esté disponible.</p>
      </section>

      <section>
        <h2>No encuentro mi película en la búsqueda. ¿Cómo puedo solucionarlo?</h2>
        <p>Si tu película no está en la búsqueda significa que por el momento no tenemos los subtítulos disponibles.</p>
      </section>

      <section>
        <h2>Mi subtítulo no está sincronizado con el video. ¿Qué puedo hacer?</h2>
        <p>
          Si descargaste el subtítulo desde la página de película, probá arrastrando y soltando el archivo de video para
          poder buscar el subtítulo correcto. En caso de que el problema persista podés escribirnos a{" "}
          <button
            type="button"
            onClick={handleCopyEmailToClipboard}
            className="underline hover:text-zinc-50 transition-all ease-in-out text-zinc-300"
          >
            soporte@subtis.io
          </button>
        </p>
      </section>

      <section>
        <h2>¿Cuál es el cliente o extensión de Subtis que debería usar?</h2>
        <p>Te recomendamos principalmente la extensión para Stremio.</p>
      </section>

      <section>
        <h2>¿Qué resoluciones soporta Subtis?</h2>
        <p>Soportamos películas desde 480p hasta 2160p (4K). También soportamos películas en 3D.</p>
      </section>

      <section>
        <h2>¿Qué publicadores o release groups soporta Subtis?</h2>
        <p>Soportamos los release groups más conocidos como YTS/YIFI, GalaxyRG, ETHEL y otros 75 más.</p>
      </section>

      <section>
        <h2>¿Soportan versiones extendidas como por ej "Director's Cut", "Extended Version"?</h2>
        <p>
          Por el momento no lo soportamos pero podés contactarnos al email enviándonos la versión que estas buscando.
        </p>
      </section>

      <section>
        <h2>¿Si utilizo la búsqueda por archivo, el video se sube a algún servidor?</h2>
        <p>No, el video no se sube a ningún lado. Solo obtenemos la metadata del archivo.</p>
      </section>

      <section>
        <h2>¿Hay add-ons para software de Home Theaters como Plex o Kodi?</h2>
        <p>No, pero tenemos planes de hacerlo en el futuro.</p>
      </section>

      <section>
        <h2>¿Hay planes para ser proveedor de Bazarr?</h2>
        <p>Esto depende de Bazarr, y esto puede llegar a tomar tiempo.</p>
      </section>
    </article>
  );
}
