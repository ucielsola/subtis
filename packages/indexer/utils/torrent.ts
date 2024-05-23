import { createHash } from "crypto";

export function generateIdFromMagnet(magnetLink: string): number {
  const btihMatch = magnetLink.match(/xt=urn:btih:([a-fA-F0-9]+)/);

  if (!btihMatch) {
    throw new Error("Invalid magnet link or btih value not found");
  }

  const [btih] = btihMatch;
  const hash = createHash("sha256").update(btih).digest("hex");

  return Number.parseInt(hash.slice(0, 10), 16);
}
