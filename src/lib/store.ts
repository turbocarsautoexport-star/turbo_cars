"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { AccessCode, Auction, Bid } from "./types";
import { BASE_STATS, TESTIMONIALS } from "./mockData";
import { fetchInitialAuctions } from "./dataSource";

interface NewAuctionInput {
  title: string;
  brand: string;
  year: number;
  mileageKm: number;
  transmission: Auction["transmission"];
  fuel: Auction["fuel"];
  city: string;
  description: string;
  startPrice: number;
  bidStep: number;
  durationMinutes: number;
  startDelayMinutes: number;
}

export type RedeemResult = "ok" | "invalid" | "used";

interface TurboStore {
  now: number;
  initialized: boolean;
  auctions: Auction[];
  testimonials: typeof TESTIMONIALS;
  stats: typeof BASE_STATS;
  accessCodes: AccessCode[];
  unlockedAuctions: string[];

  init: () => Promise<void>;
  tick: () => void;
  simulateRandomBid: () => void;
  placeBid: (auctionId: string, bidderName: string, amount?: number) => void;

  adminCloseAuction: (auctionId: string) => void;
  adminStartAuction: (auctionId: string) => void;
  adminSetTimerMinutes: (auctionId: string, minutes: number) => void;
  adminCreateAuction: (input: NewAuctionInput) => void;
  adminSetDeposit: (auctionId: string, requiresDeposit: boolean, depositAmount: number) => void;
  adminGenerateCode: (auctionId: string, holderName?: string) => string;

  redeemCode: (auctionId: string, code: string) => RedeemResult;
}

let bidCounter = 0;
let codeCounter = 0;

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function generateCodeString(): string {
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)];
  }
  return out;
}

export const useTurboStore = create<TurboStore>()(
  persist(
    (set, get) => ({
      now: Date.now(),
      initialized: false,
      auctions: [],
      testimonials: TESTIMONIALS,
      stats: BASE_STATS,
      accessCodes: [],
      unlockedAuctions: [],

      init: async () => {
        if (get().initialized) return;
        const now = Date.now();
        const auctions = await fetchInitialAuctions(now);

        set((state) => {
          const existingSeeded = new Set(
            state.accessCodes.filter((c) => c.holderName === "Demo").map((c) => c.auctionId)
          );
          const demoCodes: AccessCode[] = auctions
            .filter((a) => a.requiresDeposit && !existingSeeded.has(a.id))
            .map((a, i) => ({
              id: `demo-code-${a.id}`,
              auctionId: a.id,
              code: `DEMO${i}${a.id.slice(-1).toUpperCase()}`.slice(0, 8),
              holderName: "Demo",
              createdAt: now,
            }));

          return {
            now,
            auctions,
            initialized: true,
            accessCodes: [...state.accessCodes, ...demoCodes],
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
              return {
                ...a,
                status: "ended" as const,
                winnerName: lastBid?.bidderName,
              };
            }
            return a;
          });
          return { now, auctions: changed ? auctions : state.auctions };
        });
      },

      simulateRandomBid: () => {
        const state = get();
        const liveAuctions = state.auctions.filter((a) => a.status === "live");
        if (liveAuctions.length === 0) return;
        const target = liveAuctions[Math.floor(Math.random() * liveAuctions.length)];
        const names = [
          "Aziz K.",
          "Diyor R.",
          "Malika Y.",
          "Shahzod T.",
          "Kamola N.",
          "Bobur A.",
          "Nodira S.",
          "Jasur M.",
          "Sevara Q.",
          "Otabek I.",
        ];
        const bidderName = names[Math.floor(Math.random() * names.length)];
        get().placeBid(target.id, bidderName);
      },

      placeBid: (auctionId, bidderName, amount) => {
        set((state) => ({
          auctions: state.auctions.map((a) => {
            if (a.id !== auctionId || a.status !== "live") return a;
            const nextAmount = amount ?? a.currentPrice + a.bidStep;
            bidCounter += 1;
            const bid: Bid = {
              id: `live-bid-${bidCounter}`,
              bidderName,
              amount: nextAmount,
              createdAt: Date.now(),
            };
            return {
              ...a,
              currentPrice: nextAmount,
              bids: [...a.bids, bid],
            };
          }),
        }));
      },

      adminCloseAuction: (auctionId) => {
        set((state) => ({
          auctions: state.auctions.map((a) => {
            if (a.id !== auctionId || a.status !== "live") return a;
            const lastBid = a.bids[a.bids.length - 1];
            return {
              ...a,
              status: "ended" as const,
              endAt: Date.now(),
              winnerName: lastBid?.bidderName,
            };
          }),
        }));
      },

      adminStartAuction: (auctionId) => {
        set((state) => ({
          auctions: state.auctions.map((a) => {
            if (a.id !== auctionId || a.status !== "upcoming") return a;
            const now = Date.now();
            const duration = a.endAt - a.startAt;
            return {
              ...a,
              status: "live" as const,
              startAt: now,
              endAt: now + duration,
            };
          }),
        }));
      },

      adminSetTimerMinutes: (auctionId, minutes) => {
        set((state) => ({
          auctions: state.auctions.map((a) => {
            if (a.id !== auctionId) return a;
            return { ...a, endAt: Date.now() + minutes * 60_000 };
          }),
        }));
      },

      adminCreateAuction: (input) => {
        const now = Date.now();
        const startAt = now + input.startDelayMinutes * 60_000;
        const endAt = startAt + input.durationMinutes * 60_000;
        const id = `${input.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${now}`;
        const newAuction: Auction = {
          id,
          slug: id,
          title: input.title,
          brand: input.brand,
          year: input.year,
          mileageKm: input.mileageKm,
          transmission: input.transmission,
          fuel: input.fuel,
          city: input.city,
          description: input.description,
          accent: Math.floor(Math.random() * 5),
          startPrice: input.startPrice,
          currentPrice: input.startPrice,
          bidStep: input.bidStep,
          currency: "so'm",
          startAt,
          endAt,
          status: input.startDelayMinutes <= 0 ? "live" : "upcoming",
          bids: [],
          requiresDeposit: false,
          depositAmount: 0,
        };
        set((state) => ({ auctions: [newAuction, ...state.auctions] }));
      },

      adminSetDeposit: (auctionId, requiresDeposit, depositAmount) => {
        set((state) => ({
          auctions: state.auctions.map((a) =>
            a.id === auctionId ? { ...a, requiresDeposit, depositAmount } : a
          ),
        }));
      },

      adminGenerateCode: (auctionId, holderName) => {
        codeCounter += 1;
        const code = generateCodeString();
        const entry: AccessCode = {
          id: `code-${Date.now()}-${codeCounter}`,
          auctionId,
          code,
          holderName: holderName?.trim() || undefined,
          createdAt: Date.now(),
        };
        set((state) => ({ accessCodes: [entry, ...state.accessCodes] }));
        return code;
      },

      redeemCode: (auctionId, rawCode) => {
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
