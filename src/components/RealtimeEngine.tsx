"use client";

import { useEffect } from "react";
import { useTurboStore } from "@/lib/store";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function RealtimeEngine() {
  const init = useTurboStore((s) => s.init);
  const tick = useTurboStore((s) => s.tick);
  const upsertBid = useTurboStore((s) => s.upsertBid);
  const upsertAuctionFromRealtime = useTurboStore((s) => s.upsertAuctionFromRealtime);

  useEffect(() => {
    // Deferred one tick: server-rendered pages seed the store in their own
    // mount effects, and this lets them win so we skip a duplicate fetch.
    const initTimeout = setTimeout(init, 0);
    const tickInterval = setInterval(tick, 1000);
    return () => {
      clearTimeout(initTimeout);
      clearInterval(tickInterval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const supabase = createClient();

    const channel = supabase
      .channel("public-auctions")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bids" },
        (payload) => {
          const row = payload.new as {
            id: string;
            auction_id: string;
            bidder_name: string;
            amount: number;
            created_at: string;
          };
          upsertBid({
            id: row.id,
            auctionId: row.auction_id,
            bidderName: row.bidder_name,
            amount: row.amount,
            createdAt: new Date(row.created_at).getTime(),
          });
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "auctions" },
        (payload) => {
          const row = payload.new as {
            id: string;
            status: "upcoming" | "live" | "ended";
            current_price: number;
            end_at: string;
            winner_name: string | null;
          };
          upsertAuctionFromRealtime({
            id: row.id,
            status: row.status,
            currentPrice: row.current_price,
            endAt: new Date(row.end_at).getTime(),
            winnerName: row.winner_name ?? undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
