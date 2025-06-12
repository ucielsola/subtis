import type { MetaFunction } from "react-router";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

// meta
export const meta: MetaFunction = () => {
  return [
    { title: "Subtis | Preguntas Frecuentes" },
    {
      name: "description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    {
      name: "keywords",
      content: "subtítulos, películas, subtis, faq, preguntas frecuentes, subtítulos español, descargar subtítulos",
    },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Subtis" },
    { property: "og:title", content: "Subtis | Preguntas Frecuentes" },
    {
      property: "og:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Subtis" },
    { property: "og:url", content: "https://subtis.io/faq" },
    { property: "og:image", content: "https://subtis.io/og.png" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@subt_is" },
    { name: "twitter:title", content: "Subtis | Preguntas Frecuentes" },
    {
      name: "twitter:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { name: "twitter:image", content: "https://subtis.io/twitter.png" },
  ];
};

export default function FaqPage() {
  // ts hooks
  const [_copiedText, copy] = useCopyToClipboard();

  // handlers
  async function handleCopyEmailToClipboard(): Promise<void> {
    await copy("soporte@subtis.io");

    toast.success("¡Email copiado al portapapeles!", {
      description: "Escribinos y te responderemos lo antes posible.",
    });
  }

  return (
    <article className="prose prose-invert pt-24 pb-48">
      <h1>Preguntas Frecuentes</h1>
      <section>
        <h2>¿Qué es Subtis?</h2>
        <p>
          Subtis es una herramienta gratuita y open-source para encontrar y descargar subtítulos sincronizados para tus
          películas.
        </p>
      </section>

      <section>
        <h2>¿Qué películas tienen subtítulos disponibles?</h2>
        <p>
          Hoy tenemos todas las películas del 2025 y el top 300 de Rotten Tomatoes. Estamos sumando los años anteriores,
          así que pronto vas a tener muchas más opciones.
        </p>
      </section>

      <section>
        <h2>¿Cómo funciona?</h2>
        <p>Buscamos en varios sitios de subtítulos para encontrarte el mejor subtítulo para tu película.</p>
      </section>

      <section>
        <h2>¿Dónde está el reproductor?</h2>
        <p>Lo encontrás cuando arrastrás un archivo en "Buscar subtítulo por archivo" o en la página del subtítulo.</p>
      </section>

      <section>
        <h2>No encuentro mi película. ¿Qué hago?</h2>
        <p>Si no aparece en la búsqueda es porque todavía no tenemos subtítulos para esa película.</p>
      </section>

      <section>
        <h2>El subtítulo no coincide con el video. ¿Cómo lo arreglo?</h2>
        <p>
          Si bajaste el subtítulo desde la página de la película, probá arrastrando el archivo de video para buscar el
          subtítulo correcto. Si sigue sin funcionar, escribinos a{" "}
          <button
            type="button"
            onClick={handleCopyEmailToClipboard}
            className="underline hover:text-zinc-50 transition-all ease-in-out text-zinc-300 cursor-pointer"
          >
            soporte@subtis.io
          </button>
        </p>
      </section>

      <section>
        <h2>¿Puedo ver o descargar películas desde acá?</h2>
        <p>
          No, solo damos subtítulos. Pero podés reproducir el video que tengas en tu compu con el subtítulo que te
          damos.
        </p>
      </section>

      <section>
        <h2>¿Se sube mi video a algún servidor?</h2>
        <p>No, tu video se queda en tu computadora. Solo leemos la información del archivo.</p>
      </section>

      <section>
        <h2>¿Qué formatos de video acepta?</h2>
        <p>Por el momento solamente MP4, MKV y AVI.</p>
      </section>

      <section>
        <h2>No me llegó el subtítulo por email. ¿Cuándo llega?</h2>
        <p>Si no te llegó, probablemente todavía no esté listo. Te avisamos apenas lo tengamos.</p>
      </section>

      <section>
        <h2>¿Cómo recomiendan usar Subtis?</h2>
        <p>Te recomendamos usar la extensión para Stremio.</p>
      </section>

      <section>
        <h2>¿Qué resoluciones soportan?</h2>
        <p>Desde 480p hasta 4K (2160p). También películas en 3D.</p>
      </section>

      <section>
        <h2>¿Qué grupos de release soportan?</h2>
        <p>Los más conocidos como YTS/YIFI, GalaxyRG, ETHEL y otros 200 más.</p>
      </section>

      <section>
        <h2>¿Tienen versiones extendidas como "Director's Cut"?</h2>
        <p>Todavía no, pero escribinos contándonos qué versión buscás y vemos qué podemos hacer.</p>
      </section>

      <section>
        <h2>¿Hay extensiones para Plex o Kodi?</h2>
        <p>Todavía no, pero está en nuestros planes hacerlas.</p>
      </section>

      <section>
        <h2>¿Van a ser proveedor de Bazarr?</h2>
        <p>Depende de ellos, pero puede llevar tiempo.</p>
      </section>
    </article>
  );
}
