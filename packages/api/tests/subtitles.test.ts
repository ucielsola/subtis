import { describe, expect, it } from 'bun:test';

// internals
import { app } from '../app';

describe('API', () => {
  it('return a response for an existant subtitle', async () => {
    const request = new Request('http://localhost:8080/subtitles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4' }),
    });

    const response = await app.handle(request);
    const data = await response.json();

    expect(data).toEqual({
      id: 1095,
      subtitleShortLink: 'https://tinyurl.com/yszmsjua',
      subtitleFullLink:
        'https://yelhsmnvfyyjuamxbobs.supabase.co/storage/v1/object/public/subtitles/the-equalizer-3-1080p-yts-mx-subdivx.srt?download=The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].srt',
      resolution: '1080p',
      fileName: 'The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4',
      Movies: {
        name: 'The Equalizer 3',
        year: 2023,
      },
      ReleaseGroups: {
        name: 'YTS-MX',
      },
      SubtitleGroups: {
        name: 'SubDivX',
      },
    });
  });

  it('return a response for an 415 error for non supported file extensions', async () => {
    const request = new Request('http://localhost:8080/subtitles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'The.Equalizer.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp3' }),
    });

    const response = await app.handle(request);
    const data = await response.json();

    expect(response.status).toBe(415);
    expect(data).toEqual({
      message: 'File extension not supported',
    });
  });

  it('return a response for an 404 error for a non existant subtitle', async () => {
    const request = new Request('http://localhost:8080/subtitles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fileName: 'The.Matrix.3.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4' }),
    });

    const response = await app.handle(request);
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      message: 'Subtitles not found for file',
    });
  });
});
