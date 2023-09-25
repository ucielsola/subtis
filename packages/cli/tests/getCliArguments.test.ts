import { expect, test } from 'bun:test';

// internals
import { getCliArguments } from '../args';

test('getCliArguments should return an empty object when processArguments is empty', () => {
  expect(getCliArguments([])).toEqual({});
});

test('getCliArguments should return correct object when processArguments contains one key-value pair', () => {
  expect(getCliArguments(['--key', 'value'])).toEqual({ '--key': 'value' });
});

test('getCliArguments should return correct object when processArguments contains multiple key-value pairs', () => {
  expect(getCliArguments(['--key1', 'value1', '--key2', 'value2'])).toEqual({ '--key1': 'value1', '--key2': 'value2' });
});

test('getCliArguments should return correct object when processArguments contains keys without values', () => {
  expect(getCliArguments(['--key1'])).toEqual({});
});

test('getCliArguments should return an empty object when processArguments contains values without keys', () => {
  expect(getCliArguments(['value1', 'value2'])).toEqual({});
});

test('getCliArguments should return correct object when processArguments contains a mix of keys with and without values', () => {
  expect(getCliArguments(['--key1', 'value1', '--key2'])).toEqual({ '--key1': 'value1' });
});

test('getCliArguments should handle non-string values correctly', () => {
  expect(getCliArguments(['--key1', '123', '--key2', 'true'])).toEqual({ '--key1': '123', '--key2': 'true' });
});

test('getCliArguments should handle special characters in keys correctly', () => {
  expect(getCliArguments(['--key-with-special-chars', 'value'])).toEqual({ '--key-with-special-chars': 'value' });
});
