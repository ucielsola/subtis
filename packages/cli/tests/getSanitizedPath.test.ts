import { expect, test } from 'bun:test';

// internals
import { getSanitizedPath } from '../args';

test('should remove ./ prefix', () => {
  expect(getSanitizedPath('./folder/file.txt')).toBe('folder/file.txt');
});

test('should remove ../ prefix', () => {
  expect(getSanitizedPath('../folder/file.txt')).toBe('folder/file.txt');
});

test('should remove multiple ../ prefixes', () => {
  expect(getSanitizedPath('../../folder/file.txt')).toBe('folder/file.txt');
});

test('should not modify path without prefix', () => {
  expect(getSanitizedPath('folder/file.txt')).toBe('folder/file.txt');
});

test('should return empty string if path is empty', () => {
  expect(getSanitizedPath('')).toBe('');
});

test('should return empty string if path is only prefix', () => {
  expect(getSanitizedPath('./')).toBe('');
  expect(getSanitizedPath('../')).toBe('');
});

test('should sanitize complex paths correctly', () => {
  expect(getSanitizedPath('./Blue.Beetle.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4')).toBe(
    'Blue.Beetle.2023.1080p.WEBRip.x264.AAC5.1-[YTS.MX].mp4',
  );
});
