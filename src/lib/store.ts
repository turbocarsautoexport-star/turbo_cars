"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AccessCode, Auction, Bid } from "./types";
import { BASE_STATS, createSeedAuctions, TESTIMONIALS } from "./mockData";
import { createClient, isSupabaseConfigured } from "./supabase/client";
import * as auctionsApi from "./queries/auctions";

export type RedeemResult = "ok" | "invalid" | "used";

interface TurboStore {
  initialized: boolean;
  auctions: Auction[];
  testimonials: typeof TESTIMONIALS;
  stats: typeof BASE_STATS;
  accessCodes: AccessCode[];
  unlockedAuctions: string[];

  init: () => Promise<void>;
  /** Adopts auctions fetched server-side (RSC) so the client skips the initial fetch. */
  seedAuctions: (auctions: Auction[]) => void;
  /** Merges a single server-fetched auction (detail page) without marking the list loaded. */
  seedAuction: (auction: Auction) => void;
  tick: () => void;
  placeBid: (auctionId: string, bidderName: string, amount?: number) => Promise<void>;
  redeemCode: (auctionId: string, code: string) => Promise<RedeemResult>;

  /** Merges a live change pushed by Supabase Realtime into local state. */
  upsertBid: (bid: Bid & { auctionId: string }) => void;
  upsertAuctionFromRealtime: (auction: Partial<Auction> & { id: string }) => void;
}

export const useTurboStore = create<TurboStore>()(
  persist(
    (set, get) => ({
      initialized: false,
      auctions: [],
      testimonials: TESTIMONIALS,
      stats: BASE_STATS,
      accessCodes: [],
      unlockedAuctions: [],

      init: async () => {
        if (get().initialized) return;
        const now = Date.now();

        if (isSupabaseConfigured) {
          const supabase = createClient();
          const auctions = await auctionsApi.getAuctions(supabase);
          // A server-rendered page may have seeded the store while we were
          // fetching — its data is newer than nothing, so don't clobber it.
          if (get().initialized) return;
          set({ auctions, initialized: true });
          return;
        }

        // No backend configured yet — demo mode with local mock data.
        const auctions = createSeedAuctions(now);
        const demoCodes: AccessCode[] = auctions
          .filter((a) => a.requiresDeposit)
          .map((a, i) => ({
            id: `demo-code-${a.id}`,
            auctionId: a.id,
            code: `DEMO${i}${a.id.slice(-1).toUpperCase()}`.slice(0, 8),
            holderName: "Demo",
            createdAt: now,
          }));
        set((state) => ({
          auctions,
          initialized: true,
          accessCodes: [...state.accessCodes, ...demoCodes],
        }));
      },

      seedAuctions: (auctions) => {
        if (get().initialized) return;
        set({ auctions, initialized: true });
      },

      seedAuction: (auction) => {
        set((state) => {
          const exists = state.auctions.some((a) => a.id === auction.id);
          return {
            auctions: exists
              ? state.auctions.map((a) => (a.id === auction.id ? auction : a))
              : [...state.auctions, auction],
          };
        });
      },

      tick: () => {
        const now = Date.now();
        set((state) => {
          let changed = false;
          const auctions = state.auctions.map((a) => {
            if (a.status === "upcoming" && now >= a.startAt) {
              changed = true;
              return { ...a, status: "live" as const };
            }
            if (a.status === "live" && now >= a.endAt) {
              changed = true;
              const lastBid = a.bids[a.bids.length - 1];
              return { ...a, status: "ended" as const, winnerName: lastBid?.bidderName };
            }
            return a;
          });
          // Returning the unchanged state skips notifying subscribers, so the
          // 1s tick no longer re-renders anything unless a status flipped.
          return changed ? { auctions } : state;
        });
      },

      placeBid: async (auctionId, bidderName, amount) => {
        const auction = get().auctions.find((a) => a.id === auctionId);
        if (!auction || auction.status !== "live") return;
        const nextAmount = amount ?? auction.currentPrice + auction.bidStep;

        // Optimistic local update so the UI feels instant.
        const bid: Bid = {
          id: `local-${Date.now()}`,
          bidderName,
          amount: nextAmount,
          createdAt: Date.now(),
        };
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === auctionId
              ? { ...a, currentPrice: nextAmount, bids: [...a.bids, bid] }
              : a
          ),
        }));

        if (isSupabaseConfigured) {
          const supabase = createClient();
          await auctionsApi.placeBid(supabase, auctionId, bidderName, nextAmount);
        }
      },

      redeemCode: async (auctionId, rawCode) => {
        if (isSupabaseConfigured) {
          const supabase = createClient();
          const result = await auctionsApi.redeemAccessCode(supabase, auctionId, rawCode);
          if (result === "ok") {
            set((s) => ({
              unlockedAuctions: s.unlockedAuctions.includes(auctionId)
                ? s.unlockedAuctions
                : [...s.unlockedAuctions, auctionId],
            }));
          }
          return result;
        }

        // Demo mode: check against locally-seeded demo codes.
        const code = rawCode.trim().toUpperCase();
        const state = get();
        const match = state.accessCodes.find(
          (c) => c.auctionId === auctionId && c.code === code
        );
        if (!match) return "invalid";
        if (match.redeemedAt) return "used";

        set((s) => ({
          accessCodes: s.accessCodes.map((c) =>
            c.id === match.id ? { ...c, redeemedAt: Date.now() } : c
          ),
          unlockedAuctions: s.unlockedAuctions.includes(auctionId)
            ? s.unlockedAuctions
            : [...s.unlockedAuctions, auctionId],
        }));
        return "ok";
      },

      upsertBid: (bid) => {
        set((state) => ({
          auctions: state.auctions.map((a) => {
            if (a.id !== bid.auctionId) return a;
            if (a.bids.some((b) => b.id === bid.id)) return a;
            return {
              ...a,
              currentPrice: Math.max(a.currentPrice, bid.amount),
              bids: [...a.bids, bid],
            };
          }),
        }));
      },

      upsertAuctionFromRealtime: (patch) => {
        set((state) => ({
          auctions: state.auctions.map((a) => (a.id === patch.id ? { ...a, ...patch } : a)),
        }));
      },
    }),
    {
      name: "turbo-access-storage",
      partialize: (state) => ({
        accessCodes: state.accessCodes,
        unlockedAuctions: state.unlockedAuctions,
      }),
    }
  )
);
