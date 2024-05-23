import { describe, expect, it } from "bun:test";

import { generateIdFromMagnet } from "../utils/torrent";

describe("generateIdFromMagnet", () => {
  it("should generate an ID from a valid magnet link", () => {
    const magnetLink =
      "magnet:?xt=urn:btih:BB83A34DA5AA5A93F8C3EBB1F01B0E7680C40807&dn=Shogun+2024+S01E01+Anjin+1080p+DSNP+WE";
    const id = generateIdFromMagnet(magnetLink);
    expect(id).toBeGreaterThan(0);
  });

  it("should handle a different btih value correctly", () => {
    const magnetLink = "magnet:?xt=urn:btih:1234567890ABCDEF1234567890ABCDEF12345678&dn=Example+File";
    const id = generateIdFromMagnet(magnetLink);
    expect(id).toBeGreaterThan(0);
    expect(id).toBe(485770761647);
  });

  it("should throw an error for invalid magnet link", () => {
    const magnetLink = "magnet:?xt=urn:btih:&dn=Invalid+File";
    expect(() => generateIdFromMagnet(magnetLink)).toThrow("Invalid magnet link or btih value not found");
  });

  it("should produce different IDs for different btih values", () => {
    const magnetLink1 =
      "magnet:?xt=urn:btih:BB83A34DA5AA5A93F8C3EBB1F01B0E7680C40807&dn=Shogun+2024+S01E01+Anjin+1080p+DSNP+WE";
    const magnetLink2 = "magnet:?xt=urn:btih:1234567890ABCDEF1234567890ABCDEF12345678&dn=Example+File";
    const id1 = generateIdFromMagnet(magnetLink1);
    const id2 = generateIdFromMagnet(magnetLink2);
    expect(id1).not.toBe(id2);
  });
});
