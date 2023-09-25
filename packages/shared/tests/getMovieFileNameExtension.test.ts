import { expect, test } from 'bun:test';

import { VIDEO_FILE_EXTENSIONS, getMovieFileNameExtension } from 'shared/movie';

test('should return mp4 for "Valley.Of.The.Witch.2014.720p.WEBRip.x264.AAC-[YTS.MX].mp4"', async () => {
  const fileExtension = getMovieFileNameExtension('Valley.Of.The.Witch.2014.720p.WEBRip.x264.AAC-[YTS.MX].mp4');
  expect(fileExtension).toBe('mp4');
});

test('should return mp4 for "Lupu.2013.720p.WEBRip.x264.AAC-[YTS.MX].mkv"', async () => {
  const fileExtension = getMovieFileNameExtension('Lupu.2013.720p.WEBRip.x264.AAC-[YTS.MX].mkv');
  expect(fileExtension).toBe('mkv');
});

test('should return 13 video file extensions', () => {
  expect(VIDEO_FILE_EXTENSIONS.length).toBe(13);
});
