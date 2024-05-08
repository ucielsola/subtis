import { expect, test } from "bun:test";

// shared
import { getMessageFromStatusCode } from "./get-message-from-status-code";

test("returns correct message for 415", () => {
  expect(getMessageFromStatusCode(415)).toEqual({
    description: "Prueba con formatos como MKV, MP4, o AVI",
    title: "Extensión de archivo no soportada",
  });
});

test("returns correct message for 404", () => {
  expect(getMessageFromStatusCode(404)).toEqual({
    description: "Nos pondremos a buscarlo",
    title: "Subtitulo no encontrado",
  });
});

test("returns correct message for 500", () => {
  expect(getMessageFromStatusCode(500)).toEqual({
    description: "Estamos haciendo arreglos del servicio",
    title: "Error Inesperado",
  });
});

test("returns correct message for unknown status codes", () => {
  expect(getMessageFromStatusCode(999)).toEqual({
    description: "Estamos haciendo arreglos del servicio",
    title: "Error desconocido",
  });
});
