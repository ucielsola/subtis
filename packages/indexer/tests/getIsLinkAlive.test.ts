import { expect, test } from 'bun:test';

import { getIsLinkAlive } from '../utils';

test('should return true for alive subdivx zip link file', async () => {
  const isLinkAlive = await getIsLinkAlive('https://www.subdivx.com/sub3/130730.zip');
  expect(isLinkAlive).toBeTruthy();
});

test('should return false for dead subdivx rar link file', async () => {
  const isLinkAlive = await getIsLinkAlive('https://www.subdivx.com/sub3/130730.rar');
  expect(isLinkAlive).toBeFalsy();
});
