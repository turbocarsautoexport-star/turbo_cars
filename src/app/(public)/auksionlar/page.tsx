import { Auction } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getAuctions } from "@/lib/queries/auctions";
import AuksionlarClient from "./AuksionlarClient";

// Auction data changes constantly — always render with fresh data.
export const dynamic = "force-dynamic";

export default async function AuksionlarPage() {
  // Fetch on the server so the first paint already contains the auction list
  // instead of a skeleton that waits for the client-side fetch. Failures fall
  // back to the client fetch path, so they must not crash the page.
  let initialAuctions: Auction[] | null = null;
  if (isSupabaseConfigured) {
    try {
      initialAuctions = await getAuctions(await createClient());
    } catch {
      initialAuctions = null;
    }
  }

  return <AuksionlarClient initialAuctions={initialAuctions} />;
}
