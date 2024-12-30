import type { MetaFunction } from "@remix-run/react";

// meta
export const meta: MetaFunction = () => {
  return [
    { title: "Subtis | Términos y Condiciones" },
    { name: "description", content: "Subtítutlos para todas tus películas" },
  ];
};
export default function TermsPage() {
  return (
    <article className="prose dark:prose-invert pt-24 pb-48">
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
        <h2>10. Contacto</h2>
        <p>
          Si tienes dudas, preguntas o inquietudes sobre estos términos, puedes contactarnos en{" "}
          <a href="mailto:soporte@subtis.com">soporte@subtis.com</a>.
        </p>
      </section>
    </article>
  );
}
