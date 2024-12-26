import { beforeAll, describe, expect, it } from "bun:test";

// api
import "@subtis/api";

describe("CLI", async () => {
  beforeAll(async () => {
    const process = [
      "bun",
      "build",
      `${import.meta.dir.slice(0, -4)}/cli/app.ts`,
      "--compile",
      "--outfile",
      `${import.meta.dir.slice(0, -4)}/cli/bin/subtis`,
    ];

    Bun.spawn(process);
  });

  it("returns a message with a subtitle link with search parameter", async () => {
    const binaryProcess = Bun.spawn([
      `${import.meta.dir.slice(0, -4)}/cli/bin/subtis`,
      "search",
      "Road.House.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
    ]);

    const text = await new Response(binaryProcess.stdout).text();

    expect(text).toInclude("👋 Hola, soy Subtis");
    expect(text).toInclude("🥳 Descarga tu subtítulo en https://api.subt.is/v1/subtitle/link/11521");
    expect(text).toInclude("🍿 Disfruta de Road House (2024) en 1080p subtitulada");
  });

  it("returns a message when extension is not supported", async () => {
    const binaryProcess = Bun.spawn([
      `${import.meta.dir.slice(0, -4)}/cli/bin/subtis`,
      "search",
      "Trolls.Band.Together.2024.1080p.AMZN.WEBRip.1400MB.DD5.1.x264-GalaxyRG.mp3",
    ]);

    const text = await new Response(binaryProcess.stdout).text();

    expect(text).toInclude("👋 Hola, soy Subtis");
    expect(text).toInclude("🤔 Extensión de video no soportada. Prueba con otro archivo");
  });

  it("returns a message when subtitle is not found", async () => {
    const binaryProcess = Bun.spawn([
      `${import.meta.dir.slice(0, -4)}/cli/bin/subtis`,
      "search",
      "The.Matrix.3.2024.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4",
    ]);

    const text = await new Response(binaryProcess.stdout).text();

    expect(text).toInclude("👋 Hola, soy Subtis CLI.");
    expect(text).toInclude("🥲 No pudimos encontrar el subtítulo que estás buscando.");
  });
});
