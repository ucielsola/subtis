import { match } from 'ts-pattern'

// core
export function getMessageFromStatusCode(statusCode: number): {
  description: string
  title: string
} {
  return match(statusCode)
    .with(415, () => ({
      description: 'Prueba con formatos como MKV, MP4, o AVI',
      title: 'Extensión de archivo no soportada',
    }))
    .with(404, () => ({
      description: 'Nos pondremos a buscarlo',
      title: 'Subtitulo no encontrado',
    }))
    .with(500, () => ({
      description: 'Estamos haciendo arreglos del servicio',
      title: 'Error Inesperado',
    }))
    .otherwise(() => ({
      description: 'Estamos haciendo arreglos del servicio',
      title: 'Error desconocido',
    }))
}
