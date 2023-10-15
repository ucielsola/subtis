export function getMessageFromStatusCode(statusCode: number): {
  title: string;
  description: string;
} {
  const messages = new Map([
    [
      415,
      {
        title: 'Extensión de archivo no soportada',
        description: 'Prueba con formatos como MKV, MP4, o AVI',
      },
    ],
    [
      404,
      {
        title: 'Subtitulo no encontrado',
        description: 'Nos pondremos a buscarlo!',
      },
    ],
    [
      500,
      {
        title: 'Error Inesperado',
        description: 'Estamos haciendo arreglos del servicio, por favor tenenos paciencia',
      },
    ],
  ]);

  const defaultMessage = {
    title: 'Error desconocido',
    description: 'Estamos haciendo arreglos del servicio',
  };

  return messages.get(statusCode) || defaultMessage;
}
