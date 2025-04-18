import { Resend } from "resend";

// constants
const resend = new Resend(process.env.RESEND_API_KEY);

// api
import type { SubtitleNormalized } from "@subtis/api/lib/parsers";

// helpers
export async function sendEmail(subtitle: SubtitleNormalized, email: string): Promise<void> {
  const isMovie = subtitle.title.type === "movie";
  const isTvShow = subtitle.title.type === "tv-show";

  const type = isMovie ? "película" : "serie";
  const season = isTvShow
    ? ` - Temporada: ${subtitle.subtitle.current_season} - Episodio: ${subtitle.subtitle.current_episode}`
    : ` (${subtitle.title.year})`;

  try {
    const data = await resend.emails.send({
      to: email,
      from: "soporte@subtis.io",
      subject: "Subtis | Encontramos tu subtítulo! 🎉",
      html: `<div>
        <p>Encontramos el subtítulo para tu ${type}: ${subtitle.title.title_name}${season}</p>

        <p>Descargá tu subtítulo desde el siguiente <a href="${subtitle.subtitle.subtitle_link}" target="_blank" rel="noreferrer">link</a></p>

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
