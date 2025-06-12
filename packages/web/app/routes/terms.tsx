import type { MetaFunction } from "react-router";
import { toast } from "sonner";
import { useCopyToClipboard } from "usehooks-ts";

// meta
export const meta: MetaFunction = () => {
  return [
    { title: "Subtis | Términos y Condiciones" },
    {
      name: "description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    {
      name: "keywords",
      content: "subtítulos, películas, subtis, términos y condiciones, subtítulos español, descargar subtítulos",
    },
    { name: "robots", content: "index, follow" },
    { name: "author", content: "Subtis" },
    { property: "og:title", content: "Subtis | Términos y Condiciones" },
    {
      property: "og:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: "Subtis" },
    { property: "og:url", content: "https://subtis.io/terms" },
    { property: "og:image", content: "https://subtis.io/og.png" },
    { name: "twitter:card", content: "summary" },
    { name: "twitter:site", content: "@subt_is" },
    { name: "twitter:title", content: "Subtis | Términos y Condiciones" },
    {
      name: "twitter:description",
      content:
        "Subtítulos para todas tus películas. Buscador gratuito de subtítulos en español para películas. Compatible también con Stremio y VLC. Encuentra subtítulos sincronizados y descargalos al instante.",
    },
    { name: "twitter:image", content: "https://subtis.io/twitter.png" },
  ];
};
export default function TermsPage() {
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
      <h1>Términos y Condiciones</h1>
      <section>
        <h2>1. Definición del Servicio</h2>
        <p>
          Subtis es una plataforma que ofrece <strong>exclusivamente subtítulos</strong> para películas. Estos
          subtítulos son alojados en nuestro sistema de almacenamiento y están disponibles para descarga directa desde
          nuestra plataforma.
        </p>
        <p>
          <strong>
            No proporcionamos películas, archivos de video, audio ni ningún otro contenido que infrinja derechos de
            autor.
          </strong>
        </p>
      </section>

      <section>
        <h2>2. Aviso Legal</h2>
        <p>
          Subtis solo ofrece subtítulos alojados en nuestro servidor, que creemos están libres de restricciones legales
          para su redistribución. Si surgen dudas sobre la legalidad de algún archivo, este será eliminado de inmediato
          tras el contacto correspondiente.
        </p>
        <p>
          No garantizamos que los subtítulos descargados sean compatibles con todos los reproductores o dispositivos, ni
          asumimos responsabilidad por posibles daños derivados de su uso.
        </p>
      </section>

      <section>
        <h2>3. Prohibición de Uso Comercial</h2>
        <p>
          Los subtítulos descargados desde Subtis son únicamente para uso personal. Está estrictamente prohibido
          redistribuir, modificar o usar los subtítulos con fines comerciales, sin nuestro consentimiento previo por
          escrito.
        </p>
      </section>

      <section>
        <h2>4. Responsabilidad del Usuario</h2>
        <p>
          El usuario es responsable de asegurarse de que el uso de los subtítulos cumpla con las leyes de su
          jurisdicción. Subtis no se hace responsable por el uso indebido de los subtítulos ni por actividades que
          infrinjan derechos de autor.
        </p>
      </section>

      <section>
        <h2>5. Limitación de Garantías</h2>
        <p>
          No garantizamos la funcionalidad, precisión o disponibilidad de los subtítulos proporcionados. El servicio se
          proporciona "tal cual", sin garantías de ningún tipo, ya sean explícitas o implícitas.
          <strong>Hacemos esfuerzos por mantener el sitio online, pero puede haber interrupciones.</strong>
        </p>
      </section>

      <section>
        <h2>6. Gestión de Subtítulos en la Plataforma</h2>
        <p>
          Todos los subtítulos disponibles en Subtis están alojados directamente en nuestro sistema. No dependemos de
          enlaces externos ni de servicios de terceros para proporcionar contenido.
        </p>
        <p>
          Los subtítulos son recopilados desde fuentes públicas y gestionados exclusivamente dentro de nuestra
          plataforma para garantizar su calidad y disponibilidad.
        </p>
      </section>

      <section>
        <h2>7. Finalidad de la Plataforma</h2>
        <p>
          Subtis tiene como objetivo facilitar el acceso a subtítulos para películas ya adquiridas legalmente, con fines
          educativos, culturales e inclusivos. No fomentamos actividades ilegales ni la infracción de derechos de autor.
        </p>
      </section>

      <section>
        <h2>8. Jurisdicción y Ley Aplicable</h2>
        <p>
          Estos términos se rigen por las leyes aplicables en el país del usuario o del proveedor del servicio. En caso
          de disputa, esta será resuelta en los tribunales competentes del país correspondiente.
        </p>
      </section>

      <section>
        <h2>9. Reproductor de Videos</h2>
        <p>
          Subtis incluye un reproductor de videos diseñado exclusivamente para reproducir archivos de video almacenados
          localmente por el usuario. Este reproductor no proporciona acceso a videos, películas u otros archivos
          multimedia alojados en servidores de Subtis o de terceros.
        </p>
        <p>
          Es responsabilidad del usuario asegurarse de que los videos utilizados en el reproductor cumplen con las leyes
          de derechos de autor y que tienen la propiedad o los permisos necesarios para reproducirlos. Subtis no asume
          ninguna responsabilidad por el uso de archivos multimedia que infrinjan derechos de terceros.
        </p>
      </section>

      <section>
        <h2>10. Modificaciones de los Términos</h2>
        <p>
          Subtis se reserva el derecho de actualizar estos Términos en cualquier momento. Las modificaciones se
          notificarán con una antelación mínima de X días a su entrada en vigor. Se recomienda a los usuarios revisar
          periódicamente esta sección para estar al tanto de cualquier cambio.
        </p>
      </section>

      <section>
        <h2>11. Derechos de Propiedad Intelectual</h2>
        <p>
          Todos los textos, logotipos, elementos gráficos y el diseño del sitio web son propiedad exclusiva de Subtis y
          están protegidos por las leyes de propiedad intelectual. Si bien la plataforma no provee contenido
          audiovisual, el material propio de Subtis no puede ser reproducido, distribuido o modificado sin nuestro
          consentimiento explícito por escrito.
        </p>
      </section>

      <section>
        <h2>12. Política de Datos</h2>
        <p>En Subtis, únicamente almacenamos la cantidad de bytes y los nombres de los archivos de video.</p>
      </section>

      <section>
        <h2>13. Contacto</h2>
        <p>
          Si tenés dudas, preguntas o inquietudes sobre estos términos, puedes contactarnos en{" "}
          <button
            type="button"
            onClick={handleCopyEmailToClipboard}
            className="underline hover:text-zinc-50 transition-all ease-in-out text-zinc-300 cursor-pointer"
          >
            soporte@subtis.io
          </button>
          .
        </p>
      </section>
    </article>
  );
}
