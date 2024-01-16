import { expect, test } from 'bun:test'

// shared
import { getMessageFromStatusCode } from './get-message-from-status-code'

test('returns correct message for 415', () => {
  expect(getMessageFromStatusCode(415)).toEqual({
    title: 'Extensión de archivo no soportada',
    description: 'Prueba con formatos como MKV, MP4, o AVI',
  })
})

test('returns correct message for 404', () => {
  expect(getMessageFromStatusCode(404)).toEqual({
    title: 'Subtitulo no encontrado',
    description: 'Nos pondremos a buscarlo',
  })
})

test('returns correct message for 500', () => {
  expect(getMessageFromStatusCode(500)).toEqual({
    title: 'Error Inesperado',
    description: 'Estamos haciendo arreglos del servicio',
  })
})

test('returns correct message for unknown status codes', () => {
  expect(getMessageFromStatusCode(999)).toEqual({
    title: 'Error desconocido',
    description: 'Estamos haciendo arreglos del servicio',
  })
})
