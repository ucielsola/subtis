import { describe, it } from 'vitest';

import { getFileNameHash } from '../utils';

describe('checkLinkLife', () => {
  it('should return hash for Rumba Therapy movie file', async ({ expect }) => {
    const fileNameHash = await getFileNameHash('Rumba.Therapy.2022.BLURAY.720p.BluRay.x264.AAC-[YTS.MX].mp4');
    expect(fileNameHash).toBe('540e07179740d054c2e8fdbaa1eafb4a');
  });

  it('should return hash for Zero Tolerance movie file', async ({ expect }) => {
    const fileNameHash = await getFileNameHash('Zero.Tolerance.2015.720p.WEBRip.x264.AAC-[YTS.MX].mp4');
    expect(fileNameHash).toBe('5acb873fd3ab65b4a47a5225805419b6');
  });

  it('should return hash for Blackadder The Lost Pilot movie file', async ({ expect }) => {
    const fileNameHash = await getFileNameHash('Blackadder.The.Lost.Pilot.2023.720p.BluRay.x264.AAC-[YTS.MX].mp4');
    expect(fileNameHash).toBe('fc997a2441c8585ffbcaf6e8cf2c25c0');
  });
});
