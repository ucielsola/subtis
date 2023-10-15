import { describe, expect, it } from 'bun:test';
import { getMessageFromStatusCode } from 'shared/error-messages';

describe('CLI', () => {
  it('returns a message with a subtitle link', async () => {
    const process = Bun.spawn([
      'bun',
      'app.ts',
      '--file',
      'The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4',
    ]);
    const text = await new Response(process.stdout).text();

    expect(text).toInclude('🤗 Hola, soy Subtis CLI');
    expect(text).toInclude('🔎 Buscando subtitulos');
    expect(text).toInclude('🥳 Descarga tu subtítulo del siguiente link: https://tinyurl.com/yszmsjua');
    expect(text).toInclude('🍿 Disfruta de The Equalizer 3 (2023) en 1080p subtitulada');
  });

  it('returns a message when file parameter is not given', async () => {
    const process = Bun.spawn(['bun', 'app.ts']);
    const text = await new Response(process.stdout).text();

    expect(text).toInclude('🤗 Hola, soy Subtis CLI');
    expect(text).toInclude('🤔 Parámetro --file no provisto. Prueba con "--file [archivo]');
  });

  it('returns a message when extension is not supported', async () => {
    const process = Bun.spawn([
      'bun',
      'app.ts',
      '--file',
      'The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3',
    ]);
    const text = await new Response(process.stdout).text();

    expect(text).toInclude('🤗 Hola, soy Subtis CLI');
    expect(text).toInclude('🤔 Extension de video no soportada. Prueba con otro archivo.');
  });

  it('returns a message when subtitle is not found', async () => {
    const process = Bun.spawn(['bun', 'app.ts', '--file', 'The.Matrix.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4']);
    const text = await new Response(process.stdout).text();
    const message = getMessageFromStatusCode(404);

    expect(text).toInclude('🤗 Hola, soy Subtis CLI');
    expect(text).toInclude('🔎 Buscando subtitulos');
    expect(text).toInclude(`😥 ${message.title}`);
    expect(text).toInclude(`⛏ ${message.description}`);
  });
});
