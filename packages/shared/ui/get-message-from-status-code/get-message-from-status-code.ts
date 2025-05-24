import { match } from "ts-pattern";

// core
export function getMessageFromStatusCode(statusCode: number): {
  description: string;
  title: string;
} {
  return match(statusCode)
    .with(400, () => ({
      title: "Archivo no soportado",
      description: "El archivo no es válido (No incluye resolución o año)",
    }))
    .with(415, () => ({
      title: "Extensión de archivo no soportada",
      description: "Prueba con formatos como MKV, MP4, o AVI",
    }))
    .with(404, () => ({
      title: "Subtitulo no encontrado",
      description: "Nos pondremos a buscarlo",
    }))
    .with(500, () => ({
      title: "Error Inesperado",
      description: "Estamos haciendo arreglos del servicio",
    }))
    .otherwise(() => ({
      title: "Error desconocido",
      description: "Estamos haciendo arreglos del servicio",
    }));
}
