import { describe, it } from 'vitest';

import { getIsLinkAlive } from '../utils';

describe('getIsLinkAlive', () => {
  it('should return true for alive subdivx zip link file', async ({ expect }) => {
    const isLinkAlive = await getIsLinkAlive('https://www.subdivx.com/sub3/130730.zip');
    expect(isLinkAlive).toBeTruthy();
  });

  it('should return false for dead subdivx zip link file', async ({ expect }) => {
    const isLinkAlive = await getIsLinkAlive('https://www.subdivx.com/sub3/130730.rar');
    expect(isLinkAlive).toBeFalsy();
  });
});
