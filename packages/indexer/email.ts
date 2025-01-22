import { Resend } from "resend";

// constants
const resend = new Resend(process.env.RESEND_API_KEY);

// api
import type { SubtisSubtitleNormalized } from "@subtis/api/shared/parsers";

// helpers
export async function sendEmail(subtitle: SubtisSubtitleNormalized, email: string) {
  const isMovie = subtitle.title.type === "movie";
  const isTvShow = subtitle.title.type === "tv-show";

  const type = isMovie ? "pelicula" : "serie";
  const season = isTvShow
    ? ` - Temporada: ${subtitle.subtitle.current_season} - Episodio: ${subtitle.subtitle.current_episode}`
    : ` - ${subtitle.title.year}`;

  try {
    const data = await resend.emails.send({
      from: "soporte@subtis.io",
      to: email,
      subject: "Subtis | Encontramos tu subtítulo! 🎉",
      html: `<div>
        <p>Encontramos el subtítulo para tu ${type}: ${subtitle.title.title_name}${season}</p>
        <p>Ya contamos con la versión para la resolución ${subtitle.subtitle.resolution} y publicador ${subtitle.release_group.release_group_name}</p>

        <p>Descarga tu subtítulo desde el siguiente <a href="${subtitle.subtitle.subtitle_link}" target="_blank" rel="noreferrer">link</a></p>

        <img src="${subtitle.title.optimized_poster}" alt="${subtitle.title.title_name}" width="384px" />
      </div>`,
    });

    if (data.error) {
      throw new Error("Email not sent");
    }

    console.log("\n ~ forawait ~ data:", data);
  } catch (error) {
    console.log("\n ~ forawait ~ error:", error);
  }
}
