import { Auction } from "@/lib/types";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { getAuctionBySlug } from "@/lib/queries/auctions";
import AuctionDetailClient from "./AuctionDetailClient";

export const dynamic = "force-dynamic";

export default async function AuctionDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Server-side fetch so the first paint shows the auction, not a skeleton.
  // On failure the client store fetch covers it, so never crash the page here.
  let initialAuction: Auction | null = null;
  if (isSupabaseConfigured) {
    try {
      initialAuction = await getAuctionBySlug(await createClient(), slug);
    } catch {
      initialAuction = null;
    }
  }

  return <AuctionDetailClient slug={slug} initialAuction={initialAuction} />;
}
