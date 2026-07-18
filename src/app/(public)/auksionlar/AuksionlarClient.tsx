"use client";

import { useEffect, useMemo, useState } from "react";
import { useTurboStore } from "@/lib/store";
import { Auction, AuctionStatus } from "@/lib/types";
import AuctionCard from "@/components/AuctionCard";
import Hero from "@/components/home/Hero";
import LiveShowcase from "@/components/home/LiveShowcase";
import HowItWorks from "@/components/home/HowItWorks";
import StatsSection from "@/components/home/StatsSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";

const TABS: { key: AuctionStatus | "all"; label: string }[] = [
  { key: "all", label: "Barchasi" },
  { key: "live", label: "Jonli" },
  { key: "upcoming", label: "Tez orada" },
  { key: "ended", label: "Yakunlangan" },
];

export default function AuksionlarClient({
  initialAuctions,
}: {
  initialAuctions: Auction[] | null;
}) {
  const storeAuctions = useTurboStore((s) => s.auctions);
  const initialized = useTurboStore((s) => s.initialized);
  const seedAuctions = useTurboStore((s) => s.seedAuctions);
  const [tab, setTab] = useState<AuctionStatus | "all">("all");
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (initialAuctions) seedAuctions(initialAuctions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Server-rendered data paints immediately; once the store takes over
  // (seed or client fetch) it becomes the live source of truth.
  const auctions = !initialized && initialAuctions ? initialAuctions : storeAuctions;

  const filtered = useMemo(() => {
    const order = { live: 0, upcoming: 1, ended: 2 };
    return auctions
      .filter((a) => (tab === "all" ? true : a.status === tab))
      .filter((a) =>
        query.trim()
          ? `${a.title} ${a.brand} ${a.city}`.toLowerCase().includes(query.toLowerCase())
          : true
      )
      .sort((a, b) => order[a.status] - order[b.status]);
  }, [auctions, tab, query]);

  return (
    <div>
      <Hero />
      <LiveShowcase />

      <div id="barcha-auksionlar" className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <p className="font-condensed text-sm font-bold uppercase tracking-widest text-turbo-red">
            Auksionlar
          </p>
          <h1 className="font-display text-3xl text-white sm:text-4xl">
            Barcha mashina savdolari
          </h1>
          <p className="max-w-xl text-sm text-turbo-muted">
            Jonli, tez orada boshlanadigan va yakunlangan auksionlarni bir joydan
            kuzating.
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TABS.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`rounded-full border px-4 py-2 font-condensed text-sm font-bold uppercase tracking-wide transition-colors ${
                  tab === t.key
                    ? "border-turbo-red bg-turbo-red text-white"
                    : "border-turbo-border text-turbo-muted hover:border-turbo-red/50 hover:text-white"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Marka, model yoki shahar bo'yicha qidirish..."
            className="w-full rounded-full border border-turbo-border bg-turbo-surface px-4 py-2.5 text-sm text-white placeholder:text-turbo-muted focus:border-turbo-red focus:outline-none sm:w-72"
          />
        </div>

        <div className="mt-8">
          {auctions.length === 0 ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-80 animate-pulse rounded-2xl border border-turbo-border bg-turbo-surface"
                />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <p className="rounded-2xl border border-dashed border-turbo-border py-16 text-center text-turbo-muted">
              Hech qanday auksion topilmadi.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((a) => (
                <AuctionCard key={a.id} auction={a} />
              ))}
            </div>
          )}
        </div>
      </div>

      <HowItWorks />
      <StatsSection />
      <TestimonialsSection />
    </div>
  );
}
