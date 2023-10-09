export function getMessageFromStatusCode(statusCode: number): {
  title: string;
  subtitle: string;
} {
  const messages = new Map([
    [
      415,
      {
        title: 'Extensión de archivo no soportada',
        subtitle: 'Prueba con formatos como MKV, MP4, o AVI',
      },
    ],
    [
      404,
      {
        title: 'Subtitulo no encontrado',
        subtitle: 'Nos pondremos a buscarlo!',
      },
    ],
    [
      500,
      {
        title: 'Error Inesperado',
        subtitle: 'Estamos haciendo arreglos del servicio, por favor tenenos paciencia',
      },
    ],
  ]);

  const defaultMessage = {
    title: 'Error desconocido',
    subtitle: 'Estamos haciendo arreglos del servicio',
  };

  return messages.get(statusCode) || defaultMessage;
}
