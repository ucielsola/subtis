import { Resend } from "resend";
import type { z } from "zod";

// constants
const resend = new Resend(process.env.RESEND_API_KEY);

// api
import type { subtitleSchema } from "@subtis/api/shared/schemas";

// types
type Subtitle = z.infer<typeof subtitleSchema>;

// helpers
export async function sendEmail(subtitle: Subtitle, email: string) {
  const isMovie = subtitle.title.type === "movie";
  const isTvShow = subtitle.title.type === "tv-show";

  const type = isMovie ? "pelicula" : "serie";
  const season = isTvShow
    ? ` - Temporada: ${subtitle.current_season} - Episodio: ${subtitle.current_episode}`
    : ` - ${subtitle.title.year}`;

  try {
    const data = await resend.emails.send({
      from: "soporte@subt.is",
      to: email,
      subject: "Subtis | Encontramos tu subtítulo! 🎉",
      html: `<div>
        <p>Encontramos el subtitulo para tu ${type}: ${subtitle.title.title_name}${season}</p>
        <p>Ya contamos con la versión para la resolución ${subtitle.resolution} y publicador ${subtitle.releaseGroup.release_group_name}</p>

        <p>Descarga tu subtitulo desde el siguiente <a href="${subtitle.subtitle_link}" target="_blank" rel="noreferrer">link</a></p>

        <img src="${subtitle.title.poster}" alt="${subtitle.title.title_name}" width="384px" />
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
