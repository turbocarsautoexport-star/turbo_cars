import { Auction } from "./types";
import { createSeedAuctions } from "./mockData";

/**
 * Single integration point for auction data. Today it resolves to local mock
 * data; swapping in a real source later means replacing the body of this
 * function (e.g. `await fetch("https://.../auctions").then(r => r.json())`)
 * without touching the store or any component.
 */
export async function fetchInitialAuctions(now: number): Promise<Auction[]> {
  return createSeedAuctions(now);
}
